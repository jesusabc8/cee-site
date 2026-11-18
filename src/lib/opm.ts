/**
 * Observatório de Política Monetária (painel A2, edição 2.0; ADR-022): gráficos dos módulos, conferência com o estado
 * de partida (Anexo B) e calendário do Copom. Tudo é lido de data/processed no build; todo texto com número é gerado
 * do dado. Mesmo renderizador e mesma ficha do Panorama (src/lib/viz/render.ts, ChartCard).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';
import { href } from '../i18n/routing';
import { lerCsvTexto } from '../../scripts/data/csv.ts';
import { lerVintage, type VintageSerie } from './dados';
import { COR, type Fonte, type Grafico, type Legenda } from './panorama';
import { fmtNum, fmtX, type BandaSpec, type Ponto, type SerieSpec, type XFormat } from './viz/render';

const P = 'data/processed';
export const OPM_SLUG = '/observatorio/politica-monetaria/';
const ler = (rel: string) => lerCsvTexto(readFileSync(join(P, rel), 'utf8'));
const num = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));
const mes = (p: string) => Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5, 7)) - 1, 1);
const dia = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));

let vintCache: Record<string, VintageSerie> | null = null;
export function vintagesOpm(): Record<string, VintageSerie> {
  vintCache ??= { ...lerVintage('conjuntura'), ...lerVintage('panorama'), ...lerVintage('opm') };
  return vintCache;
}
const fonte = (id: string): Fonte => {
  const v = vintagesOpm()[id];
  if (!v) throw new Error(`OPM: série sem vintage: ${id}`);
  return { instituicao: v.instituicao, codigo: v.codigo, extraido_em: v.extraido_em.slice(0, 10), url: v.url_publica, desatualizado: v.desatualizado };
};
const painelDe = (id: string) => (lerVintage('opm')[id] ? 'opm' : lerVintage('conjuntura')[id] ? 'conjuntura' : 'panorama');
const csvSerie = (id: string) => ({ rotulo: `${id}.csv`, href: href(`/dados/${painelDe(id)}/${id}.csv`) });
const csvInd = (arq: string) => ({ rotulo: arq.split('/').pop()!, href: href(`/dados/opm/${arq}`) });

/** Último valor de cada mês de uma série diária. */
function fimDeMes<T extends { data: string }>(xs: T[]): T[] {
  const m = new Map<string, T>();
  for (const x of xs) m.set(x.data.slice(0, 7), x);
  return [...m.values()];
}

interface Monta {
  id: string; icone: string; rotulo: string; titulo: string; subtitulo: string; unidade: string; descricao: string;
  xFormat: XFormat; yDigits: number; yUnit: string; series: SerieSpec[]; bandas?: BandaSpec[]; refs?: { y: number; label: string; dash?: string; color?: string }[];
  legenda: Legenda[]; fontes: Fonte[]; csv: { rotulo: string; href: string }[]; nota?: string; largo?: boolean; zero?: boolean;
  ranges?: boolean; defaultRange?: string; altura?: number; colunasExtra?: { titulo: string; pontos: Ponto[] }[];
}

/** Monta a ficha com tabela alternativa gerada dos próprios pontos (uma linha por x). */
function monta(m: Monta, lang: Lang): Grafico {
  const en = lang === 'en';
  const cols = [...m.series.map((s) => ({ titulo: s.label, pontos: s.points })), ...(m.bandas ?? []).flatMap((b) => [
    { titulo: `${b.label} (${en ? 'low' : 'inferior'})`, pontos: b.lo }, { titulo: `${b.label} (${en ? 'high' : 'superior'})`, pontos: b.hi }]), ...(m.colunasExtra ?? [])];
  const xs = [...new Set(cols.flatMap((c) => c.pontos.map((p) => p.x)))].sort((a, b) => b - a);
  // Marcadores em séries longas viram ruído: acima de 60 pontos, a codificação secundária passa a ser traço pontilhado
  // (mais o rótulo direto no fim da linha); a legenda acompanha.
  const pontilhadas = new Set<string>();
  m.series = m.series.map((s) => {
    if (!s.markers || s.kind === 'dots' || s.points.length <= 60) return s;
    pontilhadas.add(s.id);
    const resto: SerieSpec = { ...s, dash: '1.5 3', width: Math.max(s.width ?? 1.8, 1.8) };
    delete resto.markers;
    return resto;
  });
  m.legenda = m.legenda.map((l) => (pontilhadas.has(l.id) && l.style === 'marker' ? { ...l, style: 'dash' } : l));
  const mapa = cols.map((c) => new Map(c.pontos.map((p) => [p.x, p.y])));
  return {
    id: m.id, bloco: 'precos', icone: m.icone, rotulo: m.rotulo, titulo: m.titulo, subtitulo: m.subtitulo, unidade: m.unidade, descricao: m.descricao,
    ...(m.largo ? { largo: true } : {}),
    spec: {
      id: m.id, height: m.altura ?? 320, xFormat: m.xFormat, yDigits: m.yDigits, yUnit: m.yUnit, lang, series: m.series,
      ...(m.bandas ? { bands: m.bandas } : {}), ...(m.refs ? { refs: m.refs } : {}), ...(m.zero ? { zero: true } : {}),
      ...(m.ranges === false ? {} : {
        ranges: [['5a', 5], ['10a', 10], ['tudo', null]].map(([id, years]) => ({ id: id as string, years: years as number | null, label: years === null ? (en ? 'All' : 'Tudo') : `${years} ${en ? 'yrs' : 'anos'}` })),
        defaultRange: m.defaultRange ?? '10a',
      }),
    },
    legenda: m.legenda, fontes: m.fontes, csv: m.csv, ...(m.nota ? { nota: m.nota } : {}),
    tabela: { colunas: [en ? 'Period' : 'Período', ...cols.map((c) => c.titulo)], linhas: xs.map((x) => [fmtX(x, m.xFormat, lang), ...mapa.map((mm) => mm.get(x) ?? null)]) },
  };
}

// ——— Conferência com o estado de partida (Anexo B) ———
export function valoresCee(): Record<string, number | null> {
  const i5 = ler('opm/indicadores/i5_surpresa.csv');
  const meta = (n: string) => num(i5.find((r) => r.reuniao === n)?.meta_decidida);
  const ipca = ler('conjuntura/ipca.csv');
  const nuc = ler('opm/indicadores/media_nucleos.csv');
  const val = ler('opm/dessaz/_validacao.csv');
  const fa = ler('opm/focus_anuais.csv').filter((r) => r.data === '2026-10-30' && r.indicador === 'IPCA');
  return {
    selic_281: meta('281'), selic_282: meta('282'),
    ipca12_2026_08: num(ipca.find((r) => r.periodo === '2026-08')?.acumulada_12m),
    nucleos12_2026_08: num(nuc.find((r) => r.periodo === '2026-08')?.media_12m),
    saar_ipca_2026_08: num(val.find((r) => r.serie === 'ipca' && r.periodo === '2026-08')?.saar_cee),
    saar_nucleos_2026_08: num(val.find((r) => r.serie === 'media_nucleos' && r.periodo === '2026-08')?.saar_cee),
    focus_2026_pre282: num(fa.find((r) => r.ano_referencia === '2026')?.mediana),
    focus_2027_pre282: num(fa.find((r) => r.ano_referencia === '2027')?.mediana),
  };
}

// ——— Calendário do Copom ———
export function calendarioCopom() {
  const hoje = new Date().toISOString().slice(0, 10);
  const decisoes = ler('opm/copom_decisoes.csv');
  return ler('opm/copom_calendario.csv').map((c) => {
    const d = decisoes.find((x) => x.data_reuniao === c.fim && x.extraordinaria === '0');
    return { rotulo: c.reuniao_ano!, inicio: c.inicio!, fim: c.fim!, realizada: c.fim! < hoje || Boolean(d), reuniao: d ? Number(d.reuniao) : null, meta: d ? num(d.meta_selic) : null };
  });
}

// ——— Resumo para a página principal (gerado do dado) ———
export function resumoOpm() {
  const i1 = ler('opm/indicadores/i1_juro_real_ex_ante.csv').filter((r) => r.trajetoria_completa === '1').at(-1)!;
  const f = ler('opm/indicadores/i4_faixa_neutro.csv').filter((r) => r.mediana).at(-1)!;
  const r10 = ler('opm/indicadores/i10_regime_meta_continua.csv').at(-1)!;
  const i5 = ler('opm/indicadores/i5_surpresa.csv').at(-1)!;
  const cred = ler('opm/indicadores/i7_i8_credibilidade_desancoragem.csv').at(-1)!;
  return {
    selic: { valor: num(i5.meta_decidida)!, reuniao: Number(i5.reuniao), data: i5.data_reuniao!, placar: i5.placar!, surpresa: num(i5.surpresa_pp)! },
    realEa: { valor: num(i1.juro_real_ex_ante)!, data: i1.data! },
    faixa: { q1: num(f.q1)!, mediana: num(f.mediana)!, q3: num(f.q3)!, periodo: f.periodo!, metodos: Number(f.metodos) },
    regime: { periodo: r10.periodo!, ipca12m: num(r10.ipca12m)!, meses: Number(r10.meses_consecutivos), lado: r10.lado! },
    credibilidade: { periodo: cred.periodo!, ic_t3: num(cred.ic_t3)!, desancoragem: num(cred.desancoragem_t3_pp)! },
  };
}

/** Gráficos de cada módulo. `dessaz`: pares [original, ajustada] para o seletor. */
export interface Tabela { id: string; titulo: string; descricao: string; colunas: string[]; linhas: (string | number | null)[][]; fontes: Fonte[]; csv: { rotulo: string; href: string }[] }
export interface ModuloGraficos { graficos: Grafico[]; dessaz?: { titulo: string; original: Grafico; ajustada: Grafico }[]; tabelas?: Tabela[] }
const tri = (t: string) => Date.UTC(Number(t.slice(0, 4)), (Number(t.slice(6)) - 1) * 3, 1);

