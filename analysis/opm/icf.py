"""I.17 — índice de condições financeiras por componentes principais (camada 3, EXPERIMENTAL).

Variáveis mensais de fontes abertas (padronizadas): spread médio do crédito (SGS 20783), ICC (SGS 25351), juro real ex ante
(I.1), inclinação da curva nominal (3 anos − 1 ano, NSS), variação em 12 meses do câmbio real efetivo (SGS 11752), do dólar
global (DTWEXBGS) e Treasury de 10 anos (DGS10). ICF = primeiro componente principal, com sinal tal que valores maiores =
condições mais apertadas (carga positiva no spread). PCA na amostra inteira (não é tempo real) — limitação declarada.
Uso: python -m opm.icf
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import PROC, SAIDA

IND = SAIDA / "indicadores"


def mensal_d(arq: str) -> pd.Series:
    d = pd.read_csv(PROC / arq).dropna(subset=["valor"])
    return d.groupby(d.data.str[:7])["valor"].mean()


def montar() -> pd.DataFrame:
    m = lambda arq, col="valor": pd.read_csv(PROC / arq).set_index("periodo")[col]
    curvas = pd.read_csv(IND / "curvas_nss.csv")
    nom = curvas[curvas.curva == "nominal"].assign(p=lambda x: x.data.str[:7]).groupby("p").last()
    rea = pd.read_csv(IND / "i4_faixa_neutro.csv").set_index("periodo")["juro_real_ex_ante"]
    cr = m("panorama/cambio_real.csv", "indice")
    dg = mensal_d("opm/dolar_global.csv")
    return pd.DataFrame({
        "spread_credito": m("opm/spread_credito.csv"), "icc": m("opm/icc.csv"), "juro_real_ex_ante": rea,
        "inclinacao_3a_1a": nom.y_3a - nom.y_1a, "cambio_real_12m": 100 * (cr / cr.shift(12) - 1),
        "dolar_global_12m": 100 * (dg / dg.shift(12) - 1), "ust10": mensal_d("opm/ust10.csv"),
    }).sort_index().dropna()


def main() -> None:
    d = montar()
    z = (d - d.mean()) / d.std(ddof=0)
    _, s, vt = np.linalg.svd(z.to_numpy(), full_matrices=False)
    carga = vt[0] * (1 if vt[0][list(d.columns).index("spread_credito")] > 0 else -1)
    icf = z.to_numpy() @ carga
    out = pd.DataFrame({"periodo": d.index, "icf": np.round(icf, 4)})
    out.to_csv(IND / "i17_condicoes_financeiras.csv", index=False)
    pd.DataFrame({"variavel": d.columns, "carga": np.round(carga, 4)}).assign(variancia_explicada_pc1=round(float(s[0] ** 2 / (s ** 2).sum()), 4)).to_csv(IND / "i17_cargas.csv", index=False)
    print(f"✓ i17 (experimental): {len(out)} meses ({out.periodo.iloc[0]} → {out.periodo.iloc[-1]}); PC1 explica {s[0]**2/(s**2).sum():.0%}; último {out.icf.iloc[-1]:.2f}")


if __name__ == "__main__":
    main()
