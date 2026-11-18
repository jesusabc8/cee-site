/**
 * Séries do Observatório de Política Monetária (OPM, painel A2 edição 2.0; ADR-022).
 * Séries compartilhadas com outros painéis não são repetidas aqui: IPCA (SIDRA 1737), meta Selic (SGS 432),
 * desocupação, PIB, PTAX, câmbio real (SGS 11752, ADR-020), NFSP primário, DBGG, metas — ver series.ts.
 *
 * Verificação (18/11/2026):
 * - SGS: nome oficial lido na página pública de consulta do SGS em português. O catálogo CKAN do BCB não lista
 *   várias séries (27838, 27839, 28750, 28751, 29683, 29684, 27863, 27864 etc.) e conserva nomes anteriores à
 *   revisão dos núcleos de 2018 (ex.: 16121 aparece como "ex2", hoje EX1). Por isso vale a página do SGS.
 * - Núcleos: códigos da Nota Técnica BCB nº 57 (dez./2025); as séries 29666–29682 não são usadas.
 * - Focus: $metadata do serviço Expectativas v1 (Olinda) e consultas de amostra.
 * - FRED: título oficial no cabeçalho do arquivo fredgraph.xlsx; licença pelo órgão de origem (ADR-024).
 *
 * Esta função é chamada por series.ts depois de inicializados os auxiliares (ciclo de importação).
 */
import {
  ANO_INICIAL, LIC_BCB, LIC_IBGE, odata, sgs, sgsPublica, sidra, sidraValores, type Requisicao, type Serie,
} from './series.ts';

const VERIF_DATA = '2026-11-18';
const VERIF_SGS_PAGINA = 'Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS';

interface OpcoesSgs { desde?: number; passo?: number; diaria?: boolean; observacoes?: string; unidadeFonte?: string }

/** Série SGS do OPM, com processamento genérico (periodo,valor ou data,valor). */
function sgsOpm(id: string, codigo: number, nome: string, unidade: string, nomeOficial: string, o: OpcoesSgs = {}): Serie {
  const diaria = o.diaria ?? false;
  return {
    id, painel: 'opm', fonte: 'bcb-sgs', instituicao: 'Banco Central do Brasil', nome, codigo: `SGS ${codigo}`, unidade,
    frequencia: diaria ? 'diária' : 'mensal', url_publica: sgsPublica(codigo), licenca_fonte: LIC_BCB,
    requisicoes: sgs(codigo, o.desde ?? ANO_INICIAL, o.passo ?? (diaria ? 1 : 5)),
    generico: diaria ? 'sgs-diaria' : 'sgs-mensal',
    verificacao: {
      data: VERIF_DATA, metodo: VERIF_SGS_PAGINA,
      nome_oficial: `${nomeOficial} (unidade: ${o.unidadeFonte ?? 'Var. % mensal'}; periodicidade: ${diaria ? 'D' : 'M'})`,
      ...(o.observacoes ? { observacoes: o.observacoes } : {}),
    },
  };
}

