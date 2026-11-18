"""I.11 — parcela, ponderada pelos pesos do IPCA, dos subitens com variação dessazonalizada anualizada acima de 4,5 %
(camada 2). SIDRA 7060 (desde jan./2020); cada subitem é dessazonalizado com X-13 (modelo airline, transformação log,
sem regressores) sobre o número-índice encadeado. Subitens em que o X-13 falha ou com menos de 60 meses de dados ficam
fora; a parcela é calculada sobre o peso dos subitens incluídos, e esse peso é publicado ao lado.
Uso: python -m opm.subitens
"""
from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor

import numpy as np
import pandas as pd

from . import PROC, SAIDA
from .dessaz import indice_de_variacao
from .x13 import ajustar

LIMITE = 4.5
SPEC = {"serie": "subitem", "transformacao": "log", "arima": "(0 1 1)(0 1 1)", "outliers": {"tipos": ["ao", "ls"]}}


def _ajusta(args: tuple[int, pd.Series]) -> tuple[int, pd.Series | None]:
    codigo, v = args
    try:
        r = ajustar(indice_de_variacao(v), {**SPEC, "serie": f"subitem-{codigo}"})
        return codigo, (r.ajustada.pct_change() * 100)
    except Exception:  # noqa: BLE001 — falha do X-13 num subitem: fica fora e é contado
        return codigo, None


def main() -> None:
    it = pd.read_csv(PROC / "opm" / "ipca_itens.csv")
    sub = it[it.nivel == 4]
    var = sub.pivot(index="periodo", columns="codigo", values="variacao_mensal").sort_index()
    peso = sub.pivot(index="periodo", columns="codigo", values="peso").sort_index()
    var.index = pd.PeriodIndex(var.index, freq="M")
    peso.index = var.index
    tarefas = [(c, var[c].dropna()) for c in var.columns if var[c].notna().sum() >= 60 and var[c].dropna().index.is_monotonic_increasing]
    with ProcessPoolExecutor() as ex:
        res = dict(ex.map(_ajusta, tarefas))
    sa = pd.DataFrame({c: s for c, s in res.items() if s is not None})
    saar = 100 * (((1 + sa / 100) ** 4).rolling(3).apply(np.prod, raw=True) - 1)
    linhas = []
    for per in saar.index[3:]:
        s = saar.loc[per].dropna()
        w = peso.loc[per, s.index].fillna(0)
        if w.sum() <= 0:
            continue
        linhas.append({"periodo": str(per), "parcela_acima_4_5": round(100 * float(w[s > LIMITE].sum() / w.sum()), 2),
                       "subitens_incluidos": int(len(s)), "peso_incluido": round(float(w.sum()), 2),
                       "subitens_acima": int((s > LIMITE).sum())})
    out = pd.DataFrame(linhas)
    out.to_csv(SAIDA / "indicadores" / "i11_subitens_acima_teto.csv", index=False)
    falhas = sum(1 for v in res.values() if v is None)
    u = out.iloc[-1]
    print(f"✓ i11: {len(tarefas)} subitens, {falhas} falha(s) do X-13 excluída(s); {u.periodo}: {u.parcela_acima_4_5}% do peso incluído ({u.peso_incluido}%)")


if __name__ == "__main__":
    main()
