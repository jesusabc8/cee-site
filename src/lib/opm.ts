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
export const fonte = (id: string): Fonte => {
  const v = vintagesOpm()[id];
  if (!v) throw new Error(`OPM: série sem vintage: ${id}`);
  return { instituicao: v.instituicao, codigo: v.codigo, extraido_em: v.extraido_em.slice(0, 10), url: v.url_publica, desatualizado: v.desatualizado };
};
/** Código curto para a linha de fonte das fichas (o código completo fica no catálogo de dados). */
export function codigoCurto(c: string): string {
  return c
    .replace(/^Olinda Expectativas v1, (\w+).*$/, 'Focus/Olinda $1')
    .replace(/^(SIDRA \d+).*$/, '$1')
    .replace(/^API de conteúdo do BCB: .*\/(\w+)$/, 'API BCB $1')
    .replace(/^Página "Histórico: meta de inflação vs\. inflação efetiva".*$/, 'Histórico de metas')
    .replace(/^Tesouro Transparente .*$/, 'Tesouro Direto (CKAN)')
    .replace(/^historico-votacoes-Copom\.xlsx.*$/, 'histórico de votações')
    .replace(/^Comunicados BCB .*$/, 'calendário do Copom')
    .replace(/^FTP IBGE, .*Pesos_Regionais.*$/, 'pesos regionais (FTP)')
    .replace(/^API de malhas v3 do IBGE.*$/, 'API de malhas (centroides)');
}
const painelDe = (id: string) => (lerVintage('opm')[id] ? 'opm' : lerVintage('conjuntura')[id] ? 'conjuntura' : 'panorama');
export const csvSerie = (id: string) => ({ rotulo: `${id}.csv`, href: href(`/dados/${painelDe(id)}/${id}.csv`) });
export const csvInd = (arq: string) => ({ rotulo: arq.split('/').pop()!, href: href(`/dados/opm/${arq}`) });

/** Último valor de cada mês de uma série diária. */
function fimDeMes<T extends { data: string }>(xs: T[]): T[] {
  const m = new Map<string, T>();
  for (const x of xs) m.set(x.data.slice(0, 7), x);
  return [...m.values()];
}

/** Ficha do OPM: gráfico + estado da série (V/A/R) e selo experimental (ADR-029). */
/** `estatico`: figura gerada no build (mapa, múltiplos, barras), uma SVG por faixa de largura, sem cursor nem períodos. */
export type FichaOpm = Grafico & { estado?: 'V' | 'A' | 'R'; experimental?: boolean; inferida?: boolean; estatico?: { svg: string; classe: 'larga' | 'estreita' | 'unica' }[] };

/** Reuniões ordinárias do Copom (marcas no eixo x). */
let reunioesCache: { x: number; rotulo: string }[] | null = null;
function reunioesCopom(lang: Lang) {
  reunioesCache ??= ler('opm/copom_decisoes.csv').filter((r) => r.extraordinaria === '0' && r.reuniao)
    .map((r) => ({ x: dia(r.data_reuniao!), rotulo: r.reuniao! }));
  return reunioesCache.map((r) => ({ x: r.x, rotulo: lang === 'en' ? `Copom meeting ${r.rotulo}` : `${r.rotulo}ª reunião do Copom` }));
}

