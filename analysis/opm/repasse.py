"""I.13 — repasse da Selic ao custo do crédito por projeções locais (Jordà, 2005). Camada 2.

Δ_h ℓ_{t+h} = α_h + β_h s_t + Σ_{j=1..3} (γ_j Δℓ_{t−j} + δ_j Δi_{t−j}) + u_{t+h}, h = 1…12, mensal, em que ℓ é a taxa média
de juros (SGS 20714 total, 20715 PJ, 20740 PF livres), Δ_h ℓ_{t+h} = ℓ_{t+h} − ℓ_{t−1} e i é a meta Selic de fim de mês.

O que β_h mede (ADR-031): a variação acumulada de ℓ em h meses após uma variação de 1 p.p. de s_t. Como a Selic é
persistente (ciclos), essa variação inclui as decisões seguintes do Copom: β_12 ≈ 4 p.p. (total) NÃO é repasse de 4 p.p.
por p.p. Por isso o mesmo LP é estimado para a própria Selic (θ_h = variação acumulada de i) e publica-se o repasse
normalizado ρ_h = β_h / θ_h (p.p. de ℓ por p.p. de Selic acumulada; IC pelo método delta com covariância HAC conjunta).

Dois choques s_t:
- "variacao": Δi_t, a mudança da meta no mês (endógena: o Copom reage à economia);
- "surpresa": soma no mês da surpresa do Copom em relação à mediana Focus da véspera (I.5). Parte não antecipada da
  decisão; com poucas surpresas não nulas, os intervalos são largos e o resultado é indicativo.
Associações condicionais, não efeitos causais identificados. Uso: python -m opm.repasse
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import PROC, SAIDA

SERIES = {"total": "juros_credito", "pj": "juros_pj", "pf_livres": "juros_pf_livres"}
Z90 = 1.645


def _hac_conjunto(X: np.ndarray, E: np.ndarray, L: int) -> np.ndarray:
    """Covariância Newey-West conjunta dos coeficientes de k equações com os mesmos regressores X (T × p), resíduos E (T × k)."""
    T, p = X.shape
    k = E.shape[1]
    G = np.concatenate([X * E[:, [j]] for j in range(k)], axis=1)  # T × (p·k): escores
    S = G.T @ G
    for l in range(1, L + 1):
        w = 1 - l / (L + 1)
        Gl = G[l:].T @ G[:-l]
        S += w * (Gl + Gl.T)
    Ainv = np.kron(np.eye(k), np.linalg.inv(X.T @ X))
    return Ainv @ S @ Ainv


def projecoes(l: pd.Series, i: pd.Series, H: int = 12, p: int = 3, choque: pd.Series | None = None) -> pd.DataFrame:
    """β_h (ℓ), θ_h (Selic) e ρ_h = β_h/θ_h para o choque dado (padrão: Δi_t)."""
    d = pd.DataFrame({"l": l, "i": i}).dropna()
    di, dl = d.i.diff(), d.l.diff()
    s = di if choque is None else choque.reindex(d.index).fillna(0.0)
    out = []
    for h in range(1, H + 1):
        X = pd.DataFrame({"s": s, **{f"dl_{j}": dl.shift(j) for j in range(1, p + 1)}, **{f"di_{j}": di.shift(j) for j in range(1, p + 1)}})
        if choque is not None:
            X["di"] = di  # com a surpresa como choque, controla a mudança antecipada do mês
        Y = pd.DataFrame({"yl": d.l.shift(-h) - d.l.shift(1), "yi": d.i.shift(-h) - d.i.shift(1)})
        m = pd.concat([Y, X], axis=1).dropna()
        Xm = np.column_stack([np.ones(len(m)), m[X.columns].to_numpy()])
        Ym = m[["yl", "yi"]].to_numpy()
        B, *_ = np.linalg.lstsq(Xm, Ym, rcond=None)
        V = _hac_conjunto(Xm, Ym - Xm @ B, h)
        q = Xm.shape[1]
        b, t = B[1, 0], B[1, 1]
        vb, vt, cbt = V[1, 1], V[q + 1, q + 1], V[1, q + 1]
        rho = b / t if abs(t) > 1e-9 else np.nan
        g = np.array([1 / t, -b / t ** 2]) if abs(t) > 1e-9 else np.array([np.nan, np.nan])
        se_r = float(np.sqrt(g @ np.array([[vb, cbt], [cbt, vt]]) @ g))
        out.append({"h": h, "beta": round(b, 4), "ep": round(np.sqrt(vb), 4), "ic90_inf": round(b - Z90 * np.sqrt(vb), 4), "ic90_sup": round(b + Z90 * np.sqrt(vb), 4),
                    "selic_acumulada": round(t, 4), "ep_selic": round(np.sqrt(vt), 4),
                    "repasse_normalizado": round(rho, 4), "ep_normalizado": round(se_r, 4),
                    "ic90_norm_inf": round(rho - Z90 * se_r, 4), "ic90_norm_sup": round(rho + Z90 * se_r, 4), "n": int(len(m))})
    return pd.DataFrame(out)


def surpresa_mensal(indice: pd.Index) -> pd.Series:
    s = pd.read_csv(SAIDA / "indicadores" / "i5_surpresa.csv")
    s["periodo"] = s.data_reuniao.str[:7]
    return s.groupby("periodo").surpresa_pp.sum().reindex(indice).fillna(0.0)


def main() -> None:
    selic = pd.read_csv(PROC / "conjuntura" / "selic_meta.csv").set_index("periodo")["meta_selic"]
    tab, tab_s = [], []
    for nome, sid in SERIES.items():
        l = pd.read_csv(PROC / "opm" / f"{sid}.csv").set_index("periodo")["valor"]
        r = projecoes(l, selic)
        r.insert(0, "serie", nome)
        tab.append(r)
        idx = pd.DataFrame({"l": l, "i": selic}).dropna().index
        rs = projecoes(l, selic, choque=surpresa_mensal(idx))
        rs.insert(0, "serie", nome)
        tab_s.append(rs)
    out = pd.concat(tab)
    out.to_csv(SAIDA / "indicadores" / "i13_repasse_lp.csv", index=False)
    out_s = pd.concat(tab_s)
    out_s.to_csv(SAIDA / "indicadores" / "i13_repasse_surpresa.csv", index=False)
    t = out[(out.serie == "total") & (out.h == 12)].iloc[0]
    ts = out_s[(out_s.serie == "total") & (out_s.h == 12)].iloc[0]
    print(f"✓ i13: β_12 (total) = {t.beta:.2f} [{t.ic90_inf:.2f}; {t.ic90_sup:.2f}] com Selic acumulada θ_12 = {t.selic_acumulada:.2f}; "
          f"normalizado ρ_12 = {t.repasse_normalizado:.2f} [{t.ic90_norm_inf:.2f}; {t.ic90_norm_sup:.2f}], n = {t.n}")
    print(f"  surpresa Focus: β_12 = {ts.beta:.2f} [{ts.ic90_inf:.2f}; {ts.ic90_sup:.2f}], θ_12 = {ts.selic_acumulada:.2f}, ρ_12 = {ts.repasse_normalizado:.2f} [{ts.ic90_norm_inf:.2f}; {ts.ic90_norm_sup:.2f}]")


if __name__ == "__main__":
    main()
