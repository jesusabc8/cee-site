/**
 * Testes dos dados processados (rodam no CI e no workflow de atualização):
 * formato, intervalos plausíveis, ausência de duplicatas, ordem cronológica e
 * integridade do dado bruto (hash SHA-256 registrado no meta.json).
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SERIES } from '../scripts/data/series.ts';

import { lerCsvTexto } from '../scripts/data/csv.ts';

const painelDe = Object.fromEntries(SERIES.map((s) => [s.id, s.painel]));
const vintages = Object.fromEntries(['conjuntura', 'panorama', 'opm'].map((p) => [p, JSON.parse(readFileSync(join('data/processed', p, 'vintage.json'), 'utf8'))]));
const vintage: Record<string, { extraido_em: string; arquivos: { arquivo: string; sha256: string }[]; vintage_dir: string }> =
  Object.assign({}, ...Object.values(vintages));
const lerCsv = (nome: string) => lerCsvTexto(readFileSync(join('data/processed', painelDe[nome]!, `${nome}.csv`), 'utf8'));

/** Intervalos plausíveis: fora deles, algo mudou na fonte ou no processamento. */
const LIMITES: Record<string, Record<string, [number, number]>> = {
  ipca: { variacao_mensal: [-2, 5], acumulada_12m: [-2, 30] },
  selic_meta: { meta_selic: [1, 30] },
  desocupacao: { taxa: [2, 25], coef_variacao: [0, 10] },
  focus_ipca: { mediana: [-2, 30] },
  pib: { var_interanual: [-15, 15], var_trimestral_sa: [-12, 12] },
  ptax: { media_mensal: [1, 15], fim_periodo: [1, 15] },
  cambio_real: { indice: [40, 250] },
  conta_corrente: { transacoes_correntes_pib: [-10, 5] },
  primario: { nfsp_primario_pib: [-6, 15], superavit_primario_pib: [-15, 6] },
  dbgg: { dbgg_pib: [40, 120] },
  dlsp: { dlsp_pib: [20, 120] },
  focus_anual: {},
  focus_mensal_ipca: { mediana: [-3, 5] },
  focus_12m_ipca: { mediana: [-2, 30] },
  metas_inflacao: { meta: [1, 10], limite_inferior: [0, 10], limite_superior: [2, 12] },
  pwt: { rgdpna: [1, 5e7], pop: [0.1, 2000], emp: [0.01, 1000], csh_x: [0, 2], csh_m: [-2, 0], pl_x: [0.001, 10], pl_m: [0.001, 10] },
  pib_usd: { pib_usd_milhoes_12m: [5e5, 6e6] },
  comercio: { exportacao_usd: [5e9, 6e10], importacao_usd: [5e9, 6e10] },
  pobreza: { pobreza_us685_ppc2017: [5, 60], extrema_us215_ppc2017: [0.5, 20] },
};

// OPM (ADR-022): intervalos por grupo de série.
const LIM_OPM: [RegExp, Record<string, [number, number]>][] = [
  [/^(ipca_(livres|administrados|servicos|industriais|alim_dom|comercializaveis|nao_comercializaveis|duraveis|semiduraveis|nao_duraveis)|nucleo_.*)$/, { valor: [-6, 15] }],
  [/^ipca_difusao$/, { valor: [0, 100] }],
  [/^selic_efetiva$/, { valor: [1, 30] }],
  [/^(juros_credito|juros_pj|juros_pf_livres|icc)$/, { valor: [1, 150] }],
  [/^spread_credito$/, { valor: [0, 100] }],
  [/^icbr/, { valor: [10, 2000] }],
  [/^ibcbr$/, { valor: [50, 250] }],
  [/^pib_nominal_12m$/, { valor: [1e6, 5e7] }],
  [/^(base_restrita|papel_moeda_circulacao|reservas_bancarias|base_ampliada|bma_compulsorio|pmpp|depositos_vista|m[1-4])$/, { valor: [1e6, 1e11] }],
  [/^fed_funds_sup$/, { valor: [0, 25] }], [/^ust10$/, { valor: [-1, 20] }], [/^tips5$/, { valor: [-4, 10] }],
  [/^dolar_global$/, { valor: [50, 250] }], [/^brent$/, { valor: [5, 300] }],
  [/^focus_(selic|selic_top5|anuais|mensais|inflacao_12m|top5_anuais|top5_mensais)$/, { mediana: [-10, 50] }],
  [/^ipca_itens$/, { variacao_mensal: [-70, 150], peso: [0, 100] }],
  [/^copom_(decisoes|votos)$/, { meta_selic: [1, 50] }],
  [/^copom_comunicados$/, { caracteres: [100, 200000] }],
  [/^copom_atas$/, { caracteres: [0, 400000] }],
  [/^copom_calendario$/, {}],
  [/^tesouro_direto$/, { taxa_compra: [-10, 30], taxa_venda: [-10, 30] }], // juro real de NTN-B perto do vencimento pode ser negativo
  [/^pib_volume_sa$/, { indice: [50, 400] }],
];
for (const s of SERIES) if (s.painel === 'opm') LIMITES[s.id] = LIM_OPM.find(([re]) => re.test(s.id))?.[1] ?? (() => { throw new Error(`Sem intervalo plausível para ${s.id}`); })();

