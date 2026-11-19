/**
 * Inflação ampliada e regional (A2.3; ADR-030): testes de referência.
 * - A linha "Brasil" das tabelas regionais (SIDRA 7060/7063) coincide com o IPCA nacional publicado (SIDRA 1737).
 * - Os pesos regionais oficiais somam 100 % no IPCA e no INPC; os pesos dos grupos por área somam 100 % a cada mês.
 * - A média das áreas ponderada pelos pesos regionais reproduz o Brasil (a menos do arredondamento a 2 casas).
 * - A decomposição por grupo soma a diferença área − Brasil do mês.
 * - Quantil e desvio ponderados conferem com casos calculados à mão.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lerCsvTexto } from '../scripts/data/csv.ts';
import { CAPITAIS } from '../scripts/data/opm/areas.ts';
import { desvioPonderado, quantilPonderado } from '../scripts/data/opm/estat.ts';

const ler = (f: string) => lerCsvTexto(readFileSync(`data/processed/${f}`, 'utf8'));
const IND = 'opm/indicadores';
const ipca = new Map(ler('conjuntura/ipca.csv').map((r) => [r.periodo!, r]));
const regIpca = ler('opm/ipca_regional.csv');
const regInpc = ler('opm/inpc_regional.csv');
const pesos = ler('opm/pesos_regionais.csv');
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/^Grande /, '').toLowerCase();

describe('inflação regional: coerência com o nacional', () => {
  it('Brasil (N1) da tabela regional = IPCA nacional (SIDRA 1737), mensal e 12 meses', () => {
    const br = regIpca.filter((r) => r.area === '1' && r.categoria === '7169');
    expect(br.length).toBeGreaterThan(60);
    for (const r of br) {
      const n = ipca.get(r.periodo!);
      expect(n, r.periodo).toBeDefined();
      expect(Number(r.variacao_mensal), `${r.periodo} mensal`).toBeCloseTo(Number(n!.variacao_mensal), 2);
      if (r.variacao_12m) expect(Number(r.variacao_12m), `${r.periodo} 12m`).toBeCloseTo(Number(n!.acumulada_12m), 2);
    }
  });

  it('as 16 áreas do IPCA estão presentes e não há área estadual', () => {
    const areas = new Set(regIpca.filter((r) => r.area !== '1').map((r) => r.area));
    expect([...areas].sort()).toEqual(CAPITAIS.map((c) => c[1]).sort());
    expect(new Set(regIpca.map((r) => r.nivel))).toEqual(new Set(['N1', 'N6', 'N7'])); // N3 (UF) não existe no IPCA
  });

  it('pesos regionais oficiais somam 100 % (IPCA e INPC) e cobrem as 16 áreas', () => {
    expect(pesos).toHaveLength(16);
    expect(pesos.reduce((s, p) => s + Number(p.peso_ipca), 0)).toBeCloseTo(100, 6);
    expect(pesos.reduce((s, p) => s + Number(p.peso_inpc), 0)).toBeCloseTo(100, 6);
    for (const [, , nome] of CAPITAIS) expect(pesos.some((p) => norm(p.area_nome!) === norm(nome)), nome).toBe(true);
  });

  it.each([['IPCA', regIpca], ['INPC', regInpc]] as const)('%s: pesos dos grupos somam 100 % por área e mês', (_, reg) => {
    const soma = new Map<string, number>();
    for (const r of reg) if (r.categoria !== '7169' && r.peso) soma.set(`${r.periodo}|${r.area}`, (soma.get(`${r.periodo}|${r.area}`) ?? 0) + Number(r.peso));
    expect(soma.size).toBeGreaterThan(1000);
    for (const [k, s] of soma) expect(Math.abs(s - 100), k).toBeLessThan(0.01);
  });

  it('média das áreas ponderada pelos pesos regionais reproduz o IPCA Brasil (|dif| < 0,03 p.p. ao mês)', () => {
    const peso = new Map(CAPITAIS.map(([, a, nome]) => [a, Number(pesos.find((p) => norm(p.area_nome!) === norm(nome))!.peso_ipca)]));
    const meses = new Map<string, { s: number; w: number; br?: number }>();
    for (const r of regIpca) {
      if (r.categoria !== '7169' || !r.variacao_mensal) continue;
      const m = meses.get(r.periodo!) ?? { s: 0, w: 0 };
      if (r.area === '1') m.br = Number(r.variacao_mensal);
      else { m.s += peso.get(r.area!)! * Number(r.variacao_mensal); m.w += peso.get(r.area!)!; }
      meses.set(r.periodo!, m);
    }
    let n = 0;
    for (const [p, m] of meses) if (m.br !== undefined && Math.abs(m.w - 100) < 1e-6) { expect(Math.abs(m.s / m.w - m.br), p).toBeLessThan(0.03); n++; }
    expect(n).toBeGreaterThan(60);
  });
});

describe('indicadores derivados (derive-inflacao)', () => {
  const ult = ler(`${IND}/regional_ultimo.csv`);
  const contrib = ler(`${IND}/regional_contribuicao.csv`);
  const disp = ler(`${IND}/regional_dispersao.csv`);

  it('regional_ultimo: 16 áreas, mesmo mês, coerente com a tabela longa', () => {
    expect(ult).toHaveLength(16);
    expect(new Set(ult.map((r) => r.periodo)).size).toBe(1);
    for (const r of ult) {
      const l = regIpca.find((x) => x.periodo === r.periodo && x.area === r.area && x.categoria === '7169')!;
      expect(Number(r.variacao_12m)).toBe(Number(l.variacao_12m));
    }
  });

  it('contribuições por grupo somam π_área − π_Brasil do mês (|dif| < 0,02 p.p.)', () => {
    const p = ult[0]!.periodo!;
    const br = Number(regIpca.find((x) => x.periodo === p && x.area === '1' && x.categoria === '7169')!.variacao_mensal);
    for (const r of ult) {
      const s = contrib.filter((c) => c.area === r.area).reduce((a, c) => a + Number(c.contribuicao_mes_pp), 0);
      expect(Math.abs(s - (Number(r.variacao_mensal) - br)), r.area_nome).toBeLessThan(0.02);
    }
  });

  it('dispersão: Brasil igual ao nacional, mínimo ≤ Q1 ≤ Q3 ≤ máximo, desvio ≥ 0', () => {
    for (const d of disp) {
      expect(Number(d.brasil_12m)).toBeCloseTo(Number(ipca.get(d.periodo!)!.acumulada_12m), 2);
      const [mn, q1, q3, mx] = [d.minimo, d.q1_ponderado, d.q3_ponderado, d.maximo].map(Number);
      expect(mn! <= q1! && q1! <= q3! && q3! <= mx!, d.periodo).toBe(true);
      expect(Number(d.desvio_padrao_ponderado)).toBeGreaterThanOrEqual(0);
      expect(Math.abs(Number(d.media_ponderada_12m) - Number(d.brasil_12m)), d.periodo).toBeLessThan(0.35); // 12m não agrega exatamente
    }
  });
});

describe('classificações, núcleos e grupos', () => {
  const cl = ler(`${IND}/inflacao_classificacoes.csv`);
  const gr = ler(`${IND}/ipca_grupos.csv`);
  it('alimentação no domicílio do SGS (1635) acumulada em 12 meses = subgrupo 7171 do SIDRA 7060', () => {
    const u = cl.at(-1)!;
    expect(gr.find((g) => g.codigo === '7171')!.periodo).toBe(u.periodo);
    expect(Math.abs(Number(u.alim_dom_12m) - Number(gr.find((g) => g.codigo === '7171')!.variacao_12m))).toBeLessThan(0.02);
  });
  it('contribuições dos 9 grupos somam o IPCA do mês e os pesos somam 100 % (|dif| < 0,02)', () => {
    const g1 = gr.filter((g) => g.nivel === '1');
    expect(g1).toHaveLength(9);
    expect(Math.abs(g1.reduce((s, g) => s + Number(g.peso), 0) - 100)).toBeLessThan(0.01);
    const m = Number(ipca.get(g1[0]!.periodo!)!.variacao_mensal);
    expect(Math.abs(g1.reduce((s, g) => s + Number(g.contribuicao_mes_pp), 0) - m)).toBeLessThan(0.02);
  });
  it('pesos dos subgrupos somam o peso do grupo', () => {
    for (const g of gr.filter((x) => x.nivel === '1')) {
      const s = gr.filter((x) => x.nivel === '2' && x.grupo === g.codigo).reduce((a, x) => a + Number(x.peso), 0);
      expect(Math.abs(s - Number(g.peso)), g.nome).toBeLessThan(0.01);
    }
  });
  it('medidas: IPCA-15 e INPC presentes e em faixa plausível perto do IPCA', () => {
    const md = ler(`${IND}/inflacao_medidas.csv`).filter((r) => r.ipca15_12m && r.inpc_12m && r.ipca_12m);
    expect(md.length).toBeGreaterThan(100);
    for (const r of md) {
      expect(Math.abs(Number(r.inpc_12m) - Number(r.ipca_12m)), r.periodo).toBeLessThan(3);
      expect(Math.abs(Number(r.ipca15_12m) - Number(r.ipca_12m)), r.periodo).toBeLessThan(2);
    }
  });
});

describe('estatísticas ponderadas', () => {
  it('quantil ponderado', () => {
    expect(quantilPonderado([1, 2, 3, 4], [1, 1, 1, 1], 0.5)).toBe(2);
    expect(quantilPonderado([1, 2, 3, 4], [1, 1, 1, 1], 0.75)).toBe(3);
    expect(quantilPonderado([4, 1, 3, 2], [10, 70, 10, 10], 0.5)).toBe(1); // ordena; 70 % do peso no menor valor
    expect(quantilPonderado([1, 2, 3], [1, 1, 8], 0.25)).toBe(3);
    expect(() => quantilPonderado([], [], 0.5)).toThrow();
  });
  it('desvio-padrão ponderado', () => {
    expect(desvioPonderado([2, 4, 4, 4, 5, 5, 7, 9], [1, 1, 1, 1, 1, 1, 1, 1])).toBeCloseTo(2, 12);
    expect(desvioPonderado([0, 10], [3, 1])).toBeCloseTo(Math.sqrt(18.75), 12); // média 2,5; (3·6,25 + 56,25)/4
    expect(desvioPonderado([5, 5, 5], [1, 2, 3])).toBe(0);
  });
});
