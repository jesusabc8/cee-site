"""Curvas de juros nominal e real a partir do Tesouro Direto (ADR-024) — I.12 (longo prazo) e I.4 (c). Camada 2.

Ajuste de Nelson-Siegel-Svensson (Svensson, 1994) às taxas dos títulos sem cupom: Tesouro Prefixado (LTN, curva
nominal) e Tesouro IPCA+ (NTN-B Principal, curva real). Prazo em anos = dias úteis / 252; taxas em % a.a. (base 252).
Com menos de 7 títulos na data, usa Nelson-Siegel (4 parâmetros) para não sobreajustar. Para cada (λ1, λ2) de uma grade,
os β saem por MQO; fica o par de menor erro quadrático. Não se extrapola além do vencimento mais longo + 6 meses.
Erro médio absoluto (bp) contra as taxas publicadas, por data. Datas: último dia útil de cada mês e a data mais recente.
NTN-B Principal a menos de 6 meses do vencimento fica fora (defasagem de indexação). Taxa usada: "Taxa Compra Manhã" (a oferecida ao investidor; inclui o spread do Tesouro Direto) — limitação declarada.
Saída sob ODbL (base derivada do Tesouro Transparente). Uso: python -m opm.curvas
"""
from __future__ import annotations

import datetime as dt

import numpy as np
import pandas as pd

from . import PROC, SAIDA
from .calendario import dias_uteis

PRAZOS = [1, 2, 3, 4, 5, 7, 10, 15]
L1 = np.round(np.arange(0.3, 6.01, 0.15), 3)
L2 = np.round(np.arange(1.0, 15.01, 0.5), 3)


def _cargas(tau: np.ndarray, l1: float, l2: float | None) -> np.ndarray:
    x1 = tau / l1
    f1 = (1 - np.exp(-x1)) / x1
    cols = [np.ones_like(tau), f1, f1 - np.exp(-x1)]
    if l2 is not None:
        x2 = tau / l2
        cols.append((1 - np.exp(-x2)) / x2 - np.exp(-x2))
    return np.column_stack(cols)


def ajustar_nss(tau: np.ndarray, y: np.ndarray) -> dict:
    """Melhor ajuste na grade; devolve parâmetros, modelo e erro médio absoluto em bp."""
    svensson = len(tau) >= 7
    melhor = None
    for l1 in L1:
        for l2 in (L2 if svensson else [None]):
            if l2 is not None and l2 <= l1:
                continue
            X = _cargas(tau, l1, l2)
            b, *_ = np.linalg.lstsq(X, y, rcond=None)
            sse = float(((X @ b - y) ** 2).sum())
            if melhor is None or sse < melhor[0]:
                melhor = (sse, l1, l2, b)
    _, l1, l2, b = melhor
    ajuste = _cargas(tau, l1, l2) @ b
    return {"modelo": "NSS" if svensson else "NS", "l1": l1, "l2": l2, "beta": b, "mae_bp": float(np.abs(ajuste - y).mean() * 100), "tau_max": float(tau.max()), "n": len(tau)}


def avaliar(par: dict, tau: float) -> float:
    if tau > par["tau_max"] + 0.5:
        return np.nan
    return float((_cargas(np.array([float(tau)]), par["l1"], par["l2"]) @ par["beta"])[0])


def datas_alvo(datas: pd.Series) -> list[str]:
    d = pd.to_datetime(pd.Series(sorted(datas.unique())))
    fim = d.groupby(d.dt.to_period("M")).max().dt.strftime("%Y-%m-%d").tolist()
    return sorted(set(fim) | {d.max().strftime("%Y-%m-%d")})


def main() -> None:
    td = pd.read_csv(PROC / "opm" / "tesouro_direto.csv")
    # Taxa 0,00 = título fora de oferta para compra (não é taxa); taxas negativas são legítimas (juro real perto do vencimento).
    td = td[td.titulo.isin(["LTN", "NTN-B Principal"]) & (td.taxa_compra != 0) & td.taxa_compra.notna()]
    linhas, grade = [], []
    for data in datas_alvo(td.data):
        d0 = dt.date.fromisoformat(data)
        for titulo, curva in (("LTN", "nominal"), ("NTN-B Principal", "real")):
            x = td[(td.data == data) & (td.titulo == titulo)]
            if len(x) < 4:
                continue
            tau = np.array([dias_uteis(d0, dt.date.fromisoformat(v)) / 252 for v in x.vencimento])
            # NTN-B a menos de 6 meses do vencimento: a defasagem de indexação distorce a taxa (curto prazo = Araujo e Vicente).
            ok = tau > (0.5 if curva == "real" else 0.05)
            if ok.sum() < 4:  # Nelson-Siegel tem 4 parâmetros: com menos títulos o ajuste é indeterminado
                continue
            par = ajustar_nss(tau[ok], x.taxa_compra.to_numpy()[ok])
            if curva == "nominal":
                grade.append({"data": data, **{f"m{n}": round(avaliar(par, n / 12), 4) for n in range(1, 37)}})
            linhas.append({"data": data, "curva": curva, "modelo": par["modelo"], "titulos": par["n"], "prazo_max": round(par["tau_max"], 2),
                           "mae_bp": round(par["mae_bp"], 2), **{f"y_{p}a": round(avaliar(par, p), 4) for p in PRAZOS}})
    df = pd.DataFrame(linhas)
    out = SAIDA / "indicadores"
    df.to_csv(out / "curvas_nss.csv", index=False)
    # Grade mensal da curva nominal (1 a 36 meses), insumo do prêmio a termo ACM (I.16, camada 3).
    pd.DataFrame(grade).to_csv(out / "curva_nominal_grade.csv", index=False)
    # I.12 — inflação implícita (longo prazo), mesmo prazo nas duas curvas; 2, 3 e 5 anos.
    nom = df[df.curva == "nominal"].set_index("data")
    rea = df[df.curva == "real"].set_index("data")
    comum = nom.index.intersection(rea.index)
    be = pd.DataFrame({"data": comum})
    for p in (2, 3, 5):
        be[f"implicita_{p}a"] = (100 * ((1 + nom.loc[comum, f"y_{p}a"].to_numpy() / 100) / (1 + rea.loc[comum, f"y_{p}a"].to_numpy() / 100) - 1)).round(4)
    be.to_csv(out / "i12_inflacao_implicita.csv", index=False)
    u = df.groupby("curva").tail(1)
    for _, r in u.iterrows():
        print(f"✓ curva {r.curva} {r.data}: {r.modelo}, {r.titulos} títulos, EMA {r.mae_bp:.1f} bp")
    print(f"✓ curvas_nss: {len(df)} ajustes; EMA mediano {df.mae_bp.median():.1f} bp; i12: {len(be)} datas")


if __name__ == "__main__":
    main()
