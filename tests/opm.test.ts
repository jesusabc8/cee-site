/**
 * Observatório de Política Monetária (ADR-022): cálculos simples (scripts/data/opm/) e testes de referência da
 * especificação v1.1, Anexo B e seção "Dessazonalização" (valores do RPM de set./2026 e da ata da 282ª reunião).
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lerCsvTexto } from '../scripts/data/csv.ts';
import { diaUtil, feriados, pascoa, proximosDiasUteis } from '../scripts/data/opm/calendario.ts';
import { credibilidade, metaHorizonte12m, surpresa, ultimaAntes } from '../scripts/data/opm/expectativas.ts';
import { acumula, contadorRegime, saar3m } from '../scripts/data/opm/inflacao.ts';
import { fisher, selicAcumulada252, selicEsperada12m, selicEsperadaHorizonte } from '../scripts/data/opm/juros.ts';
import { coeficientes, real, velocidade } from '../scripts/data/opm/moeda.ts';
import { datasCalendario } from '../scripts/data/process-opm.ts';
import { SERIES } from '../scripts/data/series.ts';

const ler = (f: string) => lerCsvTexto(readFileSync(`data/processed/${f}`, 'utf8'));
const IND = 'opm/indicadores';

describe('calendário de dias úteis', () => {
  it('Páscoa e feriados móveis', () => {
    expect(pascoa(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
    const f = feriados(2026);
    for (const d of ['2026-02-16', '2026-02-17', '2026-04-03', '2026-06-04', '2026-11-20']) expect(f.has(d), d).toBe(true);
    expect(feriados(2023).has('2023-11-20')).toBe(false); // feriado nacional só desde 2024
  });
  it('dias úteis', () => {
    expect(diaUtil('2026-11-18')).toBe(true);
    expect(diaUtil('2026-11-21')).toBe(false); // sábado
    expect(diaUtil('2026-11-20')).toBe(false);
    expect(proximosDiasUteis('2026-11-19', 1)).toEqual(['2026-11-23']);
  });
});

describe('juro real (I.1, I.2)', () => {
  it('Fisher exata, não a diferença simples', () => {
    expect(fisher(14, 5)).toBeCloseTo(8.5714, 4);
    expect(fisher(14, 5)).not.toBeCloseTo(9, 2);
  });
  it('trajetória constante: Selic esperada em 12 meses = a própria taxa (base 252)', () => {
    const r = selicEsperada12m('2026-01-02', 10, [{ reuniao: 'R1/2026', vigencia: '2026-01-29', mediana: 10 }, { reuniao: 'R8/2026', vigencia: '2026-12-10', mediana: 10 }]);
    expect(r.selic_12m).toBeCloseTo(10, 8);
    expect(r.completa).toBe(true);
  });
  it('a nova meta vale a partir da vigência e a composição é diária', () => {
    // 126 dias a 10 % e 126 a 12 %: fator = 1,10^(1/2) × 1,12^(1/2)
    const dias = proximosDiasUteis('2026-01-02', 252);
    const r = selicEsperada12m('2026-01-02', 10, [{ reuniao: 'X', vigencia: dias[126]!, mediana: 12 }]);
    expect(r.selic_12m).toBeCloseTo(100 * (Math.sqrt(1.1 * 1.12) - 1), 8);
  });
  it('Selic efetiva acumulada em 252 dias', () => {
    expect(selicAcumulada252(Array(300).fill(13.65))).toBeCloseTo(13.65, 8);
  });
});

describe('expectativas (I.5, I.7, I.8)', () => {
  it('índice de credibilidade (δ = 1,5)', () => {
    expect(credibilidade(3, 3)).toBe(1);
    expect(credibilidade(3.75, 3)).toBeCloseTo(0.5, 10);
    expect(credibilidade(1.5, 3)).toBe(0);
    expect(credibilidade(5.2, 3)).toBe(0);
  });
  it('surpresa e normalização', () => {
    expect(surpresa(13.75, 13.5, 0.1285)).toEqual({ surpresa_pp: 0.25, surpresa_normalizada: 1.946 });
    expect(surpresa(13.75, 13.75, 0).surpresa_normalizada).toBeNull();
  });
  it('última coleta estritamente anterior', () => {
    const c = [{ data: '2026-10-29', mediana: 1 }, { data: '2026-10-30', mediana: 2 }, { data: '2026-11-03', mediana: 3 }];
    expect(ultimaAntes(c, '2026-11-03')?.data).toBe('2026-10-30');
  });
  it('meta do horizonte de 12 meses pondera os anos cobertos', () => {
    const meta = (a: number) => (a <= 2024 ? 3.25 : 3);
    expect(metaHorizonte12m('2024-06', meta)).toBeCloseTo((6 * 3.25 + 6 * 3) / 12, 10);
    expect(metaHorizonte12m('2025-06', meta)).toBe(3);
  });
});

describe('inflação (I.9, I.10)', () => {
  it('acumulado e SAAR', () => {
    expect(acumula([1, 1])).toBeCloseTo(2.01, 10);
    expect(saar3m([0.5, 0.5, 0.5])).toBeCloseTo(100 * (1.005 ** 12 - 1), 10);
  });
  it('contador conta meses consecutivos do mesmo lado e marca o 6º', () => {
    const s = [4.6, 4.7, 4.8, 4.9, 5, 5.1, 4.4, 1.2].map((v, k) => ({ periodo: `2026-${String(k + 1).padStart(2, '0')}`, ipca12m: v }));
    const c = contadorRegime(s, 1.5, 4.5);
    expect(c.map((x) => x.meses_consecutivos)).toEqual([1, 2, 3, 4, 5, 6, 0, 1]);
    expect(c[5]!.descumprimento).toBe(1);
    expect(c[7]!.lado).toBe('abaixo');
  });
});

describe('moeda (I.18–I.20)', () => {
  it('identidades e unidades', () => {
    expect(real(10, 5)).toBeCloseTo(100 * (1.1 / 1.05 - 1), 10);
    const c = coeficientes(600, 400, 300, 300, 100);
    expect(c).toEqual({ multiplicador_m1: 1.5, c_pmpp_dv: 1, r_reservas_dv: 1 / 3 });
    // M̄ = 1.000.000 mil = 1.000 milhões; PIB 12m = 10.000 milhões → V = 10, M/PIB = 10 %
    expect(velocidade(10_000, Array(12).fill(1_000_000))).toEqual({ velocidade: 10, monetizacao_pct: 10 });
  });
});

describe('calendário do Copom (comunicado do BCB)', () => {
  it('lê as oito reuniões, com e sem "de" antes do mês', () => {
    const t = 'Datas das Reuniões: 27 e 28 de janeiro 17 e 18 de março 28 e 29 de abril 16 e 17 junho 4 e 5 de agosto 15 e 16 de setembro 3 e 4 de novembro 8 e 9 de dezembro 2. As reuniões';
    const d = datasCalendario(t, 2026);
    expect(d).toHaveLength(8);
    expect(d[3]).toEqual({ reuniao_ano: 'R4/2026', inicio: '2026-06-16', fim: '2026-06-17' });
    expect(d[6]!.fim).toBe('2026-11-04');
  });
});

describe('códigos dos núcleos (Nota Técnica BCB nº 57)', () => {
  const codigo = (id: string) => SERIES.find((s) => s.id === id)?.codigo;
  it('confere os códigos SGS', () => {
    const nt57: Record<string, number> = {
      nucleo_ex0: 11427, nucleo_ex1: 16121, nucleo_ex2: 27838, nucleo_ex3: 27839, nucleo_exfe: 28751, nucleo_ms: 4466,
      nucleo_ma: 11426, nucleo_dp: 16122, nucleo_p55: 28750, nucleo_ex3_servicos: 29683, nucleo_ex3_industriais: 29684, ipca_difusao: 21379,
    };
    for (const [id, c] of Object.entries(nt57)) expect(codigo(id), id).toBe(`SGS ${c}`);
  });
  it('não usa as séries 29666–29682', () => {
    for (const s of SERIES) {
      const m = /^SGS (\d+)$/.exec(s.codigo);
      if (m) expect(Number(m[1]) >= 29666 && Number(m[1]) <= 29682, s.id).toBe(false);
    }
  });
});

// ——— Testes de referência (Anexo B e seção "Dessazonalização" da especificação) ———
describe('referência: decisões do Copom', () => {
  const i5 = ler(`${IND}/i5_surpresa.csv`);
  it('meta Selic de 13,75 % após as reuniões 281 e 282, ambas por unanimidade', () => {
    for (const n of ['281', '282']) {
      const r = i5.find((x) => x.reuniao === n)!;
      expect(Number(r.meta_decidida)).toBe(13.75);
      expect(r.placar).toBe('Unanimidade');
      expect(r.votos_divergentes).toBe('0');
    }
  });
  it('Focus antes da 282ª: IPCA 2026 = 5,2 e 2027 = 4,8 (±0,05)', () => {
    const r = ler('opm/focus_anuais.csv').filter((x) => x.data === '2026-10-30' && x.indicador === 'IPCA');
    expect(Number(r.find((x) => x.ano_referencia === '2026')!.mediana)).toBeCloseTo(5.2, 1);
    expect(Math.abs(Number(r.find((x) => x.ano_referencia === '2026')!.mediana) - 5.2)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(Number(r.find((x) => x.ano_referencia === '2027')!.mediana) - 4.8)).toBeLessThanOrEqual(0.05);
  });
  it('surpresa da 282ª é medida com a coleta de 30/10/2026 (última antes da reunião)', () => {
    expect(i5.find((x) => x.reuniao === '282')!.coleta_focus).toBe('2026-10-30');
  });
});

describe('referência: inflação', () => {
  it('IPCA em 12 meses de ago/2026 = 4,22 %', () => {
    expect(ler('conjuntura/ipca.csv').find((r) => r.periodo === '2026-08')!.acumulada_12m).toBe('4.22');
  });
  it('média dos núcleos em 12 meses: ago/2026 = 4,35 % e mai/2026 = 4,52 % (RPM p. 35)', () => {
    const n = ler(`${IND}/media_nucleos.csv`);
    const v = (p: string, c: string) => Number(n.find((r) => r.periodo === p)![c]);
    // Convenção adotada: média mensal arredondada a 2 casas, composta em 12 meses.
    expect(v('2026-08', 'media_12m').toFixed(2)).toBe('4.35');
    expect(v('2026-05', 'media_12m').toFixed(2)).toBe('4.52');
    // As alternativas não reproduzem agosto: média das taxas de 12 meses e composição sem arredondar dão 4,36.
    expect(v('2026-08', 'media_12m_das_taxas').toFixed(2)).toBe('4.36');
    expect(v('2026-08', 'media_12m_composta_sem_arredondar').toFixed(2)).toBe('4.36');
  });
  it('contador do regime de meta contínua ativo (IPCA 12m acima do teto na 1ª edição)', () => {
    const c = ler(`${IND}/i10_regime_meta_continua.csv`);
    const set = c.find((r) => r.periodo === '2026-09')!;
    expect(set.lado).toBe('acima');
    expect(Number(c.at(-1)!.meses_consecutivos)).toBeGreaterThan(0);
  });
  it('SAAR de 3 meses dessazonalizado pelo CEE: ±0,5 p.p. do BCB (IPCA 2,9/7,2; média dos núcleos 3,9/5,4)', () => {
    const p = 'data/processed/opm/dessaz/_validacao.csv';
    expect(existsSync(p)).toBe(true);
    for (const r of lerCsvTexto(readFileSync(p, 'utf8'))) expect(Math.abs(Number(r.diferenca_pp)), `${r.serie} ${r.periodo}`).toBeLessThanOrEqual(0.5);
    // Recalcula o SAAR do IPCA de agosto a partir da série ajustada publicada.
    const sa = lerCsvTexto(readFileSync('data/processed/opm/dessaz/ipca.csv', 'utf8'));
    const k = sa.findIndex((r) => r.periodo === '2026-08');
    expect(Math.abs(saar3m(sa.slice(k - 2, k + 1).map((r) => Number(r.ajustada))) - 2.9)).toBeLessThanOrEqual(0.5);
  });
});

describe('referência: identidades monetárias', () => {
  const nivel = (id: string) => new Map(ler(`opm/${id}.csv`).map((r) => [r.periodo!, Number(r.valor)]));
  const [m1, m2, m3, m4, b, pmc, res, pmpp, dv] = ['m1', 'm2', 'm3', 'm4', 'base_restrita', 'papel_moeda_circulacao', 'reservas_bancarias', 'pmpp', 'depositos_vista'].map(nivel);
  it('M1 ≤ M2 ≤ M3 ≤ M4 em todos os meses', () => {
    for (const [p, x] of m1!) expect(x <= m2!.get(p)! && m2!.get(p)! <= m3!.get(p)! && m3!.get(p)! <= m4!.get(p)!, p).toBe(true);
  });
  it('base restrita = papel-moeda emitido + reservas bancárias (±R$ 2 mil, arredondamento)', () => {
    for (const [p, x] of b!) if (pmc!.has(p) && res!.has(p)) expect(Math.abs(x - pmc!.get(p)! - res!.get(p)!), p).toBeLessThanOrEqual(2);
  });
  it('M1 = papel-moeda em poder do público + depósitos à vista (±R$ 2 mil)', () => {
    for (const [p, x] of m1!) if (pmpp!.has(p) && dv!.has(p)) expect(Math.abs(x - pmpp!.get(p)! - dv!.get(p)!), p).toBeLessThanOrEqual(2);
  });
});

describe('Selic média esperada pela Focus em n dias úteis (I.16, ADR-031)', () => {
  it('trajetória constante reproduz a taxa', () => {
    const r = selicEsperadaHorizonte('2026-01-02', 10, [{ reuniao: 'R1', vigencia: '2026-01-29', mediana: 10 }], [2026, 2027, 2028, 2029].map((ano) => ({ ano, mediana: 10 })), 756);
    expect(r.selic_media).toBeCloseTo(10, 8);
    expect(r.coberto).toBe(true);
  });
  it('queda linear de 12 para 8 em um ano e 8 no seguinte: média ≈ 9', () => {
    const r = selicEsperadaHorizonte('2026-01-02', 12, [{ reuniao: 'R1', vigencia: '2026-01-05', mediana: 12 }], [{ ano: 2026, mediana: 8 }, { ano: 2027, mediana: 8 }], 504);
    expect(Math.abs(r.selic_media - 9)).toBeLessThan(0.15);
  });
  it('sem expectativa para o fim do horizonte: não coberto', () => {
    const r = selicEsperadaHorizonte('2026-01-02', 10, [{ reuniao: 'R1', vigencia: '2026-01-29', mediana: 10 }], [{ ano: 2026, mediana: 10 }], 756);
    expect(r.coberto).toBe(false);
  });
});
