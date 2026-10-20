/**
 * Cálculos do CEE (funções puras, testadas em tests/calc.test.ts).
 * Todas as taxas entram e saem em pontos percentuais (5 = 5 %).
 */

/** Juro real pela equação de Fisher exata: (1 + i) / (1 + π) − 1. */
export const fisher = (i: number, pi: number) => ((1 + i / 100) / (1 + pi / 100) - 1) * 100;

/** Convenção usual em bancos centrais: diferença simples i − π (aproximação de primeira ordem). */
export const jurosSimples = (i: number, pi: number) => i - pi;

/**
 * Primário que estabiliza a razão dívida/PIB (estado estacionário):
 *   d_{t+1} = d_t (1 + r)/(1 + g) − s  ⇒  s* = d (r − g)/(1 + g)
 * d em % do PIB; r e g em % a.a. (reais). Retorna s* em % do PIB.
 */
export function primarioEstabilizador(d: number, r: number, g: number): number {
  return (d * (r / 100 - g / 100)) / (1 + g / 100);
}

/** Matriz de sensibilidade de s* para grades de r (linhas) e g (colunas). */
export function matrizSensibilidade(d: number, rs: number[], gs: number[]) {
  return rs.map((r) => gs.map((g) => primarioEstabilizador(d, r, g)));
}

/** Variação acumulada (%) de uma sequência de variações mensais (%). */
export const acumular = (mensais: number[]) => (mensais.reduce((acc, x) => acc * (1 + x / 100), 1) - 1) * 100;

/**
 * Trajetória do IPCA em 12 meses combinando variações observadas e esperadas (Focus mensal).
 * `observado`: mapa AAAA-MM → variação mensal observada; `esperado`: AAAA-MM → mediana Focus.
 * Para cada mês futuro consecutivo após o último observado, acumula os 12 meses anteriores,
 * usando o observado quando existe e o esperado caso contrário. Para no primeiro buraco.
 */
export function trajetoria12m(observado: Map<string, number>, esperado: Map<string, number>) {
  const meses = [...observado.keys()].sort();
  const ultimo = meses.at(-1)!;
  const proximo = (m: string) => {
    const [a, mm] = m.split('-').map(Number) as [number, number];
    return mm === 12 ? `${a + 1}-01` : `${a}-${String(mm + 1).padStart(2, '0')}`;
  };
  const anterior = (m: string, k: number) => {
    let [a, mm] = m.split('-').map(Number) as [number, number];
    mm -= k;
    while (mm <= 0) { mm += 12; a -= 1; }
    return `${a}-${String(mm).padStart(2, '0')}`;
  };
  const out: { periodo: string; ipca_12m_projetado: number }[] = [];
  for (let m = proximo(ultimo); esperado.has(m); m = proximo(m)) {
    const janela: number[] = [];
    for (let k = 11; k >= 0; k--) {
      const p = anterior(m, k);
      const v = observado.get(p) ?? esperado.get(p);
      if (v === undefined) return out;
      janela.push(v);
    }
    out.push({ periodo: m, ipca_12m_projetado: Math.round(acumular(janela) * 100) / 100 });
  }
  return out;
}

/** Razão percentual de uma variável por unidade entre um país e a referência (EUA = 100). */
export const relativo = (x: number, ref: number) => (x / ref) * 100;
