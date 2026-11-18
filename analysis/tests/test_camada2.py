"""Camada 2 do OPM: curvas NSS, hiato do produto, regras de Taylor, projeções locais e subitens."""
import datetime as dt

import numpy as np
import pandas as pd
import pytest

from opm import SAIDA
from opm.calendario import dias_uteis
from opm.curvas import _cargas, ajustar_nss, avaliar
from opm.repasse import projecoes

IND = SAIDA / "indicadores"


def test_dias_uteis_base_252():
    assert dias_uteis(dt.date(2026, 11, 17), dt.date(2026, 11, 24)) == 4  # 20/11 feriado; fim de semana
    assert dias_uteis(dt.date(2026, 1, 1), dt.date(2027, 1, 1)) in range(248, 254)


def test_nss_recupera_curva_conhecida():
    tau = np.array([0.5, 1, 1.5, 2, 3, 4, 5, 7, 10, 15])
    y = _cargas(tau, 1.5, 6.0) @ np.array([7.0, -1.0, 1.5, -0.8])
    par = ajustar_nss(tau, y)
    assert par["modelo"] == "NSS" and par["mae_bp"] < 0.5
    assert abs(avaliar(par, 3.0) - float((_cargas(np.array([3.0]), 1.5, 6.0) @ np.array([7.0, -1.0, 1.5, -0.8]))[0])) < 0.01
    assert np.isnan(avaliar(par, 16.0))  # sem extrapolar além do prazo máximo + 6 meses


def test_projecoes_locais_recuperam_repasse_simulado():
    rng = np.random.default_rng(3)
    n = 400
    i = pd.Series(np.cumsum(rng.choice([-0.5, 0, 0, 0.5], n)) + 10)
    l = 30 + 2.0 * i + rng.normal(0, 0.05, n)  # repasse imediato e permanente de 2 p.p.
    idx = pd.period_range("1990-01", periods=n, freq="M").astype(str)
    r = projecoes(pd.Series(l.values, index=idx), pd.Series(i.values, index=idx), H=6)
    # o valor verdadeiro (2) fica dentro de três erros-padrão de Newey-West em todos os horizontes
    assert ((r.beta - 2.0).abs() < 3 * r.ep).all()
    assert abs(r.beta.iloc[0] - 2.0) < 0.3


@pytest.mark.skipif(not (IND / "curvas_nss.csv").exists(), reason="rode python -m opm.curvas antes")
def test_saidas_camada2_coerentes():
    c = pd.read_csv(IND / "curvas_nss.csv")
    assert c.mae_bp.median() < 5  # ajuste às taxas publicadas, em bp
    be = pd.read_csv(IND / "i12_inflacao_implicita.csv")
    assert be.filter(like="implicita").stack().dropna().between(-5, 30).all()
    t = pd.read_csv(IND / "i6_taylor.csv")
    for k in ("t1", "t2", "t3"):
        assert (t.envelope_min <= t[f"{k}_min"] + 1e-9).all() and (t[f"{k}_max"] <= t.envelope_max + 1e-9).all()
    s = pd.read_csv(IND / "i11_subitens_acima_teto.csv")
    assert s.parcela_acima_4_5.between(0, 100).all() and (s.peso_incluido > 80).all()
    h = pd.read_csv(IND / "i15_hiato_produto_trimestral.csv").dropna()
    assert (h.minimo <= h.maximo).all() and h[["hp_unilateral", "hamilton"]].abs().max().max() < 15
