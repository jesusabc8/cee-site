/**
 * Módulo A2.3 do OPM — inflação ampliada e regional (ADR-030). Lê data/processed/opm/indicadores/ (derive-inflacao.ts)
 * no build. Todo número de título e subtítulo vem do dado e aparece na tabela da ficha (tests/opm-textos.test.ts).
 * Não existe IPCA por unidade da federação: as áreas são 10 regiões metropolitanas e 6 capitais.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';
import { lerCsvTexto } from '../../scripts/data/csv.ts';
import { CAPITAIS } from '../../scripts/data/opm/areas.ts';
import { COR } from './panorama';
import { csvInd, csvSerie, fonte, monta, rotMes, subtitulo, type FichaOpm, type Tabela } from './opm';
import { fmtNum, type Ponto } from './viz/render';
import { barrasH, mapaSimbolos, multiplos, type Lado } from './viz/estaticos';

const ler = (rel: string) => lerCsvTexto(readFileSync(join('data/processed', rel), 'utf8'));
const mes = (p: string) => Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5, 7)) - 1, 1);
const pts = (xs: Record<string, string>[], ky: string): Ponto[] => xs.filter((r) => r[ky] !== '' && r[ky] !== undefined).map((r) => ({ x: mes(r.periodo!), y: Number(r[ky]) }));
const ultimo = (xs: Record<string, string>[], ky: string) => [...xs].reverse().find((r) => r[ky] !== '' && r[ky] !== undefined)!;
const IND = 'opm/indicadores';
const BH = '3101';
/** Tabela alternativa com os últimos n períodos (a série completa está no CSV da ficha), para manter a página leve. */
function recorta(g: FichaOpm, lang: Lang, n = 24): FichaOpm {
  if (g.tabela.linhas.length <= n) return g;
  const aviso = lang === 'en' ? `Data table: last ${n} months; full series in the CSV.` : `Tabela de dados: últimos ${n} meses; série completa no CSV.`;
  return { ...g, tabela: { ...g.tabela, linhas: g.tabela.linhas.slice(0, n) }, nota: g.nota ? `${g.nota} ${aviso}` : aviso };
}
const ordinalEn = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