export function graficosModulo(modulo: string, lang: Lang): ModuloGraficos {
  const en = lang === 'en';
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const n1 = (v: number) => fmtNum(v, 1, lang);
  const fm = (x: number) => fmtX(x, 'month', lang);
  const fd = (x: number) => fmtX(x, 'day', lang);
  const pts = (xs: Record<string, string>[], kx: string, ky: string, conv: (s: string) => number = mes) => xs.filter((r) => r[ky] !== '' && r[ky] !== undefined).map((r) => ({ x: conv(r[kx]!), y: Number(r[ky]) }));

  switch (modulo) {
    case 'a2-1-copom': {
      const dec = ler('opm/copom_decisoes.csv').filter((r) => r.inicio_vigencia! >= '2012-01-01' && r.meta_selic);
      const i5 = ler('opm/indicadores/i5_surpresa.csv');
      const u = i5.at(-1)!;
      const ns = i5.filter((r) => Number(r.surpresa_pp) !== 0).length;
      return { graficos: [
        monta({
          id: 'opm-selic-decisoes', icone: 'landmark', rotulo: 'A2.1', largo: true,
          titulo: en ? 'Selic target decided by Copom' : 'Meta Selic decidida pelo Copom',
          subtitulo: en ? `At its ${u.reuniao}th meeting (${fd(dia(u.data_reuniao!))}), Copom set the Selic target at ${n2(Number(u.meta_decidida))}% a year (${u.placar === 'Unanimidade' ? 'unanimous' : u.placar}).`
            : `Na ${u.reuniao}ª reunião (${fd(dia(u.data_reuniao!))}), o Copom fixou a meta Selic em ${n2(Number(u.meta_decidida))}% ao ano (${u.placar === 'Unanimidade' ? 'por unanimidade' : `placar ${u.placar}`}).`,
          unidade: en ? '% a year; value in force from the day after each meeting' : '% ao ano; valor vigente a partir do dia seguinte a cada reunião',
          descricao: en ? `Step series of Selic targets since ${fm(mes(dec[0]!.inicio_vigencia!.slice(0, 7)))}.` : `Série em degraus das metas Selic desde ${fm(mes(dec[0]!.inicio_vigencia!.slice(0, 7)))}.`,
          xFormat: 'day', yDigits: 2, yUnit: '%', zero: true,
          series: [{ id: 'meta', label: en ? 'Selic target' : 'Meta Selic', color: COR.navy, kind: 'step', width: 2.2, points: dec.map((r) => ({ x: dia(r.inicio_vigencia!), y: Number(r.meta_selic) })) }],
          legenda: [{ id: 'meta', label: en ? 'Selic target (Copom)' : 'Meta Selic (Copom)', color: COR.navy, style: 'step' }],
          fontes: [fonte('copom_decisoes'), fonte('copom_votos')], csv: [csvSerie('copom_decisoes'), csvSerie('copom_votos')],
        }, lang),
        monta({
          id: 'opm-surpresa', icone: 'zap', rotulo: 'I.5', largo: true,
          titulo: en ? 'Monetary policy surprise against the Focus median' : 'Surpresa de política monetária contra a mediana Focus',
          subtitulo: en ? `Meeting ${u.reuniao}: decided ${n2(Number(u.meta_decidida))}%, Focus median ${n2(Number(u.mediana_focus))}% (survey of ${fd(dia(u.coleta_focus!))}); surprise ${n2(Number(u.surpresa_pp))} p.p. ${ns} of ${i5.length} meetings since ${i5[0]!.data_reuniao!.slice(0, 4)} had a non-zero surprise.`
            : `Reunião ${u.reuniao}: decidido ${n2(Number(u.meta_decidida))}%, mediana Focus ${n2(Number(u.mediana_focus))}% (coleta de ${fd(dia(u.coleta_focus!))}); surpresa de ${n2(Number(u.surpresa_pp))} p.p. ${ns} das ${i5.length} reuniões desde ${i5[0]!.data_reuniao!.slice(0, 4)} tiveram surpresa diferente de zero.`,
          unidade: en ? 'p.p. (decided target minus expected)' : 'p.p. (meta decidida menos a esperada)',
          descricao: en ? 'Bars: surprise against the Focus median; dots: against the Top 5 (short-term ranking).' : 'Barras: surpresa contra a mediana Focus; pontos: contra o Top 5 (ranking de curto prazo).',
          xFormat: 'day', yDigits: 2, yUnit: 'p.p.', zero: true,
          series: [
            { id: 's', label: en ? 'Surprise (median)' : 'Surpresa (mediana)', color: COR.petrol, kind: 'bar', points: i5.map((r) => ({ x: dia(r.data_reuniao!), y: Number(r.surpresa_pp) })) },
            { id: 't', label: en ? 'Surprise (Top 5)' : 'Surpresa (Top 5)', color: COR.navy, kind: 'dots', markers: 'diamond', points: i5.filter((r) => r.surpresa_top5_pp).map((r) => ({ x: dia(r.data_reuniao!), y: Number(r.surpresa_top5_pp) })) },
          ],
          legenda: [{ id: 's', label: en ? 'Against the Focus median' : 'Contra a mediana Focus', color: COR.petrol, style: 'bar' }, { id: 't', label: en ? 'Against the Top 5' : 'Contra o Top 5', color: COR.navy, style: 'marker' }],
          fontes: [fonte('copom_decisoes'), fonte('focus_selic'), fonte('focus_selic_top5')], csv: [csvInd('indicadores/i5_surpresa.csv')],
          nota: en ? 'The survey used is the last one strictly before the first day of the meeting. The normalised surprise (S/σ) is in the CSV.' : 'A coleta usada é a última estritamente anterior ao primeiro dia da reunião. A surpresa normalizada (S/σ) está no CSV.',
        }, lang),
      ] };
    }
    case 'a2-2-juro-real': {
      const f = ler('opm/indicadores/i4_faixa_neutro.csv');
      const i2 = ler('opm/indicadores/i2_juro_real_ex_post.csv');
      const uf = f.filter((r) => r.mediana).at(-1)!;
      const ea = pts(f, 'periodo', 'juro_real_ex_ante');
      const comFaixa = f.filter((r) => r.q1 && r.q3);
      const h = ler('opm/indicadores/i3_hiato_juros.csv');
      const uh = h.at(-1)!;
      const BCB = 5;
      return { graficos: [
        monta({
          id: 'opm-juro-real', icone: 'percent', rotulo: 'I.1 · I.2 · I.4', largo: true,
          titulo: en ? 'Real interest rate and the CEE neutral-rate band' : 'Juro real e faixa de juro neutro do CEE',
          subtitulo: en ? `In ${fm(mes(uf.periodo!))}, the 12-month ex ante real rate was ${n2(Number(uf.juro_real_ex_ante))}%; the CEE neutral-rate band was ${n2(Number(uf.q1))}% to ${n2(Number(uf.q3))}% (median ${n2(Number(uf.mediana))}%, ${uf.metodos} methods). The BCB uses ${n2(BCB)}% (MPR Sep/2026).`
            : `Em ${fm(mes(uf.periodo!))}, o juro real ex ante de 12 meses foi de ${n2(Number(uf.juro_real_ex_ante))}%; a faixa de juro neutro do CEE ia de ${n2(Number(uf.q1))}% a ${n2(Number(uf.q3))}% (mediana de ${n2(Number(uf.mediana))}%, ${uf.metodos} métodos). O BCB usa ${n2(BCB)}% (RPM set./2026).`,
          unidade: en ? '% a year, real (exact Fisher)' : '% ao ano, real (Fisher exata)',
          descricao: en ? 'Lines: ex ante (Focus) and ex post (effective Selic) real rates, month end. Shaded area: interquartile range of the CEE neutral-rate estimates. Dashed line: BCB reference value, outside the CEE distribution.'
            : 'Linhas: juro real ex ante (Focus) e ex post (Selic efetiva), fim de mês. Área sombreada: intervalo interquartil das estimativas de juro neutro do CEE. Linha tracejada: valor de referência do BCB, fora da distribuição do CEE.',
          xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          series: [
            { id: 'ea', label: en ? 'Ex ante (I.1)' : 'Ex ante (I.1)', color: COR.navy, width: 2.4, points: ea },
            { id: 'ep', label: en ? 'Ex post (I.2)' : 'Ex post (I.2)', color: COR.azure, width: 1.8, dash: '6 3', points: pts(i2, 'periodo', 'juro_real_ex_post') },
          ],
          bandas: [{ id: 'faixa', label: en ? 'Neutral-rate band (Q1–Q3)' : 'Faixa de juro neutro (Q1–Q3)', fill: COR.sky, lo: comFaixa.map((r) => ({ x: mes(r.periodo!), y: Number(r.q1) })), hi: comFaixa.map((r) => ({ x: mes(r.periodo!), y: Number(r.q3) })) }],
          refs: [{ y: BCB, label: en ? 'BCB neutral 5.00%' : 'Neutro BCB 5,00%', dash: '2 3', color: COR.steel }],
          legenda: [{ id: 'ea', label: en ? 'Ex ante real rate (I.1)' : 'Juro real ex ante (I.1)', color: COR.navy, style: 'line' }, { id: 'ep', label: en ? 'Ex post real rate (I.2)' : 'Juro real ex post (I.2)', color: COR.azure, style: 'dash' }, { id: 'faixa', label: en ? 'CEE neutral-rate band, Q1–Q3 (I.4)' : 'Faixa de juro neutro do CEE, Q1–Q3 (I.4)', color: COR.sky, style: 'band' }],
          fontes: [fonte('focus_selic'), fonte('focus_inflacao_12m'), fonte('focus_anuais'), fonte('selic_efetiva'), fonte('ipca')],
          csv: [csvInd('indicadores/i1_juro_real_ex_ante.csv'), csvInd('indicadores/i2_juro_real_ex_post.csv'), csvInd('indicadores/i4_faixa_neutro.csv')],
          nota: en ? 'The neutral rate is unobservable and estimated with high uncertainty; it is always shown as a band, with method and date, never as a recommendation. BCB: quarterly averages four quarters ahead (MPR Sep/2026, p. 80), a different convention.'
            : 'O juro neutro não é observável e é estimado com elevada incerteza; aparece sempre como faixa, com método e data, nunca como recomendação. BCB: médias trimestrais quatro trimestres à frente (RPM set./2026, p. 80), convenção diferente.',
        }, lang),
        monta({
          id: 'opm-neutro-mercado', icone: 'git-compare', rotulo: 'I.4 (a) · (c)',
          titulo: en ? 'Neutral-rate estimates from market prices and surveys' : 'Estimativas de juro neutro a partir de preços e pesquisas',
          subtitulo: en ? `In ${fm(mes(uf.periodo!))}: (a) Focus t+4 ${n2(Number(uf.a_focus_t4))}%; (c) long NTN-B net of the term premium ${uf.c_ntnb_longa ? n2(Number(uf.c_ntnb_longa)) + '%' : '—'}.`
            : `Em ${fm(mes(uf.periodo!))}: (a) Focus t+4 ${n2(Number(uf.a_focus_t4))}%; (c) NTN-B longa líquida do prêmio a termo ${uf.c_ntnb_longa ? n2(Number(uf.c_ntnb_longa)) + '%' : '—'}.`,
          unidade: en ? '% a year, real' : '% ao ano, real', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          descricao: en ? '(a) expected real rate for t+4 (annual Focus); (c) 10-year NTN-B real yield minus the 4-year NTN-B net of the Focus real rate (month end).' : '(a) juro real esperado para t+4 (Focus anual); (c) juro real da NTN-B de 10 anos menos a NTN-B de 4 anos líquida do juro real Focus (fim de mês).',
          series: [
            { id: 'a', label: '(a) Focus, t+4', color: COR.navy, width: 2, points: pts(f, 'periodo', 'a_focus_t4') },
            { id: 'c', label: '(c) NTN-B', color: COR.azure, dash: '6 3', points: pts(f, 'periodo', 'c_ntnb_longa') },
            { id: 'd', label: en ? '(d) TIPS 5y, outside band' : '(d) TIPS 5a, fora da faixa', color: COR.steel, markers: 'circle', width: 1.4, points: pts(f, 'periodo', 'd_tips5_sem_premio_fora_da_faixa') },
          ],
          legenda: [{ id: 'a', label: '(a) Focus, t+4', color: COR.navy, style: 'line' }, { id: 'c', label: en ? '(c) Long NTN-B net of term premium' : '(c) NTN-B longa líquida do prêmio a termo', color: COR.azure, style: 'dash' }, { id: 'd', label: en ? '(d) US 5-year TIPS, no sovereign risk premium — experimental, outside the band' : '(d) TIPS americano de 5 anos, sem prêmio de risco soberano — experimental, fora da faixa', color: COR.steel, style: 'marker' }],
          fontes: [fonte('focus_anuais'), fonte('tesouro_direto'), fonte('tips5')], csv: [csvInd('indicadores/i4_faixa_neutro.csv'), csvInd('indicadores/curvas_nss.csv')],
          nota: en ? 'Tesouro Direto data under ODbL; the CEE curves (curvas_nss.csv) are a derived database published under the same licence. Method (d) uses only the US real rate: without an open measure of sovereign and currency risk (ADR-024) it is not an estimate of the Brazilian neutral rate and stays outside the band.'
            : 'Dados do Tesouro Direto sob ODbL; as curvas do CEE (curvas_nss.csv) são base derivada publicada sob a mesma licença. O método (d) usa só o juro real americano: sem medida aberta de risco soberano e cambial (ADR-024), não estima o neutro brasileiro e fica fora da faixa.',
        }, lang),
        monta({
          id: 'opm-neutro-filtros', icone: 'git-compare', rotulo: 'I.4 (b)',
          titulo: en ? 'Neutral-rate estimates from trend filters' : 'Estimativas de juro neutro por filtros de tendência',
          subtitulo: en ? `In ${fm(mes(uf.periodo!))}: one-sided HP ${n2(Number(uf.b_hp_unilateral))}%, Hamilton ${n2(Number(uf.b_hamilton))}%.` : `Em ${fm(mes(uf.periodo!))}: HP unilateral ${n2(Number(uf.b_hp_unilateral))}%, Hamilton ${n2(Number(uf.b_hamilton))}%.`,
          unidade: en ? '% a year, real' : '% ao ano, real', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          descricao: en ? 'Trend of the ex ante real rate, each point computed only with data available at its date.' : 'Tendência do juro real ex ante, cada ponto calculado só com os dados disponíveis na sua data.',
          series: [
            { id: 'hp', label: en ? '(b) One-sided HP' : '(b) HP unilateral', color: COR.navy, width: 2, points: pts(f, 'periodo', 'b_hp_unilateral') },
            { id: 'h', label: '(b) Hamilton', color: COR.azure, dash: '6 3', points: pts(f, 'periodo', 'b_hamilton') },
          ],
          legenda: [{ id: 'hp', label: en ? '(b) One-sided HP (λ = 14,400)' : '(b) HP unilateral (λ = 14.400)', color: COR.navy, style: 'line' }, { id: 'h', label: '(b) Hamilton (2018)', color: COR.azure, style: 'dash' }],
          fontes: [fonte('focus_selic'), fonte('focus_inflacao_12m')], csv: [csvInd('indicadores/i4_faixa_neutro.csv')],
        }, lang),
        monta({
          id: 'opm-hiato-juros', icone: 'move-vertical', rotulo: 'I.3',
          titulo: en ? 'Interest-rate gap: ex ante real rate minus the neutral band' : 'Hiato de juros: juro real ex ante menos a faixa neutra',
          subtitulo: en ? `In ${uh.periodo}, the gap against the median was ${n2(Number(uh.hiato_mediana))} p.p.; the real rate was ${uh.acima_q3 === '1' ? 'above' : 'not above'} the band's third quartile.`
            : `Em ${fm(mes(uh.periodo!))}, o hiato contra a mediana foi de ${n2(Number(uh.hiato_mediana))} p.p.; o juro real ${uh.acima_q3 === '1' ? 'estava acima' : 'não estava acima'} do terceiro quartil da faixa.`,
          unidade: 'p.p.', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
          descricao: en ? 'Line: gap against the median; shaded area: gap against the band (Q1–Q3).' : 'Linha: hiato contra a mediana; área sombreada: hiato contra a faixa (Q1–Q3).',
          series: [{ id: 'hm', label: en ? 'Gap (median)' : 'Hiato (mediana)', color: COR.navy, width: 2.2, points: pts(h, 'periodo', 'hiato_mediana') }],
          bandas: [{ id: 'hb', label: en ? 'Gap (band)' : 'Hiato (faixa)', fill: COR.sky, lo: pts(h, 'periodo', 'hiato_q1'), hi: pts(h, 'periodo', 'hiato_q3') }],
          legenda: [{ id: 'hm', label: en ? 'Gap against the median' : 'Hiato contra a mediana', color: COR.navy, style: 'line' }, { id: 'hb', label: en ? 'Gap against Q1–Q3' : 'Hiato contra Q1–Q3', color: COR.sky, style: 'band' }],
          fontes: [fonte('focus_selic'), fonte('focus_inflacao_12m'), fonte('focus_anuais')], csv: [csvInd('indicadores/i3_hiato_juros.csv')],
        }, lang),
        (() => {
          const t = ler('opm/indicadores/i6_taylor.csv');
          const ut = t.at(-1)!;
          const par = ler('opm/indicadores/i6_taylor_t3_parametros.csv')[0]!;
          return monta({
            id: 'opm-taylor', icone: 'scale', rotulo: 'I.6', largo: true,
            titulo: en ? 'Selic target and the envelope of Taylor rules' : 'Meta Selic e envelope de regras de Taylor',
            subtitulo: en ? `In ${fm(mes(ut.periodo!))}, the Selic target was ${n2(Number(ut.selic))}%; the three rules, over the neutral-rate and output-gap bands, ranged from ${n2(Number(ut.envelope_min))}% to ${n2(Number(ut.envelope_max))}%.`
              : `Em ${fm(mes(ut.periodo!))}, a meta Selic era de ${n2(Number(ut.selic))}%; as três regras, sobre as faixas de juro neutro e de hiato, iam de ${n2(Number(ut.envelope_min))}% a ${n2(Number(ut.envelope_max))}%.`,
            unidade: en ? '% a year, nominal' : '% ao ano, nominal', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true, defaultRange: 'tudo',
            descricao: en ? 'Line: Selic target at month end. Shaded area: minimum and maximum of rules T1, T2 and T3 over the neutral-rate quartiles and the output-gap range.' : 'Linha: meta Selic no fim do mês. Área sombreada: mínimo e máximo das regras T1, T2 e T3 sobre os quartis do juro neutro e a faixa do hiato.',
            series: [{ id: 's', label: en ? 'Selic target' : 'Meta Selic', color: COR.navy, kind: 'step', width: 2.2, points: pts(t, 'periodo', 'selic') }],
            bandas: [{ id: 'env', label: en ? 'Taylor-rule envelope' : 'Envelope das regras de Taylor', fill: COR.sky, lo: pts(t, 'periodo', 'envelope_min'), hi: pts(t, 'periodo', 'envelope_max') }],
            legenda: [{ id: 's', label: en ? 'Selic target' : 'Meta Selic', color: COR.navy, style: 'step' }, { id: 'env', label: en ? 'Envelope of rules T1–T3' : 'Envelope das regras T1–T3', color: COR.sky, style: 'band' }],
            fontes: [fonte('selic_meta'), fonte('ipca'), fonte('focus_inflacao_12m'), fonte('ibcbr')], csv: [csvInd('indicadores/i6_taylor.csv'), csvInd('indicadores/i6_taylor_t3_parametros.csv')],
            nota: en ? `Descriptive references, never prescriptions: the rules are sensitive to r* and to the output gap and are evaluated with the data of each vintage (Orphanides, 2001). T3 parameters estimated over ${par.amostra}: θ = ${n2(Number(par.theta))}, φ = ${n2(Number(par.phi))}; with θ close to 1, φ is very imprecise.`
              : `Referências descritivas, nunca prescrição: as regras são sensíveis a r* e ao hiato e são avaliadas com os dados de cada safra (Orphanides, 2001). Parâmetros de T3 estimados em ${par.amostra}: θ = ${n2(Number(par.theta))}, φ = ${n2(Number(par.phi))}; com θ próximo de 1, φ é muito impreciso.`,
          }, lang);
        })(),
      ] };
    }
    case 'a2-3-inflacao': {
      const ipca = ler('conjuntura/ipca.csv').filter((r) => r.acumulada_12m);
      const nuc = ler('opm/indicadores/media_nucleos.csv').filter((r) => r.media_12m);
      const r10 = ler('opm/indicadores/i10_regime_meta_continua.csv');
      const u = ipca.at(-1)!, un = nuc.at(-1)!, ur = r10.at(-1)!;
      const lim = (y: number) => ipca.filter((r) => r.periodo! >= '2025-01').map((r) => ({ x: mes(r.periodo!), y }));
      const par = (id: string, arq: string, nome: string): { titulo: string; original: Grafico; ajustada: Grafico } => {
        const d = ler(`opm/dessaz/${arq}.csv`);
        const ud = d.at(-1)!;
        const g = (col: 'original' | 'ajustada') => monta({
          id: `opm-${id}-${col}`, icone: 'activity', rotulo: col === 'original' ? (en ? 'Original' : 'Original') : (en ? 'Seasonally adjusted by CEE (X-13)' : 'Dessazonalizado pelo CEE (X-13)'),
          titulo: `${nome} — ${col === 'original' ? (en ? 'monthly change, original series' : 'variação mensal, série original') : (en ? 'monthly change, seasonally adjusted' : 'variação mensal, dessazonalizada')}`,
          subtitulo: en ? `In ${fm(mes(ud.periodo!))}: ${n2(Number(ud.original))}% (original) and ${n2(Number(ud.ajustada))}% (seasonally adjusted).`
            : `Em ${fm(mes(ud.periodo!))}: ${n2(Number(ud.original))}% (original) e ${n2(Number(ud.ajustada))}% (dessazonalizada).`,
          unidade: en ? '% month on month' : '% no mês', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          descricao: en ? 'Monthly bars. The seasonally adjusted series is a CEE estimate, not an official series, and is revised with each new data point.' : 'Barras mensais. A série dessazonalizada é estimativa do CEE, não série oficial, e é revista a cada novo dado.',
          series: [{ id: col, label: `${nome}, ${col === 'original' ? 'original' : (en ? 'seasonally adjusted' : 'dessazonalizada')}`, color: col === 'original' ? COR.steel : COR.navy, kind: 'bar', points: pts(d, 'periodo', col) }],
          legenda: [{ id: col, label: `${nome}: ${col === 'original' ? (en ? 'original series' : 'série original') : (en ? 'seasonally adjusted by CEE' : 'dessazonalizada pelo CEE')}`, color: col === 'original' ? COR.steel : COR.navy, style: 'bar' }],
          fontes: [fonte(arq)],
          csv: [csvInd(`dessaz/${arq}.csv`)], defaultRange: '5a',
          nota: en ? 'X-13ARIMA-SEATS 1.1 b62, airline model, specification in data/specs/x13/ (ADR-023). Validation against the MPR (Sep/2026, p. 35) is in /dados/opm/dessaz/_validacao.csv.' : 'X-13ARIMA-SEATS 1.1 b62, modelo airline, especificação em data/specs/x13/ (ADR-023). A validação contra o RPM (set./2026, p. 35) está em /dados/opm/dessaz/_validacao.csv.',
        }, lang);
        return { titulo: nome, original: g('original'), ajustada: g('ajustada') };
      };
      return {
        graficos: [
          monta({
            id: 'opm-ipca-nucleos', icone: 'percent', rotulo: 'A2.3', largo: true,
            titulo: en ? '12-month IPCA, core average and the tolerance band' : 'IPCA em 12 meses, média dos núcleos e intervalo de tolerância',
            subtitulo: en ? `In ${fm(mes(u.periodo!))}, 12-month IPCA was ${n2(Number(u.acumulada_12m))}%; the core average (EX0, EX3, MS, DP, P55) was ${n2(Number(un.media_12m))}% in ${fm(mes(un.periodo!))}.`
              : `Em ${fm(mes(u.periodo!))}, o IPCA em 12 meses foi de ${n2(Number(u.acumulada_12m))}%; a média dos núcleos (EX0, EX3, MS, DP, P55) foi de ${n2(Number(un.media_12m))}% em ${fm(mes(un.periodo!))}.`,
            unidade: en ? '% over 12 months' : '% em 12 meses', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
            descricao: en ? 'Lines: 12-month IPCA and core average. Shaded area: continuous-target tolerance band (1.5% to 4.5%), since January 2025.' : 'Linhas: IPCA e média dos núcleos em 12 meses. Área sombreada: intervalo de tolerância da meta contínua (1,5% a 4,5%), desde janeiro de 2025.',
            series: [
              { id: 'ipca', label: en ? 'IPCA, 12 months' : 'IPCA, 12 meses', color: COR.navy, width: 2.4, points: pts(ipca, 'periodo', 'acumulada_12m') },
              { id: 'nuc', label: en ? 'Core average, 12 months' : 'Média dos núcleos, 12 meses', color: COR.azure, dash: '6 3', width: 2, points: pts(nuc, 'periodo', 'media_12m') },
            ],
            bandas: [{ id: 'tol', label: en ? 'Tolerance band' : 'Intervalo de tolerância', fill: COR.sky, lo: lim(1.5), hi: lim(4.5) }],
            refs: [{ y: 3, label: en ? 'Target 3.0%' : 'Meta 3,0%', dash: '2 3', color: COR.steel }],
            legenda: [{ id: 'ipca', label: en ? 'IPCA, 12 months' : 'IPCA em 12 meses', color: COR.navy, style: 'line' }, { id: 'nuc', label: en ? 'Core average, 12 months' : 'Média dos núcleos em 12 meses', color: COR.azure, style: 'dash' }, { id: 'tol', label: en ? 'Tolerance band (continuous target)' : 'Intervalo de tolerância (meta contínua)', color: COR.sky, style: 'band' }],
            fontes: [fonte('ipca'), fonte('metas_inflacao'), ...['nucleo_ex0', 'nucleo_ex3', 'nucleo_ms', 'nucleo_dp', 'nucleo_p55'].map(fonte)],
            csv: [csvSerie('ipca'), csvInd('indicadores/media_nucleos.csv')],
            nota: en ? 'Core average: monthly mean of the five cores rounded to two decimals and compounded over 12 months — the only convention among those tested that reproduces both MPR values (4.52% in May and 4.35% in August 2026, p. 35). The alternatives are in the CSV.'
              : 'Média dos núcleos: média mensal dos cinco núcleos arredondada a duas casas e composta em 12 meses — a única convenção, entre as testadas, que reproduz os dois valores do RPM (4,52% em maio e 4,35% em agosto de 2026, p. 35). As alternativas estão no CSV.',
          }, lang),
          monta({
            id: 'opm-regime', icone: 'timer', rotulo: 'I.10',
            titulo: en ? 'Continuous-target regime counter' : 'Contador do regime de meta contínua',
            subtitulo: ur.meses_consecutivos === '0'
              ? (en ? `In ${fm(mes(ur.periodo!))}, 12-month IPCA (${n2(Number(ur.ipca12m))}%) was inside the tolerance band.` : `Em ${fm(mes(ur.periodo!))}, o IPCA em 12 meses (${n2(Number(ur.ipca12m))}%) estava dentro do intervalo de tolerância.`)
              : (en ? `In ${fm(mes(ur.periodo!))}, 12-month IPCA (${n2(Number(ur.ipca12m))}%) had been ${ur.lado === 'acima' ? 'above' : 'below'} the band for ${ur.meses_consecutivos} consecutive month(s); the target is deemed missed at 6.`
                : `Em ${fm(mes(ur.periodo!))}, o IPCA em 12 meses (${n2(Number(ur.ipca12m))}%) estava ${ur.lado} do intervalo havia ${ur.meses_consecutivos} mês(es) consecutivo(s); a meta é considerada descumprida no 6º.`),
            unidade: en ? 'consecutive months outside the band' : 'meses consecutivos fora do intervalo', xFormat: 'month', yDigits: 0, yUnit: en ? 'months' : 'meses', zero: true, ranges: false,
            descricao: en ? 'Bars: consecutive months with 12-month IPCA outside 1.5%–4.5%. Dashed line: six months (target missed).' : 'Barras: meses consecutivos com o IPCA em 12 meses fora de 1,5%–4,5%. Linha tracejada: seis meses (meta descumprida).',
            series: [{ id: 'c', label: en ? 'Consecutive months' : 'Meses consecutivos', color: COR.navy, kind: 'bar', points: pts(r10, 'periodo', 'meses_consecutivos') }],
            refs: [{ y: 6, label: en ? 'Missed (6 months)' : 'Descumprimento (6 meses)', dash: '4 3', color: COR.steel }],
            legenda: [{ id: 'c', label: en ? 'Consecutive months outside the band' : 'Meses consecutivos fora do intervalo', color: COR.navy, style: 'bar' }],
            fontes: [fonte('ipca'), fonte('metas_inflacao')], csv: [csvInd('indicadores/i10_regime_meta_continua.csv')],
            nota: en ? 'Rule of Decree 12,079/2024 as stated by the BCB ("Inflation target" page) and in the MPR Sep/2026 (p. 3). The full text of the Decree is to be re-checked (docs/PENDIENTES.md).' : 'Regra do Decreto nº 12.079/2024 conforme o BCB (página "Meta para a inflação") e o RPM set./2026 (p. 3). O texto integral do Decreto será reconferido (docs/PENDIENTES.md).',
          }, lang),
          (() => {
            const q = ler('opm/indicadores/i9_saar.csv').filter((r) => r.ipca_saar);
            const uq = q.at(-1)!;
            return monta({
              id: 'opm-saar', icone: 'activity', rotulo: 'I.9',
              titulo: en ? 'Seasonally adjusted, annualised three-month inflation' : 'Inflação de três meses, dessazonalizada e anualizada',
              subtitulo: en ? `Three months to ${fm(mes(uq.periodo!))}: IPCA ${n1(Number(uq.ipca_saar))}% and core average ${n1(Number(uq.media_nucleos_saar))}% (SAAR).` : `Três meses até ${fm(mes(uq.periodo!))}: IPCA ${n1(Number(uq.ipca_saar))}% e média dos núcleos ${n1(Number(uq.media_nucleos_saar))}% (SAAR).`,
              unidade: en ? '% annualised' : '% anualizado', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, defaultRange: '5a',
              descricao: en ? 'Lines: SAAR of the IPCA and of the core average, on series seasonally adjusted by CEE. Dashed line: 3.0% target.' : 'Linhas: SAAR do IPCA e da média dos núcleos, sobre séries dessazonalizadas pelo CEE. Tracejada: meta de 3,0%.',
              series: [
                { id: 'i', label: 'IPCA', color: COR.navy, width: 2.2, points: pts(q, 'periodo', 'ipca_saar') },
                { id: 'n', label: en ? 'Core average' : 'Média dos núcleos', color: COR.azure, dash: '6 3', points: pts(q, 'periodo', 'media_nucleos_saar') },
              ],
              refs: [{ y: 3, label: en ? 'Target 3.0%' : 'Meta 3,0%', dash: '2 3', color: COR.steel }],
              legenda: [{ id: 'i', label: en ? 'IPCA, SAAR' : 'IPCA, SAAR', color: COR.navy, style: 'line' }, { id: 'n', label: en ? 'Core average, SAAR' : 'Média dos núcleos, SAAR', color: COR.azure, style: 'dash' }],
              fontes: [fonte('ipca'), ...['nucleo_ex0', 'nucleo_ex3', 'nucleo_ms', 'nucleo_dp', 'nucleo_p55'].map(fonte)], csv: [csvInd('indicadores/i9_saar.csv'), csvInd('dessaz/_validacao.csv')],
              nota: en ? 'Validated against the Sep/2026 MPR (p. 35): within 0.5 p.p. in May and August 2026. Groups and EX3 services/goods are in the CSV.' : 'Validado contra o RPM de set./2026 (p. 35): dentro de 0,5 p.p. em maio e agosto de 2026. Grupos e EX3 serviços/industriais estão no CSV.',
            }, lang);
          })(),
          (() => {
            const q = ler('opm/indicadores/i11_subitens_acima_teto.csv');
            const uq = q.at(-1)!;
            return monta({
              id: 'opm-subitens', icone: 'layers', rotulo: 'I.11',
              titulo: en ? 'Share of IPCA sub-items above the target ceiling' : 'Parcela dos subitens do IPCA acima do teto da meta',
              subtitulo: en ? `In ${fm(mes(uq.periodo!))}, ${n1(Number(uq.parcela_acima_4_5))}% of the weight covered (${n1(Number(uq.peso_incluido))}% of the IPCA) had seasonally adjusted annualised inflation above 4.5%.`
                : `Em ${fm(mes(uq.periodo!))}, ${n1(Number(uq.parcela_acima_4_5))}% do peso coberto (${n1(Number(uq.peso_incluido))}% do IPCA) tinha inflação dessazonalizada anualizada acima de 4,5%.`,
              unidade: en ? '% of the IPCA weight covered' : '% do peso coberto do IPCA', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, ranges: false,
              descricao: en ? 'Weighted share of sub-items (SIDRA 7060) with three-month SAAR above 4.5%.' : 'Parcela ponderada dos subitens (SIDRA 7060) com SAAR de três meses acima de 4,5%.',
              series: [{ id: 'p', label: en ? 'Share above 4.5%' : 'Parcela acima de 4,5%', color: COR.navy, width: 2.2, points: pts(q, 'periodo', 'parcela_acima_4_5') }],
              colunasExtra: [{ titulo: en ? 'Weight covered (%)' : 'Peso coberto (%)', pontos: pts(q, 'periodo', 'peso_incluido') }],
              legenda: [{ id: 'p', label: en ? 'Share of weight above 4.5% (SAAR)' : 'Parcela do peso acima de 4,5% (SAAR)', color: COR.navy, style: 'line' }],
              fontes: [fonte('ipca_itens')], csv: [csvInd('indicadores/i11_subitens_acima_teto.csv')],
              nota: en ? 'Sub-items where X-13 fails are excluded; the share is computed over the weight covered, published alongside.' : 'Subitens em que o X-13 falha ficam fora; a parcela é calculada sobre o peso coberto, publicado ao lado.',
            }, lang);
          })(),
        ],
        dessaz: [par('ipca-mensal', 'ipca', 'IPCA'), par('ex3-mensal', 'nucleo_ex3', en ? 'Core EX3' : 'Núcleo EX3')],
      };
    }
    case 'a2-4-expectativas': {
      const c = ler('opm/indicadores/i7_i8_credibilidade_desancoragem.csv');
      const u = c.at(-1)!;
      return { graficos: [
        monta({
          id: 'opm-credibilidade', icone: 'anchor', rotulo: 'I.7', largo: true,
          titulo: en ? 'Credibility index at three Focus horizons' : 'Índice de credibilidade em três horizontes da Focus',
          subtitulo: en ? `In ${fm(mes(u.periodo!))}: 12 months ${n2(Number(u.ic_12m))}, year t+1 ${n2(Number(u.ic_t1))}, year t+3 ${n2(Number(u.ic_t3))} (1 = expectation at the target; 0 = 1.5 p.p. or more away).`
            : `Em ${fm(mes(u.periodo!))}: 12 meses ${n2(Number(u.ic_12m))}, ano t+1 ${n2(Number(u.ic_t1))}, ano t+3 ${n2(Number(u.ic_t3))} (1 = expectativa na meta; 0 = a 1,5 p.p. ou mais).`,
          unidade: en ? 'index from 0 to 1' : 'índice de 0 a 1', xFormat: 'month', yDigits: 2, yUnit: '', zero: true,
          descricao: en ? 'Monthly (last survey of each month).' : 'Mensal (última coleta de cada mês).',
          series: [
            { id: 't3', label: 't+3', color: COR.navy, width: 2.4, points: pts(c, 'periodo', 'ic_t3') },
            { id: 't1', label: 't+1', color: COR.azure, dash: '6 3', points: pts(c, 'periodo', 'ic_t1') },
            { id: '12', label: en ? '12 months' : '12 meses', color: COR.steel, markers: 'circle', width: 1.4, points: pts(c, 'periodo', 'ic_12m') },
          ],
          legenda: [{ id: 't3', label: en ? 'Year t+3' : 'Ano t+3', color: COR.navy, style: 'line' }, { id: 't1', label: en ? 'Year t+1' : 'Ano t+1', color: COR.azure, style: 'dash' }, { id: '12', label: en ? '12 months ahead' : '12 meses à frente', color: COR.steel, style: 'marker' }],
          fontes: [fonte('focus_anuais'), fonte('focus_inflacao_12m'), fonte('metas_inflacao')], csv: [csvInd('indicadores/i7_i8_credibilidade_desancoragem.csv')],
        }, lang),
        monta({
          id: 'opm-desancoragem', icone: 'move-vertical', rotulo: 'I.8',
          titulo: en ? 'De-anchoring: Focus median for t+3 minus the target' : 'Desancoragem: mediana Focus para t+3 menos a meta',
          subtitulo: en ? `In ${fm(mes(u.periodo!))}, the Focus median for t+3 was ${n2(Number(u.esperado_t3))}%, ${n2(Number(u.desancoragem_t3_pp))} p.p. from the target; standard deviation of responses ${n2(Number(u.dp_t3))} p.p.`
            : `Em ${fm(mes(u.periodo!))}, a mediana Focus para t+3 foi de ${n2(Number(u.esperado_t3))}%, a ${n2(Number(u.desancoragem_t3_pp))} p.p. da meta; desvio-padrão das respostas de ${n2(Number(u.dp_t3))} p.p.`,
          unidade: 'p.p.', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
          descricao: en ? 'Line: de-anchoring at t+3. Dashed line: standard deviation of responses at t+3 (dispersion).' : 'Linha: desancoragem em t+3. Tracejada: desvio-padrão das respostas em t+3 (dispersão).',
          series: [
            { id: 'd', label: en ? 'De-anchoring (t+3)' : 'Desancoragem (t+3)', color: COR.navy, width: 2.2, points: pts(c, 'periodo', 'desancoragem_t3_pp') },
            { id: 'dp', label: en ? 'Std. deviation (t+3)' : 'Desvio-padrão (t+3)', color: COR.azure, dash: '6 3', points: pts(c, 'periodo', 'dp_t3') },
          ],
          legenda: [{ id: 'd', label: en ? 'Median minus target, t+3' : 'Mediana menos meta, t+3', color: COR.navy, style: 'line' }, { id: 'dp', label: en ? 'Standard deviation of responses, t+3' : 'Desvio-padrão das respostas, t+3', color: COR.azure, style: 'dash' }],
          fontes: [fonte('focus_anuais'), fonte('metas_inflacao')], csv: [csvInd('indicadores/i7_i8_credibilidade_desancoragem.csv')],
        }, lang),
        (() => {
          const b = ler('opm/indicadores/i12_inflacao_implicita.csv');
          const ub = b.at(-1)!;
          return monta({
            id: 'opm-implicita', icone: 'line-chart', rotulo: 'I.12', largo: true,
            titulo: en ? 'Breakeven inflation from Tesouro Direto curves' : 'Inflação implícita nas curvas do Tesouro Direto',
            subtitulo: en ? `On ${fd(dia(ub.data!))}: ${n2(Number(ub.implicita_2a))}% (2 years), ${n2(Number(ub.implicita_3a))}% (3 years), ${n2(Number(ub.implicita_5a))}% (5 years).`
              : `Em ${fd(dia(ub.data!))}: ${n2(Number(ub.implicita_2a))}% (2 anos), ${n2(Number(ub.implicita_3a))}% (3 anos), ${n2(Number(ub.implicita_5a))}% (5 anos).`,
            unidade: en ? '% a year; month end' : '% ao ano; fim de mês', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
            descricao: en ? 'Breakeven inflation at three maturities, from NSS curves fitted to zero-coupon LTN and NTN-B Principal rates.' : 'Inflação implícita em três prazos, das curvas NSS ajustadas às taxas de LTN e NTN-B Principal.',
            series: [
              { id: 'b2', label: en ? '2 years' : '2 anos', color: COR.navy, width: 2.2, points: pts(b, 'data', 'implicita_2a', (d) => mes(d.slice(0, 7))) },
              { id: 'b3', label: en ? '3 years' : '3 anos', color: COR.azure, dash: '6 3', points: pts(b, 'data', 'implicita_3a', (d) => mes(d.slice(0, 7))) },
              { id: 'b5', label: en ? '5 years' : '5 anos', color: COR.steel, markers: 'circle', points: pts(b, 'data', 'implicita_5a', (d) => mes(d.slice(0, 7))) },
            ],
            legenda: [{ id: 'b2', label: en ? '2 years' : '2 anos', color: COR.navy, style: 'line' }, { id: 'b3', label: en ? '3 years' : '3 anos', color: COR.azure, style: 'dash' }, { id: 'b5', label: en ? '5 years' : '5 anos', color: COR.steel, style: 'marker' }],
            fontes: [fonte('tesouro_direto')], csv: [csvInd('indicadores/i12_inflacao_implicita.csv'), csvInd('indicadores/curvas_nss.csv')],
            nota: en ? 'Breakeven inflation contains inflation-risk and liquidity premia and the Tesouro Direto spread: it is not a market expectation. The short end (Araujo and Vicente, 2017) is still under construction. Curves under ODbL (derived from Tesouro Transparente).'
              : 'A inflação implícita contém prêmios de risco inflacionário e de liquidez e o spread do Tesouro Direto: não é expectativa do mercado. O curto prazo (Araujo e Vicente, 2017) segue em construção. Curvas sob ODbL (derivadas do Tesouro Transparente).',
          }, lang);
        })(),
      ] };
    }
    case 'a2-5-transmissao': {
      const jc = ler('opm/juros_credito.csv'), sp = ler('opm/spread_credito.csv');
      const selic = ler('conjuntura/selic_meta.csv');
      const ic = ler('opm/icbr.csv'), ib = ler('opm/ibcbr.csv');
      const uj = jc.at(-1)!, us = sp.at(-1)!, ui = ic.at(-1)!, ub = ib.at(-1)!;
      return { graficos: [
        monta({
          id: 'opm-credito', icone: 'credit-card', rotulo: 'A2.5', largo: true,
          titulo: en ? 'Lending rate, credit spread and the Selic target' : 'Juros do crédito, spread e meta Selic',
          subtitulo: en ? `In ${fm(mes(uj.periodo!))}, the average lending rate was ${n1(Number(uj.valor))}% a year and the average spread ${n1(Number(us.valor))} p.p.`
            : `Em ${fm(mes(uj.periodo!))}, a taxa média do crédito foi de ${n1(Number(uj.valor))}% ao ano e o spread médio, de ${n1(Number(us.valor))} p.p.`,
          unidade: en ? '% a year (rates) and p.p. (spread)' : '% ao ano (taxas) e p.p. (spread)', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
          descricao: en ? 'Three monthly series; the spread shares the axis in percentage points.' : 'Três séries mensais; o spread usa o mesmo eixo, em pontos percentuais.',
          series: [
            { id: 'j', label: en ? 'Average lending rate' : 'Taxa média do crédito', color: COR.navy, width: 2.2, points: pts(jc, 'periodo', 'valor') },
            { id: 's', label: 'Spread', color: COR.azure, dash: '6 3', points: pts(sp, 'periodo', 'valor') },
            { id: 'm', label: en ? 'Selic target' : 'Meta Selic', color: COR.steel, kind: 'step', markers: 'square', width: 1.4, points: pts(selic.filter((r) => r.periodo! >= '2011-03'), 'periodo', 'meta_selic') },
          ],
          legenda: [{ id: 'j', label: en ? 'Average lending rate (total)' : 'Taxa média do crédito (total)', color: COR.navy, style: 'line' }, { id: 's', label: en ? 'Average spread' : 'Spread médio', color: COR.azure, style: 'dash' }, { id: 'm', label: en ? 'Selic target' : 'Meta Selic', color: COR.steel, style: 'marker' }],
          fontes: [fonte('juros_credito'), fonte('spread_credito'), fonte('selic_meta')], csv: [csvSerie('juros_credito'), csvSerie('spread_credito'), csvSerie('juros_pj'), csvSerie('juros_pf_livres'), csvSerie('icc')],
          nota: en ? 'The pass-through of the Selic to lending rates (I.13) is in the table below. These series are shared with panel A4.' : 'O repasse da Selic ao crédito (I.13) está na tabela abaixo. Estas séries são compartilhadas com o painel A4.',
        }, lang),
        monta({
          id: 'opm-icbr', icone: 'wheat', rotulo: 'A2.5',
          titulo: en ? 'Commodity Index – Brazil (IC-Br)' : 'Índice de Commodities – Brasil (IC-Br)',
          subtitulo: en ? `In ${fm(mes(ui.periodo!))}, the IC-Br stood at ${n1(Number(ui.valor))}.` : `Em ${fm(mes(ui.periodo!))}, o IC-Br estava em ${n1(Number(ui.valor))}.`,
          unidade: en ? 'index' : 'índice', xFormat: 'month', yDigits: 1, yUnit: '',
          descricao: en ? 'Monthly index, in reais.' : 'Índice mensal, em reais.',
          series: [{ id: 'i', label: 'IC-Br', color: COR.navy, width: 2.2, points: pts(ic, 'periodo', 'valor') }],
          legenda: [{ id: 'i', label: 'IC-Br', color: COR.navy, style: 'line' }],
          fontes: [fonte('icbr')], csv: [csvSerie('icbr'), csvSerie('icbr_agro'), csvSerie('icbr_metal'), csvSerie('icbr_energia')],
        }, lang),
        monta({
          id: 'opm-ibcbr', icone: 'factory', rotulo: 'A2.5',
          titulo: en ? 'Central Bank Economic Activity Index (IBC-Br), seasonally adjusted' : 'Índice de Atividade Econômica do BC (IBC-Br), com ajuste sazonal',
          subtitulo: en ? `In ${fm(mes(ub.periodo!))}, the IBC-Br stood at ${n1(Number(ub.valor))}.` : `Em ${fm(mes(ub.periodo!))}, o IBC-Br estava em ${n1(Number(ub.valor))}.`,
          unidade: en ? 'index, seasonally adjusted by the source' : 'índice, dessazonalizado pela fonte', xFormat: 'month', yDigits: 1, yUnit: '',
          descricao: en ? 'Monthly index. Seasonally adjusted by the BCB; not readjusted by CEE (ADR-023).' : 'Índice mensal. Dessazonalizado pelo BCB; o CEE não reajusta (ADR-023).',
          series: [{ id: 'b', label: 'IBC-Br', color: COR.navy, width: 2.2, points: pts(ib, 'periodo', 'valor') }],
          legenda: [{ id: 'b', label: 'IBC-Br', color: COR.navy, style: 'line' }],
          fontes: [fonte('ibcbr')], csv: [csvSerie('ibcbr')],
        }, lang),
        (() => {
          const a = ler('opm/indicadores/i16_premio_termo_acm.csv');
          const ua = a.at(-1)!;
          const dg = ler('opm/indicadores/i16_acm_diagnostico.csv')[0]!;
          return monta({
            id: 'opm-premio-termo', icone: 'flask-conical', rotulo: en ? 'I.16 · Experimental' : 'I.16 · Experimental', largo: true,
            titulo: en ? 'Term premium on the nominal curve (ACM)' : 'Prêmio a termo da curva prefixada (ACM)',
            subtitulo: en ? `On ${fd(dia(ua.data!))}: ${n2(Number(ua.premio_24m))} p.p. at 24 months and ${n2(Number(ua.premio_36m))} p.p. at 36 months.` : `Em ${fd(dia(ua.data!))}: ${n2(Number(ua.premio_24m))} p.p. em 24 meses e ${n2(Number(ua.premio_36m))} p.p. em 36 meses.`,
            unidade: en ? 'p.p. (fitted yield minus risk-neutral yield)' : 'p.p. (taxa ajustada menos taxa neutra ao risco)', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
            descricao: en ? 'Month-end term premium at 24 and 36 months.' : 'Prêmio a termo de fim de mês em 24 e 36 meses.',
            series: [
              { id: 'p24', label: en ? '24 months' : '24 meses', color: COR.navy, width: 2.2, points: pts(a, 'data', 'premio_24m', (d) => mes(d.slice(0, 7))) },
              { id: 'p36', label: en ? '36 months' : '36 meses', color: COR.azure, dash: '6 3', points: pts(a, 'data', 'premio_36m', (d) => mes(d.slice(0, 7))) },
            ],
            legenda: [{ id: 'p24', label: en ? '24 months' : '24 meses', color: COR.navy, style: 'line' }, { id: 'p36', label: en ? '36 months' : '36 meses', color: COR.azure, style: 'dash' }],
            fontes: [fonte('tesouro_direto')], csv: [csvInd('indicadores/i16_premio_termo_acm.csv'), csvInd('indicadores/i16_acm_diagnostico.csv'), csvInd('indicadores/curva_nominal_grade.csv')],
            nota: en ? `EXPERIMENTAL (layer 3), pending Editorial Committee review; method in the draft Discussion Paper. Adrian, Crump and Moench (2013) with 3 factors (${n1(100 * Number(dg.variancia_explicada))}% of variance), fit error ${n1(Number(dg.erro_ajuste_bp))} bp. Short sample and maturities up to 3 years: the VAR projects rising short rates, unlike Focus, which pushes the premium below zero — a known small-sample bias. Do not read as market expectation.`
              : `EXPERIMENTAL (camada 3), sujeito à revisão do Comitê Editorial; método na minuta de Texto para Discussão. Adrian, Crump e Moench (2013) com 3 fatores (${n1(100 * Number(dg.variancia_explicada))}% da variância), erro de ajuste de ${n1(Number(dg.erro_ajuste_bp))} bp. Amostra curta e prazos até 3 anos: o VAR projeta alta dos juros curtos, ao contrário da Focus, o que empurra o prêmio para baixo de zero — viés de amostra pequena conhecido. Não ler como expectativa de mercado.`,
          }, lang);
        })(),
        (() => {
          const c = ler('opm/indicadores/i17_condicoes_financeiras.csv');
          const uc = c.at(-1)!;
          const cg = ler('opm/indicadores/i17_cargas.csv');
          return monta({
            id: 'opm-icf', icone: 'flask-conical', rotulo: en ? 'I.17 · Experimental' : 'I.17 · Experimental', largo: true,
            titulo: en ? 'Financial conditions index (principal components)' : 'Índice de condições financeiras (componentes principais)',
            subtitulo: en ? `In ${fm(mes(uc.periodo!))}, the index stood at ${n2(Number(uc.icf))} (sample mean = 0; higher = tighter).` : `Em ${fm(mes(uc.periodo!))}, o índice estava em ${n2(Number(uc.icf))} (média da amostra = 0; maior = mais apertado).`,
            unidade: en ? 'standard units (first principal component)' : 'unidades padronizadas (primeiro componente principal)', xFormat: 'month', yDigits: 2, yUnit: '', zero: true,
            descricao: en ? 'Monthly first principal component of seven standardised variables.' : 'Primeiro componente principal mensal de sete variáveis padronizadas.',
            series: [{ id: 'icf', label: 'ICF', color: COR.navy, width: 2.2, points: pts(c, 'periodo', 'icf') }],
            legenda: [{ id: 'icf', label: en ? 'Financial conditions index' : 'Índice de condições financeiras', color: COR.navy, style: 'line' }],
            fontes: [fonte('spread_credito'), fonte('icc'), fonte('cambio_real'), fonte('dolar_global'), fonte('ust10'), fonte('tesouro_direto')], csv: [csvInd('indicadores/i17_condicoes_financeiras.csv'), csvInd('indicadores/i17_cargas.csv')],
            nota: en ? `EXPERIMENTAL (layer 3). First component explains ${n1(100 * Number(cg[0]!.variancia_explicada_pc1))}% of variance; loadings in i17_cargas.csv. Full-sample PCA (not real time): past values change as data arrive.`
              : `EXPERIMENTAL (camada 3). O primeiro componente explica ${n1(100 * Number(cg[0]!.variancia_explicada_pc1))}% da variância; cargas em i17_cargas.csv. PCA na amostra inteira (não é tempo real): valores passados mudam com novos dados.`,
          }, lang);
        })(),
        (() => {
          const h = ler('opm/indicadores/i15_hiato_produto_trimestral.csv').filter((r) => r.minimo);
          const uh = h.at(-1)!;
          return monta({
            id: 'opm-hiato-produto', icone: 'gauge', rotulo: 'I.15', largo: true,
            titulo: en ? 'Output gap: band between methods' : 'Hiato do produto: faixa entre métodos',
            subtitulo: en ? `In ${uh.trimestre}: one-sided HP ${n2(Number(uh.hp_unilateral))}% and Hamilton ${n2(Number(uh.hamilton))}% of potential output. The BCB estimates 0.5% (Q2) and 0.4% (Q3 2026) (MPR Sep/2026, p. 83).`
              : `Em ${uh.trimestre}: HP unilateral ${n2(Number(uh.hp_unilateral))}% e Hamilton ${n2(Number(uh.hamilton))}% do produto potencial. O BCB estima 0,5% (2º tri) e 0,4% (3º tri de 2026) (RPM set./2026, p. 83).`,
            unidade: en ? '% of potential output' : '% do produto potencial', xFormat: 'quarter', yDigits: 1, yUnit: '%', zero: true,
            descricao: en ? 'Two quarterly real-time estimates and the band between them, on seasonally adjusted GDP.' : 'Duas estimativas trimestrais em tempo real e a faixa entre elas, sobre o PIB dessazonalizado.',
            series: [
              { id: 'hp', label: en ? 'One-sided HP' : 'HP unilateral', color: COR.navy, width: 2, points: pts(h, 'trimestre', 'hp_unilateral', tri) },
              { id: 'ha', label: 'Hamilton', color: COR.azure, dash: '6 3', points: pts(h, 'trimestre', 'hamilton', tri) },
            ],
            bandas: [{ id: 'f', label: en ? 'Range between methods' : 'Faixa entre métodos', fill: COR.sky, lo: pts(h, 'trimestre', 'minimo', tri), hi: pts(h, 'trimestre', 'maximo', tri) }],
            legenda: [{ id: 'hp', label: en ? 'One-sided HP (λ = 1,600)' : 'HP unilateral (λ = 1.600)', color: COR.navy, style: 'line' }, { id: 'ha', label: 'Hamilton (h = 8, p = 4)', color: COR.azure, style: 'dash' }, { id: 'f', label: en ? 'Range between methods' : 'Faixa entre métodos', color: COR.sky, style: 'band' }],
            fontes: [fonte('pib_volume_sa'), fonte('ibcbr')], csv: [csvInd('indicadores/i15_hiato_produto_trimestral.csv'), csvInd('indicadores/i15_hiato_ibcbr_mensal.csv')],
          }, lang);
        })(),
      ], tabelas: [(() => {
        const r = ler('opm/indicadores/i13_repasse_lp.csv');
        const nomes: Record<string, string> = en ? { total: 'Total', pj: 'Firms', pf_livres: 'Households (non-earmarked)' } : { total: 'Total', pj: 'Pessoas jurídicas', pf_livres: 'Pessoas físicas (livres)' };
        const series = ['total', 'pj', 'pf_livres'];
        return {
          id: 'opm-repasse', titulo: en ? 'I.13 — Cumulative pass-through of the Selic to lending rates (local projections)' : 'I.13 — Repasse acumulado da Selic ao custo do crédito (projeções locais)',
          descricao: en ? 'β_h in p.p. of the average lending rate per 1 p.p. of Selic, h months after the change; 90% interval (Newey-West) in brackets. Conditional associations, not identified causal effects.'
            : 'β_h em p.p. da taxa média do crédito por 1 p.p. de Selic, h meses após a mudança; intervalo de 90% (Newey-West) entre colchetes. Associações condicionais, não efeitos causais identificados.',
          colunas: [en ? 'Horizon (months)' : 'Horizonte (meses)', ...series.map((x) => nomes[x]!)],
          linhas: Array.from({ length: 12 }, (_, k) => [String(k + 1), ...series.map((x) => { const l = r.find((y) => y.serie === x && y.h === String(k + 1))!; return `${n2(Number(l.beta))} [${n2(Number(l.ic90_inf))}; ${n2(Number(l.ic90_sup))}]`; })]),
          fontes: [fonte('juros_credito'), fonte('juros_pj'), fonte('juros_pf_livres'), fonte('selic_meta')], csv: [csvInd('indicadores/i13_repasse_lp.csv')],
        };
      })()] };
    }
    case 'a2-6-externo-fiscal': {
      const ff = fimDeMes(ler('opm/fed_funds_sup.csv') as (Record<string, string> & { data: string })[]);
      const t10 = fimDeMes(ler('opm/ust10.csv') as (Record<string, string> & { data: string })[]);
      const tips = fimDeMes(ler('opm/tips5.csv') as (Record<string, string> & { data: string })[]);
      const br = fimDeMes(ler('opm/brent.csv') as (Record<string, string> & { data: string })[]);
      const prim = ler('panorama/primario.csv'), db = ler('panorama/dbgg.csv');
      const uf = ff.at(-1)!, ut = t10.at(-1)!, ui = tips.at(-1)!, ubr = br.at(-1)!, up = prim.at(-1)!, ud = db.at(-1)!;
      const m = (r: Record<string, string>) => mes(r.data!.slice(0, 7));
      return { graficos: [
        monta({
          id: 'opm-eua', icone: 'globe', rotulo: 'A2.6', largo: true,
          titulo: en ? 'US policy rate and Treasury yields' : 'Juros de política e do Tesouro dos EUA',
          subtitulo: en ? `On ${fd(dia(ut.data))}: fed funds upper limit ${n2(Number(uf.valor))}%, 10-year Treasury ${n2(Number(ut.valor))}%, 5-year TIPS (real) ${n2(Number(ui.valor))}%.`
            : `Em ${fd(dia(ut.data))}: limite superior dos fed funds ${n2(Number(uf.valor))}%, Tesouro de 10 anos ${n2(Number(ut.valor))}%, TIPS de 5 anos (real) ${n2(Number(ui.valor))}%.`,
          unidade: en ? '% a year; last observation of each month' : '% ao ano; última observação de cada mês', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          descricao: en ? 'Three month-end series.' : 'Três séries de fim de mês.',
          series: [
            { id: 'ff', label: 'Fed funds', color: COR.navy, kind: 'step', width: 2.2, points: ff.map((r) => ({ x: m(r), y: Number(r.valor) })) },
            { id: 't10', label: en ? '10-yr Treasury' : 'Tesouro 10 anos', color: COR.azure, dash: '6 3', points: t10.map((r) => ({ x: m(r), y: Number(r.valor) })) },
            { id: 'tips', label: 'TIPS 5', color: COR.steel, markers: 'diamond', width: 1.4, points: tips.map((r) => ({ x: m(r), y: Number(r.valor) })) },
          ],
          legenda: [{ id: 'ff', label: en ? 'Fed funds target, upper limit' : 'Fed funds, limite superior', color: COR.navy, style: 'step' }, { id: 't10', label: en ? '10-year Treasury' : 'Tesouro de 10 anos', color: COR.azure, style: 'dash' }, { id: 'tips', label: en ? '5-year TIPS (real)' : 'TIPS de 5 anos (real)', color: COR.steel, style: 'marker' }],
          fontes: [fonte('fed_funds_sup'), fonte('ust10'), fonte('tips5')], csv: [csvSerie('fed_funds_sup'), csvSerie('ust10'), csvSerie('tips5'), csvSerie('dolar_global')],
          nota: en ? 'EMBI, CDS and other sovereign-risk measures are excluded for licence reasons (ADR-024).' : 'EMBI, CDS e outras medidas de risco soberano ficam fora por licença (ADR-024).',
        }, lang),
        monta({
          id: 'opm-brent', icone: 'droplet', rotulo: 'A2.6',
          titulo: en ? 'Brent crude oil price' : 'Preço do petróleo Brent',
          subtitulo: en ? `On ${fd(dia(ubr.data))}, Brent was US$ ${n2(Number(ubr.valor))} a barrel.` : `Em ${fd(dia(ubr.data))}, o Brent estava em US$ ${n2(Number(ubr.valor))} por barril.`,
          unidade: en ? 'US$ per barrel; last observation of each month' : 'US$ por barril; última observação de cada mês', xFormat: 'month', yDigits: 0, yUnit: 'US$',
          descricao: en ? 'Month-end spot price.' : 'Preço à vista de fim de mês.',
          series: [{ id: 'b', label: 'Brent', color: COR.navy, width: 2.2, points: br.map((r) => ({ x: m(r), y: Number(r.valor) })) }],
          legenda: [{ id: 'b', label: 'Brent', color: COR.navy, style: 'line' }],
          fontes: [fonte('brent')], csv: [csvSerie('brent')],
        }, lang),
        monta({
          id: 'opm-fiscal', icone: 'landmark', rotulo: 'A2.6',
          titulo: en ? 'Primary balance and gross general government debt' : 'Resultado primário e dívida bruta do governo geral',
          subtitulo: en ? `In ${fm(mes(ud.periodo!))}, gross debt was ${n1(Number(ud.dbgg_pib))}% of GDP; the 12-month primary balance was ${n2(Number(up.superavit_primario_pib))}% of GDP in ${fm(mes(up.periodo!))}.`
            : `Em ${fm(mes(ud.periodo!))}, a dívida bruta era de ${n1(Number(ud.dbgg_pib))}% do PIB; o resultado primário em 12 meses foi de ${n2(Number(up.superavit_primario_pib))}% do PIB em ${fm(mes(up.periodo!))}.`,
          unidade: en ? '% of GDP (primary: + = surplus)' : '% do PIB (primário: + = superávit)', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
          descricao: en ? 'Gross debt on a separate table column; the chart shows the primary balance. Series from panel A3, not duplicated.' : 'A dívida bruta está na tabela; o gráfico mostra o resultado primário. Séries do painel A3, sem duplicação.',
          series: [{ id: 'p', label: en ? 'Primary balance, 12 months' : 'Primário, 12 meses', color: COR.navy, kind: 'bar', points: pts(prim, 'periodo', 'superavit_primario_pib') }],
          colunasExtra: [{ titulo: en ? 'Gross debt (% of GDP)' : 'Dívida bruta (% do PIB)', pontos: pts(db, 'periodo', 'dbgg_pib') }],
          legenda: [{ id: 'p', label: en ? 'Primary balance, 12 months (% of GDP)' : 'Resultado primário em 12 meses (% do PIB)', color: COR.navy, style: 'bar' }],
          fontes: [fonte('primario'), fonte('dbgg')], csv: [csvSerie('primario'), csvSerie('dbgg')],
        }, lang),
      ] };
    }
    case 'a2-7-projecoes': {
      const fa = ler('opm/focus_anuais.csv').filter((r) => r.indicador === 'IPCA');
      const anos = [...new Set(fa.map((r) => Number(r.ano_referencia)))];
      const ultima = fa.at(-1)!.data!;
      const anoAtual = Number(ultima.slice(0, 4));
      const serieAno = (a: number) => fimDeMes(fa.filter((r) => Number(r.ano_referencia) === a) as (Record<string, string> & { data: string })[])
        .filter((r) => r.data >= `${a - 2}-01-01`).map((r) => ({ x: mes(r.data.slice(0, 7)), y: Number(r.mediana) }));
      const v = (a: number) => fa.filter((r) => r.data === ultima && Number(r.ano_referencia) === a)[0];
      return { graficos: [
        monta({
          id: 'opm-focus-ipca', icone: 'line-chart', rotulo: 'A2.7', largo: true,
          titulo: en ? 'How Focus IPCA expectations for each year evolved' : 'Como evoluíram as expectativas Focus do IPCA para cada ano',
          subtitulo: en ? `In the survey of ${fd(dia(ultima))}, the median was ${n2(Number(v(anoAtual)?.mediana))}% for ${anoAtual} and ${n2(Number(v(anoAtual + 1)?.mediana))}% for ${anoAtual + 1}.`
            : `Na coleta de ${fd(dia(ultima))}, a mediana era de ${n2(Number(v(anoAtual)?.mediana))}% para ${anoAtual} e de ${n2(Number(v(anoAtual + 1)?.mediana))}% para ${anoAtual + 1}.`,
          unidade: en ? '% (IPCA in the calendar year); last survey of each month' : '% (IPCA no ano-calendário); última coleta de cada mês', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true, defaultRange: '5a',
          descricao: en ? 'Each line is one reference year, from two years before it.' : 'Cada linha é um ano de referência, a partir de dois anos antes dele.',
          series: [anoAtual - 1, anoAtual, anoAtual + 1].filter((a) => anos.includes(a)).map((a, k) => ({ id: `y${a}`, label: String(a), color: [COR.steel, COR.navy, COR.azure][k]!, ...(k === 0 ? { markers: 'circle' as const, width: 1.4 } : k === 2 ? { dash: '6 3' } : { width: 2.4 }), points: serieAno(a) })),
          legenda: [anoAtual - 1, anoAtual, anoAtual + 1].map((a, k) => ({ id: `y${a}`, label: `IPCA ${a}`, color: [COR.steel, COR.navy, COR.azure][k]!, style: (['marker', 'line', 'dash'] as const)[k]! })),
          fontes: [fonte('focus_anuais')], csv: [csvSerie('focus_anuais')],
          nota: en ? 'Layer 1 only records and compares projections. Forecast errors of the BCB and of Focus will be computed once each outcome is known, from the vintages stored from this edition on (ADR-025). CEE scenarios (layer 3) will be conditional exercises, never CEE forecasts.'
            : 'A camada 1 só registra e compara projeções. Os erros de previsão do BCB e da Focus serão calculados quando cada dado for conhecido, a partir das safras guardadas desde esta edição (ADR-025). Os cenários do CEE (camada 3) serão exercícios condicionais, nunca previsões do CEE.',
        }, lang),
      ], tabelas: [(() => {
        const co = ler('opm/indicadores/modelo_coeficientes.csv');
        const dg = ler('opm/indicadores/modelo_diagnostico.csv')[0]!;
        const pub = dg.publicavel === '1';
        return {
          id: 'opm-modelo', titulo: en ? 'CEE semi-structural model (experimental): estimated coefficients' : 'Modelo semiestrutural do CEE (experimental): coeficientes estimados',
          descricao: (en ? `Quarterly OLS, Newey-West errors (IS, Phillips, Taylor, UIP). Identification check for publishing the model's neutral rate (I.4 e) and conditional scenarios: IS slope t ≤ −2 and positive output-gap coefficient in the Phillips curve. Current result: t = ${n2(Number(dg.t_inclinacao_is))} and coefficient ${n2(Number(dg.coef_hiato_phillips))} — ` : `MQO trimestral, erros de Newey-West (IS, Phillips, Taylor, UIP). Critério para publicar o juro neutro do modelo (I.4 e) e os cenários condicionais: inclinação da IS com t ≤ −2 e coeficiente do hiato positivo na curva de Phillips. Resultado atual: t = ${n2(Number(dg.t_inclinacao_is))} e coeficiente ${n2(Number(dg.coef_hiato_phillips))} — `)
            + (pub ? (en ? 'passed; scenarios in modelo_cenarios.csv.' : 'aprovado; cenários em modelo_cenarios.csv.') : (en ? 'not passed: the scenarios would not distinguish interest-rate paths, so they are not published; the full exercise is in the draft Discussion Paper.' : 'não aprovado: os cenários não distinguiriam trajetórias de juros e por isso não são publicados; o exercício completo está na minuta de Texto para Discussão.')),
          colunas: [en ? 'Equation · variable' : 'Equação · variável', en ? 'Coefficient' : 'Coeficiente', en ? 'Std. error' : 'Erro-padrão', 'n', 'R²'],
          linhas: co.map((r) => [`${r.equacao} · ${r.variavel}`, n2(Number(r.coeficiente)), n2(Number(r.erro_padrao)), r.n!, n2(Number(r.r2))]),
          fontes: [fonte('pib_volume_sa'), fonte('focus_selic'), fonte('focus_inflacao_12m'), fonte('ipca'), fonte('cambio_real'), fonte('selic_meta'), fonte('fed_funds_sup')],
          csv: [csvInd('indicadores/modelo_coeficientes.csv'), csvInd('indicadores/modelo_diagnostico.csv')],
        };
      })()] };
    }
    case 'a2-8-moeda': {
      const a = ler('opm/indicadores/i18_agregados.csv');
      const c = ler('opm/indicadores/i19_multiplicador_coeficientes.csv');
      const v = ler('opm/indicadores/i20_velocidade_monetizacao.csv');
      const ua = a.at(-1)!, uc = c.at(-1)!, uv = v.at(-1)!;
      const par = (id: string, nome: string): { titulo: string; original: Grafico; ajustada: Grafico } => {
        const d = ler(`opm/dessaz/${id}.csv`);
        const mm = (col: 'original' | 'ajustada') => d.slice(1).map((r, k) => ({ x: mes(r.periodo!), y: Math.round(10000 * (Number(r[col]) / Number(d[k]![col]) - 1)) / 100 }));
        const g = (col: 'original' | 'ajustada') => {
          const p = mm(col); const up = p.at(-1)!;
          const rot = col === 'original' ? (en ? 'Original' : 'Original') : (en ? 'Seasonally adjusted by CEE (X-13)' : 'Dessazonalizado pelo CEE (X-13)');
          return monta({
            id: `opm-${id}-${col}`, icone: 'coins', rotulo: rot,
            titulo: `${nome} — ${col === 'original' ? (en ? 'monthly change, original' : 'variação mensal, original') : (en ? 'monthly change, seasonally adjusted' : 'variação mensal, dessazonalizada')}`,
            subtitulo: en ? `In ${fm(up.x)}: ${n2(up.y)}%.` : `Em ${fm(up.x)}: ${n2(up.y)}%.`,
            unidade: en ? '% month on month (end-of-period balance)' : '% no mês (saldo de fim de período)', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true, defaultRange: '5a',
            descricao: en ? 'Monthly bars.' : 'Barras mensais.',
            series: [{ id: col, label: rot, color: col === 'original' ? COR.steel : COR.navy, kind: 'bar', points: p }],
            legenda: [{ id: col, label: rot, color: col === 'original' ? COR.steel : COR.navy, style: 'bar' }],
            fontes: [fonte(id)], csv: [csvInd(`dessaz/${id}.csv`)],
          }, lang);
        };
        return { titulo: nome, original: g('original'), ajustada: g('ajustada') };
      };
      return {
        graficos: [
          monta({
            id: 'opm-agregados', icone: 'coins', rotulo: 'I.18', largo: true,
            titulo: en ? 'Real 12-month growth of money aggregates' : 'Crescimento real em 12 meses dos agregados monetários',
            subtitulo: en ? `In ${fm(mes(ua.periodo!))}, deflated by the IPCA: M1 ${n1(Number(ua.m1_real_12m))}%, M2 ${n1(Number(ua.m2_real_12m))}%, M4 ${n1(Number(ua.m4_real_12m))}%.`
              : `Em ${fm(mes(ua.periodo!))}, deflacionados pelo IPCA: M1 ${n1(Number(ua.m1_real_12m))}%, M2 ${n1(Number(ua.m2_real_12m))}%, M4 ${n1(Number(ua.m4_real_12m))}%.`,
            unidade: en ? '% over 12 months, real (IPCA)' : '% em 12 meses, real (IPCA)', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
            descricao: en ? 'Three aggregates ("New" series). Nominal growth and the narrow base are in the CSV.' : 'Três agregados (séries "Novo"). O crescimento nominal e a base restrita estão no CSV.',
            series: [
              { id: 'm1', label: 'M1', color: COR.navy, width: 2.2, points: pts(a, 'periodo', 'm1_real_12m') },
              { id: 'm2', label: 'M2', color: COR.azure, dash: '6 3', points: pts(a, 'periodo', 'm2_real_12m') },
              { id: 'm4', label: 'M4', color: COR.steel, markers: 'circle', width: 1.4, points: pts(a, 'periodo', 'm4_real_12m') },
            ],
            legenda: [{ id: 'm1', label: 'M1', color: COR.navy, style: 'line' }, { id: 'm2', label: 'M2', color: COR.azure, style: 'dash' }, { id: 'm4', label: 'M4', color: COR.steel, style: 'marker' }],
            fontes: [fonte('m1'), fonte('m2'), fonte('m4'), fonte('ipca')], csv: [csvInd('indicadores/i18_agregados.csv')],
            nota: en ? 'Changes in M1 mainly reflect money demand, which is sensitive to interest rates and to payment innovations such as Pix; they are not, by themselves, a sign of loose monetary policy.' : 'Variações de M1 refletem sobretudo demanda por moeda, sensível a juros e a inovações de pagamento como o Pix; não são, por si, sinal de política monetária frouxa.',
          }, lang),
          monta({
            id: 'opm-multiplicador', icone: 'divide', rotulo: 'I.19',
            titulo: en ? 'M1 multiplier and behavioural ratios' : 'Multiplicador de M1 e coeficientes de comportamento',
            subtitulo: en ? `In ${fm(mes(uc.periodo!))}: m = ${n2(Number(uc.multiplicador_m1))}, c = ${n2(Number(uc.c_pmpp_dv))}, r = ${n2(Number(uc.r_reservas_dv))}.` : `Em ${fm(mes(uc.periodo!))}: m = ${n2(Number(uc.multiplicador_m1))}, c = ${n2(Number(uc.c_pmpp_dv))}, r = ${n2(Number(uc.r_reservas_dv))}.`,
            unidade: en ? 'ratio' : 'razão', xFormat: 'month', yDigits: 2, yUnit: '', zero: true,
            descricao: en ? 'm = M1/base; c = currency held by the public / demand deposits; r = bank reserves / demand deposits.' : 'm = M1/base; c = papel-moeda em poder do público / depósitos à vista; r = reservas bancárias / depósitos à vista.',
            series: [
              { id: 'm', label: 'm', color: COR.navy, width: 2.2, points: pts(c, 'periodo', 'multiplicador_m1') },
              { id: 'c', label: 'c', color: COR.azure, dash: '6 3', points: pts(c, 'periodo', 'c_pmpp_dv') },
              { id: 'r', label: 'r', color: COR.steel, markers: 'square', width: 1.4, points: pts(c, 'periodo', 'r_reservas_dv') },
            ],
            legenda: [{ id: 'm', label: en ? 'm: M1 multiplier' : 'm: multiplicador de M1', color: COR.navy, style: 'line' }, { id: 'c', label: 'c: PMPP/DV', color: COR.azure, style: 'dash' }, { id: 'r', label: 'r: R/DV', color: COR.steel, style: 'marker' }],
            fontes: [fonte('m1'), fonte('base_restrita'), fonte('pmpp'), fonte('depositos_vista'), fonte('reservas_bancarias')], csv: [csvInd('indicadores/i19_multiplicador_coeficientes.csv')],
          }, lang),
          monta({
            id: 'opm-monetizacao', icone: 'gauge', rotulo: 'I.20',
            titulo: en ? 'Monetisation: M1 and M2 as a share of GDP' : 'Grau de monetização: M1 e M2 em relação ao PIB',
            subtitulo: en ? `In ${fm(mes(uv.periodo!))}: M1 ${n1(Number(uv.m1_pib_pct))}% and M2 ${n1(Number(uv.m2_pib_pct))}% of 12-month GDP; M1 income velocity ${n1(Number(uv.velocidade_m1))}.`
              : `Em ${fm(mes(uv.periodo!))}: M1 ${n1(Number(uv.m1_pib_pct))}% e M2 ${n1(Number(uv.m2_pib_pct))}% do PIB de 12 meses; velocidade-renda de M1 de ${n1(Number(uv.velocidade_m1))}.`,
            unidade: en ? '% of 12-month nominal GDP' : '% do PIB nominal de 12 meses', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
            descricao: en ? 'Average balance of the last 12 months over 12-month nominal GDP (SGS 4382). Velocity is in the table and CSV.' : 'Saldo médio dos últimos 12 meses sobre o PIB nominal de 12 meses (SGS 4382). A velocidade está na tabela e no CSV.',
            series: [
              { id: 'm1', label: 'M1/PIB', color: COR.navy, width: 2.2, points: pts(v, 'periodo', 'm1_pib_pct') },
              { id: 'm2', label: 'M2/PIB', color: COR.azure, dash: '6 3', points: pts(v, 'periodo', 'm2_pib_pct') },
            ],
            colunasExtra: [{ titulo: en ? 'M1 velocity' : 'Velocidade de M1', pontos: pts(v, 'periodo', 'velocidade_m1') }, { titulo: en ? 'M2 velocity' : 'Velocidade de M2', pontos: pts(v, 'periodo', 'velocidade_m2') }],
            legenda: [{ id: 'm1', label: en ? 'M1 / GDP' : 'M1 / PIB', color: COR.navy, style: 'line' }, { id: 'm2', label: en ? 'M2 / GDP' : 'M2 / PIB', color: COR.azure, style: 'dash' }],
            fontes: [fonte('m1'), fonte('m2'), fonte('pib_nominal_12m')], csv: [csvInd('indicadores/i20_velocidade_monetizacao.csv')],
          }, lang),
        ],
        dessaz: [par('m1', 'M1'), par('base_restrita', en ? 'Narrow monetary base' : 'Base monetária restrita')],
      };
    }
    default:
      throw new Error(`Módulo desconhecido: ${modulo}`);
  }
}

/** Safras (vintages) que alimentam o OPM: série, data, hash e link para o CSV (ADR-026). */
export function safrasOpm() {
  const v = vintagesOpm();
  const opm = lerVintage('opm');
  const usadas = new Set([...Object.keys(opm), 'ipca', 'selic_meta', 'metas_inflacao', 'primario', 'dbgg']);
  const dessaz = existsSync(join(P, 'opm/dessaz/_meta.json')) ? JSON.parse(readFileSync(join(P, 'opm/dessaz/_meta.json'), 'utf8')) as Record<string, { ultimo: string; modelo: string }> : {};
  return {
    series: [...usadas].filter((id) => v[id]).map((id) => ({ id, nome: v[id]!.nome, codigo: v[id]!.codigo, extraido_em: v[id]!.extraido_em.slice(0, 10), arquivos: v[id]!.arquivos.length, sha256: v[id]!.arquivos[0]?.sha256 ?? '', csv: csvSerie(id).href }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    dessaz: Object.entries(dessaz).map(([id, m]) => ({ id, ultimo: m.ultimo, modelo: m.modelo, href: href(`/dados/opm/safras/dessaz/${id}/${m.ultimo}.csv`) })),
  };
}
