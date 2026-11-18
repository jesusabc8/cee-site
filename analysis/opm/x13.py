"""X-13ARIMA-SEATS (U.S. Census Bureau), versão 1.1 build 62, com SHA-256 fixado (ADR-023).

O binário é baixado uma vez para analysis/.cache/x13/ (fora do git) e conferido a cada uso.
A especificação de cada série fica em data/specs/x13/<serie>.yaml e é convertida em arquivo .spc.
"""
from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from . import RAIZ
from .calendario import regressor_carnaval

URL = "https://www2.census.gov/software/x-13arima-seats/x13as/unix-linux/program-archives/x13as_ascii-v1-1-b62.tar.gz"
SHA256 = "a91d37bb2fef46237e1eadd7d9b4f1c00a422d58f6b286c9bfe485289e8ac6f5"
VERSAO = "X-13ARIMA-SEATS 1.1 build 62"
CACHE = RAIZ / "analysis" / ".cache" / "x13"


def _sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def binario() -> Path:
    """Caminho do executável; baixa e confere o arquivo se preciso. Falha se o hash divergir."""
    CACHE.mkdir(parents=True, exist_ok=True)
    tgz = CACHE / "x13as_ascii-v1-1-b62.tar.gz"
    exe = CACHE / "x13as" / "x13as_ascii"
    if not tgz.exists():
        tmp = tgz.with_suffix(".part")
        with urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": "cee-dados/1.0"}), timeout=180) as r, tmp.open("wb") as f:
            shutil.copyfileobj(r, f)
        tmp.rename(tgz)
    obtido = _sha256(tgz)
    if obtido != SHA256:
        tgz.unlink()
        raise RuntimeError(f"SHA-256 do X-13 divergente: {obtido} (esperado {SHA256}). Pipeline interrompido.")
    if not exe.exists():
        with tarfile.open(tgz) as t:
            t.extractall(CACHE, filter="data")
        exe.chmod(0o755)
    return exe


@dataclass
class Resultado:
    ajustada: pd.Series      # série ajustada (d11), mesmo índice da entrada
    fatores: pd.Series       # fatores sazonais combinados (d16: sazonal × calendário), multiplicativos
    modelo: str              # modelo ARIMA escolhido
    transformacao: str
    qs_residual: str         # estatística QS da série ajustada (linha do relatório), para conferência
    avisos: list[str]


def _bloco(nome: str, campos: dict[str, str]) -> str:
    corpo = "\n".join(f"  {k}={v}" for k, v in campos.items())
    return f"{nome}{{\n{corpo}\n}}\n"


def montar_spc(serie: pd.Series, spec: dict, arquivo_rgr: str | None) -> str:
    """Converte a especificação YAML em .spc. `serie`: índice mensal (PeriodIndex) com valores positivos."""
    ini = serie.index[0]
    dados = "\n".join(" ".join(f"{v:.6f}" for v in serie.values[i:i + 6]) for i in range(0, len(serie), 6))
    spc = f'series{{\n  title="{spec["serie"]}"\n  start={ini.year}.{ini.month:02d}\n  period=12\n  data=(\n{dados}\n  )\n}}\n'
    spc += _bloco("transform", {"function": spec.get("transformacao", "auto")})
    reg: dict[str, str] = {}
    variaveis = spec.get("regressores", [])
    if variaveis:
        reg["variables"] = "(" + " ".join(variaveis) + ")"
    teste = spec.get("teste_aic", [])
    if spec.get("carnaval") and arquivo_rgr:
        reg.update({"user": "carnaval", "file": f'"{arquivo_rgr}"', "format": "datevalue", "usertype": "holiday"})
        teste = [*teste, "user"]
    if teste:
        reg["aictest"] = "(" + " ".join(teste) + ")"
    if reg:
        spc += _bloco("regression", reg)
    arima = spec.get("arima", "auto")
    if arima == "auto":
        spc += _bloco("automdl", {})
    else:
        spc += _bloco("arima", {"model": arima})
    out = spec.get("outliers", {"tipos": ["ao", "ls"]})
    if out:
        spc += _bloco("outlier", {"types": "(" + " ".join(out["tipos"]) + ")"})
    spc += _bloco("estimate", {"save": "(mdl)"})
    spc += _bloco("x11", {"mode": "mult" if spec.get("transformacao", "auto") != "none" else "add", "save": "(d11 d16)"})
    spc += _bloco("spectrum", {"savelog": "peaks"})
    return spc


def _ler_tabela(p: Path, indice: pd.PeriodIndex) -> pd.Series:
    linhas = [l.split() for l in p.read_text().splitlines()[2:] if l.strip()]
    s = pd.Series({pd.Period(f"{l[0][:4]}-{l[0][4:]}", "M"): float(l[1]) for l in linhas})
    return s.reindex(indice)


def ajustar(serie: pd.Series, spec: dict) -> Resultado:
    exe = binario()
    with tempfile.TemporaryDirectory(prefix="x13-") as d:
        dd = Path(d)
        rgr = None
        if spec.get("carnaval"):
            ini, fim = serie.index[0].year, serie.index[-1].year + 2
            (dd / "carnaval.rgr").write_text("\n".join(f"{a} {m} {v}" for a, m, v in regressor_carnaval(ini, fim)) + "\n")
            rgr = str(dd / "carnaval.rgr")
        (dd / "s.spc").write_text(montar_spc(serie, spec, rgr))
        r = subprocess.run([str(exe), str(dd / "s")], cwd=dd, capture_output=True, text=True, timeout=300)
        err = (dd / "s.err").read_text(errors="replace") if (dd / "s.err").exists() else ""
        if r.returncode != 0 or "ERROR" in err:
            raise RuntimeError(f"X-13 falhou para {spec['serie']}:\n{err[-2000:]}\n{r.stdout[-1000:]}")
        out = (dd / "s.out").read_text(errors="replace")
        modelo = next((l.split(":", 1)[1].strip() for l in out.splitlines() if "ARIMA Model:" in l), "?")
        transf = spec.get("transformacao", "auto")
        qs = next((l.strip() for l in out.splitlines() if l.strip().startswith("qssadj") or "QS statistic for seasonality (Seasonally Adjusted" in l), "")
        avisos = [l.strip() for l in err.splitlines() if "WARNING" in l]
        return Resultado(_ler_tabela(dd / "s.d11", serie.index), _ler_tabela(dd / "s.d16", serie.index), modelo, transf, qs, avisos)
