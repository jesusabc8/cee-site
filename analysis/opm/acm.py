"""I.16 — prêmio a termo da curva prefixada pelo método de Adrian, Crump e Moench (2013). Camada 3 (EXPERIMENTAL).

Dados: curva nominal NSS do Tesouro Direto em grade mensal de 1 a 36 meses (fim de mês). O prazo máximo comum da amostra
é de 3 anos, limitado pelas LTN ofertadas. Passos (ACM, 2013, seção 2):
1. log-preços p(n) = −(n/12)·ln(1 + y(n)/100); retorno em excesso rx(n−1)_{t+1} = p(n−1)_{t+1} − p(n)_t + p(1)_t;
2. fatores X = K primeiros componentes principais das taxas; VAR(1) X_{t+1} = μ + Φ X_t + v_{t+1}, Σ = cov(v);
3. MQO de rx em [1, v_{t+1}, X_t] para cada prazo → a, β, c; λ1 = (ββ')⁻¹β C', λ0 = (ββ')⁻¹β(a + ½(B* vec Σ + σ²));
4. recursões afins com e sem preço de risco; prêmio a termo = taxa ajustada − taxa neutra ao risco.
Limitações: amostra curta (~14 anos), prazos até 3 anos, taxa com spread do Tesouro Direto. Uso: python -m opm.acm

Prêmio pela Focus e critério de plausibilidade (ADR-031):
- prêmio pela Focus: TP^F(n) = y(n) − E^F(n), com E^F(n) a Selic média esperada em n meses pela Focus (trajetória por
  reunião e medianas de fim de ano; scripts/data/derive-opm.ts → i16_selic_esperada_focus.csv), última coleta até a data
  da curva. É a medida principal publicada: não depende do VAR.
- o ACM só entra na figura se, nos últimos 36 meses, (i) a taxa neutra ao risco do ACM ficar, em média, a até 1,0 p.p.
  da Selic média esperada pela Focus em 24 e 36 meses; (ii) o sinal do prêmio ACM coincidir com o do prêmio pela Focus em
  pelo menos 2/3 dos meses; (iii) o erro médio de ajuste for ≤ 10 bp. Reprovado, fica só no CSV, com o diagnóstico.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import SAIDA

IND = SAIDA / "indicadores"
K = 3
PRAZOS_RX = list(range(3, 36, 3))  # n − 1 (meses) dos retornos usados na regressão


def acm(y: np.ndarray, k: int = K) -> dict:
    """y: T × N (taxas em % a.a., prazos 1…N meses). Devolve taxas ajustadas, neutras ao risco e prêmio (% a.a.)."""
    T, N = y.shape
    lnp = -(np.arange(1, N + 1) / 12) * np.log1p(y / 100)  # log-preços
    yc = -lnp / np.arange(1, N + 1)  # taxas contínuas mensais
    Z = yc - yc.mean(0)
    _, _, vt = np.linalg.svd(Z, full_matrices=False)
    W = vt[:k].T
    X = Z @ W  # T × k
    Xl, Xf = X[:-1], X[1:]
    A = np.column_stack([np.ones(T - 1), Xl])
    coef, *_ = np.linalg.lstsq(A, Xf, rcond=None)
    mu, Phi = coef[0], coef[1:].T
    V = Xf - A @ coef
    Sigma = V.T @ V / (T - 1)
    rf = -lnp[:-1, 0]  # 1 mês
    rx = np.column_stack([lnp[1:, n - 1] - lnp[:-1, n] - rf for n in PRAZOS_RX])  # rx(n)_{t+1}, n = prazo após 1 mês
    R = np.column_stack([np.ones(T - 1), V, Xl])
    b, *_ = np.linalg.lstsq(R, rx, rcond=None)
    a, beta, C = b[0], b[1:1 + k], b[1 + k:]
    E = rx - R @ b
    s2 = float((E ** 2).sum() / E.size)
    Bstar = np.array([np.outer(beta[:, j], beta[:, j]).ravel() for j in range(beta.shape[1])])
    bb = np.linalg.inv(beta @ beta.T) @ beta
    lam0 = bb @ (a + 0.5 * (Bstar @ Sigma.ravel() + s2))
    lam1 = bb @ C.T
    d, *_ = np.linalg.lstsq(np.column_stack([np.ones(T), X]), yc[:, 0], rcond=None)
    d0, d1 = d[0], d[1:]

    def recursao(l0: np.ndarray, l1: np.ndarray) -> np.ndarray:
        An, Bn = [0.0], [np.zeros(k)]
        for _ in range(N):
            Bp = Bn[-1]
            An.append(An[-1] + Bp @ (mu - l0) + 0.5 * (Bp @ Sigma @ Bp + s2) - d0)
            Bn.append(Bp @ (Phi - l1) - d1)
        n = np.arange(1, N + 1)
        return -(np.array(An[1:])[None, :] + X @ np.array(Bn[1:]).T) / n  # taxas contínuas mensais

    para_anual = lambda yy: 100 * (np.exp(12 * yy) - 1)
    ajust, neutra = para_anual(recursao(lam0, lam1)), para_anual(recursao(np.zeros(k), np.zeros((k, k))))
    return {"ajustada": ajust, "neutra": neutra, "premio": ajust - neutra, "erro_bp": float(np.abs(ajust - y).mean() * 100), "var_explicada": float((np.linalg.svd(Z, compute_uv=False) ** 2)[:k].sum() / (np.linalg.svd(Z, compute_uv=False) ** 2).sum())}


def main() -> None:
    g = pd.read_csv(IND / "curva_nominal_grade.csv")
    # A grade já vem no último dia útil de cada mês (e na data mais recente): fica uma observação por mês.
    g = g.dropna().groupby(g.data.str[:7]).last().reset_index(drop=True)
    y = g[[f"m{n}" for n in range(1, 37)]].to_numpy()
    r = acm(y)
    out = pd.DataFrame({"data": g.data, **{f"premio_{n}m": r["premio"][:, n - 1].round(4) for n in (12, 24, 36)},
                        **{f"neutra_{n}m": r["neutra"][:, n - 1].round(4) for n in (24, 36)}, "taxa_36m": y[:, 35].round(4)})
    f = pd.read_csv(IND / "i16_selic_esperada_focus.csv").sort_values("data")
    fx = pd.merge_asof(out[["data"]].assign(_d=pd.to_datetime(out.data)).sort_values("_d"),
                       f.assign(_d=pd.to_datetime(f.data)).rename(columns={"data": "coleta_focus"}), on="_d", direction="backward")
    for n in (12, 24, 36):
        out[f"selic_esperada_focus_{n}m"] = fx[f"selic_esperada_{n}m"].to_numpy()
        out[f"premio_focus_{n}m"] = (y[:, n - 1] - fx[f"selic_esperada_{n}m"].to_numpy()).round(4)
    out["coleta_focus"] = fx.coleta_focus.to_numpy()
    out.to_csv(IND / "i16_premio_termo_acm.csv", index=False)
    janela = out.tail(36)
    gaps = [float((janela[f"neutra_{n}m"] - janela[f"selic_esperada_focus_{n}m"]).abs().mean()) for n in (24, 36)]
    sinais = float((np.sign(janela.premio_24m) == np.sign(janela.premio_focus_24m)).mean())
    plausivel = max(gaps) <= 1.0 and sinais >= 2 / 3 and r["erro_bp"] <= 10
    pd.DataFrame([{"janela_meses": len(janela), "dif_media_neutra_focus_24m_pp": round(gaps[0], 4), "dif_media_neutra_focus_36m_pp": round(gaps[1], 4),
                   "concordancia_sinal_24m": round(sinais, 4), "erro_ajuste_bp": round(r["erro_bp"], 2), "limite_dif_pp": 1.0,
                   "limite_sinal": round(2 / 3, 4), "limite_erro_bp": 10, "plausivel": int(plausivel)}]).to_csv(IND / "i16_criterio_plausibilidade.csv", index=False)
    print(f"  critério: dif. neutra−Focus {gaps[0]:.2f}/{gaps[1]:.2f} p.p., sinal {sinais:.0%} → {'plausível' if plausivel else 'NÃO plausível (ACM só no CSV)'}")
    pd.DataFrame([{"fatores": K, "variancia_explicada": round(r["var_explicada"], 4), "erro_ajuste_bp": round(r["erro_bp"], 2), "meses": len(out), "prazo_max_meses": 36}]).to_csv(IND / "i16_acm_diagnostico.csv", index=False)
    u = out.iloc[-1]
    print(f"✓ i16 (experimental): {len(out)} meses; {u.data}: prêmio 24m {u.premio_24m:.2f} p.p., 36m {u.premio_36m:.2f} p.p.; erro de ajuste {r['erro_bp']:.1f} bp")


if __name__ == "__main__":
    main()
