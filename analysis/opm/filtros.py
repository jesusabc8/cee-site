"""Filtros de tendência em tempo real (especificação, "Filtros de tendência"): HP unilateral e Hamilton (2018).

O HP bilateral usa observações futuras e distorce o fim da amostra; aqui cada ponto t usa só dados até t.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from statsmodels.tsa.filters.hp_filter import hpfilter


def hp_unilateral(y: pd.Series, lamb: float, minimo: int = 36) -> pd.Series:
    """Tendência HP unilateral: para cada t ≥ `minimo`, roda o HP em y[0..t] e guarda o último ponto da tendência."""
    v = y.to_numpy(dtype=float)
    out = np.full(len(v), np.nan)
    for t in range(minimo - 1, len(v)):
        _, tend = hpfilter(v[: t + 1], lamb=lamb)
        out[t] = tend[-1]
    return pd.Series(out, index=y.index)


def hamilton(y: pd.Series, h: int, p: int, recursivo: bool = True, minimo: int = 60) -> pd.Series:
    """Filtro de Hamilton (2018): tendência em t = projeção de y_t por MQO em (1, y_{t−h}, …, y_{t−h−p+1}).

    Com `recursivo=True`, os coeficientes de cada t são estimados só com pares (y_s, X_s), s ≤ t (tempo real)."""
    v = y.to_numpy(dtype=float)
    n = len(v)
    X = np.full((n, p + 1), np.nan)
    for t in range(h + p - 1, n):
        X[t] = [1.0, *[v[t - h - j] for j in range(p)]]
    out = np.full(n, np.nan)
    validos = [t for t in range(n) if not np.isnan(X[t]).any()]
    if not recursivo:
        b, *_ = np.linalg.lstsq(X[validos], v[validos], rcond=None)
        for t in validos:
            out[t] = X[t] @ b
        return pd.Series(out, index=y.index)
    for k, t in enumerate(validos):
        if k + 1 < minimo:
            continue
        amostra = validos[: k + 1]
        b, *_ = np.linalg.lstsq(X[amostra], v[amostra], rcond=None)
        out[t] = X[t] @ b
    return pd.Series(out, index=y.index)
