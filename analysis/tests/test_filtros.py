import numpy as np
import pandas as pd
from statsmodels.tsa.filters.hp_filter import hpfilter

from opm.filtros import hamilton, hp_unilateral


def _serie(n=120, seed=1):
    rng = np.random.default_rng(seed)
    idx = pd.period_range("2012-01", periods=n, freq="M")
    return pd.Series(5 + 0.02 * np.arange(n) + rng.normal(0, 0.3, n), index=idx)


def test_hp_unilateral_ultimo_ponto_igual_ao_bilateral():
    y = _serie()
    _, tend = hpfilter(y.to_numpy(), lamb=14400)
    assert np.isclose(hp_unilateral(y, 14400).iloc[-1], tend[-1])
    assert hp_unilateral(y, 14400, minimo=36).iloc[:35].isna().all()


def test_hp_unilateral_nao_usa_futuro():
    y = _serie()
    a = hp_unilateral(y, 14400)
    y2 = y.copy()
    y2.iloc[-1] += 10
    b = hp_unilateral(y2, 14400)
    assert np.allclose(a.iloc[:-1], b.iloc[:-1], equal_nan=True)


def test_hamilton_em_tendencia_linear_exata():
    idx = pd.period_range("2000-01", periods=200, freq="M")
    y = pd.Series(1.0 + 0.1 * np.arange(200), index=idx)
    t = hamilton(y, 24, 12, recursivo=False)
    assert np.allclose(t.dropna(), y[t.notna()])
    tr = hamilton(y, 24, 12, recursivo=True, minimo=30)
    assert tr.notna().sum() > 0 and np.allclose(tr.dropna(), y[tr.notna()])
