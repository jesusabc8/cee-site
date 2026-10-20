/**
 * Gráficos do painel de Conjuntura (A1), no mesmo renderizador e na mesma ficha do Panorama
 * (src/lib/viz/render.ts, ChartCard). Todo texto com número é gerado a partir do dado
 * processado — nunca escrito à mão.
 */
import type { Lang } from '../i18n/ui';
import { href } from '../i18n/routing';
import { lerCsv, lerVintage, type VintageSerie } from './dados';
import { COR, type Fonte, type Grafico } from './panorama';
import { fmtNum, fmtX } from './viz/render';

const PAINEL = 'conjuntura';
const num = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));
const mes = (p: string) => Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5, 7)) - 1, 1);
const dia = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
const fonte = (v: VintageSerie): Fonte => ({ instituicao: v.instituicao, codigo: v.codigo, extraido_em: v.extraido_em.slice(0, 10), url: v.url_publica, desatualizado: v.desatualizado });
const csvLink = (serie: string) => ({ rotulo: `${serie}.csv`, href: href(`/dados/${PAINEL}/${serie}.csv`) });

export function graficosConjuntura(lang: Lang) {
  const en = lang === 'en';
  const vint = lerVintage(PAINEL);
  const fm = (x: number) => fmtX(x, 'month', lang);
  const fd = (x: number) => fmtX(x, 'day', lang);
  const n1 = (v: number) => fmtNum(v, 1, lang);
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const RANGES = (lista: [string, number | null][]) => lista.map(([id, years]) => ({
    id, years, label: years === null ? (en ? 'All' : 'Tudo') : `${years} ${en ? 'yrs' : 'anos'}`,
  }));

  const ipca = lerCsv(PAINEL, 'ipca').map((r) => ({ x: mes(r.periodo!), mensal: num(r.variacao_mensal), a12: num(r.acumulada_12m) }));
  const selic = lerCsv(PAINEL, 'selic_meta').map((r) => ({ x: mes(r.periodo!), v: num(r.meta_selic), ref: r.data_referencia! }));
  const deso = lerCsv(PAINEL, 'desocupacao').map((r) => ({ x: mes(r.periodo_fim_trimestre!), v: num(r.taxa), cv: num(r.coef_variacao) }));
  const focus = lerCsv(PAINEL, 'focus_ipca').map((r) => ({ x: dia(r.data!), ano: Number(r.ano_referencia), v: num(r.mediana) }));

  // 1. Inflação em 12 meses e meta Selic
  const uI = ipca.at(-1)!;
  const uS = selic.at(-1)!;
  const jurosInflacao: Grafico = {
    id: 'grafico-juros-inflacao', bloco: 'precos', icone: 'percent', rotulo: en ? 'Prices and rates' : 'Preços e juros',
    titulo: en ? '12-month consumer inflation and the Selic policy-rate target' : 'Inflação em 12 meses e meta da taxa Selic',
    subtitulo: en
      ? `In ${fm(uI.x)}, 12-month IPCA inflation was ${n2(uI.a12!)}%. On ${fd(dia(uS.ref))}, the Selic target set by Copom was ${n2(uS.v!)}% a year.`
      : `Em ${fm(uI.x)}, o IPCA acumulado em 12 meses foi de ${n2(uI.a12!)}%. Em ${fd(dia(uS.ref))}, a meta Selic definida pelo Copom era de ${n2(uS.v!)}% ao ano.`,
    unidade: en ? '% (IPCA: accumulated over 12 months; Selic: % a year, value at month end)' : '% (IPCA: acumulado em 12 meses; Selic: % ao ano, valor no fim do mês)',
    descricao: en
      ? `Two monthly series since ${fm(ipca[0]!.x)}: 12-month IPCA inflation and the Selic target. The full data are in the table.`
      : `Duas séries mensais desde ${fm(ipca[0]!.x)}: IPCA acumulado em 12 meses e meta Selic. Os dados completos estão na tabela.`,
    largo: true,
    spec: {
      id: 'grafico-juros-inflacao', height: 340, xFormat: 'month', yDigits: 2, yUnit: '%', yTickSuffix: '%', zero: true, lang,
      ranges: RANGES([['5a', 5], ['10a', 10], ['tudo', null]]), defaultRange: '10a',
      series: [
        { id: 'selic', label: en ? 'Selic target' : 'Meta Selic', endLabel: 'Selic', color: COR.navy, kind: 'step', width: 2.2, points: selic.map((r) => ({ x: r.x, y: r.v })) },
        { id: 'ipca', label: en ? 'IPCA, 12 months' : 'IPCA 12 meses', endLabel: 'IPCA', color: COR.azure, width: 2.4, dash: '6 3', points: ipca.map((r) => ({ x: r.x, y: r.a12 })) },
      ],
    },
    legenda: [
      { id: 'ipca', label: en ? 'IPCA, 12 months' : 'IPCA acumulado em 12 meses', color: COR.azure, style: 'dash' },
      { id: 'selic', label: en ? 'Selic target (Copom)' : 'Meta Selic (Copom)', color: COR.navy, style: 'step' },
    ],
    fontes: [fonte(vint.ipca!), fonte(vint.selic_meta!)],
    csv: [csvLink('ipca'), csvLink('selic_meta')],
    nota: en
      ? 'The Selic target is a daily series; the chart shows the value in force on the last available day of each month. The two series are different concepts (past 12-month inflation and a nominal policy rate) and their difference is not a real interest rate.'
      : 'A meta Selic é uma série diária; o gráfico mostra o valor vigente no último dia disponível de cada mês. As duas séries são conceitos distintos (inflação passada em 12 meses e taxa nominal de política) e a diferença entre elas não é uma taxa de juros real.',
    tabela: {
      colunas: en ? ['Month', 'IPCA 12m (%)', 'IPCA month (%)', 'Selic target (% a year)'] : ['Mês', 'IPCA 12m (%)', 'IPCA mês (%)', 'Meta Selic (% a.a.)'],
      linhas: [...ipca].reverse().map((r) => [fm(r.x), r.a12, r.mensal, selic.find((s) => s.x === r.x)?.v ?? null]),
    },
  };

  // 2. IPCA mensal
  const ipcaMensal: Grafico = {
    id: 'grafico-ipca-mensal', bloco: 'precos', icone: 'chart-column-increasing', rotulo: 'IPCA',
    titulo: en ? 'Monthly IPCA inflation' : 'Variação mensal do IPCA',
    subtitulo: en ? `In ${fm(uI.x)}, monthly IPCA inflation was ${n2(uI.mensal!)}%.` : `Em ${fm(uI.x)}, a variação mensal do IPCA foi de ${n2(uI.mensal!)}%.`,
    unidade: en ? '% change on previous month' : '% em relação ao mês anterior',
    descricao: en ? `Bars of monthly IPCA inflation. Latest value: ${n2(uI.mensal!)}% in ${fm(uI.x)}.` : `Barras da variação mensal do IPCA. Último valor: ${n2(uI.mensal!)}% em ${fm(uI.x)}.`,
    spec: {
      id: 'grafico-ipca-mensal', height: 300, xFormat: 'month', yDigits: 2, yUnit: '%', yTickSuffix: '%', zero: true, lang,
      ranges: RANGES([['3a', 3], ['10a', 10]]), defaultRange: '3a',
      series: [{ id: 'mensal', label: en ? 'IPCA, month' : 'IPCA no mês', color: COR.steel, kind: 'bar', points: ipca.map((r) => ({ x: r.x, y: r.mensal })) }],
    },
    legenda: [{ id: 'mensal', label: en ? 'Monthly change' : 'Variação no mês', color: COR.steel, style: 'bar' }],
    fontes: [fonte(vint.ipca!)],
    csv: [csvLink('ipca')],
    tabela: { colunas: en ? ['Month', 'IPCA month (%)'] : ['Mês', 'IPCA mês (%)'], linhas: [...ipca].reverse().map((r) => [fm(r.x), r.mensal]) },
  };

  // 3. Desocupação com intervalo aproximado de 95%
  const uD = deso.at(-1)!;
  const ic = (v: number, cv: number) => [v * (1 - (1.96 * cv) / 100), v * (1 + (1.96 * cv) / 100)] as const;
  const [lo, hi] = ic(uD.v!, uD.cv!);
  const comIc = deso.filter((r) => r.v !== null && r.cv !== null);
  const desocupacao: Grafico = {
    id: 'grafico-desocupacao', bloco: 'atividade', icone: 'users', rotulo: 'PNAD Contínua',
    titulo: en ? 'Unemployment rate (PNAD Contínua)' : 'Taxa de desocupação (PNAD Contínua)',
    subtitulo: en
      ? `In the rolling quarter ending ${fm(uD.x)}, the unemployment rate was ${n1(uD.v!)}% (approximate 95% interval: ${n1(lo)}%–${n1(hi)}%).`
      : `No trimestre móvel encerrado em ${fm(uD.x)}, a taxa de desocupação foi de ${n1(uD.v!)}% (intervalo aproximado de 95%: ${n1(lo)}%–${n1(hi)}%).`,
    unidade: en ? '% of the labour force aged 14+, rolling quarter, not seasonally adjusted' : '% da força de trabalho de 14 anos ou mais, trimestre móvel, sem ajuste sazonal',
    descricao: en ? `Unemployment rate since ${fm(deso[0]!.x)}, with a shaded approximate 95% interval.` : `Taxa de desocupação desde ${fm(deso[0]!.x)}, com faixa sombreada do intervalo aproximado de 95%.`,
    spec: {
      id: 'grafico-desocupacao', height: 300, xFormat: 'month', yDigits: 1, yUnit: '%', yTickSuffix: '%', zero: true, lang,
      ranges: RANGES([['5a', 5], ['tudo', null]]), defaultRange: 'tudo',
      bands: [{ id: 'ic', label: '', fill: 'rgb(138 164 179 / 26%)', lo: comIc.map((r) => ({ x: r.x, y: ic(r.v!, r.cv!)[0] })), hi: comIc.map((r) => ({ x: r.x, y: ic(r.v!, r.cv!)[1] })) }],
      series: [{ id: 'deso', label: en ? 'Unemployment' : 'Desocupação', endLabel: en ? 'Rate' : 'Taxa', color: COR.navy, width: 2.4, points: deso.map((r) => ({ x: r.x, y: r.v })) }],
    },
    legenda: [
      { id: 'deso', label: en ? 'Unemployment rate' : 'Taxa de desocupação', color: COR.navy, style: 'line' },
      { id: 'ic', label: en ? 'Approximate 95% interval' : 'Intervalo aproximado de 95%', color: COR.slate, style: 'band' },
    ],
    fontes: [fonte(vint.desocupacao!)],
    csv: [csvLink('desocupacao')],
    nota: en
      ? 'Shaded band: rate × (1 ± 1.96 × coefficient of variation), a normal approximation computed by CEE from the CV published by IBGE (variable 4103). The series has no seasonal adjustment: compare with the same rolling quarter of previous years.'
      : 'Faixa sombreada: taxa × (1 ± 1,96 × coeficiente de variação), aproximação normal calculada pelo CEE a partir do CV publicado pelo IBGE (variável 4103). A série não tem ajuste sazonal: compare com o mesmo trimestre móvel de anos anteriores.',
    tabela: { colunas: en ? ['Quarter ending', 'Rate (%)', 'CV (%)'] : ['Trimestre encerrado em', 'Taxa (%)', 'CV (%)'], linhas: [...deso].reverse().map((r) => [fm(r.x), r.v, r.cv]) },
  };

  // 4. Focus IPCA: ano corrente e dois seguintes, amostragem semanal (última observação da semana)
  const dataUlt = focus.at(-1)!.x;
  const anoRef = new Date(dataUlt).getUTCFullYear();
  const anos = [anoRef, anoRef + 1, anoRef + 2];
  const inicio = Date.UTC(anoRef - 1, 0, 1);
  const semana = (x: number) => { const d = new Date(x); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.getTime(); };
  const porAno = anos.map((ano) => {
    const m = new Map<number, { x: number; y: number | null }>();
    for (const r of focus) if (r.ano === ano && r.x >= inicio) m.set(semana(r.x), { x: r.x, y: r.v });
    return { ano, pontos: [...m.values()] };
  });
  const ult = anos.map((ano) => focus.filter((r) => r.ano === ano && r.x === dataUlt).at(-1)?.v ?? null);
  const cores = [COR.navy, COR.azure, COR.steel];
  const traco = [undefined, '6 3', '2 3'];
  const focusG: Grafico = {
    id: 'grafico-focus-ipca', bloco: 'precos', icone: 'gauge', rotulo: 'Focus',
    titulo: en ? 'Market expectations for IPCA inflation (Focus survey)' : 'Expectativas de mercado para o IPCA (pesquisa Focus)',
    subtitulo: en
      ? `In the survey of ${fd(dataUlt)}, the median expectation was ${anos.map((a, i) => `${n2(ult[i]!)}% for ${a}`).join(', ')}.`
      : `Na pesquisa de ${fd(dataUlt)}, a mediana das expectativas era de ${anos.map((a, i) => `${n2(ult[i]!)}% para ${a}`).join(', ')}.`,
    unidade: en ? '% (expected IPCA change in the reference year), median' : '% (variação esperada do IPCA no ano de referência), mediana',
    descricao: en ? `Weekly median Focus expectation for IPCA in ${anos.join(', ')}, since ${fm(inicio)}.` : `Mediana semanal das expectativas Focus para o IPCA de ${anos.join(', ')}, desde ${fm(inicio)}.`,
    spec: {
      id: 'grafico-focus-ipca', height: 300, xFormat: 'day', yDigits: 2, yUnit: '%', yTickSuffix: '%', lang,
      series: porAno.map((s, i) => ({ id: `f${s.ano}`, label: String(s.ano), color: cores[i]!, width: i ? 2 : 2.4, ...(traco[i] ? { dash: traco[i] } : {}), points: s.pontos })),
    },
    legenda: porAno.map((s, i) => ({ id: `f${s.ano}`, label: String(s.ano), color: cores[i]!, style: i ? 'dash' as const : 'line' as const })),
    fontes: [fonte(vint.focus_ipca!)],
    csv: [csvLink('focus_ipca')],
    nota: en
      ? 'Statistics computed by the Central Bank with each institution\'s most recent forecast submitted in the 30 days before the calculation date (baseCalculo = 0). Weekly sampling: last observation of each week.'
      : 'Estatísticas calculadas pelo Banco Central com as expectativas mais recentes de cada instituição informadas nos 30 dias anteriores à data de cálculo (baseCalculo = 0). Amostragem semanal: última observação de cada semana.',
    tabela: {
      colunas: [en ? 'Date' : 'Data', ...anos.map(String)],
      linhas: [...new Set(porAno.flatMap((s) => s.pontos.map((p) => p.x)))].sort((a, b) => b - a).map((x) => [fd(x), ...porAno.map((s) => s.pontos.find((p) => p.x === x)?.y ?? null)]),
    },
  };

  return { jurosInflacao, ipcaMensal, desocupacao, focus: focusG, vintage: vint };
}
