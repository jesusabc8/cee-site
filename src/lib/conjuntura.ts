/**
 * Gráficos do painel de Conjuntura (A1). Todo texto com número é gerado a partir do dado
 * processado — nunca escrito à mão. Títulos são descritivos; afirmações só aparecem no
 * subtítulo quando são leitura direta do último dado (valor, data, intervalo).
 */
import { config } from '../config';
import { href } from '../i18n/routing';
import type { Lang } from '../i18n/ui';
import { dia, lerCsv, lerVintage, mes, type VintageSerie } from './dados';
import { renderVariantes, type Ponto } from './charts';

const PAINEL = 'conjuntura';
const k = (lang: Lang) => (lang === 'en' ? 'en' : 'pt');
const fmtMes = (lang: Lang) => (t: Date) =>
  new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(t);
const fmtDia = (lang: Lang) => (t: Date) =>
  new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(t);
const nf = (lang: Lang, d = 1) => new Intl.NumberFormat(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
const num = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));
const anosAtras = (ref: Date, n: number) => new Date(Date.UTC(ref.getUTCFullYear() - n, ref.getUTCMonth(), 1));

function fonte(v: VintageSerie) {
  return { instituicao: v.instituicao, codigo: v.codigo, extraido_em: v.extraido_em.slice(0, 10), url: v.url_publica, desatualizado: v.desatualizado };
}
const csvLink = (serie: string, rotulo: string) => ({ rotulo, href: href(`/dados/${PAINEL}/${serie}.csv`) });
const codigoUrl = `${config.repoUrl}/tree/main/scripts/data`;

