/** I.5 surpresa, I.7 credibilidade e I.8 desancoragem/dispersão (especificação, seções I.5, I.7 e I.8). */

/** Índice de credibilidade de Cecchetti e Krause (2002), adaptado por de Mendonça (2007); δ = 1,5 p.p. */
export function credibilidade(esperada: number, meta: number, delta = 1.5): number {
  const d = Math.abs(esperada - meta);
  if (d === 0) return 1;
  return d >= delta ? 0 : 1 - d / delta;
}

export interface Coleta { data: string; mediana: number | null; desvio_padrao?: number | null }

/** Última coleta estritamente anterior a `data` (a Focus da sexta-feira antes da reunião). */
export function ultimaAntes<T extends { data: string }>(coletas: T[], data: string): T | undefined {
  let melhor: T | undefined;
  for (const c of coletas) if (c.data < data && (!melhor || c.data > melhor.data)) melhor = c;
  return melhor;
}

/** Surpresa S_k = i_k − ĩ_k (p.p.) e normalizada S_k/σ_k. */
export function surpresa(decidida: number, esperada: number, desvio: number | null | undefined) {
  const s = Math.round((decidida - esperada) * 10000) / 10000;
  return { surpresa_pp: s, surpresa_normalizada: desvio && desvio > 0 ? Math.round((s / desvio) * 1000) / 1000 : null };
}

/**
 * Meta aplicável ao horizonte de 12 meses a partir do mês `mes` (AAAA-MM): média das metas anuais dos meses
 * cobertos, ponderada pelo número de meses de cada ano (até 2024); desde jan./2025, a meta contínua.
 */
export function metaHorizonte12m(mes: string, metaAno: (ano: number) => number): number {
  let [a, m] = mes.split('-').map(Number) as [number, number];
  let soma = 0;
  for (let k = 0; k < 12; k++) { m += 1; if (m > 12) { m = 1; a += 1; } soma += metaAno(a); }
  return soma / 12;
}
