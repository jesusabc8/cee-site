"""I.6 — envelope de regras de Taylor (camada 2). Referências descritivas, nunca prescrição.

(T1) i = r* + π + 0,5(π − π*) + 0,5 h          — Taylor (1993), inflação corrente (IPCA 12 meses)
(T2) i = r* + π* + 1,5(Eπ − π*) + 0,5 h        — prospectiva (Focus 12 meses, suavizada)
(T3) i = θ i₋₁ + (1 − θ)[r* + π* + φ(Eπ − π*)] — inercial; θ e φ estimados por MQO em 2012-01 a 2019-12 (amostra declarada,
     antes da pandemia e do regime de meta contínua): i_t = c + θ i_{t−1} + b (Eπ − π*)_t, φ = b/(1 − θ).
Cada regra é avaliada para toda a faixa de r* (Q1 e Q3 do I.4) e de hiato (mínimo e máximo do I.15, IBC-Br mensal);
o envelope é o mínimo e o máximo do conjunto. Valores nominais em % a.a.; π* = meta do horizonte de 12 meses.
Uso: python -m opm.taylor
"""
from __future__ import annotations

import itertools

import numpy as np
import pandas as pd
import statsmodels.api as sm

from . import PROC, SAIDA

IND = SAIDA / "indicadores"
AMOSTRA_T3 = ("2012-01", "2019-12")


def meta_ano(metas: pd.DataFrame, ano: int) -> float:
    cont = metas[metas.sistematica.str.startswith("contínua")].iloc[0]
    if ano >= cont.ano:
        return float(cont.meta)
    return float(metas.loc[metas.ano == ano, "meta"].iloc[0])


def meta_12m(metas: pd.DataFrame, per: pd.Period) -> float:
    return float(np.mean([meta_ano(metas, (per + k).year) for k in range(1, 13)]))


def insumos() -> pd.DataFrame:
    selic = pd.read_csv(PROC / "conjuntura" / "selic_meta.csv").set_index("periodo")["meta_selic"]
    ipca = pd.read_csv(PROC / "conjuntura" / "ipca.csv").set_index("periodo")["acumulada_12m"]
    f12 = pd.read_csv(PROC / "opm" / "focus_inflacao_12m.csv")
    f12 = f12[f12.suavizada == "S"]
    f12 = f12.groupby(f12.data.str[:7])["mediana"].last()
    metas = pd.read_csv(PROC / "panorama" / "metas_inflacao.csv")
    faixa = pd.read_csv(IND / "i4_faixa_neutro.csv").set_index("periodo")[["q1", "q3"]]
    hm = pd.read_csv(IND / "i15_hiato_ibcbr_mensal.csv").set_index("periodo")[["minimo", "maximo"]]
    d = pd.DataFrame({"selic": selic, "pi": ipca, "epi": f12}).dropna()
    d["meta"] = [meta_12m(metas, pd.Period(p, "M")) for p in d.index]
    d["meta_corrente"] = [meta_ano(metas, int(p[:4])) for p in d.index]
    return d.join(faixa).join(hm.rename(columns={"minimo": "h_min", "maximo": "h_max"}))


def estimar_t3(d: pd.DataFrame) -> tuple[float, float, float]:
    x = d.loc[AMOSTRA_T3[0]:AMOSTRA_T3[1]].copy()
    x["i_1"] = d["selic"].shift(1)
    x["gap_e"] = x.epi - x.meta
    x = x.dropna(subset=["i_1"])
    m = sm.OLS(x.selic, sm.add_constant(x[["i_1", "gap_e"]])).fit()
    theta, b = float(m.params["i_1"]), float(m.params["gap_e"])
    return theta, b / (1 - theta), float(m.rsquared)


def main() -> None:
    d = insumos()
    theta, phi, r2 = estimar_t3(d)
    d["i_1"] = d.selic.shift(1)
    linhas = []
    for per, r in d.dropna(subset=["q1", "q3", "h_min", "h_max", "i_1"]).iterrows():
        vals = {"t1": [], "t2": [], "t3": []}
        for rs, h in itertools.product((r.q1, r.q3), (r.h_min, r.h_max)):
            vals["t1"].append(rs + r.pi + 0.5 * (r.pi - r.meta_corrente) + 0.5 * h)
            vals["t2"].append(rs + r.meta + 1.5 * (r.epi - r.meta) + 0.5 * h)
            vals["t3"].append(theta * r.i_1 + (1 - theta) * (rs + r.meta + phi * (r.epi - r.meta)))
        todos = sum(vals.values(), [])
        linhas.append({"periodo": per, "selic": r.selic, **{f"{k}_min": round(min(v), 4) for k, v in vals.items()}, **{f"{k}_max": round(max(v), 4) for k, v in vals.items()},
                       "envelope_min": round(min(todos), 4), "envelope_max": round(max(todos), 4)})
    out = pd.DataFrame(linhas)
    out.to_csv(IND / "i6_taylor.csv", index=False)
    pd.DataFrame([{"amostra": f"{AMOSTRA_T3[0]} a {AMOSTRA_T3[1]}", "theta": round(theta, 4), "phi": round(phi, 4), "r2": round(r2, 4)}]).to_csv(IND / "i6_taylor_t3_parametros.csv", index=False)
    u = out.iloc[-1]
    print(f"✓ i6: {len(out)} meses; θ={theta:.3f}, φ={phi:.2f}; {u.periodo}: Selic {u.selic} vs envelope [{u.envelope_min:.2f}; {u.envelope_max:.2f}]")


if __name__ == "__main__":
    main()
