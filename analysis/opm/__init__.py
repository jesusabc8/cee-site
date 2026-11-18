"""Pacote de econometria do Observatório de Política Monetária (OPM; ADR-022, ADR-023).

Lê os CSV processados em data/processed/ e escreve em data/processed/opm/. Não baixa dados de séries:
o único download é o binário X-13ARIMA-SEATS, em versão fixa e com SHA-256 conferido (x13.py).
"""
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PROC = RAIZ / "data" / "processed"
SAIDA = PROC / "opm"
SPECS = RAIZ / "data" / "specs" / "x13"