const IPCA_SGS = 'Índice Nacional de Preços ao Consumidor Amplo (IPCA) - ';
/** Grupos analíticos e núcleos do IPCA (A2.3): [id, código, nome curto, nome oficial após o prefixo]. */
const PRECOS: [string, number, string, string][] = [
  ['ipca_livres', 11428, 'IPCA — preços livres', 'Itens livres'],
  ['ipca_administrados', 4449, 'IPCA — preços administrados (monitorados)', 'Administrados'],
  ['ipca_servicos', 10844, 'IPCA — serviços', 'Serviços'],
  ['ipca_industriais', 27863, 'IPCA — bens industriais', 'Industriais'],
  ['ipca_alim_dom', 27864, 'IPCA — alimentação no domicílio', 'Alimentação no domicílio'],
  ['ipca_comercializaveis', 4447, 'IPCA — comercializáveis', 'Comercializáveis'],
  ['ipca_nao_comercializaveis', 4448, 'IPCA — não comercializáveis', 'Não comercializáveis'],
  ['ipca_duraveis', 10843, 'IPCA — bens duráveis', 'Duráveis'],
  ['ipca_semiduraveis', 10842, 'IPCA — bens semiduráveis', 'Bens semiduráveis'],
  ['ipca_nao_duraveis', 10841, 'IPCA — bens não duráveis', 'Bens não duráveis'],
  ['nucleo_ex0', 11427, 'Núcleo do IPCA — EX0', 'Núcleo por exclusão - EX0'],
  ['nucleo_ex1', 16121, 'Núcleo do IPCA — EX1', 'Núcleo por exclusão - EX1'],
  ['nucleo_ex2', 27838, 'Núcleo do IPCA — EX2', 'Núcleo por exclusão - EX2'],
  ['nucleo_ex3', 27839, 'Núcleo do IPCA — EX3', 'Núcleo por exclusão - EX3'],
  ['nucleo_exfe', 28751, 'Núcleo do IPCA — EX-FE (ex-alimentação e energia)', 'Núcleo Ex-alimentação e energia (EX-FE)'],
  ['nucleo_ms', 4466, 'Núcleo do IPCA — médias aparadas com suavização (MS)', 'Núcleo médias aparadas com suavização'],
  ['nucleo_ma', 11426, 'Núcleo do IPCA — médias aparadas sem suavização (MA)', 'Núcleo médias aparadas sem suavização'],
  ['nucleo_dp', 16122, 'Núcleo do IPCA — dupla ponderação (DP)', 'Núcleo de dupla ponderação'],
  ['nucleo_p55', 28750, 'Núcleo do IPCA — percentil 55 (P55)', 'Núcleo Percentil 55'],
  ['nucleo_ex3_servicos', 29683, 'Núcleo do IPCA — EX3 serviços', 'EX3 Serviços'],
  ['nucleo_ex3_industriais', 29684, 'Núcleo do IPCA — EX3 industriais', 'EX3 Industriais'],
];

/** Focus em janelas anuais de coleta: anos encerrados têm resposta estável (o git guarda um único blob). */
function olindaAnual(entidade: string, filtro: string, campos: string, desde = ANO_INICIAL, ordem = 'Data asc') {
  return (hoje: Date): Requisicao[] => {
    const out: Requisicao[] = [];
    for (let ano = desde; ano <= hoje.getUTCFullYear(); ano++) {
      const url = odata(entidade, `${filtro} and Data ge '${ano}-01-01' and Data le '${ano}-12-31'`, campos).replace(encodeURIComponent('Data asc'), encodeURIComponent(ordem));
      out.push({ url, arquivo: `${ano}.json` });
    }
    return out;
  };
}
const FOCUS_URL = 'https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas';
const STATS = 'Media,Mediana,DesvioPadrao,Minimo,Maximo';
const focusSerie = (id: string, nome: string, codigo: string, unidade: string, requisicoes: Serie['requisicoes'], nomeOficial: string, observacoes?: string): Serie => ({
  id, painel: 'opm', fonte: 'bcb-olinda', instituicao: 'Banco Central do Brasil', nome, codigo, unidade, frequencia: 'diária (dias úteis)',
  url_publica: FOCUS_URL, licenca_fonte: LIC_BCB, requisicoes,
  verificacao: { data: VERIF_DATA, metodo: 'OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)', nome_oficial: nomeOficial, ...(observacoes ? { observacoes } : {}) },
});

const BCB_API = 'https://www.bcb.gov.br/api/servico/sitebcb';
/** Última reunião conhecida na implantação (282ª, 4/11/2026); a faixa pedida avança ~1 reunião a cada 40 dias. */
const REUNIAO_REF = { numero: 282, data: Date.UTC(2026, 10, 4) };
export const PRIMEIRA_REUNIAO_TEXTOS = 200; // jul./2016: primeiro comunicado com o formato atual na API de conteúdo
export function ultimaReuniaoProvavel(hoje: Date) {
  return REUNIAO_REF.numero + Math.max(0, Math.ceil((hoje.getTime() - REUNIAO_REF.data) / (40 * 86_400_000))) + 1;
}
/** Comunicados do BCB que divulgam o calendário das reuniões ordinárias (Resolução BCB nº 61/2021, art. 3º, par. único).
 *  Acrescentar o número do comunicado do ano seguinte quando publicado (até junho). */
