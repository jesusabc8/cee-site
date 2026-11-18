import datetime as dt

from opm.calendario import carnaval, pascoa, regressor_carnaval


def test_pascoa_e_carnaval():
    assert pascoa(2026) == dt.date(2026, 4, 5)
    assert pascoa(2025) == dt.date(2025, 4, 20)
    assert carnaval(2026) == (dt.date(2026, 2, 16), dt.date(2026, 2, 17))
    assert carnaval(2027) == (dt.date(2027, 2, 8), dt.date(2027, 2, 9))


def test_regressor_carnaval_centrado():
    r = regressor_carnaval(2012, 2030)
    por_mes = {}
    for _, m, v in r:
        por_mes.setdefault(m, []).append(v)
    for m, vs in por_mes.items():
        assert abs(sum(vs)) < 1e-4, m  # média de longo prazo removida