describe.each(SERIES.map((s) => s.id))('série %s', (id) => {
  const v = vintage[id]!;
  const linhas = lerCsv(id);
  const chave = Object.keys(linhas[0]!)[0]!;

  it('tem registro de vintage com data de extração e arquivos', () => {
    expect(vintage[id]).toBeDefined();
    expect(Number.isNaN(Date.parse(v.extraido_em))).toBe(false);
    expect(v.arquivos.length).toBeGreaterThan(0);
  });

  it('dado bruto íntegro (SHA-256 confere)', () => {
    for (const a of v.arquivos) {
      const p = join(v.vintage_dir, a.arquivo);
      expect(existsSync(p), p).toBe(true);
      expect(createHash('sha256').update(readFileSync(p)).digest('hex')).toBe(a.sha256);
    }
  });

  it('valores dentro de intervalos plausíveis', () => {
    for (const [col, [min, max]] of Object.entries(LIMITES[id]!)) {
      for (const l of linhas) {
        if (l[col] === '') continue;
        const v = Number(l[col]);
        expect(Number.isFinite(v), `${col}=${l[col]}`).toBe(true);
        expect(v, `${l[chave]} ${col}`).toBeGreaterThanOrEqual(min);
        expect(v, `${l[chave]} ${col}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it('sem duplicatas e em ordem cronológica', () => {
    const chaveComp: Record<string, (l: Record<string, string>) => string> = {
      focus_ipca: (l) => `${l.data}|${l.ano_referencia}`,
      focus_anual: (l) => `${l.data}|${l.indicador}|${l.ano_referencia}`,
      focus_mensal_ipca: (l) => `${l.data}|${l.mes_referencia}`,
      pwt: (l) => `${l.pais}|${l.ano}`,
      focus_selic: (l) => `${l.data}|${l.reuniao}`,
      focus_selic_top5: (l) => `${l.data}|${l.reuniao}|${l.tipo_calculo}`,
      focus_anuais: (l) => `${l.data}|${l.indicador}|${l.ano_referencia}`,
      focus_mensais: (l) => `${l.data}|${l.mes_referencia}`,
      focus_inflacao_12m: (l) => `${l.data}|${l.suavizada}`,
      focus_top5_anuais: (l) => `${l.data}|${l.indicador}|${l.ano_referencia}|${l.tipo_calculo}`,
      focus_top5_mensais: (l) => `${l.data}|${l.mes_referencia}|${l.tipo_calculo}`,
      ipca_itens: (l) => `${l.periodo}|${l.codigo}`,
      copom_decisoes: (l) => `${l.reuniao}|${l.inicio_vigencia}`,
      tesouro_direto: (l) => `${l.data}|${l.titulo}|${l.vencimento}`,
    };
    const chaves = linhas.map((l) => (chaveComp[id] ?? ((x) => x[chave]!))(l));
    expect(new Set(chaves).size).toBe(chaves.length);
    // Séries por reunião do Copom: ordem numérica (ou por vigência), não lexicográfica.
    const porReuniao = ['copom_votos', 'copom_comunicados', 'copom_atas'];
    if (id === 'copom_calendario') { const f = linhas.map((l) => l.fim!); expect([...f].sort()).toEqual(f); return; }
    if (porReuniao.includes(id)) {
      const nums = linhas.map((l) => Number(l.reuniao));
      expect([...nums].sort((a, b) => a - b)).toEqual(nums);
    } else if (id === 'copom_decisoes') {
      const datas = linhas.map((l) => l.inicio_vigencia!);
      expect([...datas].sort()).toEqual(datas);
    } else if (id !== 'pwt') {
      const datas = linhas.map((l) => l[chave]!);
      expect([...datas].sort()).toEqual(datas);
    }
  });

  it('nenhuma observação posterior à data de extração', () => {
    const limite = v.extraido_em.slice(0, 10);
    // O calendário do Copom lista reuniões futuras por definição; as séries por reunião não têm data na 1ª coluna.
    if (['pwt', 'metas_inflacao', 'copom_calendario', 'copom_decisoes', 'copom_votos', 'copom_comunicados', 'copom_atas'].includes(id)) return;
    // Trimestres (AAAA-Tn) comparados pelo último mês do trimestre.
    const comoData = (v: string) => (/^\d{4}-T\d$/.test(v) ? `${v.slice(0, 4)}-${String(Number(v.slice(6)) * 3).padStart(2, '0')}` : v);
    for (const l of linhas) expect(comoData(String(l[chave])) <= limite).toBe(true);
  });
});

describe('câmbio real efetivo (SGS 11752; ADR-020)', () => {
  const cr = Object.fromEntries(lerCsv('cambio_real').map((l) => [l.periodo, Number(l.indice)]));
  it('confere com os valores de referência do SGS (duas casas, tolerância zero)', () => {
    // jul/2011 (71,76) fica antes de ANO_INICIAL (2012) e foi conferido só na API.
    expect(cr['2015-09']).toBe(129.34);
    expect(cr['2020-05']).toBe(149.83);
    expect(cr['2025-08']).toBe(127.44);
    expect(cr['2026-07']).toBe(119.67);
    expect(cr['2026-08']).toBe(123.23);
  });
  it('variação em 12 meses de ago/2026 = −3,3 % (123,23 / 127,44 − 1)', () => {
    expect(Math.round((cr['2026-08']! / cr['2025-08']! - 1) * 1000) / 10).toBe(-3.3);
  });
  it('o cartão da página inicial usa a série e mostra a variação em 12 meses', () => {
    const tiles = JSON.parse(readFileSync('data/processed/panorama/indicadores.json', 'utf8')) as Record<string, unknown>[];
    const t = tiles.find((x) => x.id === 'cambio_real')!;
    const ult = lerCsv('cambio_real').at(-1)!;
    expect(t.serie).toBe('SGS 11752');
    expect(t.referencia).toBe(ult.periodo);
    expect(t.valor).toBe(Math.round(Number(ult.indice) * 10) / 10);
    if (ult.periodo === '2026-08') {
      expect(t.var12m).toBe(-3.3);
      expect(t.descricao).toMatch(/12 meses: −3,3%$/);
    }
    expect(tiles.some((x) => x.id === 'cambio')).toBe(false);
  });
});