export const CALENDARIOS_COPOM: Record<number, number> = { 2026: 43383, 2027: 45452 };

const FRED_LIC_FED = 'Domínio público (Board of Governors of the Federal Reserve System: "Unless otherwise indicated, information on Board\'s website is in the public domain and may be copied and distributed without permission"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)';
const FRED_LIC_EIA = 'Domínio público (U.S. Energy Information Administration: "U.S. government publications are in the public domain and are not subject to copyright protection"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)';
function fred(id: string, codigo: string, nome: string, unidade: string, titulo: string, licenca: string, instituicao: string, observacoes?: string): Serie {
  return {
    id, painel: 'opm', fonte: 'fred', instituicao, nome, codigo: `FRED ${codigo}`, unidade, frequencia: 'diária',
    url_publica: `https://fred.stlouisfed.org/series/${codigo}`, licenca_fonte: licenca, formato: 'csv', cabecalho_csv: 'observation_date,', generico: 'fred',
    requisicoes: () => [{ url: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${codigo}&cosd=${ANO_INICIAL}-01-01`, arquivo: `${codigo}.csv` }],
    verificacao: {
      data: VERIF_DATA,
      metodo: 'Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial',
      nome_oficial: titulo,
      observacoes: `${observacoes ? observacoes + ' ' : ''}A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.`,
    },
  };
}

export function seriesOpm(): Serie[] {
  return [
    // ——— A2.1 Decisões e comunicação do Copom ———
    sgsOpm('selic_efetiva', 1178, 'Taxa Selic efetiva, anualizada base 252', '% a.a.', 'Taxa de juros - Selic anualizada base 252', { diaria: true, unidadeFonte: '% a.a.' }),
    {
      id: 'copom_decisoes', painel: 'opm', fonte: 'bcb-site', instituicao: 'Banco Central do Brasil',
      nome: 'Histórico das taxas de juros fixadas pelo Copom', codigo: 'API de conteúdo do BCB: /api/servico/sitebcb/historicotaxasjuros',
      unidade: '% a.a.', frequencia: 'por reunião', url_publica: 'https://www.bcb.gov.br/controleinflacao/historicotaxasjuros',
      licenca_fonte: 'Conteúdo público do sítio do Banco Central do Brasil',
      requisicoes: () => [{ url: `${BCB_API}/historicotaxasjuros`, arquivo: 'resposta.json' }],
      verificacao: {
        data: VERIF_DATA, metodo: 'Consulta à API que alimenta a página "Histórico das taxas de juros"; conferida contra os comunicados das reuniões 281 e 282',
        nome_oficial: 'Campos: NumeroReuniaoCopom, ReuniaoExtraordinaria, DataReuniaoCopom, Vies, MetaSelic, DataInicioVigencia, DataFimVigencia, TaxaSelicEfetivaVigencia, TaxaSelicEfetivaAnualizada',
        observacoes: '281ª (16/9/2026) e 282ª (4/11/2026): meta de 13,75 % a.a.',
      },
    },
    {
      id: 'copom_votos', painel: 'opm', fonte: 'bcb-site', instituicao: 'Banco Central do Brasil',
      nome: 'Histórico de votações das reuniões do Copom', codigo: 'historico-votacoes-Copom.xlsx (sítio do BCB, página do Copom)',
      unidade: 'placar e votos (p.p.)', frequencia: 'por reunião', url_publica: 'https://www.bcb.gov.br/controleinflacao/copom',
      licenca_fonte: 'Banco Central do Brasil: "Sua reprodução e edição é autorizada, desde que citada a fonte: Histórico de votações das reuniões do Copom"',
      formato: 'binario',
      requisicoes: () => [{ url: 'https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx', arquivo: 'historico-votacoes-Copom.xlsx' }],
      verificacao: {
        data: VERIF_DATA, metodo: 'Arquivo oficial vinculado na página do Copom; cabeçalhos e notas lidos',
        nome_oficial: 'Histórico de votações do Copom: Reunião, Data, Decisão Selic (% a.a.), Variação Selic (p.p.), Placar, Votante, Voto variação Selic (p.p.), Voto menos decisão (p.p.)',
        observacoes: 'O sítio publica só o placar e a contagem de votos divergentes, sem nomes. 282ª: Unanimidade (7 votantes).',
      },
    },
    {
      id: 'copom_calendario', painel: 'opm', fonte: 'bcb-site', instituicao: 'Banco Central do Brasil',
      nome: 'Calendário das reuniões ordinárias do Copom', codigo: `Comunicados BCB nº ${Object.values(CALENDARIOS_COPOM).join(', ')} (API de normativos)`,
      unidade: 'datas', frequencia: 'anual', url_publica: 'https://www.bcb.gov.br/controleinflacao/copom',
      licenca_fonte: 'Ato normativo público do Banco Central do Brasil',
      requisicoes: () => Object.entries(CALENDARIOS_COPOM).map(([ano, n]) => ({
        url: `https://www.bcb.gov.br/api/conteudo/app/normativos/exibeoutrasnormas?p1=Comunicado&p2=${n}`, arquivo: `calendario-${ano}.json`,
      })),
      verificacao: {
        data: VERIF_DATA, metodo: 'Texto dos comunicados lido pela API de normativos (exibeoutrasnormas)',
        nome_oficial: 'Comunicado nº 43.383 (24/6/2025) e nº 45.452 (23/6/2026): "Divulga o Calendário das Reuniões Ordinárias do Comitê de Política Monetária (Copom)"',
        observacoes: '2026: 27–28/1, 17–18/3, 28–29/4, 16–17/6, 4–5/8, 15–16/9, 3–4/11, 8–9/12. 2027: 26–27/1, 16–17/3, 27–28/4, 15–16/6, 3–4/8, 21–22/9, 26–27/10, 7–8/12.',
      },
    },
    {
      id: 'copom_comunicados', painel: 'opm', fonte: 'bcb-site', instituicao: 'Banco Central do Brasil',
      nome: 'Comunicados das decisões do Copom (texto integral)', codigo: 'API de conteúdo do BCB: /api/servico/sitebcb/copom/comunicados_detalhes',
      unidade: 'texto (HTML)', frequencia: 'por reunião', url_publica: 'https://www.bcb.gov.br/controleinflacao/comunicadoscopom',
      licenca_fonte: 'Conteúdo público do sítio do Banco Central do Brasil',
      requisicoes: (hoje) => Array.from({ length: ultimaReuniaoProvavel(hoje) - PRIMEIRA_REUNIAO_TEXTOS + 1 }, (_, k) => PRIMEIRA_REUNIAO_TEXTOS + k)
        .map((n) => ({ url: `${BCB_API}/copom/comunicados_detalhes?nro_reuniao=${n}`, arquivo: `${n}.json` })),
      verificacao: {
        data: VERIF_DATA, metodo: 'Consulta à API que alimenta a página de comunicados (reuniões 200, 281, 282 e 283, esta ainda vazia)',
        nome_oficial: 'Campos: nro_reuniao, dataReferencia, titulo, textoComunicado (HTML)',
        observacoes: 'Guardado em bruto, com hash, para o índice de tom (I.14, camada 3). Reuniões ainda não realizadas retornam {"conteudo":[]}.',
      },
    },
    {
      id: 'copom_atas', painel: 'opm', fonte: 'bcb-site', instituicao: 'Banco Central do Brasil',
      nome: 'Atas das reuniões do Copom (texto integral)', codigo: 'API de conteúdo do BCB: /api/servico/sitebcb/copom/atas_detalhes',
      unidade: 'texto (HTML)', frequencia: 'por reunião', url_publica: 'https://www.bcb.gov.br/publicacoes/atascopom',
      licenca_fonte: 'Conteúdo público do sítio do Banco Central do Brasil',
      requisicoes: (hoje) => Array.from({ length: ultimaReuniaoProvavel(hoje) - PRIMEIRA_REUNIAO_TEXTOS + 1 }, (_, k) => PRIMEIRA_REUNIAO_TEXTOS + k)
        .map((n) => ({ url: `${BCB_API}/copom/atas_detalhes?nro_reuniao=${n}`, arquivo: `${n}.json` })),
      verificacao: {
        data: VERIF_DATA, metodo: 'Consulta à API que alimenta a página de atas (reuniões 200 e 282)',
        nome_oficial: 'Campos: nroReuniao, dataReferencia, dataPublicacao, titulo, urlPdfAta, textoAta (HTML; nulo nas atas antigas, que só têm PDF)',
        observacoes: 'Guardado em bruto, com hash. Atas sem texto (textoAta nulo) ficam fora do índice de tom até a extração do PDF.',
      },
    },

    // ——— A2.1/A2.2/A2.4 Expectativas Focus (todas as estatísticas) ———
    focusSerie('focus_selic', 'Focus — Selic por reunião do Copom', "Olinda Expectativas v1, ExpectativasMercadoSelic, baseCalculo=0", '% a.a.',
      olindaAnual('ExpectativasMercadoSelic', "baseCalculo eq 0", `Data,Reuniao,${STATS},numeroRespondentes`),
      'ExpectativaMercadoSelic: Indicador, Data, Reuniao (Rk/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
      'A 282ª reunião (3–4/11/2026) é R7/2026; mediana na coleta de 30/10/2026: 13,50 % (139 respondentes).'),
    focusSerie('focus_selic_top5', 'Focus Top 5 (curto prazo) — Selic por reunião do Copom', "Olinda Expectativas v1, ExpectativasMercadoTop5Selic, tipoCalculo='C'", '% a.a.',
      olindaAnual('ExpectativasMercadoTop5Selic', "indicador eq 'Selic' and tipoCalculo eq 'C'", 'Data,reuniao,tipoCalculo,media,mediana,desvioPadrao,minimo,maximo'),
      'ExpectativasMercadoSelicTop5: indicador, Data, reuniao, tipoCalculo (C curto, M médio, L longo prazo), media, mediana, desvioPadrao, coeficienteVariacao, minimo, maximo',
      'Os campos desta entidade vêm em minúsculas e sem número de respondentes. Só o ranking de curto prazo (tipoCalculo C), o usado na surpresa (I.5): os rankings de médio e longo prazo triplicariam o volume sem uso nos indicadores.'),
    focusSerie('focus_anuais', 'Focus — indicadores anuais (IPCA, Selic, PIB, câmbio), todas as estatísticas', "Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0, Indicador ∈ {IPCA; Selic; PIB Total; Câmbio}", 'conforme o indicador',
      olindaAnual('ExpectativasMercadoAnuais', "baseCalculo eq 0 and (Indicador eq 'IPCA' or Indicador eq 'Selic' or Indicador eq 'PIB Total' or Indicador eq 'Câmbio')", `Indicador,Data,DataReferencia,${STATS},numeroRespondentes`),
      'ExpectativaMercadoAnual: Indicador, IndicadorDetalhe, Data, DataReferencia, Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
      'Difere de focus_ipca e focus_anual (Panorama), que guardam só a mediana numa janela curta. Na coleta de 30/10/2026: IPCA 2026 = 5,2166 e 2027 = 4,7646 (medianas).'),
    focusSerie('focus_mensais', 'Focus — IPCA mensal, todas as estatísticas', "Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0", '% (variação no mês)',
      olindaAnual('ExpectativaMercadoMensais', "Indicador eq 'IPCA' and baseCalculo eq 0", `Data,DataReferencia,${STATS},numeroRespondentes`),
      'ExpectativaMercadoMensal: Indicador, Data, DataReferencia (MM/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo'),
    focusSerie('focus_inflacao_12m', 'Focus — IPCA nos 12 meses seguintes (suavizada e não suavizada), todas as estatísticas', "Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', baseCalculo=0", '% (próximos 12 meses)',
      olindaAnual('ExpectativasMercadoInflacao12Meses', "Indicador eq 'IPCA' and baseCalculo eq 0", `Data,Suavizada,${STATS},numeroRespondentes`),
      'ExpectativaMercadoInflacao12Meses: Indicador, Data, Suavizada (S/N), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo'),
    focusSerie('focus_top5_anuais', 'Focus Top 5 (curto prazo) — IPCA e Selic anuais', "Olinda Expectativas v1, ExpectativasMercadoTop5Anuais, tipoCalculo='C', Indicador ∈ {IPCA; Selic}", 'conforme o indicador',
      olindaAnual('ExpectativasMercadoTop5Anuais', "(Indicador eq 'IPCA' or Indicador eq 'Selic') and tipoCalculo eq 'C'", `Indicador,Data,DataReferencia,tipoCalculo,${STATS}`),
      'ExpectativasMercadoTop5Anual: Indicador, Data, DataReferencia, tipoCalculo (C, M, L), Media, Mediana, DesvioPadrao, Minimo, Maximo',
      'Só o ranking de curto prazo (tipoCalculo C).'),
    focusSerie('focus_top5_mensais', 'Focus Top 5 (curto prazo) — IPCA mensal', "Olinda Expectativas v1, ExpectativasMercadoTop5Mensais, Indicador='IPCA', tipoCalculo='C'", '% (variação no mês)',
      olindaAnual('ExpectativasMercadoTop5Mensais', "Indicador eq 'IPCA' and tipoCalculo eq 'C'", `Data,DataReferencia,tipoCalculo,${STATS}`),
      'ExpectativasMercadoTop5Mensal: Indicador, Data, DataReferencia (MM/AAAA), tipoCalculo (C, M, L), Media, Mediana, DesvioPadrao, Minimo, Maximo',
      'Só o ranking de curto prazo (tipoCalculo C).'),

    // ——— A2.3 Inflação: grupos, núcleos, difusão e subitens ———
    ...PRECOS.map(([id, c, nome, oficial]) => sgsOpm(id, c, nome, '% (variação mensal)', IPCA_SGS + oficial)),
    sgsOpm('ipca_difusao', 21379, 'IPCA — índice de difusão', '% dos subitens com variação positiva', `${IPCA_SGS}Índice de difusão`, { unidadeFonte: '%' }),
    {
      id: 'ipca_itens', painel: 'opm', fonte: 'ibge-sidra', instituicao: 'IBGE',
      nome: 'IPCA — variação mensal e peso de grupos, subgrupos, itens e subitens', codigo: 'SIDRA 7060, variáveis 63 e 66, classificação 315 (todas as categorias), Brasil',
      unidade: '% (variação mensal) e % (peso)', frequencia: 'mensal (desde jan./2020)', url_publica: 'https://sidra.ibge.gov.br/tabela/7060', licenca_fonte: LIC_IBGE,
      // Uma requisição por ano: anos fechados não mudam e o git guarda um único blob para eles.
      requisicoes: (hoje) => Array.from({ length: hoje.getUTCFullYear() - 2020 + 1 }, (_, k) => 2020 + k).map((ano) => ({
        url: sidra(7060, `${ano}01`, [63, 66], '&classificacao=315%5Ball%5D').replace('-209912', `-${ano}12`),
        alternativa: sidraValores(7060, `${ano}01`, [63, 66]).replace('-209912', `-${ano}12`) + '/c315/all',
        arquivo: `${ano}.json`,
      })),
      verificacao: {
        data: VERIF_DATA, metodo: 'GET /api/v3/agregados/7060/metadados (API de agregados do IBGE)',
        nome_oficial: 'IPCA - Variação mensal, acumulada no ano, acumulada em 12 meses e peso mensal, para o índice geral, grupos, subgrupos, itens e subitens de produtos e serviços (a partir de janeiro/2020); var. 63 "IPCA - Variação mensal" (%); var. 66 "IPCA - Peso mensal" (%); classificação 315 "Geral, grupo, subgrupo, item e subitem" (457 categorias, níveis 0–4; subitens = nível 4)',
        observacoes: 'Usada no indicador I.11 (camada 2).',
      },
    },

    // ——— A2.5 Transmissão: crédito (compartilhado com A4), commodities, atividade ———
    sgsOpm('juros_credito', 20714, 'Taxa média de juros das operações de crédito — total', '% a.a.', 'Taxa média de juros das operações de crédito - Total', { unidadeFonte: '% a.a.', observacoes: 'Série compartilhada com o painel A4 (Crédito e Estabilidade Financeira), ainda não publicado.' }),
    sgsOpm('juros_pj', 20715, 'Taxa média de juros das operações de crédito — pessoas jurídicas', '% a.a.', 'Taxa média de juros das operações de crédito - Pessoas jurídicas - Total', { unidadeFonte: '% a.a.' }),
    sgsOpm('juros_pf_livres', 20740, 'Taxa média de juros do crédito livre — pessoas físicas', '% a.a.', 'Taxa média de juros das operações de crédito com recursos livres - Pessoas físicas - Total', { unidadeFonte: '% a.a.' }),
    sgsOpm('spread_credito', 20783, 'Spread médio das operações de crédito — total', 'p.p.', 'Spread médio das operações de crédito - Total', { unidadeFonte: 'p.p.' }),
    sgsOpm('icc', 25351, 'Indicador de Custo do Crédito (ICC) — total', '% a.a.', 'Indicador de Custo do Crédito - ICC - Total', { unidadeFonte: '% a.a.', desde: 2013 }),
    sgsOpm('icbr', 27574, 'Índice de Commodities — Brasil (IC-Br)', 'índice', 'Índice de Commodities - Brasil', { unidadeFonte: 'Índice' }),
    sgsOpm('icbr_agro', 27575, 'IC-Br — agropecuária', 'índice', 'Índice de Commodities - Brasil - Agropecuária', { unidadeFonte: 'Índice' }),
    sgsOpm('icbr_metal', 27576, 'IC-Br — metal', 'índice', 'Índice de Commodities - Brasil - Metal', { unidadeFonte: 'Índice' }),
    sgsOpm('icbr_energia', 27577, 'IC-Br — energia', 'índice', 'Índice de Commodities - Brasil - Energia', { unidadeFonte: 'Índice' }),
    sgsOpm('ibcbr', 24364, 'IBC-Br com ajuste sazonal', 'índice (2002 = 100)', 'Índice de Atividade Econômica do Banco Central (IBC-Br) - com ajuste sazonal', { unidadeFonte: 'Índice', observacoes: 'Já dessazonalizado pela fonte: o CEE não reajusta (ADR-023).' }),
    sgsOpm('pib_nominal_12m', 4382, 'PIB acumulado dos últimos 12 meses, valores correntes', 'R$ milhões', 'PIB acumulado dos últimos 12 meses - Valores correntes (R$ milhões)', { unidadeFonte: 'R$ (milhões)', observacoes: 'Denominador da velocidade e do grau de monetização (I.20), em reais como os agregados. A série SGS 4192 (Panorama) está em US$ e não serve para M/PIB.' }),

    // ——— A2.6 Ambiente externo (FRED; licença conferida no órgão de origem) ———
    fred('fed_funds_sup', 'DFEDTARU', 'Fed funds — limite superior do intervalo-alvo', '% a.a.', 'Federal Funds Target Range - Upper Limit, Percent, Daily, Not Seasonally Adjusted', FRED_LIC_FED, 'Board of Governors of the Federal Reserve System (via FRED)'),
    fred('ust10', 'DGS10', 'Rendimento do Tesouro americano de 10 anos', '% a.a.', 'Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis, Percent, Daily, Not Seasonally Adjusted', FRED_LIC_FED, 'Board of Governors of the Federal Reserve System, H.15 (via FRED)'),
    fred('tips5', 'DFII5', 'Rendimento real do Tesouro americano de 5 anos (TIPS)', '% a.a.', 'Market Yield on U.S. Treasury Securities at 5-Year Constant Maturity, Quoted on an Investment Basis, Inflation-Indexed, Percent, Daily, Not Seasonally Adjusted', FRED_LIC_FED, 'Board of Governors of the Federal Reserve System, H.15 (via FRED)', 'Insumo do método (d) do juro neutro (I.4, camada 3), sem prêmio de risco soberano (ADR-024).'),
    fred('dolar_global', 'DTWEXBGS', 'Índice amplo nominal do dólar americano', 'índice (jan./2006 = 100)', 'Nominal Broad U.S. Dollar Index, Index Jan 2006=100, Daily, Not Seasonally Adjusted', FRED_LIC_FED, 'Board of Governors of the Federal Reserve System, H.10 (via FRED)'),
    fred('brent', 'DCOILBRENTEU', 'Petróleo Brent — preço à vista (Europa)', 'US$ por barril', 'Crude Oil Prices: Brent - Europe, Dollars per Barrel, Daily, Not Seasonally Adjusted', FRED_LIC_EIA, 'U.S. Energy Information Administration (via FRED)'),

    // ——— A2.8 Moeda, reservas bancárias e agregados ———
    sgsOpm('base_restrita', 1788, 'Base monetária restrita (saldo em final de período)', 'R$ mil', 'BM - Base monetária restrita (saldo em final de período)', { unidadeFonte: 'u.m.c. (mil)' }),
    sgsOpm('papel_moeda_circulacao', 1786, 'Papel-moeda em circulação (emitido), componente da base (saldo em final de período)', 'R$ mil', 'BM - Papel moeda em circulação (saldo em final de período)', { unidadeFonte: 'u.m.c. (mil)', observacoes: 'É o papel-moeda emitido (fora do BCB) da identidade da base: SGS 1788 = 1786 + 1787 com diferença de no máximo R$ 1 mil (jul.–set./2026).' }),
    sgsOpm('reservas_bancarias', 1787, 'Reservas bancárias (saldo em final de período)', 'R$ mil', 'BM - Reservas bancárias (saldo em final de período)', { unidadeFonte: 'u.m.c. (mil)' }),
    sgsOpm('base_ampliada', 1833, 'Base monetária ampliada (saldo em final de período)', 'R$ mil', 'Base Monetária Ampliada (saldo em final de período)', { unidadeFonte: 'u.m.c. (mil)' }),
    sgsOpm('bma_compulsorio', 1828, 'Base ampliada — depósitos compulsórios em espécie (saldo em final de período)', 'R$ mil', 'Base monetária ampliada - Depósitos compulsórios em espécie (saldo em final de período)', { unidadeFonte: 'u.m.c. (mil)' }),
    sgsOpm('pmpp', 27789, 'Papel-moeda em poder do público (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento - Papel moeda em poder do público (saldo em final de período) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
    sgsOpm('depositos_vista', 27790, 'Depósitos à vista (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento - Depósitos à vista (saldo em final de período) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
    sgsOpm('m1', 27791, 'M1 (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento - M1 (saldo em final de período) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
    sgsOpm('m2', 27810, 'M2 (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento amplos - M2 (saldo em final de período) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
    sgsOpm('m3', 27813, 'M3 (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento amplos - M3 (saldo em final de período) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
    sgsOpm('m4', 27815, 'M4 (saldo em final de período) — Novo', 'R$ mil', 'Meios de pagamento amplos - M4 (saldo em final de periodo) - Novo', { unidadeFonte: 'u.m.c. (mil)', desde: 2002 }),
  ];
}
