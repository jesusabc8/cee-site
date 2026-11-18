"""I.4 — faixa de juro neutro (métodos a e b) e I.3 — hiato de juros (especificação, I.3 e I.4; camada 1).

(a) juro real esperado para t+4 pela Focus anual (calculado em scripts/data/derive-opm.ts; média mensal);
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
    f = faixa(metodos)
    out = pd.concat([metodos, f], axis=1)
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
