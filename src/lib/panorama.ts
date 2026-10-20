/**
 * Painel "Panorama da economia brasileira" (página inicial e Observatório).
 * Lê data/processed no build e devolve, para cada gráfico, a especificação do renderizador
 * (src/lib/viz/render.ts) e os metadados da ficha: título, subtítulo gerado do dado, unidade,
 * descrição textual, fontes com data de extração, CSV, nota e tabela alternativa.
 * Nenhum número de texto é escrito à mão.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerCsvTexto } from '../../scripts/data/csv';
import type { ChartSpec, SerieSpec } from './viz/render';
import { fmtNum, fmtX } from './viz/render';
import { href } from '../i18n/routing';
import { config } from '../site.config';
import type { Lang } from '../i18n/ui';

const P = 'data/processed';
const ler = (painel: string, id: string) => lerCsvTexto(readFileSync(join(P, painel, `${id}.csv`), 'utf8'));
const lerJson = <T>(painel: string, id: string): T => JSON.parse(readFileSync(join(P, painel, `${id}.json`), 'utf8'));
const n = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));
const mes = (p: string) => Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5, 7)) - 1, 1);
const ano = (a: number) => Date.UTC(a, 6, 1);
const tri = (t: string) => Date.UTC(Number(t.slice(0, 4)), (Number(t.slice(6)) - 1) * 3 + 1, 15);

export const COR = { navy: '#0A2259', petrol: '#1D5FA6', azure: '#3C8DCB', steel: '#4A7C96', slate: '#8AA4B3', sky: '#C0E0F0' };

export interface Fonte { instituicao: string; codigo: string; extraido_em: string; url: string; desatualizado?: boolean }
export interface Legenda { id: string; label: string; color: string; style: 'line' | 'dash' | 'bar' | 'band' | 'step' | 'marker' }
export interface Grafico {
  id: string;
  bloco: 'atividade' | 'precos' | 'produtividade' | 'fiscal';
  icone: string;
  rotulo: string;
  titulo: string;
  subtitulo: string;
  unidade: string;
  descricao: string;
  largo?: boolean;
  /** Valor em destaque da ficha (gerado do dado). */
  destaque?: { valor: string; texto: string; secundaria: string; periodo: string };
  spec: ChartSpec & { ranges?: { id: string; label: string; years: number | null }[]; defaultRange?: string };
  legenda: Legenda[];
  fontes: Fonte[];
  csv: { rotulo: string; href: string }[];
  nota?: string;
  tabela: { colunas: string[]; linhas: (string | number | null)[][] };
}

type Vint = Record<string, { instituicao: string; codigo: string; extraido_em: string; url_publica: string; desatualizado: boolean }>;
const vint: Vint = {
  ...JSON.parse(readFileSync(join(P, 'conjuntura', 'vintage.json'), 'utf8')),
  ...JSON.parse(readFileSync(join(P, 'panorama', 'vintage.json'), 'utf8')),
};
const fonte = (id: string, codigo?: string): Fonte => ({
  instituicao: vint[id]!.instituicao, codigo: codigo ?? vint[id]!.codigo, extraido_em: vint[id]!.extraido_em.slice(0, 10), url: vint[id]!.url_publica, desatualizado: vint[id]!.desatualizado,
});
const csvLink = (painel: string, id: string) => ({ rotulo: `${id}.csv`, href: href(`/dados/${painel}/${id}.csv`) });

