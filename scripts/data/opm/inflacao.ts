/** Inflação: acumulado em 12 meses, variação trimestral, SAAR (I.9), média dos núcleos e contador do regime (I.10). */

export const acumula = (vars: number[]) => 100 * (vars.reduce((f, v) => f * (1 + v / 100), 1) - 1);

/** SAAR de três meses: 100 × [Π_{j=0..2} (1 + x_{t−j}/100)^4 − 1] sobre variações mensais dessazonalizadas. */
export function saar3m(ultimos3: number[]): number {
  if (ultimos3.length !== 3) throw new Error('SAAR exige três variações mensais.');
  return 100 * (ultimos3.reduce((f, v) => f * (1 + v / 100) ** 4, 1) - 1);
}

/** Núcleos que compõem a média do RPM (BCB, RPM set./2026, p. 35, nota 31). */
export const NUCLEOS_MEDIA = ['nucleo_ex0', 'nucleo_ex3', 'nucleo_ms', 'nucleo_dp', 'nucleo_p55'] as const;
export const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

/**
 * Contador do regime de meta contínua (I.10): meses consecutivos, até `ate`, com o IPCA em 12 meses fora do
 * intervalo de tolerância. Pelo Decreto nº 12.079/2024 (conforme BCB, página "Meta para a inflação", e RPM set./2026,
 * p. 3), a meta é descumprida após seis meses consecutivos fora do intervalo.
 */
export function contadorRegime(serie: { periodo: string; ipca12m: number }[], inferior: number, superior: number) {
  const out: { periodo: string; ipca12m: number; fora: number; meses_consecutivos: number; lado: string; descumprimento: number }[] = [];
  let n = 0, lado = '';
  for (const r of serie) {
    const acima = r.ipca12m > superior, abaixo = r.ipca12m < inferior;
    const l = acima ? 'acima' : abaixo ? 'abaixo' : '';
    n = l && l === lado ? n + 1 : l ? 1 : 0;
    lado = l;
    out.push({ periodo: r.periodo, ipca12m: r.ipca12m, fora: l ? 1 : 0, meses_consecutivos: n, lado: l, descumprimento: n >= 6 ? 1 : 0 });
  }
  return out;
}
