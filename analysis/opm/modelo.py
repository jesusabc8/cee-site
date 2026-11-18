"""A2.7 — modelo semiestrutural pequeno do CEE e I.4 (e). Camada 3 (EXPERIMENTAL; Texto para Discussão em minuta).

Trimestral, equações estimadas uma a uma por MQO (erros de Newey-West), na linha dos modelos de pequena escala do BCB
(BCB, 2023a; 2023b; Svensson, 1997), em versão reduzida:
  IS:        h_t = b0 + b1 h_{t−1} + b2 r_{t−1} + b3 Δq_{t−1} + e
  Phillips:  π_t = a0 + a1 π_{t−1} + a2 πᵉ_t + a3 h_{t−1} + a4 Δq_{t−1} + u
  Taylor:    i_t = c0 + ρ i_{t−1} + c1 πᵉ_t + c2 h_t + w            (estimada e reportada; não usada nos cenários)
  UIP:       Δq_t = d0 + d1 Δ(i − i*)_{t−1} + s
h: média dos hiatos HP e Hamilton (I.15); r: juro real ex ante (I.1, média trimestral); π: IPCA dessazonalizado, variação
trimestral anualizada (I.9); πᵉ: Focus 12 meses; q: câmbio real efetivo (SGS 11752, alta = depreciação); i: meta Selic;
i*: fed funds. Juro neutro do modelo (I.4 e): estado estacionário da IS com h = 0 e Δq = 0, r* = −b0/b2, reestimado a cada
trimestre só com dados até ele (tempo real).
Cenários: exercícios CONDICIONAIS a trajetórias exógenas da Selic (Focus mais recente; ±1 p.p.), com πᵉ fixa na última
Focus e i* constante; nunca previsão do CEE. Critério de publicação no sítio (modelo_diagnostico.csv): t(b2) ≤ −2 e a3 > 0; sem isso, só os coeficientes e o motivo
aparecem, e o exercício completo fica na minuta do TD. Uso: python -m opm.modelo
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm

from . import PROC, SAIDA

IND = SAIDA / "indicadores"
TD = SAIDA.parents[2] / "docs" / "td" / "dados"  # fora de data/processed: não é servido em /dados/
HORIZONTE = 8
MIN_TRIM = 24


def trimestral(s: pd.Series, como: str = "mean") -> pd.Series:
    idx = pd.PeriodIndex(s.index, freq="M")
    return getattr(pd.Series(s.values, index=idx).groupby(idx.asfreq("Q")), como)()


def dados() -> pd.DataFrame:
    h = pd.read_csv(IND / "i15_hiato_produto_trimestral.csv").dropna()
    h = pd.Series(((h.hp_unilateral + h.hamilton) / 2).values, index=pd.PeriodIndex(h.trimestre.str.replace("-T", "Q"), freq="Q"))
    i1 = pd.read_csv(IND / "i1_juro_real_ex_ante.csv").query("trajetoria_completa == 1")
    rea = i1.groupby(i1.data.str[:7])["juro_real_ex_ante"].last()
    sa = pd.read_csv(IND / "i9_saar.csv").set_index("periodo")["ipca_saar"]
    sa.index = pd.PeriodIndex(sa.index, freq="M")
    pi = sa[sa.index.month % 3 == 0]
    pi.index = pi.index.asfreq("Q")
    f12 = pd.read_csv(PROC / "opm" / "focus_inflacao_12m.csv").query("suavizada == 'S'")
    f12 = f12.groupby(f12.data.str[:7])["mediana"].last()
    cr = pd.read_csv(PROC / "panorama" / "cambio_real.csv").set_index("periodo")["indice"]
    q = trimestral(cr)
    selic = pd.read_csv(PROC / "conjuntura" / "selic_meta.csv").set_index("periodo")["meta_selic"]
    ff = pd.read_csv(PROC / "opm" / "fed_funds_sup.csv")
    ff = ff.groupby(ff.data.str[:7])["valor"].mean()
    return pd.DataFrame({"h": h, "r": trimestral(rea), "pi": pi, "pie": trimestral(f12),
                         "dq": 100 * q.pct_change(), "i": trimestral(selic), "istar": trimestral(ff)})


def estimar(d: pd.DataFrame) -> dict[str, sm.regression.linear_model.RegressionResultsWrapper]:
    x = d.copy()
    x["h1"], x["r1"], x["dq1"], x["pi1"], x["i1"] = x.h.shift(), x.r.shift(), x.dq.shift(), x.pi.shift(), x.i.shift()
    x["ddif1"] = (x.i - x.istar).diff().shift()
    eq = {"IS": ("h", ["h1", "r1", "dq1"]), "Phillips": ("pi", ["pi1", "pie", "h1", "dq1"]), "Taylor": ("i", ["i1", "pie", "h"]), "UIP": ("dq", ["ddif1"])}
    out = {}
    for nome, (y, xs) in eq.items():
        m = x[[y, *xs]].dropna()
        out[nome] = sm.OLS(m[y], sm.add_constant(m[xs])).fit(cov_type="HAC", cov_kwds={"maxlags": 4})
    return out


def neutro_tempo_real(d: pd.DataFrame) -> pd.Series:
    out = {}
    validos = d.dropna(subset=["h", "r", "dq"]).index
    for k in range(MIN_TRIM, len(validos) + 1):
        fim = validos[k - 1]
        m = estimar(d.loc[:fim])["IS"]
        b0, b2 = m.params["const"], m.params["r1"]
        out[fim] = -b0 / b2 if b2 < 0 else np.nan  # sem efeito contracionista do juro, o neutro não é identificado
    return pd.Series(out)


def selic_trimestral_focus() -> tuple[pd.Series, str]:
    """Trajetória da meta Selic por trimestre: realizada até a última vigência e mediana Focus por reunião depois."""
    fs = pd.read_csv(PROC / "opm" / "focus_selic.csv")
    data = fs.data.max()
    fs = fs[fs.data == data]
    cal = pd.read_csv(PROC / "opm" / "copom_calendario.csv").set_index("reuniao_ano")["fim"]
    dec = pd.read_csv(PROC / "opm" / "copom_decisoes.csv")
    atual = float(dec.sort_values("inicio_vigencia").meta_selic.dropna().iloc[-1])
    dias = pd.bdate_range(data, periods=HORIZONTE * 66)
    taxa = pd.Series(atual, index=dias)
    for _, r in fs.sort_values("reuniao_chave").iterrows():
        if r.reuniao in cal.index and pd.Timestamp(cal[r.reuniao]) > pd.Timestamp(data):
            taxa[taxa.index > pd.Timestamp(cal[r.reuniao])] = r.mediana
    return taxa.groupby(taxa.index.to_period("Q")).mean(), data


def cenarios(d: pd.DataFrame, m: dict) -> pd.DataFrame:
    base_i, data_focus = selic_trimestral_focus()
    ult = d.dropna(subset=["h", "pi", "dq"]).index[-1]
    pie = float(d.pie.dropna().iloc[-1])
    istar = float(d.istar.dropna().iloc[-1])
    IS, PH, UIP = m["IS"].params, m["Phillips"].params, m["UIP"].params
    linhas = []
    for nome, delta in (("Focus", 0.0), ("Focus +1 p.p.", 1.0), ("Focus −1 p.p.", -1.0)):
        h, pi, dq = float(d.h[ult]), float(d.pi[ult]), float(d.dq[ult])
        i_ant, i_ant2 = float(d.i[ult]), float(d.i.shift()[ult])
        r_ant = float(d.r[ult])
        for k in range(1, HORIZONTE + 1):
            t = ult + k
            i = float(base_i.get(t, base_i.iloc[-1])) + delta
            ddif = (i_ant - istar) - (i_ant2 - istar)
            dq_n = UIP["const"] + UIP["ddif1"] * ddif
            h_n = IS["const"] + IS["h1"] * h + IS["r1"] * r_ant + IS["dq1"] * dq
            pi_n = PH["const"] + PH["pi1"] * pi + PH["pie"] * pie + PH["h1"] * h + PH["dq1"] * dq
            r_n = 100 * ((1 + i / 100) / (1 + pie / 100) - 1)
            linhas.append({"cenario": nome, "trimestre": f"{t.year}-T{t.quarter}", "selic_media": round(i, 4), "hiato": round(h_n, 4), "ipca_saar_trimestral": round(pi_n, 4), "variacao_cambio_real": round(dq_n, 4)})
            h, pi, dq, i_ant2, i_ant, r_ant = h_n, pi_n, dq_n, i_ant, i, r_n
    out = pd.DataFrame(linhas)
    out["ipca_4_trimestres"] = out.groupby("cenario")["ipca_saar_trimestral"].transform(lambda s: (100 * (((1 + s / 100) ** 0.25).rolling(4).apply(np.prod, raw=True) - 1)).round(4))
    out["coleta_focus"] = data_focus
    return out


def main() -> None:
    d = dados()
    m = estimar(d)
    coef = pd.DataFrame([{"equacao": e, "variavel": v, "coeficiente": round(float(r.params[v]), 4), "erro_padrao": round(float(r.bse[v]), 4), "n": int(r.nobs), "r2": round(float(r.rsquared), 4),
                          "amostra": f"{r.model.data.row_labels[0]} a {r.model.data.row_labels[-1]}"} for e, r in m.items() for v in r.params.index])
    coef.to_csv(IND / "modelo_coeficientes.csv", index=False)
    rn = neutro_tempo_real(d)
    rn_df = pd.DataFrame({"trimestre": [f"{p.year}-T{p.quarter}" for p in rn.index], "neutro_modelo": rn.round(4).values})
    c = cenarios(d, m)
    is_ = m["IS"]
    # Critérios mínimos de identificação para publicar (I.4 e) e os cenários no sítio: IS com efeito contracionista do juro
    # estatisticamente diferente de zero (t ≤ −2) e curva de Phillips com coeficiente positivo do hiato.
    t_is = float(is_.params["r1"] / is_.bse["r1"])
    a3 = float(m["Phillips"].params["h1"])
    publicavel = t_is <= -2 and a3 > 0
    pd.DataFrame([{"t_inclinacao_is": round(t_is, 3), "coef_hiato_phillips": round(a3, 4), "publicavel": int(publicavel),
                   "criterio": "t(b2) <= -2 e a3 > 0"}]).to_csv(IND / "modelo_diagnostico.csv", index=False)
    # Cenários e neutro do modelo: sempre na minuta do TD; no sítio só se o modelo passar no critério.
    TD.mkdir(parents=True, exist_ok=True)
    rn_df.to_csv(TD / "i4e_neutro_modelo.csv", index=False)
    c.to_csv(TD / "modelo_cenarios.csv", index=False)
    for nome, df in (("i4e_neutro_modelo.csv", rn_df), ("modelo_cenarios.csv", c)):
        if publicavel:
            df.to_csv(IND / nome, index=False)
        else:
            (IND / nome).unlink(missing_ok=True)
    print(f"✓ modelo (experimental; publicável: {'sim' if publicavel else 'não'} — t(b2) = {t_is:.2f}, a3 = {a3:.3f}): IS b2 = {is_.params['r1']:.3f} (ep {is_.bse['r1']:.3f}); r*_e último {rn.dropna().iloc[-1]:.2f}; cenários {c.cenario.nunique()} × {HORIZONTE} trimestres")


if __name__ == "__main__":
    main()
