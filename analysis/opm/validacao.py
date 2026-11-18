"""Validação da dessazonalização contra o BCB (especificação, seção "Dessazonalização"; ADR-023).

RPM set./2026, p. 35: no trimestre encerrado em agosto de 2026, IPCA e média dos núcleos (EX0, EX3, MS, DP, P55)
cresceram 2,9 % e 3,9 % anualizados com ajuste sazonal, ante 7,2 % e 5,4 % em maio. Tolerância: 0,5 p.p.
Escreve data/processed/opm/dessaz/_validacao.csv. Uso: python -m opm.validacao
"""
from __future__ import annotations

import pandas as pd

from . import SAIDA

NUCLEOS = ["ex0", "ex3", "ms", "dp", "p55"]
REFERENCIA = {("ipca", "2026-05"): 7.2, ("ipca", "2026-08"): 2.9, ("media_nucleos", "2026-05"): 5.4, ("media_nucleos", "2026-08"): 3.9}
TOLERANCIA = 0.5


def saar3m(var_sa: pd.Series, periodo: str) -> float:
    i = list(var_sa.index).index(periodo)
    x = var_sa.iloc[i - 2:i + 1]
    return float(100 * (((1 + x / 100) ** 4).prod() - 1))


def ajustadas() -> dict[str, pd.Series]:
    d = SAIDA / "dessaz"
    out = {"ipca": pd.read_csv(d / "ipca.csv", index_col="periodo")["ajustada"]}
    out["media_nucleos"] = pd.concat({k: pd.read_csv(d / f"nucleo_{k}.csv", index_col="periodo")["ajustada"] for k in NUCLEOS}, axis=1).mean(axis=1)
    return out


def validar() -> pd.DataFrame:
    s = ajustadas()
    linhas = []
    for (serie, p), ref in REFERENCIA.items():
        v = saar3m(s[serie], p)
        linhas.append({"serie": serie, "periodo": p, "saar_cee": round(v, 2), "saar_bcb": ref, "diferenca_pp": round(v - ref, 2), "dentro_tolerancia": int(abs(v - ref) <= TOLERANCIA)})
    df = pd.DataFrame(linhas)
    df.to_csv(SAIDA / "dessaz" / "_validacao.csv", index=False)
    return df


if __name__ == "__main__":
    df = validar()
    print(df.to_string(index=False))
    if not df.dentro_tolerancia.all():
        raise SystemExit("Validação da dessazonalização fora da tolerância de 0,5 p.p.: explicar a especificação antes de publicar.")
