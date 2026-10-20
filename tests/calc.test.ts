/** Validação dos cálculos do CEE contra casos de referência fixados pela coordenação. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { acumular, fisher, jurosSimples, matrizSensibilidade, primarioEstabilizador, trajetoria12m } from '../scripts/data/calc.ts';
import { lerCsvTexto } from '../scripts/data/csv.ts';

describe('primário que estabiliza a dívida: s* = d (r − g)/(1 + g)', () => {
  it('d = 82,6; r = 5 %; g = 2 % → 2,43', () => expect(primarioEstabilizador(82.6, 5, 2)).toBeCloseTo(2.43, 2));
  it('d = 82,6; r = 6 %; g = 1,5 % → 3,66', () => expect(primarioEstabilizador(82.6, 6, 1.5)).toBeCloseTo(3.66, 2));
  it('supostos da IFI (d ≈ 82,5; r = 5 %; g = 2,3 %) → ≈ 2,2 (IFI publica 2,1)', () => {
    const s = primarioEstabilizador(82.5, 5, 2.3);
    expect(s).toBeGreaterThan(2.1);
    expect(s).toBeLessThan(2.25);
  });
  it('r = g → s* = 0; r < g → s* < 0', () => {
    expect(primarioEstabilizador(80, 3, 3)).toBe(0);
    expect(primarioEstabilizador(80, 2, 3)).toBeLessThan(0);
  });
  it('matriz cresce com r e cai com g', () => {
    const m = matrizSensibilidade(82.6, [4, 5, 6], [1, 2, 3]);
    expect(m[2]![0]!).toBeGreaterThan(m[0]![0]!);
    expect(m[0]![2]!).toBeLessThan(m[0]![0]!);
  });
});

describe('juro real', () => {
  it('Fisher exata < diferença simples quando π > 0', () => {
    expect(fisher(13.75, 4.5)).toBeCloseTo(8.851, 2);
    expect(jurosSimples(13.75, 4.5)).toBeCloseTo(9.25, 6);
    expect(fisher(13.75, 4.5)).toBeLessThan(jurosSimples(13.75, 4.5));
  });
});

describe('trajetória do IPCA em 12 meses', () => {
  it('acumula variações mensais', () => expect(acumular(Array(12).fill(0.5))).toBeCloseTo(6.168, 2));
  it('usa observado e completa com o esperado; para no primeiro buraco', () => {
    const obs = new Map<string, number>();
    for (let m = 1; m <= 12; m++) obs.set(`2025-${String(m).padStart(2, '0')}`, 0.5);
    const esp = new Map([['2026-01', 0.2], ['2026-02', 0.2], ['2026-04', 0.2]]);
    const t = trajetoria12m(obs, esp);
    expect(t.map((x) => x.periodo)).toEqual(['2026-01', '2026-02']);
    expect(t[0]!.ipca_12m_projetado).toBeCloseTo(acumular([...Array(11).fill(0.5), 0.2]), 2);
  });
  it('dezembro projetado ≈ mediana Focus anual do mesmo ano (consistência, ±0,25 p.p.)', () => {
    const traj = lerCsvTexto(readFileSync('data/processed/panorama/ipca_meta.csv', 'utf8'));
    const focus = lerCsvTexto(readFileSync('data/processed/conjuntura/focus_ipca.csv', 'utf8'));
    const ultimaData = focus.at(-1)!.data;
    for (const r of traj.filter((x) => x.periodo!.endsWith('-12') && x.ipca_12m_focus && !x.ipca_12m)) {
      const ano = Number(r.periodo!.slice(0, 4));
      const anual = focus.find((f) => f.data === ultimaData && Number(f.ano_referencia) === ano);
      if (anual) expect(Math.abs(Number(r.ipca_12m_focus) - Number(anual.mediana))).toBeLessThan(0.25);
    }
  });
});

describe('PWT 11.0 (2023): conferência com valores já publicados na Proposta', () => {
  const conv = lerCsvTexto(readFileSync('data/processed/panorama/pwt_convergencia.csv', 'utf8'));
  const prod = lerCsvTexto(readFileSync('data/processed/panorama/pwt_produtividade.csv', 'utf8'));
  const c23 = conv.find((x) => x.ano === '2023')!;
  it('PIB per capita relativo (rgdpna) ≈ 25,4 %', () => expect(Number(c23.pib_pc_rel_ppc_rgdpna)).toBeCloseTo(25.4, 1));
  it('produtividade do trabalho Brasil ≈ 26,4 %; Coreia ≈ 68,7 %', () => {
    expect(Number(prod.find((x) => x.pais === 'BRA' && x.ano === '2023')!.produtividade_rel_eua)).toBeCloseTo(26.4, 1);
    expect(Number(prod.find((x) => x.pais === 'KOR' && x.ano === '2023')!.produtividade_rel_eua)).toBeCloseTo(68.7, 1);
  });
  it('Coreia começa em 1953 e Brasil em 1950; tudo termina em 2023', () => {
    const anos = (p: string) => prod.filter((x) => x.pais === p).map((x) => Number(x.ano));
    expect(Math.min(...anos('KOR'))).toBe(1953);
    expect(Math.min(...anos('BRA'))).toBe(1950);
    expect(Math.max(...anos('BRA'))).toBe(2023);
  });
});

describe('sinal da NFSP', () => {
  it('superávit = −NFSP em todas as linhas', () => {
    for (const r of lerCsvTexto(readFileSync('data/processed/panorama/primario.csv', 'utf8'))) {
      expect(Number(r.superavit_primario_pib)).toBeCloseTo(-Number(r.nfsp_primario_pib), 6);
    }
  });
});

describe('metas de inflação', () => {
  const metas = lerCsvTexto(readFileSync('data/processed/panorama/metas_inflacao.csv', 'utf8'));
  it('2025 (meta contínua) = 3 % ± 1,5 p.p.', () => {
    const m = metas.find((x) => x.ano === '2025')!;
    expect([Number(m.meta), Number(m.limite_inferior), Number(m.limite_superior)]).toEqual([3, 1.5, 4.5]);
  });
  it('limites = meta ± tolerância em todos os anos', () => {
    for (const m of metas) {
      expect(Number(m.limite_superior) - Number(m.meta)).toBeCloseTo(Number(m.tolerancia_pp), 6);
      expect(Number(m.meta) - Number(m.limite_inferior)).toBeCloseTo(Number(m.tolerancia_pp), 6);
    }
  });
});

describe('pobreza (SIS 2025, Tabela 2.18) e abertura comercial', () => {
  const pob = lerCsvTexto(readFileSync('data/processed/panorama/pobreza.csv', 'utf8'));
  it('2024 confere com a divulgação do IBGE (23,1 % e 3,5 %)', () => {
    const r = pob.find((l) => l.ano === '2024')!;
    expect(Number(r.pobreza_us685_ppc2017)).toBeCloseTo(23.1, 1);
    expect(Number(r.extrema_us215_ppc2017)).toBeCloseTo(3.5, 1);
  });
  it('abertura = (X12 + M12) / PIB12 × 100', () => {
    const ab = lerCsvTexto(readFileSync('data/processed/panorama/abertura.csv', 'utf8'));
    for (const l of ab.slice(-24)) {
      const esperado = ((Number(l.exportacoes_12m_usd_milhoes) + Number(l.importacoes_12m_usd_milhoes)) / Number(l.pib_12m_usd_milhoes)) * 100;
      expect(Number(l.abertura_pib)).toBeCloseTo(esperado, 1);
      expect(Number(l.abertura_pib)).toBeGreaterThan(10);
      expect(Number(l.abertura_pib)).toBeLessThan(50);
    }
  });
});
