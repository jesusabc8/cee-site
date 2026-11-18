"""Dessazonalização das séries do OPM com X-13 (ADR-023).

Para cada especificação em data/specs/x13/*.yaml:
- `tipo: variacao` (variação mensal em %): encadeia o número-índice, ajusta e reconverte em variação;
- `tipo: nivel`: ajusta o nível diretamente.
Saídas: data/processed/opm/dessaz/<serie>.csv (original e ajustada lado a lado), dessaz/_meta.json (modelo,
transformação, avisos, hash da especificação) e a safra data/processed/opm/safras/dessaz/<serie>/<último período>.csv.
Uso: python -m opm.dessaz [serie ...]
"""
from __future__ import annotations

import hashlib
import json
import sys

import pandas as pd
import yaml

from . import PROC, SAIDA, SPECS
from .x13 import VERSAO, ajustar


def carregar(spec: dict) -> pd.Series:
    df = pd.read_csv(PROC / spec["entrada"])
    col_p = "periodo" if "periodo" in df.columns else df.columns[0]
    s = pd.Series(df[spec["coluna"]].astype(float).values, index=pd.PeriodIndex(df[col_p], freq="M")).dropna().sort_index()
    s = s[s.index >= pd.Period(spec.get("inicio", "2012-01"), "M")]
    if s.index.has_duplicates or len(s) != (s.index[-1] - s.index[0]).n + 1:
        raise ValueError(f"{spec['serie']}: série mensal com lacunas ou duplicatas")
    return s


def indice_de_variacao(v: pd.Series) -> pd.Series:
    """Número-índice encadeado (base 100 no mês anterior ao início)."""
    return 100 * (1 + v / 100).cumprod()


def processar(spec: dict) -> dict:
    s = carregar(spec)
    entrada = indice_de_variacao(s) if spec["tipo"] == "variacao" else s
    r = ajustar(entrada, spec)
    if spec["tipo"] == "variacao":
        ajust = r.ajustada.pct_change() * 100
        # primeiro mês: variação ajustada = original dividida pelo fator relativo (índice-base = 100)
        ajust.iloc[0] = (r.ajustada.iloc[0] / 100 - 1) * 100
        out = pd.DataFrame({"periodo": s.index.astype(str), "original": s.values, "ajustada": ajust.round(4).values, "fator_sazonal": r.fatores.round(4).values})
    else:
        out = pd.DataFrame({"periodo": s.index.astype(str), "original": s.values, "ajustada": r.ajustada.round(1).values, "fator_sazonal": r.fatores.round(4).values})
    (SAIDA / "dessaz").mkdir(parents=True, exist_ok=True)
    out.to_csv(SAIDA / "dessaz" / f"{spec['serie']}.csv", index=False)
    safra = SAIDA / "safras" / "dessaz" / spec["serie"] / f"{out.periodo.iloc[-1]}.csv"
    if not safra.exists():
        safra.parent.mkdir(parents=True, exist_ok=True)
        out.to_csv(safra, index=False)
    return {"modelo": r.modelo, "transformacao": r.transformacao, "avisos": r.avisos, "primeiro": out.periodo.iloc[0], "ultimo": out.periodo.iloc[-1]}


def main(alvos: list[str]) -> None:
    meta_p = SAIDA / "dessaz" / "_meta.json"
    meta = json.loads(meta_p.read_text()) if meta_p.exists() else {}
    specs = sorted(SPECS.glob("*.yaml"))
    for p in specs:
        spec = yaml.safe_load(p.read_text())
        if alvos and spec["serie"] not in alvos:
            continue
        info = processar(spec)
        info.update({"programa": VERSAO, "especificacao": str(p.relative_to(SPECS.parents[2])), "sha256_especificacao": hashlib.sha256(p.read_bytes()).hexdigest()})
        meta[spec["serie"]] = info
        print(f"✓ {spec['serie']}: {info['modelo']} ({info['transformacao']}) {info['primeiro']} → {info['ultimo']}" + (f" — {len(info['avisos'])} aviso(s)" if info["avisos"] else ""))
    meta_p.write_text(json.dumps(dict(sorted(meta.items())), ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main(sys.argv[1:])