// ——— Outras medidas de preços ———
export function inflacaoAmpliada(lang: Lang): { graficos: FichaOpm[]; tabelas: Tabela[] } {
  const en = lang === 'en';
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const n1 = (v: number) => fmtNum(v, 1, lang);
  const md = ler(`${IND}/inflacao_medidas.csv`);
  const cl = ler(`${IND}/inflacao_classificacoes.csv`);
  const mm = en ? 'monthly' : 'mensal';
  const u12 = en ? '% over 12 months' : '% em 12 meses';
  const desde = (xs: Record<string, string>[], p: string) => xs.filter((r) => r.periodo! >= p);

  // 1. Consumidor: IPCA, IPCA-15 e INPC.
  const comum = [...md].reverse().find((r) => r.ipca_12m && r.ipca15_12m && r.inpc_12m)!;
  const consumidor = monta({
    id: 'opm-medidas-consumidor', icone: 'percent', rotulo: 'A2.3', largo: true,
    titulo: en
      ? `In ${rotMes(mes(comum.periodo!), lang)}, 12-month INPC at ${n2(Number(comum.inpc_12m))}% and IPCA\u201115 at ${n2(Number(comum.ipca15_12m))}%, against ${n2(Number(comum.ipca_12m))}% for the IPCA`
      : `INPC em 12 meses de ${n2(Number(comum.inpc_12m))}% e IPCA\u201115 de ${n2(Number(comum.ipca15_12m))}%, ante ${n2(Number(comum.ipca_12m))}% do IPCA (${rotMes(mes(comum.periodo!), lang)})`,
    subtitulo: subtitulo(lang, u12, mm, pts(md, 'ipca_12m'), 'mes', en ? 'INPC: households earning 1 to 5 minimum wages; IPCA\u201115: collection from the 16th to the 15th' : 'INPC: famílias com renda de 1 a 5 salários mínimos; IPCA\u201115: coleta do dia 16 ao dia 15'),
    eixo: '%', unidade: u12, xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
    descricao: en ? 'Lines: 12-month change of the IPCA, IPCA-15 and INPC (IBGE).' : 'Linhas: variação em 12 meses do IPCA, do IPCA-15 e do INPC (IBGE).',
    series: [
      { id: 'ipca', label: 'IPCA', color: COR.navy, width: 2.4, points: pts(md, 'ipca_12m') },
      { id: 'ipca15', label: 'IPCA-15', color: COR.azure, dash: '6 3', width: 1.8, points: pts(md, 'ipca15_12m') },
      { id: 'inpc', label: 'INPC', color: COR.steel, dash: '1.5 3', width: 1.8, points: pts(md, 'inpc_12m') },
    ],
    refs: [{ y: 3, label: en ? 'Target 3.0%' : 'Meta 3,0%', dash: '2 3', color: COR.steel }],
    legenda: [{ id: 'ipca', label: 'IPCA', color: COR.navy, style: 'line' }, { id: 'ipca15', label: 'IPCA-15', color: COR.azure, style: 'dash' }, { id: 'inpc', label: 'INPC', color: COR.steel, style: 'dash' }],
    fontes: [fonte('ipca'), fonte('ipca15'), fonte('inpc')], csv: [csvInd('indicadores/inflacao_medidas.csv'), csvSerie('ipca15'), csvSerie('inpc')],
    nota: en ? 'The inflation target refers to the IPCA only; IPCA-15 and INPC are shown for comparison. Same methodology and basket structure (POF 2017–2018), different reference period (IPCA-15) and income range (INPC). The IGP-M, IGP-DI and IPC-S (FGV/IBRE) and the IPC-Fipe are excluded: no verified redistribution licence (ADR-030).'
      : 'A meta de inflação refere-se apenas ao IPCA; IPCA-15 e INPC aparecem para comparação. Mesma metodologia e estrutura de pesos (POF 2017–2018), com período de coleta (IPCA-15) e faixa de renda (INPC) diferentes. IGP-M, IGP-DI e IPC-S (FGV/IBRE) e IPC-Fipe ficam fora: sem licença de redistribuição verificada (ADR-030).',
  }, lang);

  // 2. Produtor: IPP indústria de transformação.
  const uIpp = ultimo(md, 'ipp_transformacao_12m');
  const produtor = monta({
    id: 'opm-ipp', icone: 'factory', rotulo: 'A2.3',
    titulo: en ? `Manufacturing producer prices up ${n2(Number(uIpp.ipp_transformacao_12m))}% over 12 months to ${rotMes(mes(uIpp.periodo!), lang)}` : `Preços ao produtor da indústria de transformação: ${n2(Number(uIpp.ipp_transformacao_12m))}% em 12 meses até ${rotMes(mes(uIpp.periodo!), lang)}`,
    subtitulo: subtitulo(lang, en ? '% over 12 months; factory-gate prices, excluding taxes and freight' : '% em 12 meses; preços na porta da fábrica, sem impostos e fretes', mm, pts(md, 'ipp_transformacao_12m'), 'mes'),
    eixo: '%', unidade: u12, xFormat: 'month', yDigits: 1, yUnit: '%', zero: true,
    descricao: en ? 'Lines: 12-month change of the IPP for manufacturing and of the IPCA.' : 'Linhas: variação em 12 meses do IPP da indústria de transformação e do IPCA.',
    series: [
      { id: 'ipp', label: en ? 'IPP, manufacturing' : 'IPP, transformação', endLabel: 'IPP', color: COR.navy, width: 2.2, points: pts(md, 'ipp_transformacao_12m') },
      { id: 'ipca', label: 'IPCA', color: COR.azure, dash: '6 3', width: 1.8, points: pts(md, 'ipca_12m') },
    ],
    legenda: [{ id: 'ipp', label: en ? 'IPP, manufacturing' : 'IPP, indústria de transformação', color: COR.navy, style: 'line' }, { id: 'ipca', label: 'IPCA', color: COR.azure, style: 'dash' }],
    fontes: [fonte('ipp'), fonte('ipca')], csv: [csvInd('indicadores/inflacao_medidas.csv'), csvSerie('ipp')],
    nota: en ? 'IPP (IBGE, SIDRA 6903), section C of CNAE 2.0. The general industry index (extractive + manufacturing) is in the CSV.' : 'IPP (IBGE, SIDRA 6903), seção C da CNAE 2.0. O índice da indústria geral (extrativa + transformação) está no CSV.',
  }, lang);

  // 3–5. Classificações do BCB.
  const uc = cl.at(-1)!;
  const classif = (id: string, titulo: string, sub: string, ss: { col: string; label: string; end?: string; idf: string }[], nota: string, desc: string) => monta({
    id, icone: 'layers', rotulo: 'A2.3', titulo, subtitulo: subtitulo(lang, sub, mm, pts(cl, ss[0]!.col), 'mes'),
    eixo: '%', unidade: u12, xFormat: 'month', yDigits: 1, yUnit: '%', zero: true, descricao: desc,
    series: ss.map((x, i) => ({ id: x.idf, label: x.label, ...(x.end ? { endLabel: x.end } : {}), color: [COR.navy, COR.azure, COR.steel][i]!, width: i ? 1.8 : 2.2, ...(i === 1 ? { dash: '6 3' } : i === 2 ? { dash: '1.5 3' } : {}), points: pts(cl, x.col) })),
    refs: [{ y: 3, label: en ? 'Target 3.0%' : 'Meta 3,0%', dash: '2 3', color: COR.steel }],
    legenda: ss.map((x, i) => ({ id: x.idf, label: x.label, color: [COR.navy, COR.azure, COR.steel][i]!, style: i ? 'dash' as const : 'line' as const })),
    fontes: ['ipca_livres', 'ipca_administrados', 'ipca_servicos', 'ipca_industriais', 'ipca_alim_dom', 'ipca_comercializaveis', 'ipca_nao_comercializaveis', 'nucleo_ma', 'nucleo_p55'].filter((f) => ss.some((x) => x.col.startsWith(f.replace(/^ipca_/, '')))).map(fonte),
    csv: [csvInd('indicadores/inflacao_classificacoes.csv')], nota,
  }, lang);
  const notaAcum = en ? 'Monthly BCB series (SGS) compounded by CEE over 12 months: Π(1 + πₘ/100) − 1.' : 'Séries mensais do BCB (SGS) compostas pelo CEE em 12 meses: Π(1 + πₘ/100) − 1.';
  const livres = classif('opm-livres-administrados',
    en ? `Market prices at ${n2(Number(uc.livres_12m))}% and regulated prices at ${n2(Number(uc.administrados_12m))}% over 12 months` : `Preços livres em ${n2(Number(uc.livres_12m))}% e administrados em ${n2(Number(uc.administrados_12m))}% em 12 meses`,
    en ? '% over 12 months; BCB classification' : '% em 12 meses; classificação do BCB',
    [{ col: 'livres_12m', idf: 'liv', label: en ? 'Market prices' : 'Livres' }, { col: 'administrados_12m', idf: 'adm', label: en ? 'Regulated prices' : 'Administrados' }],
    notaAcum, en ? 'Lines: 12-month change of market and regulated prices.' : 'Linhas: variação em 12 meses dos preços livres e administrados.');
  const servicos = classif('opm-servicos-bens',
    en ? `Services at ${n2(Number(uc.servicos_12m))}%, industrial goods at ${n2(Number(uc.industriais_12m))}% and food at home at ${n2(Number(uc.alim_dom_12m))}%` : `Serviços em ${n2(Number(uc.servicos_12m))}%, bens industriais em ${n2(Number(uc.industriais_12m))}% e alimentação no domicílio em ${n2(Number(uc.alim_dom_12m))}%`,
    en ? '% over 12 months; components of market prices (BCB)' : '% em 12 meses; componentes dos preços livres (BCB)',
    [{ col: 'servicos_12m', idf: 'serv', label: en ? 'Services' : 'Serviços' }, { col: 'industriais_12m', idf: 'ind', label: en ? 'Industrial goods' : 'Industriais' }, { col: 'alim_dom_12m', idf: 'ali', label: en ? 'Food at home' : 'Alimentação no domicílio', end: en ? 'Food' : 'Alimentação' }],
    notaAcum, en ? 'Lines: 12-month change of services, industrial goods and food at home.' : 'Linhas: variação em 12 meses de serviços, bens industriais e alimentação no domicílio.');
  const comerc = classif('opm-comercializaveis',
    en ? `Tradables at ${n2(Number(uc.comercializaveis_12m))}% and non-tradables at ${n2(Number(uc.nao_comercializaveis_12m))}% over 12 months` : `Comercializáveis em ${n2(Number(uc.comercializaveis_12m))}% e não comercializáveis em ${n2(Number(uc.nao_comercializaveis_12m))}% em 12 meses`,
    en ? '% over 12 months; BCB classification' : '% em 12 meses; classificação do BCB',
    [{ col: 'comercializaveis_12m', idf: 'com', label: en ? 'Tradables' : 'Comercializáveis' }, { col: 'nao_comercializaveis_12m', idf: 'ncom', label: en ? 'Non-tradables' : 'Não comercializáveis' }],
    notaAcum, en ? 'Lines: 12-month change of tradable and non-tradable prices.' : 'Linhas: variação em 12 meses dos preços comercializáveis e não comercializáveis.');

  // 6. Média aparada e percentil ponderado (núcleos oficiais do BCB).
  const nucleos = classif('opm-ma-p55',
    en ? `Trimmed mean at ${n2(Number(uc.nucleo_ma_12m))}% and weighted 55th percentile at ${n2(Number(uc.nucleo_p55_12m))}% over 12 months` : `Média aparada em ${n2(Number(uc.nucleo_ma_12m))}% e percentil ponderado 55 em ${n2(Number(uc.nucleo_p55_12m))}% em 12 meses`,
    en ? '% over 12 months; BCB core measures MA (no smoothing) and P55' : '% em 12 meses; núcleos MA (sem suavização) e P55 do BCB',
    [{ col: 'nucleo_ma_12m', idf: 'ma', label: en ? 'Trimmed mean (MA)' : 'Médias aparadas (MA)', end: 'MA' }, { col: 'nucleo_p55_12m', idf: 'p55', label: en ? 'Weighted percentile 55 (P55)' : 'Percentil 55 (P55)', end: 'P55' }],
    en ? 'Both are computed and published by the BCB (SGS 11426 and 28750), with methodology in the MPR boxes on core inflation; CEE only compounds them over 12 months. CEE does not compute its own trimmed mean or percentile.'
      : 'As duas medidas são calculadas e publicadas pelo BCB (SGS 11426 e 28750), com metodologia nos boxes do RPM sobre núcleos; o CEE só as compõe em 12 meses. O CEE não calcula média aparada nem percentil próprios.',
    en ? 'Lines: 12-month trimmed-mean and 55th-percentile cores.' : 'Linhas: núcleos de médias aparadas e percentil 55 em 12 meses.');

  // 7. Difusão.
  const dif = desde(cl, '2013-01');
  const ud = ultimo(cl, 'difusao_media_12m');
  const difusao = monta({
    id: 'opm-difusao', icone: 'activity', rotulo: 'A2.3',
    titulo: en ? `${n1(Number(ud.difusao))}% of sub-items rose in ${rotMes(mes(ud.periodo!), lang)}; 12-month average at ${n1(Number(ud.difusao_media_12m))}%` : `${n1(Number(ud.difusao))}% dos subitens subiram em ${rotMes(mes(ud.periodo!), lang)}; média de 12 meses em ${n1(Number(ud.difusao_media_12m))}%`,
    subtitulo: subtitulo(lang, en ? '% of IPCA sub-items with a positive monthly change' : '% dos subitens do IPCA com variação mensal positiva', mm, pts(dif, 'difusao'), 'mes'),
    eixo: '%', unidade: '%', xFormat: 'month', yDigits: 1, yUnit: '%',
    descricao: en ? 'Bars: monthly diffusion index. Line: 12-month moving average.' : 'Barras: índice de difusão mensal. Linha: média móvel de 12 meses.',
    series: [
      { id: 'd', label: en ? 'Diffusion' : 'Difusão', endLabel: false, color: COR.slate, kind: 'bar', points: pts(dif, 'difusao') },
      { id: 'dm', label: en ? '12-month average' : 'Média de 12 meses', endLabel: en ? '12m avg.' : 'Média 12m', color: COR.navy, width: 2.2, points: pts(dif, 'difusao_media_12m') },
    ],
    legenda: [{ id: 'd', label: en ? 'Diffusion index (monthly)' : 'Índice de difusão (mensal)', color: COR.slate, style: 'bar' }, { id: 'dm', label: en ? '12-month moving average' : 'Média móvel de 12 meses', color: COR.navy, style: 'line' }],
    fontes: [fonte('ipca_difusao')], csv: [csvInd('indicadores/inflacao_classificacoes.csv'), csvSerie('ipca_difusao')], defaultRange: '5a',
    nota: en ? 'BCB series (SGS 21379); the moving average is computed by CEE. Diffusion is seasonal: compare with the same month of previous years.' : 'Série do BCB (SGS 21379); a média móvel é cálculo do CEE. A difusão é sazonal: compare com o mesmo mês de anos anteriores.',
  }, lang);

  // Tabela: grupos e subgrupos.
  const gr = ler(`${IND}/ipca_grupos.csv`);
  const pg = gr[0]!.periodo!;
  const nf = (v: string | undefined, c: number) => (v === undefined || v === '' ? null : Number(Number(v).toFixed(c)));
  const tabela: Tabela = {
    id: 'ipca-grupos',
    titulo: en ? `IPCA groups and subgroups, ${rotMes(mes(pg), lang)}` : `Grupos e subgrupos do IPCA, ${rotMes(mes(pg), lang)}`,
    descricao: en ? 'Weight at the start of the month, change in the month, 12-month change (monthly changes compounded by CEE) and contribution to the month’s IPCA (weight × change / 100). Subgroups are indented under their group.'
      : 'Peso no início do mês, variação no mês, variação em 12 meses (variações mensais compostas pelo CEE) e contribuição para o IPCA do mês (peso × variação / 100). Subgrupos recuados sob o grupo.',
    colunas: [en ? 'Group / subgroup' : 'Grupo / subgrupo', en ? 'Weight (%)' : 'Peso (%)', en ? 'Month (%)' : 'Mês (%)', en ? '12 months (%)' : '12 meses (%)', en ? 'Contribution (p.p.)' : 'Contribuição (p.p.)'],
    linhas: gr.map((r) => [`${r.nivel === '2' ? ' ' : ''}${r.nome}`, nf(r.peso, 2), nf(r.variacao_mensal, 2), nf(r.variacao_12m, 2), nf(r.contribuicao_mes_pp, 2)]),
    fontes: [fonte('ipca_itens')], csv: [csvInd('indicadores/ipca_grupos.csv')],
  };
  return { graficos: [consumidor, produtor, livres, servicos, comerc, nucleos, difusao].map((g) => recorta(g, lang)), tabelas: [tabela] };
}