export function graficosConjuntura(lang: Lang) {
  const L = k(lang);
  const vint = lerVintage(PAINEL);
  const fm = fmtMes(lang);
  const fd = fmtDia(lang);
  const n1 = nf(lang, 1);
  const n2 = nf(lang, 2);

  const ipca = lerCsv(PAINEL, 'ipca').map((r) => ({ t: mes(r.periodo!), mensal: num(r.variacao_mensal), a12: num(r.acumulada_12m) }));
  const selic = lerCsv(PAINEL, 'selic_meta').map((r) => ({ t: mes(r.periodo!), v: num(r.meta_selic), ref: r.data_referencia! }));
  const deso = lerCsv(PAINEL, 'desocupacao').map((r) => ({ t: mes(r.periodo_fim_trimestre!), v: num(r.taxa), cv: num(r.coef_variacao) }));
  const focus = lerCsv(PAINEL, 'focus_ipca').map((r) => ({ t: dia(r.data!), ano: Number(r.ano_referencia), v: num(r.mediana) }));

  const ultimo = <T extends { t: Date }>(a: T[]) => a.at(-1)!;
  const ref = ultimo(ipca).t;
  const periodosLongos = [
    { id: '10a', rotulo: L === 'en' ? '10 years' : '10 anos', desde: anosAtras(ref, 10) },
    { id: '5a', rotulo: L === 'en' ? '5 years' : '5 anos', desde: anosAtras(ref, 5) },
    { id: 'tudo', rotulo: L === 'en' ? 'Since 2012' : 'Desde 2012', desde: null },
  ];

  // 1. Inflação em 12 meses e meta Selic
  const uI = ultimo(ipca);
  const uS = ultimo(selic);
  const nomeIpca = L === 'en' ? 'IPCA, 12 months' : 'IPCA 12 meses';
  const nomeSelic = L === 'en' ? 'Selic target' : 'Meta Selic';
  const jurosInflacao = {
    id: 'grafico-juros-inflacao',
    titulo: L === 'en' ? '12-month consumer inflation and the Selic policy-rate target' : 'Inflação em 12 meses e meta da taxa Selic',
    subtitulo: L === 'en'
      ? `In ${fm(uI.t)}, 12-month IPCA inflation was ${n2.format(uI.a12!)}%. On ${fd(dia(uS.ref))}, the Selic target set by Copom was ${n2.format(uS.v!)}% a year.`
      : `Em ${fm(uI.t)}, o IPCA acumulado em 12 meses foi de ${n2.format(uI.a12!)}%. Em ${fd(dia(uS.ref))}, a meta Selic definida pelo Copom era de ${n2.format(uS.v!)}% ao ano.`,
    unidade: L === 'en' ? '% (IPCA: accumulated over 12 months; Selic: % a year, value at month end)' : '% (IPCA: acumulado em 12 meses; Selic: % ao ano, valor no fim do mês)',
    descricao: L === 'en'
      ? `Line chart with two monthly series since ${fm(ipca[0]!.t)}: 12-month IPCA inflation and the Selic target. Latest values: IPCA ${n2.format(uI.a12!)}% (${fm(uI.t)}); Selic ${n2.format(uS.v!)}% (${fd(dia(uS.ref))}). The full data are in the table below.`
      : `Gráfico de linhas com duas séries mensais desde ${fm(ipca[0]!.t)}: IPCA acumulado em 12 meses e meta Selic. Últimos valores: IPCA ${n2.format(uI.a12!)}% (${fm(uI.t)}); Selic ${n2.format(uS.v!)}% (${fd(dia(uS.ref))}). Os dados completos estão na tabela abaixo.`,
    series: [nomeIpca, nomeSelic],
    digitos: 2,
    variantes: renderVariantes({
      series: [
        { nome: nomeIpca, pontos: ipca.map((r) => ({ t: r.t, v: r.a12 })) },
        { nome: nomeSelic, pontos: selic.map((r) => ({ t: r.t, v: r.v })), tipo: 'degrau' },
      ],
      periodos: periodosLongos, lang, digitos: 2, rotuloData: fm, zeroNoEixo: true,
    }),
    fontes: [fonte(vint.ipca!), fonte(vint.selic_meta!)],
    csv: [csvLink('ipca', 'ipca.csv'), csvLink('selic_meta', 'selic_meta.csv')],
    codigoUrl,
    nota: L === 'en'
      ? 'The Selic target is a daily series; the chart shows the value in force on the last available day of each month. The two series are different concepts (past 12-month inflation and a nominal policy rate) and their difference is not a real interest rate.'
      : 'A meta Selic é uma série diária; o gráfico mostra o valor vigente no último dia disponível de cada mês. As duas séries são conceitos distintos (inflação passada em 12 meses e taxa nominal de política) e a diferença entre elas não é uma taxa de juros real.',
    tabela: {
      colunas: L === 'en' ? ['Month', 'IPCA 12m (%)', 'IPCA month (%)', 'Selic target (% a year)'] : ['Mês', 'IPCA 12m (%)', 'IPCA mês (%)', 'Meta Selic (% a.a.)'],
      linhas: [...ipca].reverse().map((r) => [fm(r.t), r.a12, r.mensal, selic.find((s) => s.t.getTime() === r.t.getTime())?.v ?? null]),
    },
  };

  // 2. IPCA mensal
  const ipcaMensal = {
    id: 'grafico-ipca-mensal',
    titulo: L === 'en' ? 'Monthly IPCA inflation' : 'Variação mensal do IPCA',
    subtitulo: L === 'en'
      ? `In ${fm(uI.t)}, monthly IPCA inflation was ${n2.format(uI.mensal!)}%.`
      : `Em ${fm(uI.t)}, a variação mensal do IPCA foi de ${n2.format(uI.mensal!)}%.`,
    unidade: L === 'en' ? '% change on previous month' : '% em relação ao mês anterior',
    descricao: L === 'en'
      ? `Bar chart of monthly IPCA inflation. Latest value: ${n2.format(uI.mensal!)}% in ${fm(uI.t)}.`
      : `Gráfico de barras da variação mensal do IPCA. Último valor: ${n2.format(uI.mensal!)}% em ${fm(uI.t)}.`,
    series: ['IPCA'],
    digitos: 2,
    variantes: renderVariantes({
      series: [{ nome: 'IPCA', pontos: ipca.map((r) => ({ t: r.t, v: r.mensal })), tipo: 'barra' }],
      periodos: [
        { id: '3a', rotulo: L === 'en' ? '3 years' : '3 anos', desde: anosAtras(ref, 3) },
        { id: '10a', rotulo: L === 'en' ? '10 years' : '10 anos', desde: anosAtras(ref, 10) },
      ],
      lang, digitos: 2, rotuloData: fm, zeroNoEixo: true, altura: 280,
    }),
    fontes: [fonte(vint.ipca!)],
    csv: [csvLink('ipca', 'ipca.csv')],
    codigoUrl,
    tabela: {
      colunas: L === 'en' ? ['Month', 'IPCA month (%)'] : ['Mês', 'IPCA mês (%)'],
      linhas: [...ipca].reverse().map((r) => [fm(r.t), r.mensal]),
    },
  };

  // 3. Desocupação com intervalo de confiança aproximado
  const uD = ultimo(deso);
  const ic = (v: number, cv: number) => [v * (1 - 1.96 * cv / 100), v * (1 + 1.96 * cv / 100)] as const;
  const [lo, hi] = ic(uD.v!, uD.cv!);
  const nomeDeso = L === 'en' ? 'Unemployment' : 'Desocupação';
  const desocupacao = {
    id: 'grafico-desocupacao',
    titulo: L === 'en' ? 'Unemployment rate (PNAD Contínua)' : 'Taxa de desocupação (PNAD Contínua)',
    subtitulo: L === 'en'
      ? `In the rolling quarter ending ${fm(uD.t)}, the unemployment rate was ${n1.format(uD.v!)}% (approximate 95% interval: ${n1.format(lo)}%–${n1.format(hi)}%).`
      : `No trimestre móvel encerrado em ${fm(uD.t)}, a taxa de desocupação foi de ${n1.format(uD.v!)}% (intervalo aproximado de 95%: ${n1.format(lo)}%–${n1.format(hi)}%).`,
    unidade: L === 'en' ? '% of the labour force aged 14+, rolling quarter, not seasonally adjusted' : '% da força de trabalho de 14 anos ou mais, trimestre móvel, sem ajuste sazonal',
    descricao: L === 'en'
      ? `Line chart of the unemployment rate since ${fm(deso[0]!.t)}, with a shaded approximate 95% interval. Latest value ${n1.format(uD.v!)}% (${fm(uD.t)}).`
      : `Gráfico de linha da taxa de desocupação desde ${fm(deso[0]!.t)}, com faixa sombreada do intervalo aproximado de 95%. Último valor ${n1.format(uD.v!)}% (${fm(uD.t)}).`,
    series: [nomeDeso],
    digitos: 1,
    variantes: renderVariantes({
      series: [{
        nome: nomeDeso,
        pontos: deso.map((r) => ({ t: r.t, v: r.v })),
        faixa: deso.filter((r) => r.v !== null && r.cv !== null).map((r) => { const [a, b] = ic(r.v!, r.cv!); return { t: r.t, lo: a, hi: b }; }),
      }],
      periodos: [periodosLongos[1]!, periodosLongos[2]!],
      lang, digitos: 1, rotuloData: fm, zeroNoEixo: true,
    }),
    fontes: [fonte(vint.desocupacao!)],
    csv: [csvLink('desocupacao', 'desocupacao.csv')],
    codigoUrl,
    nota: L === 'en'
      ? 'Shaded band: rate × (1 ± 1.96 × coefficient of variation), a normal approximation computed by CEE from the CV published by IBGE (variable 4103). The series has no seasonal adjustment: compare with the same rolling quarter of previous years.'
      : 'Faixa sombreada: taxa × (1 ± 1,96 × coeficiente de variação), aproximação normal calculada pelo CEE a partir do CV publicado pelo IBGE (variável 4103). A série não tem ajuste sazonal: compare com o mesmo trimestre móvel de anos anteriores.',
    tabela: {
      colunas: L === 'en' ? ['Quarter ending', 'Rate (%)', 'CV (%)'] : ['Trimestre encerrado em', 'Taxa (%)', 'CV (%)'],
      linhas: [...deso].reverse().map((r) => [fm(r.t), r.v, r.cv]),
    },
  };

  // 4. Expectativas Focus para o IPCA: ano corrente e dois seguintes, semanal (última observação da semana)
  const anoRef = ultimo(focus).t.getUTCFullYear();
  const anos = [anoRef, anoRef + 1, anoRef + 2];
  const inicioFocus = new Date(Date.UTC(anoRef - 1, 0, 1));
  const semana = (t: Date) => { const d = new Date(t); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
  const porAno = anos.map((ano) => {
    const m = new Map<string, Ponto>();
    for (const r of focus) if (r.ano === ano && r.t >= inicioFocus) m.set(semana(r.t), { t: r.t, v: r.v });
    return { ano, pontos: [...m.values()] };
  });
  const dataUlt = ultimo(focus).t;
  const ultimosFocus = anos.map((ano) => focus.filter((r) => r.ano === ano && r.t.getTime() === dataUlt.getTime()).at(-1)?.v ?? null);
  const focusChart = {
    id: 'grafico-focus-ipca',
    titulo: L === 'en' ? 'Market expectations for IPCA inflation (Focus survey)' : 'Expectativas de mercado para o IPCA (pesquisa Focus)',
    subtitulo: L === 'en'
      ? `In the survey of ${fd(dataUlt)}, the median expectation was ${anos.map((a, i) => `${n2.format(ultimosFocus[i]!)}% for ${a}`).join(', ')}.`
      : `Na pesquisa de ${fd(dataUlt)}, a mediana das expectativas era de ${anos.map((a, i) => `${n2.format(ultimosFocus[i]!)}% para ${a}`).join(', ')}.`,
    unidade: L === 'en' ? '% (expected IPCA change in the reference year), median' : '% (variação esperada do IPCA no ano de referência), mediana',
    descricao: L === 'en'
      ? `Line chart with the weekly median Focus expectation for IPCA in ${anos.join(', ')}, since ${fm(inicioFocus)}.`
      : `Gráfico de linhas com a mediana semanal das expectativas Focus para o IPCA de ${anos.join(', ')}, desde ${fm(inicioFocus)}.`,
    series: anos.map(String),
    digitos: 2,
    variantes: renderVariantes({
      series: porAno.map((s) => ({ nome: String(s.ano), pontos: s.pontos })),
      periodos: [{ id: 'todo', rotulo: '', desde: null }],
      lang, digitos: 2, rotuloData: fd,
    }),
    fontes: [fonte(vint.focus_ipca!)],
    csv: [csvLink('focus_ipca', 'focus_ipca.csv')],
    codigoUrl,
    nota: L === 'en'
      ? 'Statistics computed by the Central Bank with each institution\'s most recent forecast submitted in the 30 days before the calculation date (baseCalculo = 0). Weekly sampling: last observation of each week.'
      : 'Estatísticas calculadas pelo Banco Central com as expectativas mais recentes de cada instituição informadas nos 30 dias anteriores à data de cálculo (baseCalculo = 0). Amostragem semanal: última observação de cada semana.',
    tabela: {
      colunas: [L === 'en' ? 'Date' : 'Data', ...anos.map(String)],
      linhas: [...new Set(porAno.flatMap((s) => s.pontos.map((p) => p.t.getTime())))].sort((a, b) => b - a).map((t) => [
        fd(new Date(t)), ...porAno.map((s) => s.pontos.find((p) => p.t.getTime() === t)?.v ?? null),
      ]),
    },
  };

  return { jurosInflacao, ipcaMensal, desocupacao, focus: focusChart, vintage: vint };
}
