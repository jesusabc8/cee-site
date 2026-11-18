"""I.14 — índice de tom das comunicações do Copom (camada 3, EXPERIMENTAL; NÃO PUBLICADO sem validação).

1. Lê os comunicados brutos (data/raw/bcb-site/copom_comunicados/<safra mais recente>/), remove HTML e divide em frases.
2. Conta termos do léxico preliminar (docs/td/i14/lexico.yaml): T_k = (N_contr − N_exp) / (N_contr + N_exp).
3. Gera amostra estratificada de frases (semente fixa) para dupla codificação humana (docs/td/i14/amostra_codificacao.csv).
4. Com as duas colunas de codificação preenchidas, calcula o kappa de Cohen entre codificadores e contra o léxico.
O índice só pode ir ao sítio depois de kappa ≥ 0,6 entre codificadores e revisão do Comitê Editorial (especificação, I.14).
Saídas ficam em docs/td/i14/ (fora de /dados/). Uso: python -m opm.tom
"""
from __future__ import annotations

import html
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd
import yaml

from . import RAIZ

DIR = RAIZ / "docs" / "td" / "i14"
CLASSES = ("contracionista", "expansionista", "neutra")


def normaliza(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")


def frases(texto_html: str) -> list[str]:
    t = html.unescape(re.sub(r"<[^>]+>", " ", texto_html)).replace("​", " ")
    t = re.sub(r"\s+", " ", t).strip()
    return [f.strip() for f in re.split(r"(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])", t) if len(f.strip()) > 30]


def classifica(frase: str, lex: dict[str, list[str]]) -> tuple[str, int, int]:
    f = normaliza(frase)
    c = sum(f.count(t) for t in lex["contracionista"])
    e = sum(f.count(t) for t in lex["expansionista"])
    return ("contracionista" if c > e else "expansionista" if e > c else "neutra"), c, e


def kappa(a: list[str], b: list[str]) -> float:
    """Kappa de Cohen para duas codificações nominais da mesma lista de itens."""
    if len(a) != len(b) or not a:
        raise ValueError("listas de mesmo tamanho e não vazias")
    cats = sorted(set(a) | set(b))
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    pe = sum((a.count(c) / n) * (b.count(c) / n) for c in cats)
    return 1.0 if pe == 1 else (po - pe) / (1 - pe)


def comunicados() -> pd.DataFrame:
    base = RAIZ / "data" / "raw" / "bcb-site" / "copom_comunicados"
    safra = sorted(p for p in base.iterdir() if p.is_dir())[-1]
    linhas = []
    for arq in sorted((p for p in safra.glob("*.json") if p.stem.isdigit()), key=lambda p: int(p.stem)):
        for r in json.loads(arq.read_text())["conteudo"]:
            for k, f in enumerate(frases(r.get("textoComunicado") or "")):
                linhas.append({"reuniao": int(r["nro_reuniao"]), "data": r["dataReferencia"][:10], "frase_n": k, "frase": f})
    return pd.DataFrame(linhas)


def main() -> None:
    lex = yaml.safe_load((DIR / "lexico.yaml").read_text())
    lex = {k: [normaliza(t) for t in v] for k, v in lex.items()}
    f = comunicados()
    cl = f.frase.apply(lambda x: classifica(x, lex))
    f["lexico"], f["n_contr"], f["n_exp"] = [c[0] for c in cl], [c[1] for c in cl], [c[2] for c in cl]
    g = f.groupby(["reuniao", "data"])[["n_contr", "n_exp"]].sum().reset_index()
    g["tom_preliminar"] = ((g.n_contr - g.n_exp) / (g.n_contr + g.n_exp).where(lambda s: s > 0)).round(4)
    g.to_csv(DIR / "indice_preliminar_nao_publicado.csv", index=False)
    amostra_p = DIR / "amostra_codificacao.csv"
    if not amostra_p.exists():  # a amostra é fixa: não se refaz depois que a codificação começou
        amostra = pd.concat([x.sample(min(len(x), 70), random_state=20261118) for _, x in f.groupby("lexico")])
        amostra = amostra.sample(frac=1, random_state=7).reset_index(drop=True)
        amostra.insert(0, "id", range(1, len(amostra) + 1))
        amostra[["id", "reuniao", "data", "frase", "lexico"]].assign(codificador_1="", codificador_2="").to_csv(amostra_p, index=False)
    a = pd.read_csv(amostra_p, dtype=str, keep_default_na=False)
    feitos = a[(a.codificador_1 != "") & (a.codificador_2 != "")]
    if len(feitos):
        k12 = kappa(feitos.codificador_1.tolist(), feitos.codificador_2.tolist())
        kl = kappa(feitos.codificador_1.tolist(), feitos.lexico.tolist())
        print(f"✓ i14: {len(feitos)} frases codificadas; kappa entre codificadores {k12:.2f}; codificador 1 × léxico {kl:.2f}")
    else:
        print(f"✓ i14 (não publicado): {len(f)} frases de {g.reuniao.nunique()} comunicados; amostra de {len(a)} frases aguardando dupla codificação humana")


if __name__ == "__main__":
    main()
