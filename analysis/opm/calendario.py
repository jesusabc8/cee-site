"""Calendário: Páscoa (algoritmo de Meeus/Jones/Butcher) e Carnaval (47 dias antes da Páscoa: segunda e terça)."""
from __future__ import annotations

import datetime as dt


def pascoa(ano: int) -> dt.date:
    a, b, c = ano % 19, ano // 100, ano % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mes = (h + l - 7 * m + 114) // 31
    dia = (h + l - 7 * m + 114) % 31 + 1
    return dt.date(ano, mes, dia)


def carnaval(ano: int) -> tuple[dt.date, dt.date]:
    """Segunda e terça-feira de Carnaval."""
    p = pascoa(ano)
    return p - dt.timedelta(days=48), p - dt.timedelta(days=47)


def regressor_carnaval(inicio: int, fim: int) -> list[tuple[int, int, float]]:
    """Regressor de feriado para o X-13 (formato datevalue): fração dos dois dias de Carnaval em cada mês,
    centrada pela média de longo prazo do mês, para não confundir o efeito com a sazonalidade."""
    bruto: dict[tuple[int, int], float] = {}
    for ano in range(inicio, fim + 1):
        for m in range(1, 13):
            bruto[(ano, m)] = 0.0
        for d in carnaval(ano):
            bruto[(d.year, d.month)] += 0.5
    medias = {m: sum(v for (a, mm), v in bruto.items() if mm == m) / (fim - inicio + 1) for m in range(1, 13)}
    return [(a, m, round(v - medias[m], 6)) for (a, m), v in sorted(bruto.items())]
