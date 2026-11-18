"""I.13 — repasse da Selic ao custo do crédito por projeções locais (Jordà, 2005). Camada 2.

Δ_h ℓ_{t+h} = α_h + β_h Δi_t + Σ_{j=1..3} (γ_j Δℓ_{t−j} + δ_j Δi_{t−j}) + u_{t+h}, h = 1…12, mensal, em que
ℓ é a taxa média de juros (SGS 20714 total, 20715 PJ, 20740 PF livres), Δ_h ℓ_{t+h} = ℓ_{t+h} − ℓ_{t−1} e i é a meta
Selic de fim de mês. Erros-padrão de Newey-West (defasagens = h). β_h é o repasse acumulado em p.p. por 1 p.p. de Selic.
Associação condicional, não efeito causal identificado: Δi responde ao estado da economia.
Uso: python -m opm.repasse
"""
from __future__ import annotations

import pandas as pd
import statsmodels.api as sm

from . import PROC, SAIDA

SERIES = {"total": "juros_credito", "pj": "juros_pj", "pf_livres": "juros_pf_livres"}


def projecoes(l: pd.Series, i: pd.Series, H: int = 12, p: int = 3) -> pd.DataFrame:
    d = pd.DataFrame({"l": l, "i": i}).dropna()
    di, dl = d.i.diff(), d.l.diff()
    out = []
    for h in range(1, H + 1):
        X = pd.DataFrame({"di": di, **{f"dl_{j}": dl.shift(j) for j in range(1, p + 1)}, **{f"di_{j}": di.shift(j) for j in range(1, p + 1)}})
        y = d.l.shift(-h) - d.l.shift(1)
        m = pd.concat([y.rename("y"), X], axis=1).dropna()
        r = sm.OLS(m.y, sm.add_constant(m.drop(columns="y"))).fit(cov_type="HAC", cov_kwds={"maxlags": h})
        b, se = float(r.params["di"]), float(r.bse["di"])
        out.append({"h": h, "beta": round(b, 4), "ep": round(se, 4), "ic90_inf": round(b - 1.645 * se, 4), "ic90_sup": round(b + 1.645 * se, 4), "n": int(r.nobs)})
    return pd.DataFrame(out)


def main() -> None:
    selic = pd.read_csv(PROC / "conjuntura" / "selic_meta.csv").set_index("periodo")["meta_selic"]
    tab = []
    for nome, sid in SERIES.items():
        l = pd.read_csv(PROC / "opm" / f"{sid}.csv").set_index("periodo")["valor"]
        r = projecoes(l, selic)
        r.insert(0, "serie", nome)
        tab.append(r)
    out = pd.concat(tab)
    out.to_csv(SAIDA / "indicadores" / "i13_repasse_lp.csv", index=False)
    t = out[(out.serie == "total") & (out.h == 12)].iloc[0]
    print(f"✓ i13: β_12 (total) = {t.beta:.2f} [{t.ic90_inf:.2f}; {t.ic90_sup:.2f}], n = {t.n}")


if __name__ == "__main__":
    main()