export function panorama(lang: Lang) {
  const en = lang === 'en';
  const nf = (v: number, d = 1) => fmtNum(v, d, lang);
  const fx = (x: number, f: 'month' | 'quarter' | 'year' | 'day') => fmtX(x, f, lang);
  const RANGES = (lista: [string, number | null][]) => lista.map(([id, years]) => ({
    id, years, label: years === null ? (en ? 'All' : 'Tudo') : `${years} ${en ? 'yrs' : 'anos'}`,
  }));
  const graficos: Grafico[] = [];

  // ——— 1. PIB ———
  {
    const pib = ler('panorama', 'pib');
    const u = pib.at(-1)!;
    const xU = tri(u.trimestre!);
    graficos.push({
      id: 'grafico-pib', bloco: 'atividade', icone: 'trending-up', rotulo: en ? 'GDP' : 'PIB',
      titulo: en ? 'Real GDP growth' : 'Crescimento do PIB real',
      subtitulo: en
        ? `In ${fx(xU, 'quarter')}, GDP grew ${nf(n(u.var_trimestral_sa)!)}% on the previous quarter (seasonally adjusted) and ${nf(n(u.var_interanual)!)}% year on year.`
        : `No ${fx(xU, 'quarter')}, o PIB cresceu ${nf(n(u.var_trimestral_sa)!)}% ante o trimestre anterior (com ajuste sazonal) e ${nf(n(u.var_interanual)!)}% ante o mesmo trimestre do ano anterior.`,
      unidade: en ? '% change' : 'variação %',
      descricao: en ? 'Quarterly bars: year-on-year growth. Line with markers: quarter-on-quarter growth, seasonally adjusted.' : 'Barras trimestrais: variação interanual. Linha com marcadores: variação contra o trimestre anterior, com ajuste sazonal.',
      spec: {
        id: 'grafico-pib', height: 300, xFormat: 'quarter', yDigits: 1, yUnit: '%', yTickSuffix: '%', zero: true, lang,
        ranges: RANGES([['5a', 5], ['10a', 10], ['tudo', null]]), defaultRange: '10a',
        series: [
          { id: 'yoy', label: en ? 'Year on year' : 'Interanual', color: COR.slate, kind: 'bar', endLabel: false, points: pib.map((r) => ({ x: tri(r.trimestre!), y: n(r.var_interanual) })) },
          { id: 'qoq', label: en ? 'Quarter on quarter (s.a.)' : 'Trimestral (dessaz.)', endLabel: en ? 'q/q' : 't/t', color: COR.navy, width: 2, markers: 'circle', points: pib.map((r) => ({ x: tri(r.trimestre!), y: n(r.var_trimestral_sa) })) },
        ],
      },
      legenda: [
        { id: 'yoy', label: en ? 'Year on year' : 'Interanual', color: COR.slate, style: 'bar' },
        { id: 'qoq', label: en ? 'Quarter on quarter, seasonally adjusted' : 'Contra o trimestre anterior, dessazonalizado', color: COR.navy, style: 'marker' },
      ],
      fontes: [fonte('pib')], csv: [csvLink('panorama', 'pib')],
      tabela: { colunas: [en ? 'Quarter' : 'Trimestre', en ? 'Year on year (%)' : 'Interanual (%)', en ? 'q/q s.a. (%)' : 't/t dessaz. (%)'], linhas: [...pib].reverse().map((r) => [fx(tri(r.trimestre!), 'quarter'), n(r.var_interanual), n(r.var_trimestral_sa)]) },
    });
  }

  // ——— 2. PIB per capita PPC (PWT) ———
  {
    const pc = ler('panorama', 'pwt_pib_pc');
    const nomes: Record<string, [string, string]> = { BRA: ['Brasil', 'Brazil'], CHN: ['China', 'China'], CHL: ['Chile', 'Chile'], MEX: ['México', 'Mexico'], ARG: ['Argentina', 'Argentina'], PER: ['Peru', 'Peru'] };
    const estilos: Record<string, Partial<SerieSpec>> = {
      BRA: { color: COR.navy, width: 2.6 },
      CHL: { color: COR.azure, width: 1.6, muted: true },
      CHN: { color: COR.steel, width: 1.6, muted: true, dash: '6 3' },
      MEX: { color: COR.slate, width: 1.6, muted: true },
      ARG: { color: COR.steel, width: 1.6, muted: true },
      PER: { color: COR.slate, width: 1.6, muted: true, dash: '2 3' },
    };
    const series: SerieSpec[] = Object.keys(nomes).map((p) => ({
      id: p, label: nomes[p]![en ? 1 : 0], color: '#000', ...estilos[p],
      points: pc.filter((r) => r.pais === p).map((r) => ({ x: ano(Number(r.ano)), y: n(r.pib_pc_ppc_usd2021) })),
    }) as SerieSpec);
    const v23 = (p: string) => n(pc.find((r) => r.pais === p && r.ano === '2023')?.pib_pc_ppc_usd2021);
    const ord = Object.keys(nomes).filter((p) => p !== 'BRA').sort((a, b) => (v23(b) ?? 0) - (v23(a) ?? 0));
    const artigo: Record<string, string> = { CHN: 'da', CHL: 'do', MEX: 'do', ARG: 'da', PER: 'do' };
    const acima = ord.filter((p) => v23(p)! > v23('BRA')!);
    const abaixo = ord.filter((p) => v23(p)! <= v23('BRA')!);
    const lista = (ps: string[], i: 0 | 1) => {
      const xs = ps.map((p) => (i ? nomes[p]![1] : `${artigo[p]} ${nomes[p]![0]}`));
      return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${i ? 'and' : 'e'} ${xs.at(-1)}` : xs.join('');
    };
    const mil = (v: number) => (en ? `US$${nf(v / 1000)}k` : `US$ ${nf(v / 1000)} mil`);
    graficos.push({
      id: 'grafico-pib-pc', bloco: 'atividade', icone: 'globe', rotulo: 'PWT 11.0',
      titulo: en ? 'GDP per capita at PPP, 1950–2023' : 'PIB per capita em PPC, 1950–2023',
      subtitulo: en
        ? `In 2023, Brazil's GDP per capita was ${mil(v23('BRA')!)} (2021 dollars at PPP): below ${lista(acima, 1)}${abaixo.length ? `, above ${lista(abaixo, 1)}` : ''}.`
        : `Em 2023, o PIB per capita do Brasil era de ${mil(v23('BRA')!)} (dólares de 2021 em PPC): abaixo ${lista(acima, 0)}${abaixo.length ? ` e acima ${lista(abaixo, 0)}` : ''}.`,
      unidade: en ? '2021 US$ at PPP per person (rgdpna / pop)' : 'US$ de 2021 em PPC por habitante (rgdpna / pop)',
      descricao: en ? 'Lines for Brazil (highlighted) and five comparators from 1950 to 2023.' : 'Linhas do Brasil (em destaque) e de cinco países de comparação, de 1950 a 2023.',
      spec: { id: 'grafico-pib-pc', height: 300, xFormat: 'year', yDigits: 0, yUnit: 'US$', yThousands: true, zero: true, lang, series },
      legenda: series.map((s) => ({ id: s.id, label: s.label, color: s.color, style: s.dash ? 'dash' : 'line' })),
      fontes: [fonte('pwt', 'PWT 11.0: rgdpna, pop')], csv: [csvLink('panorama', 'pwt_pib_pc')],
      nota: en
        ? 'rgdpna uses national growth rates and is designed for comparisons over time; Feenstra, Inklaar and Timmer (2015) recommend rgdpe/rgdpo for cross-country level comparisons. China starts in 1952 and Chile in 1951.'
        : 'rgdpna usa taxas de crescimento nacionais e é a medida indicada para comparações no tempo; para níveis entre países, Feenstra, Inklaar e Timmer (2015) recomendam rgdpe/rgdpo. China começa em 1952 e Chile em 1951.',
      tabela: { colunas: [en ? 'Year' : 'Ano', ...Object.keys(nomes).map((p) => nomes[p]![en ? 1 : 0])], linhas: [...new Set(pc.map((r) => r.ano!))].sort().reverse().map((a) => [a, ...Object.keys(nomes).map((p) => n(pc.find((r) => r.pais === p && r.ano === a)?.pib_pc_ppc_usd2021))]) },
    });
  }

  // ——— 3. IPCA × meta × Focus ———
  {
    const im = ler('panorama', 'ipca_meta');
    const obs = im.filter((r) => r.ipca_12m);
    const u = obs.at(-1)!;
    const proj = im.filter((r) => r.ipca_12m_focus && !r.ipca_12m);
    const dez = (a: number) => proj.find((r) => r.periodo === `${a}-12`);
    const anoU = Number(u.periodo!.slice(0, 4));
    const deriv = lerJson<{ ipca_meta: { data_focus_mensal: string } }>('panorama', 'derivados');
    const dataFocus = Date.parse(deriv.ipca_meta.data_focus_mensal);
    const v = n(u.ipca_12m)!;
    const sup = n(u.limite_superior)!;
    const inf = n(u.limite_inferior)!;
    const posicao = v > sup ? (en ? `above the upper limit of the tolerance interval (${nf(sup)}%)` : `acima do limite superior do intervalo de tolerância (${nf(sup)}%)`)
      : v < inf ? (en ? `below the lower limit (${nf(inf)}%)` : `abaixo do limite inferior (${nf(inf)}%)`)
      : (en ? `within the tolerance interval (${nf(inf)}%–${nf(sup)}%)` : `dentro do intervalo de tolerância (${nf(inf)}%–${nf(sup)}%)`);
    const projTxt = [anoU, anoU + 1].map((a) => dez(a)).filter(Boolean).map((r) => `${nf(n(r!.ipca_12m_focus)!, 2)}% ${en ? 'in Dec' : 'em dez.'} ${r!.periodo!.slice(0, 4)}`);
    graficos.push({
      id: 'grafico-ipca-meta', bloco: 'precos', icone: 'tag', rotulo: 'IPCA', largo: true,
      titulo: en ? 'IPCA inflation, target and market expectations' : 'IPCA, meta para a inflação e expectativas de mercado',
      subtitulo: en
        ? `In ${fx(mes(u.periodo!), 'month')}, 12-month IPCA inflation was ${nf(v, 2)}%, ${posicao}. On the Focus survey of ${fx(dataFocus, 'day')}, it would reach ${projTxt.join(' and ')}.`
        : `Em ${fx(mes(u.periodo!), 'month')}, o IPCA em 12 meses foi de ${nf(v, 2)}%, ${posicao}. Pela mediana do Focus de ${fx(dataFocus, 'day')}, chegaria a ${projTxt.join(' e a ')}.`,
      unidade: en ? '% change over 12 months (monthly data)' : 'variação % em 12 meses (dados mensais)',
      descricao: en ? 'Observed 12-month IPCA, inflation target, upper and lower tolerance limits and the path implied by the latest Focus monthly medians.' : 'IPCA em 12 meses observado, meta para a inflação, limites superior e inferior do intervalo de tolerância e trajetória implícita nas medianas mensais do Focus mais recente.',
      spec: {
        id: 'grafico-ipca-meta', height: 340, xFormat: 'month', yDigits: 2, yUnit: '%', yTickSuffix: '%', zero: true, lang,
        ranges: RANGES([['5a', 5], ['10a', 10], ['tudo', null]]), defaultRange: '10a',
        projection: { x0: mes(proj[0]!.periodo!), label: en ? 'Focus projection' : 'Projeção Focus' },
        bands: [{ id: 'banda', label: '', step: true, fill: 'rgb(138 164 179 / 16%)', lo: im.map((r) => ({ x: mes(r.periodo!), y: n(r.limite_inferior) })), hi: im.map((r) => ({ x: mes(r.periodo!), y: n(r.limite_superior) })) }],
        series: [
          { id: 'sup', label: en ? 'Upper limit' : 'Limite superior', color: COR.steel, kind: 'step', width: 1.2, dash: '5 4', endLabel: false, noTooltip: true, points: im.map((r) => ({ x: mes(r.periodo!), y: n(r.limite_superior) })) },
          { id: 'inf', label: en ? 'Lower limit' : 'Limite inferior', color: COR.steel, kind: 'step', width: 1.2, dash: '5 4', endLabel: false, noTooltip: true, points: im.map((r) => ({ x: mes(r.periodo!), y: n(r.limite_inferior) })) },
          { id: 'meta', label: en ? 'Target' : 'Meta', color: COR.navy, kind: 'step', width: 1.6, endLabel: en ? 'Target' : 'Meta', points: im.map((r) => ({ x: mes(r.periodo!), y: n(r.meta) })) },
          { id: 'focus', label: en ? 'Latest Focus' : 'Focus mais recente', endLabel: 'Focus', color: COR.azure, width: 2.4, dash: '6 3', points: im.map((r) => ({ x: mes(r.periodo!), y: n(r.ipca_12m_focus) })) },
          { id: 'ipca', label: en ? 'Observed IPCA' : 'IPCA ocorrido', endLabel: false, color: COR.petrol, width: 2.4, points: obs.map((r) => ({ x: mes(r.periodo!), y: n(r.ipca_12m) })) },
        ],
      },
      legenda: [
        { id: 'ipca', label: en ? 'Observed IPCA' : 'IPCA ocorrido', color: COR.petrol, style: 'line' },
        { id: 'focus', label: en ? 'Latest Focus (CEE calculation)' : 'Focus mais recente (cálculo do CEE)', color: COR.azure, style: 'dash' },
        { id: 'meta', label: en ? 'Inflation target' : 'Meta para a inflação', color: COR.navy, style: 'step' },
        { id: 'sup', label: en ? 'Tolerance interval' : 'Intervalo de tolerância', color: COR.steel, style: 'band' },
      ],
      fontes: [fonte('ipca'), fonte('metas_inflacao', 'BCB, histórico de metas (Resolução CMN nº 5.141/2024 desde 2025)'), fonte('focus_mensal_ipca')],
      csv: [csvLink('panorama', 'ipca_meta'), csvLink('panorama', 'focus_mensal_ipca')],
      nota: en
        ? 'Until 2024 the target referred to calendar-year inflation; since January 2025 it is continuous (12-month IPCA, checked monthly). Projected path: 12-month accumulation combining observed monthly IPCA and, for future months, the median of the latest Focus monthly expectations (CEE calculation; it approximates the BCB chart). Updated automatically every Monday after the Focus release.'
        : 'Até 2024 a meta se referia ao ano-calendário; desde jan/2025 é contínua (IPCA em 12 meses, verificada mês a mês). Trajetória projetada: acumulação de 12 meses que combina o IPCA mensal observado e, nos meses futuros, a mediana das expectativas mensais do Focus mais recente (cálculo do CEE, aproximação do gráfico do BCB). Atualizada automaticamente toda segunda-feira, após a divulgação do Focus.',
      tabela: { colunas: [en ? 'Month' : 'Mês', 'IPCA 12m (%)', 'Focus (%)', en ? 'Target (%)' : 'Meta (%)', en ? 'Lower (%)' : 'Limite inf. (%)', en ? 'Upper (%)' : 'Limite sup. (%)'], linhas: [...im].reverse().map((r) => [fx(mes(r.periodo!), 'month'), n(r.ipca_12m), r.ipca_12m ? null : n(r.ipca_12m_focus), n(r.meta), n(r.limite_inferior), n(r.limite_superior)]) },
    });
  }

  // ——— 4. Selic e juro real ———
  {
    const jr = ler('panorama', 'juro_real');
    const selic = ler('conjuntura', 'selic_meta');
    const u = jr.at(-1)!;
    graficos.push({
      id: 'grafico-juros', bloco: 'precos', icone: 'landmark', rotulo: 'Selic',
      titulo: en ? 'Selic target and ex-ante real interest rate' : 'Selic meta e juro real ex ante',
      subtitulo: en
        ? `On ${fx(Date.parse(u.data_selic!), 'day')}, the Selic target was ${nf(n(u.selic_meta)!, 2)}% a year; with Focus 12-month inflation expectations of ${nf(n(u.focus_ipca_12m)!, 2)}%, the ex-ante real rate was ${nf(n(u.juro_real_fisher)!, 2)}% (calculated).`
        : `Em ${fx(Date.parse(u.data_selic!), 'day')}, a Selic meta era de ${nf(n(u.selic_meta)!, 2)}% a.a.; com expectativa Focus de ${nf(n(u.focus_ipca_12m)!, 2)}% para os 12 meses seguintes, o juro real ex ante era de ${nf(n(u.juro_real_fisher)!, 2)}% (calculado).`,
      unidade: en ? '% a year' : '% ao ano',
      descricao: en ? 'Selic target at month end (step line) and ex-ante real interest rate computed with the Fisher equation.' : 'Selic meta no fim de cada mês (linha em degraus) e juro real ex ante calculado pela equação de Fisher.',
      spec: {
        id: 'grafico-juros', height: 300, xFormat: 'month', yDigits: 2, yUnit: '%', yTickSuffix: '%', zero: true, lang,
        ranges: RANGES([['3a', 3], ['5a', 5], ['10a', 10], ['tudo', null]]), defaultRange: '10a',
        series: [
          { id: 'selic', label: en ? 'Selic target' : 'Selic meta', endLabel: 'Selic', color: COR.navy, kind: 'step', width: 2.2, points: selic.map((r) => ({ x: mes(r.periodo!), y: n(r.meta_selic) })) },
          { id: 'real', label: en ? 'Ex-ante real rate' : 'Juro real ex ante', endLabel: en ? 'Real' : 'Real', color: COR.azure, width: 2.2, points: jr.map((r) => ({ x: mes(r.periodo!), y: n(r.juro_real_fisher) })) },
        ],
      },
      legenda: [
        { id: 'selic', label: en ? 'Selic target (Copom)' : 'Selic meta (Copom)', color: COR.navy, style: 'step' },
        { id: 'real', label: en ? 'Ex-ante real rate (calculated)' : 'Juro real ex ante (calculado)', color: COR.azure, style: 'line' },
      ],
      fontes: [fonte('selic_meta'), fonte('focus_12m_ipca')], csv: [csvLink('panorama', 'juro_real')],
      nota: en
        ? 'Ex-ante real rate (with the Selic target in force) = (1 + Selic) / (1 + Focus IPCA expectation for the next 12 months, smoothed median) − 1. The central-bank convention, Selic − expectation, is in the CSV; the gap between the two formulas grows with the level of rates. The BCB uses the 360-day DI swap as the nominal rate, so this is an approximation.'
        : 'Juro real ex ante (com a Selic meta vigente) = (1 + Selic) / (1 + expectativa Focus de IPCA para os 12 meses seguintes, mediana suavizada) − 1. A convenção de bancos centrais, Selic − expectativa, está no CSV; a diferença entre as duas fórmulas cresce com o nível das taxas. O BCB usa o swap DI 360 como taxa nominal; trata-se, portanto, de aproximação.',
      tabela: { colunas: [en ? 'Month' : 'Mês', 'Selic (%)', 'Focus 12m (%)', en ? 'Real, Fisher (%)' : 'Real, Fisher (%)', en ? 'Real, difference (%)' : 'Real, diferença (%)'], linhas: [...jr].reverse().map((r) => [fx(mes(r.periodo!), 'month'), n(r.selic_meta), n(r.focus_ipca_12m), n(r.juro_real_fisher), n(r.juro_real_simples)]) },
    });
  }

  // ——— 5. Câmbio ———
  {
    const pt = ler('panorama', 'ptax');
    const u = pt.at(-1)!;
    graficos.push({
      id: 'grafico-cambio', bloco: 'precos', icone: 'arrow-left-right', rotulo: 'PTAX',
      titulo: en ? 'Exchange rate, R$ per US$' : 'Taxa de câmbio, R$ por US$',
      subtitulo: en
        ? `On ${fx(Date.parse(u.data_ultimo!), 'day')}, the PTAX selling rate was R$ ${nf(n(u.fim_periodo)!, 4)} per dollar; the ${fx(mes(u.periodo!), 'month')} average so far is R$ ${nf(n(u.media_mensal)!, 4)}.`
        : `Em ${fx(Date.parse(u.data_ultimo!), 'day')}, a PTAX de venda era de R$ ${nf(n(u.fim_periodo)!, 4)} por dólar; a média de ${fx(mes(u.periodo!), 'month')} até agora é de R$ ${nf(n(u.media_mensal)!, 4)}.`,
      unidade: en ? 'R$/US$, monthly average of daily PTAX (selling)' : 'R$/US$, média mensal da PTAX diária (venda)',
      descricao: en ? 'Monthly average of the daily PTAX selling rate.' : 'Média mensal da taxa PTAX diária de venda.',
      spec: {
        id: 'grafico-cambio', height: 300, xFormat: 'month', yDigits: 2, yUnit: 'R$/US$', lang,
        ranges: RANGES([['3a', 3], ['5a', 5], ['10a', 10], ['tudo', null]]), defaultRange: '5a',
        series: [{ id: 'ptax', label: 'PTAX', endLabel: 'PTAX', color: COR.navy, width: 2.2, points: pt.map((r) => ({ x: mes(r.periodo!), y: n(r.media_mensal) })) }],
      },
      legenda: [{ id: 'ptax', label: en ? 'PTAX selling rate, monthly average' : 'PTAX venda, média mensal', color: COR.navy, style: 'line' }],
      fontes: [fonte('ptax')], csv: [csvLink('panorama', 'ptax')],
      nota: en ? 'The current month is partial (average of the days available on the extraction date).' : 'O mês corrente é parcial (média dos dias disponíveis na data de extração).',
      tabela: { colunas: [en ? 'Month' : 'Mês', en ? 'Average' : 'Média', en ? 'End of period' : 'Fim do período'], linhas: [...pt].reverse().map((r) => [fx(mes(r.periodo!), 'month'), n(r.media_mensal), n(r.fim_periodo)]) },
    });
  }

  // ——— 6. Produtividade do trabalho (WDR 2024) ———
  {
    const pr = ler('panorama', 'pwt_produtividade');
    const v = (p: string, a: string) => n(pr.find((r) => r.pais === p && r.ano === a)?.produtividade_rel_eua);
    graficos.push({
      id: 'grafico-produtividade', bloco: 'produtividade', icone: 'hard-hat', rotulo: 'WDR 2024',
      titulo: en ? 'Labour productivity relative to the United States' : 'Produtividade do trabalho relativa aos EUA',
      destaque: {
        valor: `${nf(v('BRA', '2023')!)}%`,
        texto: en ? 'of a US worker (Brazil)' : 'de um trabalhador dos EUA (Brasil)',
        secundaria: `${en ? 'South Korea' : 'Coreia do Sul'}: ${nf(v('KOR', '2023')!)}%`,
        periodo: '2023',
      },
      subtitulo: en
        ? `GDP per person engaged relative to the United States. In 1980 the positions were reversed: Brazil ${nf(v('BRA', '1980')!)}%, South Korea ${nf(v('KOR', '1980')!)}%.`
        : `PIB por pessoa ocupada relativo aos EUA. Em 1980 as posições eram inversas: Brasil ${nf(v('BRA', '1980')!)}%, Coreia do Sul ${nf(v('KOR', '1980')!)}%.`,
      unidade: en ? '% of US level, (rgdpna / emp)' : '% do nível dos EUA, (rgdpna / emp)',
      descricao: en ? 'Brazil and South Korea, 1950 (Korea 1953) to 2023.' : 'Brasil e Coreia do Sul, de 1950 (Coreia: 1953) a 2023.',
      spec: {
        id: 'grafico-produtividade', height: 300, xFormat: 'year', yDigits: 1, yUnit: '%', yTickSuffix: '%', zero: true, lang,
        refs: [{ y: 100, label: en ? 'United States = 100' : 'EUA = 100', color: COR.slate }],
        series: [
          { id: 'KOR', label: en ? 'South Korea' : 'Coreia do Sul', endLabel: en ? 'Korea' : 'Coreia', color: COR.azure, width: 2.2, dash: '7 3', points: pr.filter((r) => r.pais === 'KOR').map((r) => ({ x: ano(Number(r.ano)), y: n(r.produtividade_rel_eua) })) },
          { id: 'BRA', label: en ? 'Brazil' : 'Brasil', color: COR.navy, width: 2.6, points: pr.filter((r) => r.pais === 'BRA').map((r) => ({ x: ano(Number(r.ano)), y: n(r.produtividade_rel_eua) })) },
        ],
        yMax: 100,
      },
      legenda: [
        { id: 'BRA', label: en ? 'Brazil' : 'Brasil', color: COR.navy, style: 'line' },
        { id: 'KOR', label: en ? 'South Korea' : 'Coreia do Sul', color: COR.azure, style: 'dash' },
      ],
      fontes: [fonte('pwt', 'PWT 11.0: rgdpna, emp; definição: Banco Mundial, WDR 2024 (Figura O.7)')], csv: [csvLink('panorama', 'pwt_produtividade')],
      nota: en ? 'Relative productivity = (rgdpna/emp)_country ÷ (rgdpna/emp)_US × 100, replicating Figure O.7 of the World Development Report 2024. emp = persons engaged.' : 'Produtividade relativa = (rgdpna/emp)_país ÷ (rgdpna/emp)_EUA × 100, replicando a Figura O.7 do World Development Report 2024. emp = pessoas ocupadas (persons engaged).',
      tabela: { colunas: [en ? 'Year' : 'Ano', en ? 'Brazil (%)' : 'Brasil (%)', en ? 'South Korea (%)' : 'Coreia do Sul (%)'], linhas: [...new Set(pr.map((r) => r.ano!))].sort().reverse().map((a) => [a, v('BRA', a), v('KOR', a)]) },
    });
  }

  // ——— 7. Proximidade à fronteira ———
  {
    const cv = ler('panorama', 'pwt_convergencia');
    const u = cv.find((r) => r.ano === '2023')!;
    graficos.push({
      id: 'grafico-convergencia', bloco: 'produtividade', icone: 'move-up-right', rotulo: 'WDR 2024',
      titulo: en ? 'Proximity to the frontier' : 'Proximidade à fronteira',
      destaque: {
        valor: `${nf(n(u.proximidade_fronteira_mercado)!)}%`,
        texto: en ? 'of US GDP per capita (Brazil)' : 'do PIB per capita dos EUA (Brasil)',
        secundaria: en ? 'At market exchange rates (no PPP adjustment)' : 'A taxas de câmbio de mercado (sem ajuste por PPC)',
        periodo: '2023',
      },
      subtitulo: en
        ? `At purchasing power parity (rgdpna), Brazil's relative GDP per capita was ${nf(n(u.pib_pc_rel_ppc_rgdpna)!)}% in 2023. The gap between the two lines reflects the price level relative to the US.`
        : `Em paridade de poder de compra (rgdpna), o PIB per capita relativo do Brasil era de ${nf(n(u.pib_pc_rel_ppc_rgdpna)!)}% em 2023. A distância entre as linhas reflete o nível de preços relativo aos EUA.`,
      unidade: en ? '% of US GDP per capita' : '% do PIB per capita dos EUA',
      descricao: en ? 'Brazil, 1950 to 2023: GDP per capita relative to the United States at market exchange rates and at PPP.' : 'Brasil, de 1950 a 2023: PIB per capita relativo aos EUA a câmbio de mercado e em PPC.',
      spec: {
        id: 'grafico-convergencia', height: 300, xFormat: 'year', yDigits: 1, yUnit: '%', yTickSuffix: '%', zero: true, lang,
        series: [
          { id: 'ppc', label: en ? 'At PPP (rgdpna)' : 'Em PPC (rgdpna)', endLabel: en ? 'PPP' : 'PPC', color: COR.azure, width: 2.2, dash: '7 3', points: cv.map((r) => ({ x: ano(Number(r.ano)), y: n(r.pib_pc_rel_ppc_rgdpna) })) },
          { id: 'mercado', label: en ? 'At market exchange rates' : 'A câmbio de mercado', endLabel: en ? 'Market' : 'Mercado', color: COR.navy, width: 2.6, points: cv.map((r) => ({ x: ano(Number(r.ano)), y: n(r.proximidade_fronteira_mercado) })) },
        ],
      },
      legenda: [
        { id: 'mercado', label: en ? 'Proximity to the frontier (market exchange rates)' : 'Proximidade à fronteira (câmbio de mercado)', color: COR.navy, style: 'line' },
        { id: 'ppc', label: en ? 'Relative GDP per capita at PPP' : 'PIB per capita relativo em PPC', color: COR.azure, style: 'dash' },
      ],
      fontes: [fonte('pwt', 'PWT 11.0: cgdpo, pl_gdpo, pop, rgdpna; definição: WDR 2024')], csv: [csvLink('panorama', 'pwt_convergencia')],
      nota: en
        ? 'Proximity = (cgdpo × pl_gdpo / pop)_Brazil ÷ (cgdpo × pl_gdpo / pop)_US × 100: cgdpo is GDP at PPP and pl_gdpo the PPP/exchange-rate ratio, so the product is GDP at market exchange rates (WDR 2024 glossary). The scale constant cancels out.'
        : 'Proximidade = (cgdpo × pl_gdpo / pop)_Brasil ÷ (cgdpo × pl_gdpo / pop)_EUA × 100: cgdpo é o PIB em PPC e pl_gdpo a razão PPC/câmbio, de modo que o produto é o PIB a câmbio de mercado (glossário do WDR 2024). A constante de escala se cancela.',
      tabela: { colunas: [en ? 'Year' : 'Ano', en ? 'Market (%)' : 'Mercado (%)', en ? 'PPP (%)' : 'PPC (%)'], linhas: [...cv].reverse().map((r) => [r.ano!, n(r.proximidade_fronteira_mercado), n(r.pib_pc_rel_ppc_rgdpna)]) },
    });
  }

  // ——— 8. Dívida pública + Focus ———
  {
    const dv = ler('panorama', 'divida');
    const obs = dv.filter((r) => r.tipo === 'observado');
    const fo = dv.filter((r) => r.tipo !== 'observado');
    const u = obs.at(-1)!;
    const dataF = fo[0]?.tipo?.replace('focus ', '') ?? '';
    const liga = (k: 'dbgg_pib' | 'dlsp_pib') => [{ x: mes(u.periodo!), y: n(u[k]) }, ...fo.map((r) => ({ x: mes(r.periodo!), y: n(r[k]) }))];
    const f27 = fo.find((r) => r.periodo!.startsWith(String(Number(u.periodo!.slice(0, 4)) + 1)));
    graficos.push({
      id: 'grafico-divida', bloco: 'fiscal', icone: 'building-2', rotulo: en ? 'Debt' : 'Dívida',
      titulo: en ? 'Public debt and Focus projections' : 'Dívida pública e projeções do Focus',
      subtitulo: en
        ? `In ${fx(mes(u.periodo!), 'month')}, general government gross debt (DBGG) was ${nf(n(u.dbgg_pib)!)}% of GDP and public sector net debt (DLSP) ${nf(n(u.dlsp_pib)!)}%. The Focus survey of ${fx(Date.parse(dataF), 'day')} projects ${nf(n(f27?.dbgg_pib)!)}% and ${nf(n(f27?.dlsp_pib)!)}% for the end of ${f27?.periodo?.slice(0, 4)}.`
        : `Em ${fx(mes(u.periodo!), 'month')}, a dívida bruta do governo geral (DBGG) era de ${nf(n(u.dbgg_pib)!)}% do PIB e a dívida líquida do setor público (DLSP), de ${nf(n(u.dlsp_pib)!)}%. O Focus de ${fx(Date.parse(dataF), 'day')} projeta ${nf(n(f27?.dbgg_pib)!)}% e ${nf(n(f27?.dlsp_pib)!)}% para o fim de ${f27?.periodo?.slice(0, 4)}.`,
      unidade: en ? '% of GDP' : '% do PIB',
      descricao: en ? 'Monthly DBGG and DLSP since 2012 and Focus medians for the end of each year (dashed, with markers).' : 'DBGG e DLSP mensais desde 2012 e medianas Focus para o fim de cada ano (tracejado, com marcadores).',
      spec: {
        id: 'grafico-divida', height: 300, xFormat: 'month', yDigits: 1, yUnit: '%', yTickSuffix: '%', lang,
        projection: { x0: mes(u.periodo!), label: en ? 'Focus' : 'Focus' },
        series: [
          { id: 'dbgg_f', label: en ? 'DBGG, Focus' : 'DBGG, Focus', color: COR.navy, width: 2, dash: '5 3', markers: 'diamond', endLabel: false, points: liga('dbgg_pib') },
          { id: 'dlsp_f', label: en ? 'DLSP, Focus' : 'DLSP, Focus', color: COR.azure, width: 2, dash: '5 3', markers: 'diamond', endLabel: false, points: liga('dlsp_pib') },
          { id: 'dbgg', label: 'DBGG', color: COR.navy, width: 2.4, endLabel: false, points: obs.map((r) => ({ x: mes(r.periodo!), y: n(r.dbgg_pib) })) },
          { id: 'dlsp', label: 'DLSP', color: COR.azure, width: 2.4, endLabel: false, points: obs.map((r) => ({ x: mes(r.periodo!), y: n(r.dlsp_pib) })) },
        ],
      },
      legenda: [
        { id: 'dbgg', label: en ? 'Gross debt, general government (DBGG)' : 'Dívida bruta do governo geral (DBGG)', color: COR.navy, style: 'line' },
        { id: 'dlsp', label: en ? 'Net debt, public sector (DLSP)' : 'Dívida líquida do setor público (DLSP)', color: COR.azure, style: 'line' },
        { id: 'dbgg_f', label: en ? 'Focus median, end of year' : 'Mediana Focus, fim de ano', color: COR.steel, style: 'marker' },
      ],
      fontes: [fonte('dbgg'), fonte('dlsp'), fonte('focus_anual', 'Focus anual: Dívida bruta do governo geral; Dívida líquida do setor público')],
      csv: [csvLink('panorama', 'divida')],
      tabela: { colunas: [en ? 'Period' : 'Período', 'DBGG (%)', 'DLSP (%)', en ? 'Type' : 'Tipo'], linhas: [...dv].reverse().map((r) => [fx(mes(r.periodo!), 'month'), n(r.dbgg_pib), n(r.dlsp_pib), r.tipo === 'observado' ? (en ? 'observed' : 'observado') : 'Focus']) },
    });
  }

  const estab = lerJson<Estabilizacao>('panorama', 'estabilizacao');
  return { graficos, estabilizacao: estab, fonteEstab: [fonte('dbgg'), fonte('primario'), fonte('focus_anual'), fonte('focus_ipca')], repo: config.repoUrl };
}

export interface Estabilizacao {
  formula: string; d: number; d_periodo: string; r: number; g: number; s_estrela: number;
  horizonte: { ano: number; selic: number; ipca: number; juro_real: number; pib: number }[];
  data_focus: string; primario_atual: number; primario_periodo: string;
  matriz: { r: number[]; g: number[]; valores: number[][] };
}

/** Indicadores "Brasil em números". */
export interface Indicador {
  id: string; grupo: 'atividade' | 'precos' | 'externo' | 'fiscal' | 'trabalho'; icone: string; titulo: string;
  valor: number | null; unidade: string; descricao: string; referencia: string; tipo_ref: string; variacao: string;
  spark: number[]; ancora: string | null; calculado?: boolean;
  fonte: string; serie: string; extraido_em: string; url: string; desatualizado: boolean;
}
export const indicadores = (): Indicador[] => lerJson<Indicador[]>('panorama', 'indicadores');
export const serieHero = () => ler('conjuntura', 'ipca').map((r) => ({ x: mes(r.periodo!), y: n(r.acumulada_12m) }));
