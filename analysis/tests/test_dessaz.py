"""Saídas do X-13 (geradas por `python -m opm.dessaz`) e validação contra o RPM de set./2026 (ADR-023)."""
import json

import pandas as pd
import pytest

from opm import SAIDA, SPECS
from opm.dessaz import indice_de_variacao
from opm.validacao import TOLERANCIA, validar
from opm.x13 import SHA256

D = SAIDA / "dessaz"
pytestmark = pytest.mark.skipif(not (D / "_meta.json").exists(), reason="rode python -m opm.dessaz antes")


def test_hash_do_binario_fixado():
    assert SHA256 == "a91d37bb2fef46237e1eadd7d9b4f1c00a422d58f6b286c9bfe485289e8ac6f5"


def test_indice_encadeado():
    v = pd.Series([1.0, -0.5, 2.0])
    assert indice_de_variacao(v).round(6).tolist() == [101.0, 100.495, 102.5049]


def test_toda_especificacao_tem_saida_com_original_e_ajustada():
    meta = json.loads((D / "_meta.json").read_text())
    for p in SPECS.glob("*.yaml"):
        nome = p.stem
        assert nome in meta
        df = pd.read_csv(D / f"{nome}.csv")
        assert list(df.columns) == ["periodo", "original", "ajustada", "fator_sazonal"]
        assert df.ajustada.notna().all() and df.original.notna().all()


def test_ipca_sem_ajuste_confere_com_rpm():
    # RPM set./2026, p. 35: IPCA trimestral sem ajuste 2,14 % (até maio) e −0,09 % (até agosto).
    o = pd.read_csv(D / "ipca.csv", index_col="periodo")["original"]
    tri = lambda p: 100 * ((1 + o.loc[:p].iloc[-3:] / 100).prod() - 1)
    assert round(tri("2026-05"), 2) == 2.14
    assert round(tri("2026-08"), 2) == -0.09


def test_saar_dentro_da_tolerancia_do_bcb():
    df = validar()
    assert (df.diferenca_pp.abs() <= TOLERANCIA).all(), df.to_string()


def test_soma_dos_fatores_aproximadamente_neutra_em_12_meses():
    f = pd.read_csv(D / "ipca.csv")["fator_sazonal"].iloc[-24:]
    assert abs(f.rolling(12).mean().dropna() - 1).max() < 0.01  # fatores multiplicativos (razão)
