/** A2.8 — agregados (I.18), multiplicador e coeficientes (I.19), velocidade e monetização (I.20). */

/** Crescimento em 12 meses (%) e real, deflacionado pelo IPCA de 12 meses (Fisher). */
export const cresc12 = (x: number, x12: number) => 100 * (x / x12 - 1);
export const real = (nominal: number, ipca12: number) => 100 * ((1 + nominal / 100) / (1 + ipca12 / 100) - 1);

/** m = M1/B; c = PMPP/DV; r = R/DV (especificação, A2.8). */
export function coeficientes(m1: number, base: number, pmpp: number, dv: number, reservas: number) {
  return { multiplicador_m1: m1 / base, c_pmpp_dv: pmpp / dv, r_reservas_dv: reservas / dv };
}

/** V = PIB nominal 12m / M̄ (média de 12 meses do saldo), e M̄/PIB em %. Saldos em R$ mil, PIB em R$ milhões. */
export function velocidade(pibMilhoes12m: number, saldosMil12: number[]) {
  if (saldosMil12.length !== 12) throw new Error('São necessários 12 saldos mensais.');
  const mMedio = saldosMil12.reduce((s, x) => s + x, 0) / 12 / 1000; // → R$ milhões
  return { velocidade: pibMilhoes12m / mMedio, monetizacao_pct: (100 * mMedio) / pibMilhoes12m };
}
