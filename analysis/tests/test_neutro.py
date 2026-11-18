import numpy as np
import pandas as pd
import pytest

from opm import SAIDA
from opm.neutro import faixa

IND = SAIDA / "indicadores"


def test_faixa_quartis_lineares():
    m = pd.DataFrame({"a": [5.0], "b": [6.0], "c": [8.0]})
    f = faixa(m).iloc[0]
    assert (f.q1, f.mediana, f.q3, f.metodos) == (5.5, 6.0, 7.0, 3)


@pytest.mark.skipif(not (IND / "i4_faixa_neutro.csv").exists(), reason="rode python -m opm.neutro antes")
def test_faixa_ordenada_e_hiato_consistente():
    f = pd.read_csv(IND / "i4_faixa_neutro.csv").dropna(subset=["mediana"])
    assert (f.q1 <= f.mediana + 1e-9).all() and (f.mediana <= f.q3 + 1e-9).all()
    h = pd.read_csv(IND / "i3_hiato_juros.csv")
    assert np.allclose(h.hiato_mediana, h.juro_real_ex_ante - f.set_index("periodo").loc[h.periodo, "mediana"].to_numpy(), atol=1e-3)
