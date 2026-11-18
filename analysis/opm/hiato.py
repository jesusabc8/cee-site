"""I.15 — hiato do produto multimétodo (camada 2): HP unilateral e Hamilton (2018), em tempo real.

Trimestral: PIB dessazonalizado pelo IBGE (SIDRA 1621), λ = 1.600, Hamilton h = 8, p = 4.
Mensal: IBC-Br dessazonalizado pelo BCB (SGS 24364), λ = 129.600 (Ravn e Uhlig, 2002), Hamilton h = 24, p = 12.
Hiato = 100 × (ln y − tendência de ln y), em % do produto potencial. A faixa é o mínimo e o máximo entre os métodos;
o método de componentes não observados com curva de Phillips entra na camada 3. O BCB é referência ao lado (RPM).
Uso: python -m opm.hiato
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import PROC, SAIDA
from .filtros import hamilton, hp_unilateral


def hiatos(y: pd.Series, lamb: float, h: int, p: int, minimo_hp: int, minimo_h: int) -> pd.DataFrame:
    ly = 100 * np.log(y)
    d = pd.DataFrame({"hp_unilateral": ly - hp_unilateral(ly, lamb, minimo=minimo_hp), "hamilton": ly - hamilton(ly, h, p, minimo=minimo_h)})
    d["minimo"] = d[["hp_unilateral", "hamilton"]].min(axis=1, skipna=False)
    d["maximo"] = d[["hp_unilateral", "hamilton"]].max(axis=1, skipna=False)
    return d.round(4)


def main() -> None:
    pib = pd.read_csv(PROC / "opm" / "pib_volume_sa.csv")
    q = pd.Series(pib.indice.values, index=pd.PeriodIndex(pib.trimestre.str.replace("-T", "Q"), freq="Q"))
    tq = hiatos(q, 1600, 8, 4, minimo_hp=24, minimo_h=24)
    tq.index = [f"{p.year}-T{p.quarter}" for p in tq.index]
    tq.index.name = "trimestre"
    tq.dropna(how="all").to_csv(SAIDA / "indicadores" / "i15_hiato_produto_trimestral.csv")
    ib = pd.read_csv(PROC / "opm" / "ibcbr.csv").dropna()
    m = pd.Series(ib.valor.values, index=pd.PeriodIndex(ib.periodo, freq="M"))
    tm = hiatos(m, 129_600, 24, 12, minimo_hp=60, minimo_h=60)
    tm.index = tm.index.astype(str)
    tm.index.name = "periodo"
    tm.dropna(how="all").to_csv(SAIDA / "indicadores" / "i15_hiato_ibcbr_mensal.csv")
    u = tq.dropna().iloc[-1]
    print(f"✓ i15: trimestral até {tq.dropna().index[-1]} (HP {u.hp_unilateral:.2f}; Hamilton {u.hamilton:.2f}); mensal até {tm.dropna().index[-1]}")


if __name__ == "__main__":
    main()