// ——— Inflação regional ———
const LADOS: Record<string, Lado> = {
  '1200401': 'd', '1501': 'e', '2111300': 'b', '2301': 'd', '2601': 'd', '2800308': 'd', '2901': 'd', '3101': 'a', '3201': 'd',
  '3301': 'd', '3501': 'e', '4101': 'e', '4301': 'e', '5002704': 'e', '5208707': 'e', '5300108': 'd',
};
export interface LinhaRegional { area: string; nome: string; tipo: string; peso: number; mensal: number | null; doze: number | null; inpc12: number | null; grupos: (number | null)[]; destaque: boolean }
export interface Regional {
  periodo: string; graficos: FichaOpm[];
  tabela: { colunas: string[]; grupos: string[]; linhas: LinhaRegional[]; brasil: LinhaRegional };
}

export function inflacaoRegional(lang: Lang): Regional {
  const en = lang === 'en';
  const n2 = (v: number) => fmtNum(v, 2, lang);
  const ult = ler(`${IND}/regional_ultimo.csv`);
  const d12 = ler(`${IND}/regional_12m.csv`);
  const disp = ler(`${IND}/regional_dispersao.csv`);
  const contrib = ler(`${IND}/regional_contribuicao.csv`);
  const reg = ler('opm/ipca_regional.csv');
  const inpc = ler('opm/inpc_regional.csv');
  const periodo = ult[0]!.periodo!;
  const pm = rotMes(mes(periodo), lang);
  const grupos = ult[0]!.grupos!.split('; ').map((g) => g.split('=') as [string, string]);
  const nomeGrupo = (c: string) => grupos.find(([k]) => k === c)?.[1] ?? c;
  const tipo = (a: string) => (a.length === 4 ? (en ? 'Metropolitan area' : 'Região metropolitana') : (en ? 'Capital city' : 'Capital'));
  const fontesReg = [fonte('ipca_regional'), fonte('pesos_regionais'), fonte('capitais_coordenadas')];
  const brM = reg.find((r) => r.periodo === periodo && r.area === '1' && r.categoria === '7169')!;
  const i12 = (a: string) => { const r = inpc.find((x) => x.periodo === periodo && x.area === a && x.categoria === '7169'); return r?.variacao_12m ? Number(r.variacao_12m) : null; };
  const linhas: LinhaRegional[] = ult.map((r) => ({
    area: r.area!, nome: r.area_nome!, tipo: tipo(r.area!), peso: Number(r.peso_regional_ipca), mensal: Number(r.variacao_mensal), doze: Number(r.variacao_12m), inpc12: i12(r.area!),
    grupos: grupos.map(([c]) => (r[`grupo_${c}`] === '' ? null : Number(r[`grupo_${c}`]))), destaque: r.area === BH,
  }));
  const brasil: LinhaRegional = {
    area: '1', nome: 'Brasil', tipo: en ? 'National' : 'Nacional', peso: 100, mensal: Number(brM.variacao_mensal), doze: Number(brM.variacao_12m), inpc12: i12('1'),
    grupos: grupos.map(([c]) => { const g = reg.find((x) => x.periodo === periodo && x.area === '1' && x.categoria === c); return g?.variacao_mensal ? Number(g.variacao_mensal) : null; }), destaque: false,
  };
  const mn = linhas.reduce((a, b) => (b.doze! < a.doze! ? b : a)), mx = linhas.reduce((a, b) => (b.doze! > a.doze! ? b : a));
  const bh = linhas.find((l) => l.destaque)!;
  const acima = linhas.filter((l) => l.doze! > 4.5).length;
  const colunasTab = [en ? 'Area' : 'Área', en ? 'IPCA weight (%)' : 'Peso no IPCA (%)', en ? 'IPCA, month (%)' : 'IPCA no mês (%)', en ? 'IPCA, 12 months (%)' : 'IPCA em 12 meses (%)', en ? 'INPC, 12 months (%)' : 'INPC em 12 meses (%)'];
  const tabLinhas = [...linhas, brasil].map((l) => [l.nome, l.peso, l.mensal, l.doze, l.inpc12]);
  const estatica = (id: string, rotulo: string, titulo: string, sub: string, descricao: string, svgs: NonNullable<FichaOpm['estatico']>, tab: FichaOpm['tabela'], csv: FichaOpm['csv'], nota: string, largo = true): FichaOpm => ({
    id, bloco: 'precos', icone: 'map', rotulo, titulo, subtitulo: sub, unidade: '%', descricao, largo, estado: 'V', estatico: svgs,
    spec: { id, height: 0, xFormat: 'month', yDigits: 2, yUnit: '%', lang, series: [] },
    legenda: [], fontes: fontesReg, csv, nota, tabela: tab,
  });

  // Mapa de símbolos.
  const pontos = ult.map((r) => ({ id: r.area!, nome: r.area_nome!.replace(/^Grande /, ''), lon: Number(r.longitude), lat: Number(r.latitude), peso: Number(r.peso_regional_ipca), valor: Number(r.variacao_12m), destaque: r.area === BH }));
  const classes = [
    { ate: 1.5, rotulo: en ? '< 1.5' : '< 1,5' }, { ate: 3, rotulo: en ? '1.5–3.0' : '1,5–3,0' }, { ate: 4.5, rotulo: en ? '3.0–4.5' : '3,0–4,5' },
    { ate: 6, rotulo: en ? '4.5–6.0' : '4,5–6,0' }, { ate: null, rotulo: '≥ 6' },
  ];
  const tituloMapa = en
    ? `12-month IPCA ranges from ${n2(mn.doze!)}% in ${mn.nome} to ${n2(mx.doze!)}% in ${mx.nome}; Belo Horizonte at ${n2(bh.doze!)}%`
    : `IPCA em 12 meses vai de ${n2(mn.doze!)}% em ${mn.nome} a ${n2(mx.doze!)}% em ${mx.nome}; Belo Horizonte em ${n2(bh.doze!)}%`;
  const optMapa = { lados: LADOS, classes, lang, titulo: tituloMapa, legendaTamanho: en ? 'Weight in the IPCA' : 'Peso no IPCA', legendaCor: en ? 'IPCA, 12 months (%)' : 'IPCA em 12 meses (%)' };
  const mapa = estatica('opm-regional-mapa', 'A2.3 · ' + (en ? 'Regional' : 'Regional'), tituloMapa,
    en ? `% over 12 months to ${pm}; circle area proportional to the area’s weight in the national IPCA; Brazil: ${n2(brasil.doze!)}%` : `% em 12 meses até ${pm}; área do círculo proporcional ao peso da área no IPCA nacional; Brasil: ${n2(brasil.doze!)}%`,
    en ? 'Symbol map: one circle per IPCA area at the centroid of its capital city, sized by regional weight and shaded by 12-month inflation. Belo Horizonte outlined.' : 'Mapa de símbolos: um círculo por área do IPCA no centroide da capital, com tamanho pelo peso regional e tom pela inflação em 12 meses. Belo Horizonte contornada.',
    [
      { classe: 'larga', svg: mapaSimbolos(pontos, { ...optMapa, largura: 620, rotular: () => true }) },
      { classe: 'estreita', svg: mapaSimbolos(pontos, { ...optMapa, largura: 340, rotular: (p) => p.destaque === true || p.id === mn.area || p.id === mx.area }) },
    ],
    { colunas: colunasTab, linhas: tabLinhas }, [csvInd('indicadores/regional_ultimo.csv'), csvSerie('ipca_regional'), csvSerie('pesos_regionais')],
    en ? 'Circles mark the IPCA collection areas (centroid of the capital, IBGE meshes API), not states: there is no IPCA by state. Boundaries are not drawn while the licence of the IBGE mesh is being checked (ADR-030).'
      : 'Os círculos marcam as áreas de coleta do IPCA (centroide da capital, API de malhas do IBGE), não estados: não existe IPCA por unidade da federação. As fronteiras não são desenhadas enquanto a licença da malha do IBGE é conferida (ADR-030).', false);

  // Ordenação das áreas pelo IPCA em 12 meses (par do mapa).
  const ordenadas = [...linhas].sort((a, b) => b.doze! - a.doze!);
  const tituloR = en
    ? `Belo Horizonte ranks ${ordinalEn(ordenadas.findIndex((l) => l.destaque) + 1)} of 16 areas, ${bh.doze! >= brasil.doze! ? 'above' : 'below'} the national ${n2(brasil.doze!)}%`
    : `Belo Horizonte é a ${ordenadas.findIndex((l) => l.destaque) + 1}ª de 16 áreas, ${bh.doze! >= brasil.doze! ? 'acima' : 'abaixo'} dos ${n2(brasil.doze!)}% do Brasil`;
  const barrasR = ordenadas.map((l) => ({ rotulo: l.nome.replace(/^Grande /, ''), valor: l.doze!, destaque: l.destaque }));
  const ranking = estatica('opm-regional-ranking', 'A2.3 · Regional', tituloR,
    en ? `% over 12 months to ${pm}, IPCA by area; dashed line: Brazil` : `% em 12 meses até ${pm}, IPCA por área; tracejada: Brasil`,
    en ? 'Horizontal bars: 12-month IPCA of the 16 areas in decreasing order; Belo Horizonte highlighted; dashed line at the national IPCA.' : 'Barras horizontais: IPCA em 12 meses das 16 áreas em ordem decrescente; Belo Horizonte em destaque; linha tracejada no IPCA nacional.',
    [
      { classe: 'larga', svg: barrasH(barrasR, { largura: 580, lang, titulo: tituloR, unidade: '%', ref: { valor: brasil.doze!, rotulo: 'Brasil' }, destaqueSo: true }) },
      { classe: 'estreita', svg: barrasH(barrasR, { largura: 340, lang, titulo: tituloR, unidade: '%', ref: { valor: brasil.doze!, rotulo: 'Brasil' }, destaqueSo: true }) },
    ],
    { colunas: colunasTab, linhas: [...ordenadas, brasil].map((l) => [l.nome, l.peso, l.mensal, l.doze, l.inpc12]) },
    [csvInd('indicadores/regional_ultimo.csv')],
    en ? 'Ranking by the 12-month change published by IBGE for each area; INPC by area is in the table below.' : 'Ordenação pela variação em 12 meses publicada pelo IBGE para cada área; o INPC por área está na tabela abaixo.', false);

  // Múltiplos pequenos: 16 áreas × Brasil.
  const ref = pts(d12, 'brasil');
  const ordem = [...linhas].sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || b.doze! - a.doze!);
  const paineis = ordem.map((l) => ({ id: l.area, nome: l.nome.replace(/^Grande /, ''), pontos: pts(d12, `a${l.area}`), destaque: l.destaque }));
  const tituloMult = en ? `${acima} of the 16 areas above the 4.5% ceiling over 12 months to ${pm}` : `${acima} das 16 áreas acima do teto de 4,5% em 12 meses até ${pm}`;
  const optMult = { lang, titulo: tituloMult, rotuloRef: 'Brasil' };
  const xs = d12.map((r) => r.periodo!).reverse();
  const multiplo = estatica('opm-regional-multiplos', 'A2.3 · Regional', tituloMult,
    subtitulo(lang, en ? '% over 12 months, IPCA by area (solid) and Brazil (dashed); common scale' : '% em 12 meses, IPCA da área (contínua) e do Brasil (tracejada); escala comum', en ? 'monthly' : 'mensal', ref, 'mes'),
    en ? 'Small multiples: one panel per IPCA area, ordered by 12-month inflation, Belo Horizonte first.' : 'Múltiplos pequenos: um painel por área do IPCA, em ordem de inflação em 12 meses, com Belo Horizonte primeiro.',
    [
      { classe: 'larga', svg: multiplos(paineis, ref, { ...optMult, largura: 1180, colunas: 4 }) },
      { classe: 'estreita', svg: multiplos(paineis, ref, { ...optMult, largura: 340, colunas: 2 }) },
    ],
    { colunas: [en ? 'Period' : 'Período', 'Brasil', ...ordem.map((l) => l.nome)], linhas: xs.map((p) => { const r = d12.find((x) => x.periodo === p)!; return [rotMes(mes(p), lang), Number(r.brasil), ...ordem.map((l) => (r[`a${l.area}`] ? Number(r[`a${l.area}`]) : null))]; }) },
    [csvInd('indicadores/regional_12m.csv')],
    en ? 'Twelve-month changes published by IBGE (SIDRA 7060, variable 2265) for each area.' : 'Variações em 12 meses publicadas pelo IBGE (SIDRA 7060, variável 2265) para cada área.');

  // Dispersão regional (renderizador padrão: faixas e linha).
  const ud = disp.at(-1)!;
  const dispersao = monta({
    id: 'opm-regional-dispersao', icone: 'activity', rotulo: 'A2.3 · Regional',
    titulo: en ? `Regional spread: weighted standard deviation of ${n2(Number(ud.desvio_padrao_ponderado))} p.p. and interquartile range of ${n2(Number(ud.iqr_ponderado))} p.p.` : `Dispersão regional: desvio-padrão ponderado de ${n2(Number(ud.desvio_padrao_ponderado))} p.p. e intervalo interquartil de ${n2(Number(ud.iqr_ponderado))} p.p.`,
    subtitulo: subtitulo(lang, en ? '% over 12 months; range across the 16 areas and weighted interquartile range' : '% em 12 meses; amplitude entre as 16 áreas e intervalo interquartil ponderado', en ? 'monthly' : 'mensal', pts(disp, 'brasil_12m'), 'mes'),
    eixo: '%', unidade: en ? '% over 12 months' : '% em 12 meses', xFormat: 'month', yDigits: 0, yUnit: '%', zero: true, ranges: false,
    descricao: en ? 'Light band: minimum to maximum across areas. Dark band: weighted interquartile range. Line: Brazil.' : 'Faixa clara: mínimo a máximo entre as áreas. Faixa escura: intervalo interquartil ponderado. Linha: Brasil.',
    series: [{ id: 'br', label: 'Brasil', color: COR.navy, width: 2.2, points: pts(disp, 'brasil_12m') }],
    bandas: [
      { id: 'iqr', label: en ? 'Weighted interquartile range' : 'Intervalo interquartil ponderado', fill: COR.sky, lo: pts(disp, 'q1_ponderado'), hi: pts(disp, 'q3_ponderado') },
      { id: 'amp', label: en ? 'Minimum–maximum' : 'Mínimo–máximo', fill: COR.sky, lo: pts(disp, 'minimo'), hi: pts(disp, 'maximo') },
    ],
    colunasExtra: [{ titulo: en ? 'Weighted standard deviation (p.p.)' : 'Desvio-padrão ponderado (p.p.)', pontos: pts(disp, 'desvio_padrao_ponderado') }, { titulo: en ? 'Weighted IQR (p.p.)' : 'IIQ ponderado (p.p.)', pontos: pts(disp, 'iqr_ponderado') }],
    refs: [{ y: 4.5, label: en ? 'Ceiling 4.5%' : 'Teto 4,5%', dash: '2 3', color: COR.steel }],
    legenda: [{ id: 'br', label: 'Brasil', color: COR.navy, style: 'line' }, { id: 'iqr', label: en ? 'Weighted interquartile range' : 'Intervalo interquartil ponderado', color: COR.sky, style: 'band' }, { id: 'amp', label: en ? 'Minimum–maximum across areas' : 'Mínimo–máximo entre as áreas', color: '#E6EBF2', style: 'band' }],
    fontes: fontesReg, csv: [csvInd('indicadores/regional_dispersao.csv')],
    nota: en ? 'Weights: official regional weights of the IPCA (IBGE, POF 2017–2018). Weighted quantile: smallest value whose cumulative weight reaches q. The national IPCA is not the weighted mean of the 12-month changes of the areas, only of the monthly ones.'
      : 'Pesos: pesos regionais oficiais do IPCA (IBGE, POF 2017–2018). Quantil ponderado: menor valor cujo peso acumulado atinge q. O IPCA nacional é a média ponderada das variações mensais das áreas, não das variações em 12 meses.',
  }, lang);

  // Contribuição por grupo à diferença Belo Horizonte − Brasil.
  const cbh = contrib.filter((c) => c.area === BH);
  const difBh = bh.mensal! - brasil.mensal!;
  const maior = cbh.reduce((a, b) => (Math.abs(Number(b.contribuicao_mes_pp)) > Math.abs(Number(a.contribuicao_mes_pp)) ? b : a));
  const tituloC = en
    ? `Belo Horizonte ${difBh >= 0 ? 'above' : 'below'} Brazil by ${n2(Math.abs(difBh))} p.p. in ${pm}; largest contribution from ${nomeGrupo(maior.grupo!)}`
    : `Belo Horizonte ${difBh >= 0 ? 'acima' : 'abaixo'} do Brasil em ${n2(Math.abs(difBh))} p.p. em ${pm}; maior contribuição de ${nomeGrupo(maior.grupo!)}`;
  const barras = cbh.map((c) => ({ rotulo: c.grupo_nome!, valor: Number(c.contribuicao_mes_pp) }));
  const contribuicao = estatica('opm-regional-contribuicao', 'A2.3 · Regional', tituloC,
    en ? `p.p. of the monthly IPCA; Belo Horizonte ${n2(bh.mensal!)}% and Brazil ${n2(brasil.mensal!)}% in ${pm}` : `p.p. do IPCA do mês; Belo Horizonte ${n2(bh.mensal!)}% e Brasil ${n2(brasil.mensal!)}% em ${pm}`,
    en ? 'Horizontal bars: contribution of each IPCA group to the difference between Belo Horizonte and Brazil in the month.' : 'Barras horizontais: contribuição de cada grupo do IPCA para a diferença entre Belo Horizonte e o Brasil no mês.',
    [
      { classe: 'larga', svg: barrasH(barras, { largura: 580, lang, titulo: tituloC, unidade: 'p.p.' }) },
      { classe: 'estreita', svg: barrasH(barras, { largura: 340, lang, titulo: tituloC, unidade: 'p.p.' }) },
    ],
    { colunas: [en ? 'Group' : 'Grupo', en ? 'Contribution in the month (p.p.)' : 'Contribuição no mês (p.p.)', en ? 'Sum of monthly contributions, 12 months (p.p.)' : 'Soma das contribuições mensais, 12 meses (p.p.)'],
      linhas: [...cbh.map((c) => [c.grupo_nome!, Number(c.contribuicao_mes_pp), c.contribuicao_12m_pp ? Number(c.contribuicao_12m_pp) : null]),
        [en ? 'Total: Belo Horizonte − Brazil' : 'Total: Belo Horizonte − Brasil', Number(difBh.toFixed(2)), null], ['Belo Horizonte (%)', bh.mensal, null], ['Brasil (%)', brasil.mensal, null]] },
    [csvInd('indicadores/regional_contribuicao.csv')],
    en ? 'c_g = (w_BH,g·π_BH,g − w_BR,g·π_BR,g)/100, with the weights and changes of the month (SIDRA 7060); the sum over groups equals the difference up to rounding. The 12-month column adds monthly contributions — an additive approximation. Other areas are in the CSV.'
      : 'c_g = (w_BH,g·π_BH,g − w_BR,g·π_BR,g)/100, com pesos e variações do mês (SIDRA 7060); a soma dos grupos iguala a diferença a menos de arredondamento. A coluna de 12 meses soma as contribuições mensais — aproximação aditiva. As demais áreas estão no CSV.', false);

  return {
    periodo: pm,
    graficos: [mapa, ranking, multiplo, contribuicao, dispersao].map((g) => recorta(g, lang)),
    tabela: { colunas: colunasTab, grupos: grupos.map(([, nome]) => nome), linhas, brasil },
  };
}

export const AREAS_IPCA = CAPITAIS.length;
