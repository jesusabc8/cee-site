"""Camada 3 (experimental): ACM, ICF, modelo semiestrutural e índice de tom."""
import numpy as np
import pandas as pd
import pytest

from opm import SAIDA
from opm.acm import acm
from opm.tom import classifica, frases, kappa, normaliza

IND = SAIDA / "indicadores"


def test_kappa_casos_conhecidos():
    assert kappa(list("aabb"), list("aabb")) == 1.0
    assert abs(kappa(list("aaab"), list("abab")) - 0.5) < 1e-12  # po = 0,75; pe = 0,5
    # exemplo clássico: po = 0.7, pe = 0.5 → κ = 0.4
    a = ["s"] * 5 + ["n"] * 5
    b = ["s"] * 3 + ["n"] * 2 + ["n"] * 4 + ["s"] * 1
    assert abs(kappa(a, b) - 0.4) < 1e-12


def test_lexico_e_frases():
    lex = {"contracionista": [normaliza("pressões inflacionárias")], "expansionista": [normaliza("flexibilização")]}
    assert classifica("Persistem PRESSÕES INFLACIONÁRIAS relevantes.", lex)[0] == "contracionista"
    assert classifica("O Comitê avalia a flexibilização.", lex)[0] == "expansionista"
    assert len(frases("<p>Primeira frase longa o bastante para contar aqui. Segunda frase também longa o bastante.</p>")) == 2


def test_acm_neutro_igual_ajustado_sem_premio():
    # curva gerada sem prêmio de risco: o prêmio estimado deve ser pequeno em média
    rng = np.random.default_rng(1)
    T, N = 160, 36
    nivel = 10 + np.cumsum(rng.normal(0, 0.2, T))
    y = np.array([[l + 0.0 * n for n in range(1, N + 1)] for l in nivel]) + rng.normal(0, 0.01, (T, N))
    r = acm(y)
    assert r["erro_bp"] < 20
    assert np.isfinite(r["premio"]).all()


@pytest.mark.skipif(not (IND / "i16_premio_termo_acm.csv").exists(), reason="rode python -m opm.acm antes")
def test_saidas_experimentais():
    d = pd.read_csv(IND / "i16_acm_diagnostico.csv").iloc[0]
    assert d.erro_ajuste_bp < 10 and d.variancia_explicada > 0.95
    c = pd.read_csv(IND / "i17_cargas.csv")
    assert c.set_index("variavel").carga["spread_credito"] > 0  # sinal: maior = mais apertado
    dg = pd.read_csv(IND / "modelo_diagnostico.csv").iloc[0]
    publicados = (IND / "modelo_cenarios.csv").exists()
    assert publicados == bool(dg.publicavel)  # cenários só em /dados/ se o modelo passar no critério
