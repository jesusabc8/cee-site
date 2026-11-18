/** Estatísticas ponderadas usadas na dispersão regional da inflação (ADR-030). */

/** Quantil ponderado: menor x cujo peso acumulado (normalizado) é ≥ q. */
export function quantilPonderado(xs: number[], ws: number[], q: number): number {
  if (!xs.length || xs.length !== ws.length) throw new Error('quantilPonderado: vetores vazios ou de tamanhos diferentes');
  const o = xs.map((x, i) => [x, ws[i]!] as const).sort((a, b) => a[0] - b[0]);
  const tot = o.reduce((s, [, w]) => s + w, 0);
  let acc = 0;
  for (const [x, w] of o) { acc += w / tot; if (acc >= q - 1e-12) return x; }
  return o.at(-1)![0];
}

/** Desvio-padrão ponderado (populacional): √(Σ w (x − x̄_w)² / Σ w). */
export function desvioPonderado(xs: number[], ws: number[]): number {
  const tot = ws.reduce((s, w) => s + w, 0);
  const m = xs.reduce((s, x, i) => s + x * ws[i]!, 0) / tot;
  return Math.sqrt(xs.reduce((s, x, i) => s + ws[i]! * (x - m) ** 2, 0) / tot);
}
