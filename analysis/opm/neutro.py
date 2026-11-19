"""I.4 — faixa de juro neutro (métodos a e b) e I.3 — hiato de juros (especificação, I.3 e I.4; camada 1).

(a) juro real esperado para t+4 pela Focus anual (calculado em scripts/data/derive-opm.ts; média mensal);
(c) NTN-B de 10 anos menos prêmio a termo aproximado (camada 2; ver metodo_c);
(b) tendência do juro real ex ante de 12 meses (I.1, fim de mês): HP unilateral (λ = 14.400, mensal) e Hamilton
    (h = 24 meses, p = 12), ambos em tempo real.
A faixa é a mediana e os quartis (interpolação linear) entre os métodos disponíveis em cada mês. Com três métodos,
os quartis são pontos médios: a faixa é indicativa e cresce com os métodos das camadas 2 e 3.
O valor do BCB (RPM) não entra na distribuição; é mostrado ao lado.
Uso: python -m opm.neutro
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import SAIDA
from .filtros import hamilton, hp_unilateral

IND = SAIDA / "indicadores"
LAMBDA_MENSAL = 14_400
H_HAMILTON, P_HAMILTON = 24, 12


def mensal_ex_ante() -> pd.Series:
    i1 = pd.read_csv(IND / "i1_juro_real_ex_ante.csv", parse_dates=["data"])
    i1 = i1[i1.trajetoria_completa == 1]
    s = i1.set_index("data")["juro_real_ex_ante"]
    m = s.groupby(s.index.to_period("M")).last()
    return m.asfreq("M") if m.index.is_monotonic_increasing else m.sort_index()


def metodo_c() -> pd.Series | None:
    """(c) juro real da NTN-B de 10 anos (curva NSS) menos um prêmio a termo aproximado pela diferença entre a NTN-B de
    4 anos e o juro real Focus no mesmo horizonte (média geométrica de Fisher dos anos t+1…t+4). Camada 2."""
    p = IND / "curvas_nss.csv"
    if not p.exists():
        return None
    c = pd.read_csv(p)
    c = c[(c.curva == "real") & c.y_10a.notna() & c.y_4a.notna()]
    fa = pd.read_csv(SAIDA / "focus_anuais.csv")
    fa = fa[fa.indicador.isin(["Selic", "IPCA"])].pivot_table(index=["data", "ano_referencia"], columns="indicador", values="mediana").reset_index()
    datas = sorted(fa.data.unique())
    out = {}
    for _, r in c.iterrows():
        d = max((x for x in datas if x <= r.data), default=None)
        if d is None:
            continue
        ano = int(d[:4])
        f = fa[(fa.data == d) & fa.ano_referencia.between(ano + 1, ano + 4)].dropna()
        if len(f) < 4:
            continue
        reais = (1 + f.Selic / 100) / (1 + f.IPCA / 100)
        r_focus4 = 100 * (float(np.prod(reais)) ** 0.25 - 1)
        out[pd.Period(r.data[:7], "M")] = r.y_10a - (r.y_4a - r_focus4)
    return pd.Series(out).sort_index() if out else None


def metodo_d() -> pd.Series | None:
    """(d) TIPS de 5 anos (DFII5), média mensal. Sem medida aberta de risco soberano, não estima o neutro brasileiro."""
    p = SAIDA / "tips5.csv"
    if not p.exists():
        return None
    t = pd.read_csv(p).dropna(subset=["valor"])
    m = t.groupby(t.data.str[:7])["valor"].mean()
    m.index = pd.PeriodIndex(m.index, freq="M")
    return m


def metodo_e() -> pd.Series | None:
    """(e) modelo semiestrutural (camada 3), em tempo real; só entra se o modelo passar no critério de identificação."""
    p, dg = IND / "i4e_neutro_modelo.csv", IND / "modelo_diagnostico.csv"
    if not (p.exists() and dg.exists()) or int(pd.read_csv(dg).publicavel.iloc[0]) != 1:
        return None
    e = pd.read_csv(p).dropna()
    q = pd.PeriodIndex(e.trimestre.str.replace("-T", "Q"), freq="Q")
    s = pd.Series(e.neutro_modelo.values, index=q)
    meses = pd.period_range(q.min().asfreq("M", "start"), q.max().asfreq("M", "end"), freq="M")
    return pd.Series([s.get(m.asfreq("Q"), np.nan) for m in meses], index=meses)


def faixa(metodos: pd.DataFrame) -> pd.DataFrame:
    q = metodos.apply(lambda r: pd.Series(np.percentile(r.dropna(), [25, 50, 75]) if r.notna().any() else [np.nan] * 3, index=["q1", "mediana", "q3"]), axis=1)
    q["metodos"] = metodos.notna().sum(axis=1)
    return q


def main() -> None:
    rea = mensal_ex_ante()
    a = pd.read_csv(IND / "i4a_neutro_focus_t4.csv", parse_dates=["data"]).set_index("data")["juro_real_t4"]
    a_m = a.groupby(a.index.to_period("M")).mean()
    metodos = pd.DataFrame({
        "a_focus_t4": a_m,
        "b_hp_unilateral": hp_unilateral(rea, LAMBDA_MENSAL),
        "b_hamilton": hamilton(rea, H_HAMILTON, P_HAMILTON),
    }).loc[rea.index.min():]
    c = metodo_c()
    if c is not None:
        metodos["c_ntnb_longa"] = c.groupby(level=0).last()
    e = metodo_e()
    if e is not None:
        metodos["e_modelo"] = e
    # (d) só o juro real americano, sem prêmio de risco soberano e cambial (ADR-024): mostrado à parte, fora da faixa.
    d_tips = metodo_d()
    f = faixa(metodos)
    out = pd.concat([metodos, f], axis=1)
    if d_tips is not None:
        out["d_tips5_sem_premio_fora_da_faixa"] = d_tips.reindex(out.index)
    out.insert(0, "juro_real_ex_ante", rea)
    out = out.round(4)
    out.index = out.index.astype(str)
    out.index.name = "periodo"
    out.to_csv(IND / "i4_faixa_neutro.csv")
    # I.3 hiato de juros: r^ea − faixa (contra a mediana e os quartis). Restritiva sem ambiguidade só se r^ea > Q3.
    h = pd.DataFrame({
        "juro_real_ex_ante": out.juro_real_ex_ante,
        "hiato_mediana": (out.juro_real_ex_ante - out.mediana).round(4),
        "hiato_q1": (out.juro_real_ex_ante - out.q3).round(4),
        "hiato_q3": (out.juro_real_ex_ante - out.q1).round(4),
        "acima_q3": (out.juro_real_ex_ante > out.q3).astype("Int64").where(out.q3.notna()),
    }).dropna(subset=["hiato_mediana"])
    h.to_csv(IND / "i3_hiato_juros.csv")
    print(f"✓ i4_faixa_neutro: {len(out)} meses; último {out.index[-1]}: mediana {out.mediana.iloc[-1]:.2f} [{out.q1.iloc[-1]:.2f}; {out.q3.iloc[-1]:.2f}]")
    print(f"✓ i3_hiato_juros: {len(h)} meses; último hiato (mediana) {h.hiato_mediana.iloc[-1]:.2f} p.p.")


if __name__ == "__main__":
    main()