const MES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Mês de referência: "set/2026" (pt) ou "Sep 2026" (en). */
export const rotMes = (x: number, lang: Lang) => { const d = new Date(x); return lang === 'en' ? `${MES_EN[d.getUTCMonth()]} ${d.getUTCFullYear()}` : `${MES_PT[d.getUTCMonth()]}/${d.getUTCFullYear()}`; };
/** Data de referência: "13 nov 2026" / "13 Nov 2026". */
export const rotDia = (x: number, lang: Lang) => { const d = new Date(x); return `${d.getUTCDate()} ${(lang === 'en' ? MES_EN : MES_PT)[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const rotTri = (x: number) => { const d = new Date(x); return `${d.getUTCFullYear()}-T${Math.floor(d.getUTCMonth() / 3) + 1}`; };
/** Subtítulo padronizado: unidade · frequência e período · último dado (com a data de referência real da série). */
export function subtitulo(lang: Lang, unidade: string, freq: string, pts: Ponto[], fmt: 'mes' | 'dia' | 'tri', extra?: string) {
  const v = pts.filter((p) => p.y !== null);
  const f = (x: number) => (fmt === 'dia' ? rotDia(x, lang) : fmt === 'tri' ? rotTri(x) : rotMes(x, lang));
  const ini = v[0] ? f(v[0].x) : '', fim = v.at(-1) ? f(v.at(-1)!.x) : '';
  return [unidade, `${freq}, ${ini}–${fim}`, extra].filter(Boolean).join(' · ');
}

export interface Monta {
  id: string; icone: string; rotulo: string; titulo: string; subtitulo: string; unidade: string; descricao: string;
  /** Unidade curta escrita no topo do eixo y. */
  eixo?: string; marcas?: boolean; estado?: 'V' | 'A' | 'R'; experimental?: boolean;
  /** Série inferida pelo CEE (expectativa, prêmio, faixa ou trajetória deduzida de dados da fonte), não publicada pela fonte. */
  inferida?: boolean;
  xFormat: XFormat; yDigits: number; yUnit: string; series: SerieSpec[]; bandas?: BandaSpec[]; refs?: { y: number; label: string; dash?: string; color?: string }[];
  legenda: Legenda[]; fontes: Fonte[]; csv: { rotulo: string; href: string }[]; nota?: string; largo?: boolean; zero?: boolean;
  ranges?: boolean; defaultRange?: string; altura?: number; colunasExtra?: { titulo: string; pontos: Ponto[] }[];
}

/** Monta a ficha com tabela alternativa gerada dos próprios pontos (uma linha por x). */
export function monta(m: Monta, lang: Lang): FichaOpm {
  const en = lang === 'en';
  // Estilo de publicação: cor semântica pela posição da série (s1 = principal), faixas na cor de faixa.
  const CLS = ['s1', 's2', 's3', 's4'] as const;
  let k = 0;
  // Rótulo direto curto: o texto antes da primeira vírgula ou parêntese (a legenda completa fica na tabela).
  const curto = (t: string) => t.replace(/^\([a-e]\)\s*/, '').split(/[,(]/)[0]!.trim() || t;
  m.series = m.series.map((s): SerieSpec => ({ ...s, classe: s.classe ?? CLS[Math.min(k++, 3)]!, endLabel: s.endLabel ?? curto(s.label) }));
  if (m.bandas) m.bandas = m.bandas.map((b, i): BandaSpec => ({ ...b, classe: b.classe ?? (i ? 'banda-2' : 'banda-1') }));
  const vintage = m.fontes.map((f) => f.extraido_em).sort().at(-1);
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
    ...(m.largo ? { largo: true } : {}), estado: m.estado ?? 'V', ...(m.experimental ? { experimental: true } : {}), ...(m.inferida ? { inferida: true } : {}),
    spec: {
      id: m.id, height: m.altura ?? (m.largo ? 340 : 300), xFormat: m.xFormat, yDigits: m.yDigits, yUnit: m.yUnit, lang, series: m.series,
      estilo: 'pub', yLabel: m.eixo ?? m.yUnit, ...(vintage ? { vintage: rotDia(dia(vintage), lang) } : {}),
      ...(m.marcas ? { marcas: reunioesCopom(lang) } : {}),
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
export interface ModuloGraficos { graficos: FichaOpm[]; dessaz?: { titulo: string; original: FichaOpm; ajustada: FichaOpm }[]; tabelas?: Tabela[] }
/** Métodos presentes na faixa de juro neutro, na ordem da especificação. */
function metodosFaixa(r: Record<string, string>, lang: Lang) {
  const M: [string, string, string][] = [['a_focus_t4', '(a) Focus t+4', '(a) Focus t+4'], ['b_hp_unilateral', '(b) HP', '(b) HP'], ['b_hamilton', '(b) Hamilton', '(b) Hamilton'], ['c_ntnb_longa', '(c) NTN-B', '(c) NTN-B'], ['e_modelo', '(e) modelo', '(e) model']];
  return M.filter(([k]) => r[k] !== undefined && r[k] !== '').map(([, pt, en]) => (lang === 'en' ? en : pt)).join(', ');
}
const tri = (t: string) => Date.UTC(Number(t.slice(0, 4)), (Number(t.slice(6)) - 1) * 3, 1);

export function graficosModulo(modulo: string, lang: Lang): ModuloGraficos {
  const en = lang === 'en';
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const n1 = (v: number) => fmtNum(v, 1, lang);
  const fm = (x: number) => fmtX(x, 'month', lang);
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
          titulo: (() => { const ant = dec.filter((r) => Number(r.reuniao) < Number(u.reuniao)).at(-1); const d = ant ? Number(u.meta_decidida) - Number(ant.meta_selic) : 0;
            return en ? `Copom ${d === 0 ? 'holds' : d > 0 ? 'raises' : 'cuts'} the Selic ${d === 0 ? 'at' : 'to'} ${n2(Number(u.meta_decidida))}% at its ${u.reuniao}th meeting`
              : `Copom ${d === 0 ? 'mantém' : d > 0 ? 'eleva' : 'reduz'} a Selic ${d === 0 ? 'em' : 'para'} ${n2(Number(u.meta_decidida))}% na ${u.reuniao}ª reunião`; })(),
          subtitulo: subtitulo(lang, en ? 'Selic target, % a year' : 'Meta Selic, % ao ano', en ? 'by meeting' : 'por reunião', dec.map((r) => ({ x: dia(r.inicio_vigencia!), y: 1 })), 'mes',
            en ? `decision of ${rotDia(dia(u.data_reuniao!), lang)}, ${u.placar === 'Unanimidade' ? 'unanimous' : `vote ${u.placar}`}` : `decisão de ${rotDia(dia(u.data_reuniao!), lang)}, ${u.placar === 'Unanimidade' ? 'por unanimidade' : `placar ${u.placar}`}`),
          eixo: en ? '% a year' : '% ao ano', marcas: true,
          unidade: en ? '% a year; value in force from the day after each meeting' : '% ao ano; valor vigente a partir do dia seguinte a cada reunião',
          descricao: en ? `Step series of Selic targets since ${fm(mes(dec[0]!.inicio_vigencia!.slice(0, 7)))}.` : `Série em degraus das metas Selic desde ${fm(mes(dec[0]!.inicio_vigencia!.slice(0, 7)))}.`,
          xFormat: 'day', yDigits: 2, yUnit: '%', zero: true,
          series: [{ id: 'meta', label: en ? 'Selic target' : 'Meta Selic', color: COR.navy, kind: 'step', width: 2.2, points: dec.map((r) => ({ x: dia(r.inicio_vigencia!), y: Number(r.meta_selic) })) }],
          legenda: [{ id: 'meta', label: en ? 'Selic target (Copom)' : 'Meta Selic (Copom)', color: COR.navy, style: 'step' }],
          fontes: [fonte('copom_decisoes'), fonte('copom_votos')], csv: [csvSerie('copom_decisoes'), csvSerie('copom_votos')],
        }, lang),
        monta({
          id: 'opm-surpresa', icone: 'zap', rotulo: 'I.5', largo: true,
          titulo: Number(u.surpresa_pp) === 0
            ? (en ? `The ${u.reuniao}th meeting decision matched the Focus median` : `A decisão da ${u.reuniao}ª reunião coincidiu com a mediana Focus`)
            : (en ? `The ${u.reuniao}th meeting surprised the Focus median by ${Number(u.surpresa_pp) > 0 ? '+' : ''}${n2(Number(u.surpresa_pp))} p.p.` : `A ${u.reuniao}ª reunião surpreendeu a mediana Focus em ${Number(u.surpresa_pp) > 0 ? '+' : ''}${n2(Number(u.surpresa_pp))} p.p.`),
          subtitulo: subtitulo(lang, en ? 'Decided target minus the Focus median in the last survey before the meeting, p.p.' : 'Meta decidida menos a mediana Focus da última coleta antes da reunião, p.p.', en ? 'by meeting' : 'por reunião', i5.map((r) => ({ x: dia(r.data_reuniao!), y: 1 })), 'mes',
            en ? `${ns} of ${i5.length} meetings with a non-zero surprise` : `${ns} de ${i5.length} reuniões com surpresa diferente de zero`),
          eixo: 'p.p.',
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
          id: 'opm-juro-real', icone: 'percent', rotulo: 'I.1 · I.2 · I.4', inferida: true, largo: true,
          titulo: (() => { const r = Number(uf.juro_real_ex_ante), q1 = Number(uf.q1), q3 = Number(uf.q3);
            const pos = r > q3 ? (en ? 'above' : 'acima da') : r < q1 ? (en ? 'below' : 'abaixo da') : (en ? 'inside' : 'dentro da');
            return en ? `Ex ante real rate of ${n2(r)}% sits ${pos} the CEE neutral-rate band` : `Juro real ex ante de ${n2(r)}% fica ${pos} faixa de juro neutro do CEE`; })(),
          subtitulo: subtitulo(lang, en ? '% a year, real (exact Fisher)' : '% ao ano, real (Fisher exata)', en ? 'monthly' : 'mensal', ea, 'mes',
            en ? `band ${n2(Number(uf.q1))}–${n2(Number(uf.q3))}% (median ${n2(Number(uf.mediana))}%, ${uf.metodos} methods: ${metodosFaixa(uf, lang)}); BCB: ${n2(BCB)}%`
              : `faixa de ${n2(Number(uf.q1))} a ${n2(Number(uf.q3))}% (mediana ${n2(Number(uf.mediana))}%, ${uf.metodos} métodos: ${metodosFaixa(uf, lang)}); BCB: ${n2(BCB)}%`),
          eixo: en ? '% a year' : '% ao ano', marcas: true,
          unidade: en ? '% a year, real (exact Fisher)' : '% ao ano, real (Fisher exata)',
          descricao: en ? 'Lines: ex ante (Focus) and ex post (effective Selic) real rates, month end. Shaded area: interquartile range of the CEE neutral-rate estimates. Dashed line: BCB reference value, outside the CEE distribution.'
            : 'Linhas: juro real ex ante (Focus) e ex post (Selic efetiva), fim de mês. Área sombreada: intervalo interquartil das estimativas de juro neutro do CEE. Linha tracejada: valor de referência do BCB, fora da distribuição do CEE.',
          xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
          series: [
            { id: 'ea', label: en ? 'Ex ante (I.1)' : 'Ex ante (I.1)', color: COR.navy, width: 2.4, points: ea },
            { id: 'ep', label: en ? 'Ex post (I.2)' : 'Ex post (I.2)', color: COR.azure, width: 1.8, dash: '6 3', points: pts(i2, 'periodo', 'juro_real_ex_post') },
          ],
          bandas: [{ id: 'faixa', label: en ? 'Neutral-rate band (Q1–Q3)' : 'Faixa de juro neutro (Q1–Q3)', fill: COR.sky, lo: comFaixa.map((r) => ({ x: mes(r.periodo!), y: Number(r.q1) })), hi: comFaixa.map((r) => ({ x: mes(r.periodo!), y: Number(r.q3) })) }],
          colunasExtra: [{ titulo: en ? 'Neutral-rate band, median' : 'Faixa de juro neutro, mediana', pontos: pts(f, 'periodo', 'mediana') }],
          refs: [{ y: BCB, label: en ? 'BCB neutral 5.00%' : 'Neutro BCB 5,00%', dash: '2 3', color: COR.steel }],
          legenda: [{ id: 'ea', label: en ? 'Ex ante real rate (I.1)' : 'Juro real ex ante (I.1)', color: COR.navy, style: 'line' }, { id: 'ep', label: en ? 'Ex post real rate (I.2)' : 'Juro real ex post (I.2)', color: COR.azure, style: 'dash' }, { id: 'faixa', label: en ? 'CEE neutral-rate band, Q1–Q3 (I.4)' : 'Faixa de juro neutro do CEE, Q1–Q3 (I.4)', color: COR.sky, style: 'band' }],
          fontes: [fonte('focus_selic'), fonte('focus_inflacao_12m'), fonte('focus_anuais'), fonte('selic_efetiva'), fonte('ipca')],
          csv: [csvInd('indicadores/i1_juro_real_ex_ante.csv'), csvInd('indicadores/i2_juro_real_ex_post.csv'), csvInd('indicadores/i4_faixa_neutro.csv')],
          nota: en ? 'The neutral rate is unobservable and estimated with high uncertainty; it is always shown as a band, with method and date, never as a recommendation. BCB: quarterly averages four quarters ahead (MPR Sep/2026, p. 80), a different convention.'
            : 'O juro neutro não é observável e é estimado com elevada incerteza; aparece sempre como faixa, com método e data, nunca como recomendação. BCB: médias trimestrais quatro trimestres à frente (RPM set./2026, p. 80), convenção diferente.',
        }, lang),
        monta({
          id: 'opm-neutro-mercado', icone: 'git-compare', rotulo: 'I.4 (a) · (c)', inferida: true,
          titulo: en ? `Survey and market methods put the neutral rate at ${n2(Number(uf.a_focus_t4))}% and ${n2(Number(uf.c_ntnb_longa))}%` : `Métodos de pesquisa e de mercado situam o juro neutro em ${n2(Number(uf.a_focus_t4))}% e ${n2(Number(uf.c_ntnb_longa))}%`,
          subtitulo: subtitulo(lang, en ? '% a year, real' : '% ao ano, real', en ? 'monthly' : 'mensal', pts(f, 'periodo', 'a_focus_t4'), 'mes', en ? '(a) Focus t+4 and (c) long NTN-B net of term premium; (d) outside the band' : '(a) Focus t+4 e (c) NTN-B longa líquida do prêmio a termo; (d) fora da faixa'),
          eixo: en ? '% a year' : '% ao ano',
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
          id: 'opm-neutro-filtros', icone: 'git-compare', rotulo: 'I.4 (b)', inferida: true,
          titulo: en ? `Trend filters put the neutral rate at ${n2(Number(uf.b_hamilton))}% (Hamilton) and ${n2(Number(uf.b_hp_unilateral))}% (one-sided HP)` : `Filtros de tendência situam o juro neutro em ${n2(Number(uf.b_hamilton))}% (Hamilton) e ${n2(Number(uf.b_hp_unilateral))}% (HP unilateral)`,
          subtitulo: subtitulo(lang, en ? '% a year, real' : '% ao ano, real', en ? 'monthly, real time' : 'mensal, em tempo real', pts(f, 'periodo', 'b_hp_unilateral'), 'mes'),
          eixo: en ? '% a year' : '% ao ano',
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
          id: 'opm-hiato-juros', icone: 'move-vertical', rotulo: 'I.3', inferida: true,
          titulo: en ? `Interest-rate gap of ${n2(Number(uh.hiato_mediana))} p.p. against the median neutral rate` : `Hiato de juros de ${n2(Number(uh.hiato_mediana))} p.p. em relação à mediana do juro neutro`,
          subtitulo: subtitulo(lang, en ? 'Ex ante real rate minus the neutral-rate band, p.p.' : 'Juro real ex ante menos a faixa de juro neutro, p.p.', en ? 'monthly' : 'mensal', pts(h, 'periodo', 'hiato_mediana'), 'mes',
            uh.acima_q3 === '1' ? (en ? 'above the third quartile: unambiguously restrictive' : 'acima do 3º quartil: restritiva sem ambiguidade') : (en ? 'not above the third quartile' : 'não supera o 3º quartil')),
          eixo: 'p.p.',
          unidade: 'p.p.', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
          descricao: en ? 'Line: gap against the median; shaded area: gap against the band (Q1–Q3).' : 'Linha: hiato contra a mediana; área sombreada: hiato contra a faixa (Q1–Q3).',
          series: [{ id: 'hm', label: en ? 'Gap (median)' : 'Hiato (mediana)', endLabel: en ? 'Gap' : 'Hiato', color: COR.navy, width: 2.2, points: pts(h, 'periodo', 'hiato_mediana') }],
          bandas: [{ id: 'hb', label: en ? 'Gap (band)' : 'Hiato (faixa)', fill: COR.sky, lo: pts(h, 'periodo', 'hiato_q1'), hi: pts(h, 'periodo', 'hiato_q3') }],
          legenda: [{ id: 'hm', label: en ? 'Gap against the median' : 'Hiato contra a mediana', color: COR.navy, style: 'line' }, { id: 'hb', label: en ? 'Gap against Q1–Q3' : 'Hiato contra Q1–Q3', color: COR.sky, style: 'band' }],
          fontes: [fonte('focus_selic'), fonte('focus_inflacao_12m'), fonte('focus_anuais')], csv: [csvInd('indicadores/i3_hiato_juros.csv')],
        }, lang),
        (() => {
          const t = ler('opm/indicadores/i6_taylor.csv');
          const ut = t.at(-1)!;
          const par = ler('opm/indicadores/i6_taylor_t3_parametros.csv')[0]!;
          return monta({
            id: 'opm-taylor', icone: 'scale', rotulo: 'I.6', inferida: true, largo: true,
            titulo: (() => { const s0 = Number(ut.selic), a = Number(ut.envelope_min), b = Number(ut.envelope_max);
              const pos = s0 > b ? (en ? 'above' : 'acima do') : s0 < a ? (en ? 'below' : 'abaixo do') : (en ? 'within' : 'dentro do');
              return en ? `Selic of ${n2(s0)}% is ${pos} the Taylor-rule envelope (${n2(a)}–${n2(b)}%)` : `Selic de ${n2(s0)}% está ${pos} envelope das regras de Taylor (${n2(a)}–${n2(b)}%)`; })(),
            subtitulo: subtitulo(lang, en ? '% a year, nominal; rules T1–T3 over the neutral-rate and output-gap bands' : '% ao ano, nominal; regras T1–T3 sobre as faixas de juro neutro e de hiato', en ? 'monthly' : 'mensal', pts(t, 'periodo', 'selic'), 'mes'),
            eixo: en ? '% a year' : '% ao ano', marcas: true,
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
      const par = (id: string, arq: string, nome: string): { titulo: string; original: FichaOpm; ajustada: FichaOpm } => {
        const d = ler(`opm/dessaz/${arq}.csv`);
        const ud = d.at(-1)!;
        const g = (col: 'original' | 'ajustada') => monta({
          id: `opm-${id}-${col}`, icone: 'activity', rotulo: col === 'original' ? (en ? 'Original' : 'Original') : (en ? 'Seasonally adjusted by CEE (X-13)' : 'Dessazonalizado pelo CEE (X-13)'),
          titulo: col === 'original'
            ? (en ? `${nome}: ${n2(Number(ud.original))}% in ${rotMes(mes(ud.periodo!), lang)}, original series` : `${nome}: ${n2(Number(ud.original))}% em ${rotMes(mes(ud.periodo!), lang)}, série original`)
            : (en ? `${nome}: ${n2(Number(ud.ajustada))}% in ${rotMes(mes(ud.periodo!), lang)}, seasonally adjusted` : `${nome}: ${n2(Number(ud.ajustada))}% em ${rotMes(mes(ud.periodo!), lang)}, dessazonalizado`),
          subtitulo: subtitulo(lang, en ? '% month on month' : '% no mês', en ? 'monthly' : 'mensal', pts(d, 'periodo', col), 'mes', col === 'original' ? (en ? `seasonally adjusted: ${n2(Number(ud.ajustada))}%` : `dessazonalizado: ${n2(Number(ud.ajustada))}%`) : (en ? `original: ${n2(Number(ud.original))}%` : `original: ${n2(Number(ud.original))}%`)),
          eixo: '%',
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
            titulo: (() => { const x = Number(u.acumulada_12m); const pos = x > 4.5 ? (en ? 'above the 4.5% ceiling' : 'acima do teto de 4,5%') : x < 1.5 ? (en ? 'below the 1.5% floor' : 'abaixo do piso de 1,5%') : (en ? 'within the tolerance band' : 'dentro do intervalo de tolerância');
              return en ? `12-month IPCA at ${n2(x)}%, ${pos}; core average at ${n2(Number(un.media_12m))}%` : `IPCA em 12 meses de ${n2(x)}%, ${pos}; média dos núcleos em ${n2(Number(un.media_12m))}%`; })(),
            subtitulo: subtitulo(lang, en ? '% over 12 months; core average of EX0, EX3, MS, DP and P55' : '% em 12 meses; média dos núcleos EX0, EX3, MS, DP e P55', en ? 'monthly' : 'mensal', pts(ipca, 'periodo', 'acumulada_12m'), 'mes', en ? 'target 3.0% ± 1.5 p.p. since Jan 2025' : 'meta de 3,0% ± 1,5 p.p. desde jan/2025'),
            eixo: '%',
            unidade: en ? '% over 12 months' : '% em 12 meses', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true,
            descricao: en ? 'Lines: 12-month IPCA and core average. Shaded area: continuous-target tolerance band (1.5% to 4.5%), since January 2025.' : 'Linhas: IPCA e média dos núcleos em 12 meses. Área sombreada: intervalo de tolerância da meta contínua (1,5% a 4,5%), desde janeiro de 2025.',
            series: [
              { id: 'ipca', label: en ? 'IPCA, 12 months' : 'IPCA, 12 meses', color: COR.navy, width: 2.4, points: pts(ipca, 'periodo', 'acumulada_12m') },
              { id: 'nuc', label: en ? 'Core average, 12 months' : 'Média dos núcleos, 12 meses', endLabel: en ? 'Core' : 'Núcleos', color: COR.azure, dash: '6 3', width: 2, points: pts(nuc, 'periodo', 'media_12m') },
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
            titulo: ur.meses_consecutivos === '0'
              ? (en ? `12-month IPCA back inside the tolerance band in ${rotMes(mes(ur.periodo!), lang)}` : `IPCA em 12 meses de volta ao intervalo de tolerância em ${rotMes(mes(ur.periodo!), lang)}`)
              : (en ? `IPCA ${ur.lado === 'acima' ? 'above the ceiling' : 'below the floor'} for ${ur.meses_consecutivos} consecutive ${ur.meses_consecutivos === '1' ? 'month' : 'months'}; the target is missed at the sixth` : `IPCA ${ur.lado === 'acima' ? 'acima do teto' : 'abaixo do piso'} há ${ur.meses_consecutivos} ${ur.meses_consecutivos === '1' ? 'mês' : 'meses consecutivos'}; a meta é descumprida no sexto`),
            subtitulo: subtitulo(lang, en ? 'Consecutive months with 12-month IPCA outside 1.5%–4.5%' : 'Meses consecutivos com IPCA em 12 meses fora de 1,5%–4,5%', en ? 'monthly' : 'mensal', pts(r10, 'periodo', 'meses_consecutivos'), 'mes',
              en ? `latest: ${rotMes(mes(ur.periodo!), lang)}, IPCA ${n2(Number(ur.ipca12m))}%` : `último dado: ${rotMes(mes(ur.periodo!), lang)}, IPCA ${n2(Number(ur.ipca12m))}%`),
            eixo: en ? 'months' : 'meses',
            unidade: en ? 'consecutive months outside the band' : 'meses consecutivos fora do intervalo', xFormat: 'month', yDigits: 0, yUnit: en ? 'months' : 'meses', zero: true, ranges: false,
            descricao: en ? 'Bars: consecutive months with 12-month IPCA outside 1.5%–4.5%. Dashed line: six months (target missed).' : 'Barras: meses consecutivos com o IPCA em 12 meses fora de 1,5%–4,5%. Linha tracejada: seis meses (meta descumprida).',
            series: [{ id: 'c', label: en ? 'Consecutive months' : 'Meses consecutivos', endLabel: false, color: COR.navy, kind: 'bar', points: pts(r10, 'periodo', 'meses_consecutivos') }],
            colunasExtra: [{ titulo: en ? 'IPCA, 12 months (%)' : 'IPCA em 12 meses (%)', pontos: pts(r10, 'periodo', 'ipca12m') }],
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
              titulo: (() => { const k = q.length - 4; const ant = q[k]; const y = Number(uq.media_nucleos_saar); const ya = ant ? Number(ant.media_nucleos_saar) : y;
                const verbo = y < ya - 0.05 ? (en ? 'slow' : 'desaceleram') : y > ya + 0.05 ? (en ? 'speed up' : 'aceleram') : (en ? 'hold' : 'estabilizam');
                return en ? `Core measures ${verbo} to ${n1(y)}% annualised; headline IPCA at ${n1(Number(uq.ipca_saar))}%` : `Núcleos ${verbo} em ${n1(y)}% anualizados; IPCA cheio a ${n1(Number(uq.ipca_saar))}%`; })(),
              subtitulo: subtitulo(lang, en ? 'Three-month change, seasonally adjusted by CEE, annualised (SAAR)' : 'Variação de três meses dessazonalizada pelo CEE, anualizada (SAAR)', en ? 'monthly' : 'mensal', pts(q, 'periodo', 'ipca_saar'), 'mes'),
              eixo: en ? '% annualised' : '% anualizado',
              unidade: en ? '% annualised' : '% anualizado', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, defaultRange: '5a',
              descricao: en ? 'Lines: SAAR of the IPCA and of the core average, on series seasonally adjusted by CEE. Dashed line: 3.0% target.' : 'Linhas: SAAR do IPCA e da média dos núcleos, sobre séries dessazonalizadas pelo CEE. Tracejada: meta de 3,0%.',
              series: [
                { id: 'i', label: 'IPCA', color: COR.navy, width: 2.2, points: pts(q, 'periodo', 'ipca_saar') },
                { id: 'n', label: en ? 'Core average' : 'Média dos núcleos', endLabel: en ? 'Core' : 'Núcleos', color: COR.azure, dash: '6 3', points: pts(q, 'periodo', 'media_nucleos_saar') },
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
              titulo: en ? `${n1(Number(uq.parcela_acima_4_5))}% of the IPCA basket runs above 4.5% annualised` : `${n1(Number(uq.parcela_acima_4_5))}% da cesta do IPCA corre acima de 4,5% anualizados`,
              subtitulo: subtitulo(lang, en ? 'Weighted share of sub-items with seasonally adjusted three-month SAAR above 4.5%' : 'Parcela ponderada dos subitens com SAAR dessazonalizado de três meses acima de 4,5%', en ? 'monthly' : 'mensal', pts(q, 'periodo', 'parcela_acima_4_5'), 'mes',
                en ? `weight covered ${n1(Number(uq.peso_incluido))}%` : `peso coberto de ${n1(Number(uq.peso_incluido))}%`),
              eixo: '%',
              unidade: en ? '% of the IPCA weight covered' : '% do peso coberto do IPCA', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, ranges: false,
              descricao: en ? 'Weighted share of sub-items (SIDRA 7060) with three-month SAAR above 4.5%.' : 'Parcela ponderada dos subitens (SIDRA 7060) com SAAR de três meses acima de 4,5%.',
              series: [{ id: 'p', label: en ? 'Share above 4.5%' : 'Parcela acima de 4,5%', endLabel: en ? 'Share' : 'Parcela', color: COR.navy, width: 2.2, points: pts(q, 'periodo', 'parcela_acima_4_5') }],
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
          titulo: en ? `Credibility at the long horizon (t+3) stands at ${n2(Number(u.ic_t3))} on a 0–1 scale` : `Credibilidade no horizonte longo (t+3) em ${n2(Number(u.ic_t3))}, numa escala de 0 a 1`,
          subtitulo: subtitulo(lang, en ? 'Cecchetti–Krause index, δ = 1.5 p.p.; 1 = expectation at the target' : 'Índice de Cecchetti–Krause, δ = 1,5 p.p.; 1 = expectativa na meta', en ? 'monthly' : 'mensal', pts(c, 'periodo', 'ic_t3'), 'mes',
            en ? `12 months: ${n2(Number(u.ic_12m))}; t+1: ${n2(Number(u.ic_t1))}` : `12 meses: ${n2(Number(u.ic_12m))}; t+1: ${n2(Number(u.ic_t1))}`),
          eixo: en ? 'index' : 'índice',
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
          titulo: en ? `Long-horizon expectation ${n2(Number(u.desancoragem_t3_pp))} p.p. away from the 3.0% target` : `Expectativa de longo prazo a ${n2(Number(u.desancoragem_t3_pp))} p.p. da meta de 3,0%`,
          subtitulo: subtitulo(lang, en ? 'Focus median for t+3 minus the target, p.p.; standard deviation of responses' : 'Mediana Focus para t+3 menos a meta, p.p.; desvio-padrão das respostas', en ? 'monthly' : 'mensal', pts(c, 'periodo', 'desancoragem_t3_pp'), 'mes',
            en ? `median ${n2(Number(u.esperado_t3))}%` : `mediana de ${n2(Number(u.esperado_t3))}%`),
          eixo: 'p.p.',
          unidade: 'p.p.', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
          descricao: en ? 'Line: de-anchoring at t+3. Dashed line: standard deviation of responses at t+3 (dispersion).' : 'Linha: desancoragem em t+3. Tracejada: desvio-padrão das respostas em t+3 (dispersão).',
          colunasExtra: [{ titulo: en ? 'Focus median, t+3 (%)' : 'Mediana Focus, t+3 (%)', pontos: pts(c, 'periodo', 'esperado_t3') }],
          series: [
            { id: 'd', label: en ? 'De-anchoring (t+3)' : 'Desancoragem (t+3)', endLabel: en ? 'Gap to target' : 'Distância', color: COR.navy, width: 2.2, points: pts(c, 'periodo', 'desancoragem_t3_pp') },
            { id: 'dp', label: en ? 'Std. deviation (t+3)' : 'Desvio-padrão (t+3)', endLabel: en ? 'Std. dev.' : 'Desvio-padrão', color: COR.azure, dash: '6 3', points: pts(c, 'periodo', 'dp_t3') },
          ],
          legenda: [{ id: 'd', label: en ? 'Median minus target, t+3' : 'Mediana menos meta, t+3', color: COR.navy, style: 'line' }, { id: 'dp', label: en ? 'Standard deviation of responses, t+3' : 'Desvio-padrão das respostas, t+3', color: COR.azure, style: 'dash' }],
          fontes: [fonte('focus_anuais'), fonte('metas_inflacao')], csv: [csvInd('indicadores/i7_i8_credibilidade_desancoragem.csv')],
        }, lang),
        (() => {
          const b = ler('opm/indicadores/i12_inflacao_implicita.csv');
          const ub = b.at(-1)!;
          return monta({
            id: 'opm-implicita', icone: 'line-chart', rotulo: 'I.12', inferida: true, largo: true,
            titulo: en ? `Breakeven inflation of ${n2(Number(ub.implicita_2a))}% at two years in Tesouro Direto prices` : `Inflação implícita de ${n2(Number(ub.implicita_2a))}% em dois anos nos preços do Tesouro Direto`,
            subtitulo: subtitulo(lang, en ? '% a year; includes risk and liquidity premia — not an expectation' : '% ao ano; inclui prêmios de risco e de liquidez — não é expectativa', en ? 'month end' : 'fim de mês', pts(b, 'data', 'implicita_2a', (d) => dia(d)), 'dia'),
            eixo: en ? '% a year' : '% ao ano',
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
          titulo: en ? `Average lending rate at ${n1(Number(uj.valor))}% a year, with a ${n1(Number(us.valor))} p.p. spread` : `Taxa média do crédito em ${n1(Number(uj.valor))}% ao ano, com spread de ${n1(Number(us.valor))} p.p.`,
          subtitulo: subtitulo(lang, en ? '% a year (rates) and p.p. (spread)' : '% ao ano (taxas) e p.p. (spread)', en ? 'monthly' : 'mensal', pts(jc, 'periodo', 'valor'), 'mes'),
          eixo: en ? '% a year' : '% ao ano', marcas: true,
          unidade: en ? '% a year (rates) and p.p. (spread)' : '% ao ano (taxas) e p.p. (spread)', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
          descricao: en ? 'Three monthly series; the spread shares the axis in percentage points.' : 'Três séries mensais; o spread usa o mesmo eixo, em pontos percentuais.',
          series: [
            { id: 'j', label: en ? 'Average lending rate' : 'Taxa média do crédito', endLabel: en ? 'Lending' : 'Crédito', color: COR.navy, width: 2.2, points: pts(jc, 'periodo', 'valor') },
            { id: 's', label: 'Spread', color: COR.azure, dash: '6 3', points: pts(sp, 'periodo', 'valor') },
            { id: 'm', label: en ? 'Selic target' : 'Meta Selic', color: COR.steel, kind: 'step', markers: 'square', width: 1.4, points: pts(selic.filter((r) => r.periodo! >= '2011-03'), 'periodo', 'meta_selic') },
          ],
          legenda: [{ id: 'j', label: en ? 'Average lending rate (total)' : 'Taxa média do crédito (total)', color: COR.navy, style: 'line' }, { id: 's', label: en ? 'Average spread' : 'Spread médio', color: COR.azure, style: 'dash' }, { id: 'm', label: en ? 'Selic target' : 'Meta Selic', color: COR.steel, style: 'marker' }],
          fontes: [fonte('juros_credito'), fonte('spread_credito'), fonte('selic_meta')], csv: [csvSerie('juros_credito'), csvSerie('spread_credito'), csvSerie('juros_pj'), csvSerie('juros_pf_livres'), csvSerie('icc')],
          nota: en ? 'The pass-through of the Selic to lending rates (I.13) is in the table below. These series are shared with panel A4.' : 'O repasse da Selic ao crédito (I.13) está na tabela abaixo. Estas séries são compartilhadas com o painel A4.',
        }, lang),
        monta({
          id: 'opm-icbr', icone: 'wheat', rotulo: 'A2.5',
          titulo: en ? `Commodity Index – Brazil at ${n1(Number(ui.valor))}` : `Índice de Commodities – Brasil em ${n1(Number(ui.valor))}`,
          subtitulo: subtitulo(lang, en ? 'IC-Br, index in reais' : 'IC-Br, índice em reais', en ? 'monthly' : 'mensal', pts(ic, 'periodo', 'valor'), 'mes'),
          eixo: en ? 'index' : 'índice',
          unidade: en ? 'index' : 'índice', xFormat: 'month', yDigits: 1, yUnit: '',
          descricao: en ? 'Monthly index, in reais.' : 'Índice mensal, em reais.',
          series: [{ id: 'i', label: 'IC-Br', color: COR.navy, width: 2.2, points: pts(ic, 'periodo', 'valor') }],
          legenda: [{ id: 'i', label: 'IC-Br', color: COR.navy, style: 'line' }],
          fontes: [fonte('icbr')], csv: [csvSerie('icbr'), csvSerie('icbr_agro'), csvSerie('icbr_metal'), csvSerie('icbr_energia')],
        }, lang),
        monta({
          id: 'opm-ibcbr', icone: 'factory', rotulo: 'A2.5',
          titulo: en ? `IBC-Br activity index at ${n1(Number(ub.valor))}` : `Índice de atividade IBC-Br em ${n1(Number(ub.valor))}`,
          subtitulo: subtitulo(lang, en ? 'Index, seasonally adjusted by the BCB' : 'Índice, dessazonalizado pelo BCB', en ? 'monthly' : 'mensal', pts(ib, 'periodo', 'valor'), 'mes'),
          eixo: en ? 'index' : 'índice',
          unidade: en ? 'index, seasonally adjusted by the source' : 'índice, dessazonalizado pela fonte', xFormat: 'month', yDigits: 1, yUnit: '',
          descricao: en ? 'Monthly index. Seasonally adjusted by the BCB; not readjusted by CEE (ADR-023).' : 'Índice mensal. Dessazonalizado pelo BCB; o CEE não reajusta (ADR-023).',
          series: [{ id: 'b', label: 'IBC-Br', color: COR.navy, width: 2.2, points: pts(ib, 'periodo', 'valor') }],
          legenda: [{ id: 'b', label: 'IBC-Br', color: COR.navy, style: 'line' }],
          fontes: [fonte('ibcbr')], csv: [csvSerie('ibcbr')],
        }, lang),
        (() => {
          // I.16 (ADR-031): medida principal = prêmio pela Focus (taxa prefixada − Selic média esperada pela Focus).
          // O ACM só entra na figura se passar no critério de plausibilidade (analysis/opm/acm.py).
          const a = ler('opm/indicadores/i16_premio_termo_acm.csv').filter((r) => r.premio_focus_24m);
          const ua = a.at(-1)!;
          const dg = ler('opm/indicadores/i16_acm_diagnostico.csv')[0]!;
          const cr = ler('opm/indicadores/i16_criterio_plausibilidade.csv')[0]!;
          const ok = cr.plausivel === '1';
          const xm = (d: string) => mes(d.slice(0, 7));
          const series: SerieSpec[] = [
            { id: 'f24', label: en ? '24 months (Focus)' : '24 meses (Focus)', endLabel: '24m', color: COR.navy, width: 2.2, points: pts(a, 'data', 'premio_focus_24m', xm) },
            { id: 'f36', label: en ? '36 months (Focus)' : '36 meses (Focus)', endLabel: '36m', color: COR.azure, dash: '6 3', points: pts(a, 'data', 'premio_focus_36m', xm) },
            ...(ok ? [{ id: 'acm24', label: en ? '24 months (ACM)' : '24 meses (ACM)', endLabel: 'ACM', color: COR.steel, dash: '1.5 3', points: pts(a, 'data', 'premio_24m', xm) } as SerieSpec] : []),
          ];
          const p24 = Number(ua.premio_focus_24m);
          return monta({
            id: 'opm-premio-termo', icone: 'flask-conical', rotulo: 'I.16 · Experimental', largo: true, inferida: true,
            titulo: en ? `Fixed-rate curve ${p24 >= 0 ? 'above' : 'below'} the Focus Selic path by ${n2(Math.abs(p24))} p.p. at 24 months` : `Curva prefixada ${p24 >= 0 ? 'acima' : 'abaixo'} da trajetória Focus da Selic em ${n2(Math.abs(p24))} p.p. em 24 meses`,
            subtitulo: subtitulo(lang, en ? 'Inferred premium: NSS fixed-rate yield minus average Selic expected by Focus, p.p.' : 'Prêmio inferido: taxa prefixada NSS menos Selic média esperada pela Focus, p.p.', en ? 'month end' : 'fim de mês', pts(a, 'data', 'premio_focus_24m', (d) => dia(d)), 'dia',
              en ? `36 months: ${n2(Number(ua.premio_focus_36m))} p.p.` : `36 meses: ${n2(Number(ua.premio_focus_36m))} p.p.`),
            eixo: 'p.p.', experimental: true,
            unidade: en ? 'p.p. (yield minus expected average Selic)' : 'p.p. (taxa menos Selic média esperada)', xFormat: 'month', yDigits: 2, yUnit: 'p.p.', zero: true,
            descricao: en ? 'Month-end inferred term premium at 24 and 36 months, from the fixed-rate curve and the Focus Selic path.' : 'Prêmio a termo inferido de fim de mês em 24 e 36 meses, pela curva prefixada e pela trajetória Focus da Selic.',
            series,
            colunasExtra: [
              { titulo: en ? 'Expected average Selic, 24 months (Focus, %)' : 'Selic média esperada, 24 meses (Focus, %)', pontos: pts(a, 'data', 'selic_esperada_focus_24m', xm) },
              { titulo: en ? 'ACM premium, 24 months (p.p.)' : 'Prêmio ACM, 24 meses (p.p.)', pontos: pts(a, 'data', 'premio_24m', xm) },
            ],
            legenda: series.map((x, i) => ({ id: x.id, label: x.label, color: x.color, style: i ? 'dash' as const : 'line' as const })),
            fontes: [fonte('tesouro_direto'), fonte('focus_selic'), fonte('focus_anuais')],
            csv: [csvInd('indicadores/i16_premio_termo_acm.csv'), csvInd('indicadores/i16_selic_esperada_focus.csv'), csvInd('indicadores/i16_criterio_plausibilidade.csv'), csvInd('indicadores/i16_acm_diagnostico.csv')],
            nota: (en
              ? `EXPERIMENTAL (layer 3). Inferred, not observed: it also contains the Tesouro Direto spread and the Selic–DI gap, and Focus is a survey median, not a risk-neutral expectation. ACM (Adrian, Crump and Moench, 2013; 3 factors, fit error ${n1(Number(dg.erro_ajuste_bp))} bp) ${ok ? 'passes' : 'fails'} the plausibility criterion over the last ${cr.janela_meses} months: its risk-neutral rate differs from the Focus path by ${n2(Number(cr.dif_media_neutra_focus_24m_pp))} p.p. (24m) and ${n2(Number(cr.dif_media_neutra_focus_36m_pp))} p.p. (36m) on average (limit 1.0) and the sign agrees in ${n1(100 * Number(cr.concordancia_sinal_24m))}% of months (minimum 67%). ${ok ? '' : 'It is therefore kept out of the figure and published only in the CSV.'}`
              : `EXPERIMENTAL (camada 3). Inferido, não observado: contém também o spread do Tesouro Direto e a diferença Selic–DI, e a Focus é mediana de pesquisa, não expectativa neutra ao risco. O ACM (Adrian, Crump e Moench, 2013; 3 fatores, erro de ajuste de ${n1(Number(dg.erro_ajuste_bp))} bp) ${ok ? 'passa' : 'não passa'} no critério de plausibilidade nos últimos ${cr.janela_meses} meses: sua taxa neutra ao risco difere da trajetória Focus em ${n2(Number(cr.dif_media_neutra_focus_24m_pp))} p.p. (24m) e ${n2(Number(cr.dif_media_neutra_focus_36m_pp))} p.p. (36m) em média (limite 1,0) e o sinal coincide em ${n1(100 * Number(cr.concordancia_sinal_24m))}% dos meses (mínimo 67%). ${ok ? '' : 'Por isso fica fora da figura e é publicado só no CSV.'}`).trim(),
          }, lang);
        })(),
        (() => {
          const c = ler('opm/indicadores/i17_condicoes_financeiras.csv');
          const uc = c.at(-1)!;
          const cg = ler('opm/indicadores/i17_cargas.csv');
          return monta({
            id: 'opm-icf', icone: 'flask-conical', rotulo: en ? 'I.17 · Experimental' : 'I.17 · Experimental', largo: true,
            titulo: Number(uc.icf) > 0
              ? (en ? `Financial conditions ${n2(Number(uc.icf))} standard units tighter than the sample average` : `Condições financeiras ${n2(Number(uc.icf))} unidades padronizadas mais apertadas que a média`)
              : (en ? `Financial conditions ${n2(Math.abs(Number(uc.icf)))} standard units looser than the sample average` : `Condições financeiras ${n2(Math.abs(Number(uc.icf)))} unidades padronizadas mais folgadas que a média`),
            subtitulo: subtitulo(lang, en ? 'First principal component of seven variables; higher = tighter' : 'Primeiro componente principal de sete variáveis; maior = mais apertado', en ? 'monthly' : 'mensal', pts(c, 'periodo', 'icf'), 'mes'),
            eixo: en ? 'std. units' : 'unid. padr.', experimental: true,
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
            id: 'opm-hiato-produto', icone: 'gauge', rotulo: 'I.15', inferida: true, largo: true,
            titulo: en ? `Output gap between ${n1(Number(uh.minimo))}% and ${n1(Number(uh.maximo))}% in ${uh.trimestre}, depending on the method` : `Hiato do produto entre ${n1(Number(uh.minimo))}% e ${n1(Number(uh.maximo))}% em ${uh.trimestre}, conforme o método`,
            subtitulo: subtitulo(lang, en ? '% of potential output; BCB estimate 0.4% in Q3 2026 (MPR, p. 83)' : '% do produto potencial; BCB estima 0,4% no 3º tri de 2026 (RPM, p. 83)', en ? 'quarterly' : 'trimestral', pts(h, 'trimestre', 'hp_unilateral', tri), 'tri'),
            eixo: '%',
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
        // I.13 (ADR-031): β_h inclui as decisões seguintes do Copom; o repasse por p.p. de Selic é ρ_h = β_h/θ_h.
        const r = ler('opm/indicadores/i13_repasse_lp.csv');
        const rs = ler('opm/indicadores/i13_repasse_surpresa.csv');
        const nomes: Record<string, string> = en ? { total: 'Total', pj: 'Firms', pf_livres: 'Households (non-earmarked)' } : { total: 'Total', pj: 'Pessoas jurídicas', pf_livres: 'Pessoas físicas (livres)' };
        const L = (tab: Record<string, string>[], x: string, h: number) => tab.find((y) => y.serie === x && y.h === String(h))!;
        const ic = (v: string, a: string, b: string) => `${n2(Number(v))} [${n2(Number(a))}; ${n2(Number(b))}]`;
        const t12 = L(r, 'total', 12);
        return {
          id: 'opm-repasse',
          titulo: en ? `I.13 — Pass-through of the Selic to lending rates: ${n2(Number(t12.repasse_normalizado))} p.p. per p.p. of accumulated Selic after 12 months (total)` : `I.13 — Repasse da Selic ao custo do crédito: ${n2(Number(t12.repasse_normalizado))} p.p. por p.p. de Selic acumulada em 12 meses (total)`,
          descricao: en
            ? `Local projections. β_h: change in the lending rate h months after a 1 p.p. change in the Selic target in month t — it includes the Copom decisions that follow, since the Selic is persistent (after 12 months the Selic itself has moved ${n2(Number(t12.selic_acumulada))} p.p.; hence β₁₂ = ${n2(Number(t12.beta))} p.p. is not a pass-through of ${n2(Number(t12.beta))} per point). ρ_h = β_h/θ_h divides by the accumulated Selic change θ_h and is the pass-through per p.p. of Selic. Last columns: the shock is the Copom surprise against the Focus median of the day before (I.5), net of the anticipated change; few non-zero surprises, so wide intervals. 90% intervals (Newey-West; delta method for ρ). Conditional associations, not identified causal effects.`
            : `Projeções locais. β_h: variação da taxa do crédito h meses após uma mudança de 1 p.p. na meta Selic no mês t — inclui as decisões seguintes do Copom, porque a Selic é persistente (em 12 meses a própria Selic andou ${n2(Number(t12.selic_acumulada))} p.p.; por isso β₁₂ = ${n2(Number(t12.beta))} p.p. não é repasse de ${n2(Number(t12.beta))} por ponto). ρ_h = β_h/θ_h divide pela variação acumulada da Selic θ_h e é o repasse por p.p. de Selic. Últimas colunas: o choque é a surpresa do Copom em relação à mediana Focus da véspera (I.5), descontada a mudança antecipada; poucas surpresas não nulas, por isso intervalos largos. Intervalos de 90% (Newey-West; método delta para ρ). Associações condicionais, não efeitos causais identificados.`,
          colunas: [en ? 'Horizon (months)' : 'Horizonte (meses)', en ? 'β_h total (p.p.)' : 'β_h total (p.p.)', en ? 'θ_h Selic accumulated (p.p.)' : 'θ_h Selic acumulada (p.p.)',
            ...['total', 'pj', 'pf_livres'].map((x) => `ρ_h ${nomes[x]}`), en ? 'ρ_h total, Focus-surprise shock' : 'ρ_h total, choque = surpresa Focus'],
          linhas: Array.from({ length: 12 }, (_, k) => {
            const h = k + 1, t = L(r, 'total', h), u = L(rs, 'total', h);
            return [String(h), ic(t.beta!, t.ic90_inf!, t.ic90_sup!), n2(Number(t.selic_acumulada)),
              ...['total', 'pj', 'pf_livres'].map((x) => { const y = L(r, x, h); return ic(y.repasse_normalizado!, y.ic90_norm_inf!, y.ic90_norm_sup!); }),
              ic(u.repasse_normalizado!, u.ic90_norm_inf!, u.ic90_norm_sup!)];
          }),
          fontes: [fonte('juros_credito'), fonte('juros_pj'), fonte('juros_pf_livres'), fonte('selic_meta'), fonte('focus_selic')], csv: [csvInd('indicadores/i13_repasse_lp.csv'), csvInd('indicadores/i13_repasse_surpresa.csv')],
        };
      })()] };
    }
    case 'a2-6-externo-fiscal': {
      const ff = fimDeMes(ler('opm/fed_funds_sup.csv') as (Record<string, string> & { data: string })[]);
      const t10 = fimDeMes(ler('opm/ust10.csv') as (Record<string, string> & { data: string })[]);
      const tips = fimDeMes(ler('opm/tips5.csv') as (Record<string, string> & { data: string })[]);
      const br = fimDeMes(ler('opm/brent.csv') as (Record<string, string> & { data: string })[]);
      const prim = ler('panorama/primario.csv'), db = ler('panorama/dbgg.csv');
      const uf = ff.at(-1)!, ut = t10.at(-1)!, ubr = br.at(-1)!, up = prim.at(-1)!, ud = db.at(-1)!;
      const m = (r: Record<string, string>) => mes(r.data!.slice(0, 7));
      return { graficos: [
        monta({
          id: 'opm-eua', icone: 'globe', rotulo: 'A2.6', largo: true,
          titulo: en ? `Fed funds at ${n2(Number(uf.valor))}% and the 10-year Treasury at ${n2(Number(ut.valor))}%` : `Fed funds em ${n2(Number(uf.valor))}% e Treasury de 10 anos em ${n2(Number(ut.valor))}%`,
          subtitulo: subtitulo(lang, en ? '% a year; last observation of each month' : '% ao ano; última observação de cada mês', en ? 'daily' : 'diária', ff.map((r) => ({ x: dia(r.data), y: 1 })), 'dia'),
          eixo: en ? '% a year' : '% ao ano',
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
          titulo: en ? `Brent at US$ ${n2(Number(ubr.valor))} a barrel` : `Brent a US$ ${n2(Number(ubr.valor))} por barril`,
          subtitulo: subtitulo(lang, en ? 'US$ per barrel; last observation of each month' : 'US$ por barril; última observação de cada mês', en ? 'daily' : 'diária', br.map((r) => ({ x: dia(r.data), y: 1 })), 'dia'),
          eixo: en ? 'US$/barrel' : 'US$/barril',
          unidade: en ? 'US$ per barrel; last observation of each month' : 'US$ por barril; última observação de cada mês', xFormat: 'month', yDigits: 0, yUnit: 'US$',
          descricao: en ? 'Month-end spot price.' : 'Preço à vista de fim de mês.',
          series: [{ id: 'b', label: 'Brent', color: COR.navy, width: 2.2, points: br.map((r) => ({ x: m(r), y: Number(r.valor) })) }],
          legenda: [{ id: 'b', label: 'Brent', color: COR.navy, style: 'line' }],
          fontes: [fonte('brent')], csv: [csvSerie('brent')],
        }, lang),
        monta({
          id: 'opm-fiscal', icone: 'landmark', rotulo: 'A2.6',
          titulo: Number(up.superavit_primario_pib) < 0
            ? (en ? `Primary deficit of ${n2(-Number(up.superavit_primario_pib))}% of GDP; gross debt at ${n1(Number(ud.dbgg_pib))}%` : `Déficit primário de ${n2(-Number(up.superavit_primario_pib))}% do PIB; dívida bruta em ${n1(Number(ud.dbgg_pib))}%`)
            : (en ? `Primary surplus of ${n2(Number(up.superavit_primario_pib))}% of GDP; gross debt at ${n1(Number(ud.dbgg_pib))}%` : `Superávit primário de ${n2(Number(up.superavit_primario_pib))}% do PIB; dívida bruta em ${n1(Number(ud.dbgg_pib))}%`),
          subtitulo: subtitulo(lang, en ? '% of GDP, 12 months (+ = surplus); gross debt in the table' : '% do PIB, 12 meses (+ = superávit); dívida bruta na tabela', en ? 'monthly' : 'mensal', pts(prim, 'periodo', 'superavit_primario_pib'), 'mes'),
          eixo: en ? '% of GDP' : '% do PIB',
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
        (() => {
          const c = ler('opm/indicadores/a27_projecoes_copom.csv');
          const u = c.at(-1)!;
          const xd = (d: string) => dia(d);
          const hz = (h: string) => (/T\d$/.test(h) ? (en ? `Q${h.slice(-1)} ${h.slice(0, 4)}` : `${h.slice(-1)}º tri de ${h.slice(0, 4)}`) : h);
          return monta({
            id: 'opm-copom-focus-meta', icone: 'target', rotulo: 'A2.7', largo: true,
            titulo: en
              ? `Copom projects ${n1(Number(u.projecao_copom))}% for the relevant horizon (${hz(u.horizonte!)}); Focus expects ${n2(Number(u.focus_ipca_ano_horizonte))}% for ${u.ano_horizonte}, against the 3.0% target`
              : `Copom projeta ${n1(Number(u.projecao_copom))}% no horizonte relevante (${hz(u.horizonte!)}); Focus espera ${n2(Number(u.focus_ipca_ano_horizonte))}% para ${u.ano_horizonte}, ante a meta de 3,0%`,
            subtitulo: subtitulo(lang, en ? '% IPCA; Copom reference scenario at each meeting and Focus median before it' : '% IPCA; cenário de referência do Copom em cada reunião e mediana Focus da véspera', en ? 'by meeting' : 'por reunião', pts(c, 'data_reuniao', 'projecao_copom', xd), 'dia',
              en ? `${u.reuniao}th meeting` : `${u.reuniao}ª reunião`),
            eixo: '%', unidade: '%', xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, ranges: false,
            descricao: en ? 'Markers: Copom projection for the relevant horizon and Focus median for the horizon year, at each meeting since the 265th. Shaded: tolerance band.' : 'Marcadores: projeção do Copom para o horizonte relevante e mediana Focus para o ano do horizonte, em cada reunião desde a 265ª. Área: intervalo de tolerância.',
            series: [
              { id: 'copom', label: en ? 'Copom, relevant horizon' : 'Copom, horizonte relevante', endLabel: 'Copom', color: COR.navy, width: 2, kind: 'step', markers: 'circle', points: pts(c, 'data_reuniao', 'projecao_copom', xd) },
              { id: 'focus', label: en ? 'Focus, horizon year' : 'Focus, ano do horizonte', endLabel: 'Focus', color: COR.azure, dash: '6 3', kind: 'step', markers: 'square', points: pts(c, 'data_reuniao', 'focus_ipca_ano_horizonte', xd) },
            ],
            bandas: [{ id: 'tol', label: en ? 'Tolerance band' : 'Intervalo de tolerância', fill: COR.sky, lo: c.map((r) => ({ x: xd(r.data_reuniao!), y: 1.5 })), hi: c.map((r) => ({ x: xd(r.data_reuniao!), y: 4.5 })) }],
            refs: [{ y: 3, label: en ? 'Target 3.0%' : 'Meta 3,0%', dash: '2 3', color: COR.steel }],
            colunasExtra: [{ titulo: en ? 'Target (%)' : 'Meta (%)', pontos: pts(c, 'data_reuniao', 'meta', xd) }],
            legenda: [{ id: 'copom', label: en ? 'Copom projection, relevant horizon' : 'Projeção do Copom, horizonte relevante', color: COR.navy, style: 'marker' }, { id: 'focus', label: en ? 'Focus median, horizon year' : 'Mediana Focus, ano do horizonte', color: COR.azure, style: 'dash' }, { id: 'tol', label: en ? 'Tolerance band' : 'Intervalo de tolerância', color: COR.sky, style: 'band' }],
            fontes: [fonte('copom_comunicados'), fonte('focus_anuais'), fonte('metas_inflacao')], csv: [csvInd('indicadores/a27_projecoes_copom.csv')],
            nota: en
              ? 'Copom projection extracted from each statement (sentence “inflation projection for … current relevant horizon”), in the format used since the 265th meeting. Copom projects 12-month inflation up to the horizon quarter; Focus is the calendar-year median for that year, so the comparison is approximate. Copom uses the Focus Selic path in its reference scenario. The CEE semi-structural model does not pass the identification check (ADR-028) and is not shown here.'
              : 'Projeção do Copom extraída de cada comunicado (frase “projeção de inflação … atual horizonte relevante”), no formato usado desde a 265ª reunião. O Copom projeta a inflação em 12 meses até o trimestre do horizonte; a Focus é a mediana do ano-calendário, por isso a comparação é aproximada. O Copom usa a trajetória da Selic da Focus no cenário de referência. O modelo semiestrutural do CEE não passa no critério de identificação (ADR-028) e não aparece aqui.',
          }, lang);
        })(),
        monta({
          id: 'opm-focus-ipca', icone: 'line-chart', rotulo: 'A2.7', largo: true,
          titulo: en ? `Focus expects IPCA of ${n2(Number(v(anoAtual)?.mediana))}% in ${anoAtual} and ${n2(Number(v(anoAtual + 1)?.mediana))}% in ${anoAtual + 1}` : `Focus projeta IPCA de ${n2(Number(v(anoAtual)?.mediana))}% em ${anoAtual} e ${n2(Number(v(anoAtual + 1)?.mediana))}% em ${anoAtual + 1}`,
          subtitulo: subtitulo(lang, en ? '% in the calendar year; last survey of each month' : '% no ano-calendário; última coleta de cada mês', en ? 'monthly' : 'mensal', serieAno(anoAtual), 'mes', en ? `survey of ${rotDia(dia(ultima), lang)}` : `coleta de ${rotDia(dia(ultima), lang)}`),
          eixo: '%',
          unidade: en ? '% (IPCA in the calendar year); last survey of each month' : '% (IPCA no ano-calendário); última coleta de cada mês', xFormat: 'month', yDigits: 2, yUnit: '%', zero: true, defaultRange: '5a',
          descricao: en ? 'Each line is one reference year, from two years before it.' : 'Cada linha é um ano de referência, a partir de dois anos antes dele.',
          series: [anoAtual - 1, anoAtual, anoAtual + 1].filter((a) => anos.includes(a)).map((a, k) => ({ id: `y${a}`, label: String(a), color: [COR.steel, COR.navy, COR.azure][k]!, ...(k === 0 ? { markers: 'circle' as const, width: 1.4 } : k === 2 ? { dash: '6 3' } : { width: 2.4 }), points: serieAno(a) })),
          legenda: [anoAtual - 1, anoAtual, anoAtual + 1].map((a, k) => ({ id: `y${a}`, label: `IPCA ${a}`, color: [COR.steel, COR.navy, COR.azure][k]!, style: (['marker', 'line', 'dash'] as const)[k]! })),
          fontes: [fonte('focus_anuais')], csv: [csvSerie('focus_anuais')],
          nota: en ? 'Layer 1 only records and compares projections. Forecast errors of the BCB and of Focus will be computed once each outcome is known, from the vintages stored from this edition on (ADR-025). CEE scenarios (layer 3) will be conditional exercises, never CEE forecasts.'
            : 'A camada 1 só registra e compara projeções. Os erros de previsão do BCB e da Focus serão calculados quando cada dado for conhecido, a partir das safras guardadas desde esta edição (ADR-025). Os cenários do CEE (camada 3) serão exercícios condicionais, nunca previsões do CEE.',
        }, lang),
      ] };
    }
    case 'a2-8-moeda': {
      const a = ler('opm/indicadores/i18_agregados.csv');
      const c = ler('opm/indicadores/i19_multiplicador_coeficientes.csv');
      const v = ler('opm/indicadores/i20_velocidade_monetizacao.csv');
      const ua = a.at(-1)!, uc = c.at(-1)!, uv = v.at(-1)!;
      const par = (id: string, nome: string): { titulo: string; original: FichaOpm; ajustada: FichaOpm } => {
        const d = ler(`opm/dessaz/${id}.csv`);
        const mm = (col: 'original' | 'ajustada') => d.slice(1).map((r, k) => ({ x: mes(r.periodo!), y: Math.round(10000 * (Number(r[col]) / Number(d[k]![col]) - 1)) / 100 }));
        const g = (col: 'original' | 'ajustada') => {
          const p = mm(col); const up = p.at(-1)!;
          const rot = col === 'original' ? (en ? 'Original' : 'Original') : (en ? 'Seasonally adjusted by CEE (X-13)' : 'Dessazonalizado pelo CEE (X-13)');
          return monta({
            id: `opm-${id}-${col}`, icone: 'coins', rotulo: rot,
            titulo: en ? `${nome}: ${n2(up.y)}% in ${rotMes(up.x, lang)}, ${col === 'original' ? 'original series' : 'seasonally adjusted'}` : `${nome}: ${n2(up.y)}% em ${rotMes(up.x, lang)}, ${col === 'original' ? 'série original' : 'dessazonalizado'}`,
            subtitulo: subtitulo(lang, en ? '% month on month, end-of-period balance' : '% no mês, saldo de fim de período', en ? 'monthly' : 'mensal', p, 'mes'),
            eixo: '%',
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
            titulo: en ? `M1 ${Number(ua.m1_real_12m) >= 0 ? 'grows' : 'shrinks'} ${n1(Math.abs(Number(ua.m1_real_12m)))}% in real terms over 12 months; M2 ${n1(Number(ua.m2_real_12m))}%` : `M1 ${Number(ua.m1_real_12m) >= 0 ? 'cresce' : 'encolhe'} ${n1(Math.abs(Number(ua.m1_real_12m)))}% em termos reais em 12 meses; M2 ${n1(Number(ua.m2_real_12m))}%`,
            subtitulo: subtitulo(lang, en ? '% over 12 months, deflated by the IPCA' : '% em 12 meses, deflacionado pelo IPCA', en ? 'monthly' : 'mensal', pts(a, 'periodo', 'm1_real_12m'), 'mes'),
            eixo: '%',
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
            titulo: en ? `M1 multiplier at ${n2(Number(uc.multiplicador_m1))}` : `Multiplicador de M1 em ${n2(Number(uc.multiplicador_m1))}`,
            subtitulo: subtitulo(lang, en ? 'Ratios: m = M1/base; c = currency/demand deposits; r = reserves/demand deposits' : 'Razões: m = M1/base; c = PMPP/depósitos à vista; r = reservas/depósitos à vista', en ? 'monthly' : 'mensal', pts(c, 'periodo', 'multiplicador_m1'), 'mes'),
            eixo: en ? 'ratio' : 'razão',
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
            titulo: en ? `M2 equals ${n1(Number(uv.m2_pib_pct))}% of GDP; M1, ${n1(Number(uv.m1_pib_pct))}%` : `M2 equivale a ${n1(Number(uv.m2_pib_pct))}% do PIB; M1, a ${n1(Number(uv.m1_pib_pct))}%`,
            subtitulo: subtitulo(lang, en ? '% of 12-month nominal GDP (12-month average balance)' : '% do PIB nominal de 12 meses (saldo médio de 12 meses)', en ? 'monthly' : 'mensal', pts(v, 'periodo', 'm2_pib_pct'), 'mes'),
            eixo: en ? '% of GDP' : '% do PIB',
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

// ——— Faixa de indicadores-chave e mensagens-chave (ADR-029) ———
/** Origem verificável de um número exibido: arquivo em data/processed, coluna e linha (chave → valor). */
export interface Origem { arquivo: string; coluna: string; chave: string; valor: string; filtro?: Record<string, string> }
export interface Kpi {
  id: string; rotulo: string; valor: number; digitos: number; sufixo: string; anterior: number | null; deltaUnid: string;
  ref: string; serie: number[]; href: string; origem: Origem; origemAnterior: Origem | null;
}

export function kpisOpm(lang: Lang): Kpi[] {
  const en = lang === 'en';
  const mod = (m: string) => href(`${OPM_SLUG}${m}/`, lang);
  const ultimos = (xs: Record<string, string>[], col: string, n = 36) => xs.filter((r) => r[col]).slice(-n).map((r) => Number(r[col]));
  const kpi = (id: string, rotulo: string, arq: string, xs: Record<string, string>[], chaveCol: string, col: string, digitos: number, sufixo: string, deltaUnid: string, ref: (r: Record<string, string>) => string, m: string, passo = 1): Kpi => {
    const v = xs.filter((r) => r[col]);
    const u = v.at(-1)!, a = v.at(-1 - passo) ?? null;
    return {
      id, rotulo, valor: Number(u[col]), digitos, sufixo, anterior: a ? Number(a[col]) : null, deltaUnid, ref: ref(u), serie: ultimos(v, col), href: mod(m),
      origem: { arquivo: arq, coluna: col, chave: chaveCol, valor: u[chaveCol]! }, origemAnterior: a ? { arquivo: arq, coluna: col, chave: chaveCol, valor: a[chaveCol]! } : null,
    };
  };
  const i5 = ler('opm/indicadores/i5_surpresa.csv');
  const ipca = ler('conjuntura/ipca.csv');
  const nuc = ler('opm/indicadores/media_nucleos.csv');
  const saar = ler('opm/indicadores/i9_saar.csv');
  const i1 = ler('opm/indicadores/i1_juro_real_ex_ante.csv').filter((r) => r.trajetoria_completa === '1');
  const i1m = fimDeMes(i1 as (Record<string, string> & { data: string })[]);
  const f12 = ler('opm/focus_inflacao_12m.csv').filter((r) => r.suavizada === 'S');
  const f12m = fimDeMes(f12 as (Record<string, string> & { data: string })[]);
  const cred = ler('opm/indicadores/i7_i8_credibilidade_desancoragem.csv');
  const h3 = ler('opm/indicadores/i3_hiato_juros.csv');
  const rm = (r: Record<string, string>) => (en ? `latest: ${rotMes(mes(r.periodo!), lang)}` : `último dado: ${rotMes(mes(r.periodo!), lang)}`);
  const rd = (k: string) => (r: Record<string, string>) => (en ? `latest: ${rotDia(dia(r[k]!), lang)}` : `último dado: ${rotDia(dia(r[k]!), lang)}`);
  // Para séries diárias, a variação é contra o fim do mês anterior (a série do minigráfico é mensal).
  const comMensal = (k: Kpi, mensal: Record<string, string>[], col: string, arq: string, chave: string): Kpi => {
    const ant = mensal.filter((r) => r[chave]!.slice(0, 7) < k.origem.valor.slice(0, 7)).at(-1);
    return { ...k, serie: mensal.slice(-36).map((r) => Number(r[col])), anterior: ant ? Number(ant[col]) : null, origemAnterior: ant ? { arquivo: arq, coluna: col, chave, valor: ant[chave]! } : null };
  };
  const filtrado = (k: Kpi, filtro: Record<string, string>): Kpi => ({ ...k, origem: { ...k.origem, filtro }, origemAnterior: k.origemAnterior ? { ...k.origemAnterior, filtro } : null });
  return [
    kpi('selic', en ? 'Selic target' : 'Meta Selic', 'opm/indicadores/i5_surpresa.csv', i5, 'reuniao', 'meta_decidida', 2, '%', 'p.p.', (r) => (en ? `meeting ${r.reuniao}, ${rotDia(dia(r.data_reuniao!), lang)}` : `${r.reuniao}ª reunião, ${rotDia(dia(r.data_reuniao!), lang)}`), 'a2-1-copom'),
    kpi('ipca', en ? 'IPCA, 12 months' : 'IPCA em 12 meses', 'conjuntura/ipca.csv', ipca, 'periodo', 'acumulada_12m', 2, '%', 'p.p.', rm, 'a2-3-inflacao'),
    kpi('nucleos', en ? 'Core average, 12 months' : 'Média dos núcleos, 12 meses', 'opm/indicadores/media_nucleos.csv', nuc, 'periodo', 'media_12m', 2, '%', 'p.p.', rm, 'a2-3-inflacao'),
    kpi('saar', en ? 'Core average, SAAR 3m' : 'Núcleos, SAAR 3 meses', 'opm/indicadores/i9_saar.csv', saar, 'periodo', 'media_nucleos_saar', 2, '%', 'p.p.', rm, 'a2-3-inflacao'),
    comMensal(kpi('real', en ? 'Ex ante real rate' : 'Juro real ex ante', 'opm/indicadores/i1_juro_real_ex_ante.csv', i1, 'data', 'juro_real_ex_ante', 2, '%', 'p.p.', rd('data'), 'a2-2-juro-real'), i1m, 'juro_real_ex_ante', 'opm/indicadores/i1_juro_real_ex_ante.csv', 'data'),
    filtrado(comMensal(kpi('focus12', en ? 'Focus IPCA, 12 months ahead' : 'Focus IPCA, 12 meses à frente', 'opm/focus_inflacao_12m.csv', f12, 'data', 'mediana', 2, '%', 'p.p.', rd('data'), 'a2-4-expectativas'), f12m, 'mediana', 'opm/focus_inflacao_12m.csv', 'data'), { suavizada: 'S' }),
    kpi('cred', en ? 'Credibility, year t+3' : 'Credibilidade, ano t+3', 'opm/indicadores/i7_i8_credibilidade_desancoragem.csv', cred, 'periodo', 'ic_t3', 2, '', '', rm, 'a2-4-expectativas'),
    kpi('hiato', en ? 'Interest-rate gap (median)' : 'Hiato de juros (mediana)', 'opm/indicadores/i3_hiato_juros.csv', h3, 'periodo', 'hiato_mediana', 2, ' p.p.', 'p.p.', rm, 'a2-2-juro-real'),
  ];
}

export interface Mensagem { texto: string; href: string; origens: Origem[] }

/** Mensagens-chave (3–5), geradas dos dados; cada número tem origem declarada (testada em tests/opm-textos.test.ts). */
export function mensagensOpm(lang: Lang): Mensagem[] {
  const en = lang === 'en';
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const mod = (m: string) => href(`${OPM_SLUG}${m}/`, lang);
  const o = (arquivo: string, chave: string, valor: string, coluna: string): Origem => ({ arquivo, chave, valor, coluna });
  const i5 = ler('opm/indicadores/i5_surpresa.csv').at(-1)!;
  const r10 = ler('opm/indicadores/i10_regime_meta_continua.csv').at(-1)!;
  const nuc = ler('opm/indicadores/media_nucleos.csv').filter((r) => r.media_12m).at(-1)!;
  const sa = ler('opm/indicadores/i9_saar.csv').filter((r) => r.media_nucleos_saar).at(-1)!;
  const f = ler('opm/indicadores/i4_faixa_neutro.csv').filter((r) => r.mediana).at(-1)!;
  const c = ler('opm/indicadores/i7_i8_credibilidade_desancoragem.csv').at(-1)!;
  const S = Number(i5.surpresa_pp);
  const unan = i5.placar === 'Unanimidade';
  const r = Number(f.juro_real_ex_ante), q1 = Number(f.q1), q3 = Number(f.q3);
  const fora = Number(r10.meses_consecutivos);
  return [
    {
      texto: en
        ? `At its ${i5.reuniao}th meeting (${rotDia(dia(i5.data_reuniao!), lang)}), Copom set the Selic at ${n2(Number(i5.meta_decidida))}%${unan ? ', unanimously' : ''}; the Focus median expected ${n2(Number(i5.mediana_focus))}%${S === 0 ? ', so there was no surprise' : `, a surprise of ${S > 0 ? '+' : ''}${n2(S)} p.p`}.`
        : `Na ${i5.reuniao}ª reunião (${rotDia(dia(i5.data_reuniao!), lang)}), o Copom fixou a Selic em ${n2(Number(i5.meta_decidida))}%${unan ? ', por unanimidade' : ''}; a mediana Focus esperava ${n2(Number(i5.mediana_focus))}%${S === 0 ? ', sem surpresa' : `, uma surpresa de ${S > 0 ? '+' : ''}${n2(S)} p.p`}.`,
      href: mod('a2-1-copom'),
      origens: [o('opm/indicadores/i5_surpresa.csv', 'reuniao', i5.reuniao!, 'meta_decidida'), o('opm/indicadores/i5_surpresa.csv', 'reuniao', i5.reuniao!, 'mediana_focus'), o('opm/indicadores/i5_surpresa.csv', 'reuniao', i5.reuniao!, 'surpresa_pp')],
    },
    {
      texto: fora
        ? (en ? `12-month IPCA was ${n2(Number(r10.ipca12m))}% in ${rotMes(mes(r10.periodo!), lang)}, ${r10.lado === 'acima' ? 'above the 4.5% ceiling' : 'below the 1.5% floor'} for ${fora} consecutive ${fora === 1 ? 'month' : 'months'}; under the continuous target, the target is missed at the sixth.`
          : `O IPCA em 12 meses foi de ${n2(Number(r10.ipca12m))}% em ${rotMes(mes(r10.periodo!), lang)}, ${r10.lado === 'acima' ? 'acima do teto de 4,5%' : 'abaixo do piso de 1,5%'} há ${fora} ${fora === 1 ? 'mês' : 'meses consecutivos'}; na meta contínua, a meta é descumprida no sexto.`)
        : (en ? `12-month IPCA was ${n2(Number(r10.ipca12m))}% in ${rotMes(mes(r10.periodo!), lang)}, within the 1.5%–4.5% tolerance band.` : `O IPCA em 12 meses foi de ${n2(Number(r10.ipca12m))}% em ${rotMes(mes(r10.periodo!), lang)}, dentro do intervalo de 1,5% a 4,5%.`),
      href: mod('a2-3-inflacao'),
      origens: [o('opm/indicadores/i10_regime_meta_continua.csv', 'periodo', r10.periodo!, 'ipca12m'), o('opm/indicadores/i10_regime_meta_continua.csv', 'periodo', r10.periodo!, 'limite_superior'), o('opm/indicadores/i10_regime_meta_continua.csv', 'periodo', r10.periodo!, 'limite_inferior')],
    },
    {
      texto: en
        ? `Underlying inflation: the core average stands at ${n2(Number(nuc.media_12m))}% over 12 months (${rotMes(mes(nuc.periodo!), lang)}) and at ${n2(Number(sa.media_nucleos_saar))}% annualised over the last three months, seasonally adjusted.`
        : `Inflação subjacente: a média dos núcleos está em ${n2(Number(nuc.media_12m))}% em 12 meses (${rotMes(mes(nuc.periodo!), lang)}) e em ${n2(Number(sa.media_nucleos_saar))}% anualizados nos últimos três meses, com ajuste sazonal.`,
      href: mod('a2-3-inflacao'),
      origens: [o('opm/indicadores/media_nucleos.csv', 'periodo', nuc.periodo!, 'media_12m'), o('opm/indicadores/i9_saar.csv', 'periodo', sa.periodo!, 'media_nucleos_saar')],
    },
    {
      texto: en
        ? `The 12-month ex ante real rate (${n2(r)}%) is ${r > q3 ? 'above the third quartile of' : r < q1 ? 'below' : 'inside'} the CEE neutral-rate band (${n2(q1)}–${n2(q3)}%)${r > q3 ? ': restrictive by the OPM criterion' : ''}. The BCB uses 5.00% in its reference scenario.`
        : `O juro real ex ante de 12 meses (${n2(r)}%) está ${r > q3 ? 'acima do terceiro quartil da' : r < q1 ? 'abaixo da' : 'dentro da'} faixa de juro neutro do CEE (${n2(q1)}–${n2(q3)}%)${r > q3 ? ': restritivo pelo critério do OPM' : ''}. O BCB usa 5,00% no cenário de referência.`,
      href: mod('a2-2-juro-real'),
      origens: [o('opm/indicadores/i4_faixa_neutro.csv', 'periodo', f.periodo!, 'juro_real_ex_ante'), o('opm/indicadores/i4_faixa_neutro.csv', 'periodo', f.periodo!, 'q1'), o('opm/indicadores/i4_faixa_neutro.csv', 'periodo', f.periodo!, 'q3')],
    },
    {
      texto: en
        ? `Long-horizon expectations remain ${n2(Number(c.desancoragem_t3_pp))} p.p. above the 3.0% target (Focus median for t+3: ${n2(Number(c.esperado_t3))}%), with a credibility index of ${n2(Number(c.ic_t3))} on a 0–1 scale.`
        : `As expectativas de longo prazo seguem ${n2(Number(c.desancoragem_t3_pp))} p.p. acima da meta de 3,0% (mediana Focus para t+3: ${n2(Number(c.esperado_t3))}%), com índice de credibilidade de ${n2(Number(c.ic_t3))} numa escala de 0 a 1.`,
      href: mod('a2-4-expectativas'),
      origens: [o('opm/indicadores/i7_i8_credibilidade_desancoragem.csv', 'periodo', c.periodo!, 'desancoragem_t3_pp'), o('opm/indicadores/i7_i8_credibilidade_desancoragem.csv', 'periodo', c.periodo!, 'esperado_t3'), o('opm/indicadores/i7_i8_credibilidade_desancoragem.csv', 'periodo', c.periodo!, 'ic_t3'), o('opm/indicadores/i7_i8_credibilidade_desancoragem.csv', 'periodo', c.periodo!, 'meta_t3')],
    },
  ];
}
