/**
 * Catálogo das séries do Observatório. Cada série foi verificada contra a fonte oficial
 * (ver data/CATALOGO.md, gerado a partir deste arquivo por `npm run data:catalogo`).
 * Não acrescente série sem registrar `verificacao`.
 */

export interface Requisicao {
  url: string;
  arquivo: string;
  /** Padrão: GET. A API do ComexStat recebe a consulta em JSON via POST. */
  metodo?: 'POST';
  corpo?: string;
}

export type Fonte = 'bcb-sgs' | 'ibge-sidra' | 'ibge-sis' | 'mdic-comexstat' | 'bcb-olinda' | 'bcb-site' | 'pwt';

export interface Serie {
  id: string;
  painel: 'conjuntura' | 'panorama';
  fonte: Fonte;
  instituicao: string;
  nome: string;
  codigo: string;
  unidade: string;
  frequencia: string;
  /** Página pública de consulta (para leitores humanos). */
  url_publica: string;
  licenca_fonte: string;
  /** 'json' (padrão): a resposta precisa ser JSON válido. 'binario': arquivo (ex.: xlsx) conferido por SHA-1. */
  formato?: 'json' | 'binario';
  /** SHA-1 oficial publicado pela fonte (para arquivos binários). */
  sha1_oficial?: string;
  /** Requisições que compõem uma extração (uma série pode exigir várias, ex.: janelas anuais do SGS). */
  requisicoes: (hoje: Date) => Requisicao[];
  verificacao: { data: string; metodo: string; nome_oficial: string; observacoes?: string };
}

const pad = (n: number) => String(n).padStart(2, '0');
const brDate = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
const isoDia = (d: Date) => d.toISOString().slice(0, 10);

const SIDRA = 'https://servicodados.ibge.gov.br/api/v3/agregados';
/** `inicio` = AAAAMM (intervalo até 209912) ou 'all' (a tabela 5932 retorna erro 500 com intervalo aberto). */
const sidra = (tabela: number, inicio: string, variaveis: number[], classificacao = '') =>
  `${SIDRA}/${tabela}/periodos/${inicio === 'all' ? 'all' : `${inicio}-209912`}/variaveis/${variaveis.join('%7C')}?localidades=N1%5Ball%5D${classificacao}`;

const OLINDA = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata';
const odata = (entidade: string, filtro: string, campos: string) =>
  `${OLINDA}/${entidade}?${[
    `$filter=${encodeURIComponent(filtro)}`,
    `$select=${encodeURIComponent(campos)}`,
    `$orderby=${encodeURIComponent('Data asc')}`,
    '$format=json',
    '$top=50000',
  ].join('&')}`;

/** Ano inicial das séries de conjuntura no painel. */
export const ANO_INICIAL = 2012;

/** SGS em janelas: anuais para séries diárias (a API rejeita janelas longas), quinquenais para mensais. */
function sgs(codigo: number, desde: number, passo: number) {
  return (hoje: Date): Requisicao[] => {
    const out: Requisicao[] = [];
    for (let ano = desde; ano <= hoje.getUTCFullYear(); ano += passo) {
      const fimAno = Math.min(ano + passo - 1, hoje.getUTCFullYear());
      const fim = fimAno === hoje.getUTCFullYear() ? brDate(hoje) : `31/12/${fimAno}`;
      out.push({
        url: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=${fim}`,
        arquivo: `${ano}.json`,
      });
    }
    return out;
  };
}

/** ComexStat (MDIC/Secex): total mensal, sem detalhamento, em US$ FOB. */
const COMEXSTAT = 'https://api-comexstat.mdic.gov.br/general';
const comexstat = (desde: number) => (hoje: Date): Requisicao[] => (['export', 'import'] as const).map((flow) => ({
  url: COMEXSTAT, arquivo: `${flow}.json`, metodo: 'POST' as const,
  corpo: JSON.stringify({ flow, monthDetail: true, period: { from: `${desde}-01`, to: `${hoje.getUTCFullYear()}-12` }, filters: [], details: [], metrics: ['metricFOB'] }),
}));

/** Síntese de Indicadores Sociais: tabelas em ODS, por edição (atualizar a URL a cada nova edição anual). */
const SIS_EDICAO = 2025;
const SIS_RENDA = `https://ftp.ibge.gov.br/Indicadores_Sociais/Sintese_de_Indicadores_Sociais/Sintese_de_Indicadores_Sociais_${SIS_EDICAO}/Tabelas/ods/2_Distribuicao_Renda_ods.zip`;

const LIC_BCB = 'Dados abertos do Banco Central do Brasil';
const LIC_IBGE = 'Dados públicos do IBGE; reutilização com citação da fonte';
const sgsPublica = (c: number) => `https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=${c}`;
const VERIF_SGS = 'Portal de dados abertos do BCB (CKAN package_search pelo código da série)';

/** Indicadores anuais do Focus usados no painel (nomes exatamente como retornados pela API). */
export const FOCUS_ANUAIS = [
  'IPCA', 'Selic', 'PIB Total', 'Câmbio',
  'Dívida bruta do governo geral', 'Dívida líquida do setor público', 'Resultado primário',
] as const;

export const SERIES: Serie[] = [
  // ——— Conjuntura (A1) ———
  {
    id: 'ipca',
    painel: 'conjuntura',
    fonte: 'ibge-sidra',
    instituicao: 'IBGE',
    nome: 'IPCA — variação mensal e acumulada em 12 meses',
    codigo: 'SIDRA 1737, variáveis 63 e 2265 (Brasil)',
    unidade: '%',
    frequencia: 'mensal',
    url_publica: 'https://sidra.ibge.gov.br/tabela/1737',
    licenca_fonte: LIC_IBGE,
    requisicoes: () => [{ url: sidra(1737, `${ANO_INICIAL}01`, [63, 2265]), arquivo: 'resposta.json' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'GET /api/v3/agregados/1737/metadados (API de agregados do IBGE)',
      nome_oficial: 'IPCA - Série histórica com número-índice, variação mensal e variações acumuladas em 3 meses, em 6 meses, no ano e em 12 meses (a partir de dezembro/1979); var. 63 "IPCA - Variação mensal" (%); var. 2265 "IPCA - Variação acumulada em 12 meses" (%)',
      observacoes: 'Fonte primária do índice. Conferido contra a tabela "meta vs. inflação efetiva" do BCB (set/26 = 4,58; ago/26 = 4,22).',
    },
  },
  {
    id: 'selic_meta',
    painel: 'conjuntura',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'Taxa de juros — Meta Selic definida pelo Copom',
    codigo: 'SGS 432',
    unidade: '% a.a.',
    frequencia: 'diária',
    url_publica: sgsPublica(432),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(432, ANO_INICIAL, 1),
    verificacao: {
      data: '2026-10-20',
      metodo: VERIF_SGS,
      nome_oficial: 'Taxa de juros - Meta Selic definida pelo Copom; série temporal diária; unidade: percentual ao ano; fonte: Comitê de Política Monetária',
      observacoes: 'A API retorna valores para datas futuras (até a próxima reunião do Copom); o processamento descarta datas posteriores à extração.',
    },
  },
  {
    id: 'desocupacao',
    painel: 'conjuntura',
    fonte: 'ibge-sidra',
    instituicao: 'IBGE',
    nome: 'Taxa de desocupação (PNAD Contínua), trimestre móvel',
    codigo: 'SIDRA 6381, variáveis 4099 e 4103 (Brasil)',
    unidade: '%',
    frequencia: 'trimestre móvel (mensal)',
    url_publica: 'https://sidra.ibge.gov.br/tabela/6381',
    licenca_fonte: LIC_IBGE,
    requisicoes: () => [{ url: sidra(6381, `${ANO_INICIAL}03`, [4099, 4103]), arquivo: 'resposta.json' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'GET /api/v3/agregados/6381/metadados (API de agregados do IBGE)',
      nome_oficial: 'Taxa de desocupação, na semana de referência, das pessoas de 14 anos ou mais de idade (PNAD Contínua mensal); var. 4099 (%) e var. 4103 "Coeficiente de variação" (%)',
      observacoes: 'O período AAAAMM identifica o último mês do trimestre móvel. Série sem ajuste sazonal.',
    },
  },
  {
    id: 'focus_ipca',
    painel: 'conjuntura',
    fonte: 'bcb-olinda',
    instituicao: 'Banco Central do Brasil',
    nome: 'Expectativas de mercado (Focus) — IPCA anual, mediana',
    codigo: "Olinda Expectativas v1, ExpectativasMercadoAnuais, Indicador='IPCA', baseCalculo=0",
    unidade: '% (variação no ano de referência)',
    frequencia: 'diária (dias úteis)',
    url_publica: 'https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas',
    licenca_fonte: LIC_BCB,
    requisicoes: (hoje) => [{
      url: odata('ExpectativasMercadoAnuais', `Indicador eq 'IPCA' and baseCalculo eq 0 and Data ge '${hoje.getUTCFullYear() - 2}-01-01'`, 'Data,DataReferencia,Mediana,numeroRespondentes'),
      arquivo: 'resposta.json',
    }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'OData $metadata do serviço Expectativas v1 (entidade ExpectativaMercadoAnual) e documentação do serviço no Olinda',
      nome_oficial: 'ExpectativasMercadoAnuais: Indicador, Data, DataReferencia, Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
      observacoes: 'baseCalculo 0 = "uso das expectativas mais recentes informadas pelas instituições participantes a partir do 30º dia anterior à data de cálculo das estatísticas".',
    },
  },

  // ——— Panorama da economia brasileira (portada) ———
  {
    id: 'pib',
    painel: 'panorama',
    fonte: 'ibge-sidra',
    instituicao: 'IBGE',
    nome: 'PIB a preços de mercado — taxa interanual e taxa contra o trimestre anterior (dessazonalizada)',
    codigo: 'SIDRA 5932, variáveis 6561 e 6564, classificação 11255 [90707] (Brasil)',
    unidade: '%',
    frequencia: 'trimestral',
    url_publica: 'https://sidra.ibge.gov.br/tabela/5932',
    licenca_fonte: LIC_IBGE,
    requisicoes: () => [{ url: sidra(5932, 'all', [6561, 6564], '&classificacao=11255%5B90707%5D'), arquivo: 'resposta.json' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'GET /api/v3/agregados/5932/metadados (API de agregados do IBGE)',
      nome_oficial: 'Taxa de variação do índice de volume trimestral; var. 6561 "Taxa trimestral (em relação ao mesmo período do ano anterior)" (%); var. 6564 "Taxa trimestre contra trimestre imediatamente anterior" (%); categoria 90707 "PIB a preços de mercado"',
      observacoes: 'A taxa 6564 foi conferida contra a variação do índice com ajuste sazonal (SIDRA 1621, var. 584): diferenças de no máximo 0,1 p.p., por arredondamento do índice.',
    },
  },
  {
    id: 'ptax',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'Taxa de câmbio — livre — dólar americano (venda), PTAX',
    codigo: 'SGS 1',
    unidade: 'R$/US$',
    frequencia: 'diária',
    url_publica: sgsPublica(1),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(1, ANO_INICIAL, 1),
    verificacao: { data: '2026-10-20', metodo: VERIF_SGS, nome_oficial: 'Taxa de câmbio - Livre - Dólar americano (venda) - diário' },
  },
  {
    id: 'conta_corrente',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'Transações correntes acumuladas em 12 meses em relação ao PIB',
    codigo: 'SGS 23079',
    unidade: '% do PIB',
    frequencia: 'mensal',
    url_publica: sgsPublica(23079),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(23079, ANO_INICIAL, 5),
    verificacao: { data: '2026-10-20', metodo: VERIF_SGS, nome_oficial: 'Transações Correntes acumulado em 12 meses em relação ao PIB - mensal' },
  },
  {
    id: 'primario',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'NFSP — resultado primário do setor público consolidado, acumulado em 12 meses',
    codigo: 'SGS 5793',
    unidade: '% do PIB (NFSP: positivo = déficit)',
    frequencia: 'mensal',
    url_publica: sgsPublica(5793),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(5793, ANO_INICIAL, 5),
    verificacao: {
      data: '2026-10-20',
      metodo: VERIF_SGS,
      nome_oficial: 'NFSP sem desvalorização cambial (% PIB) - Fluxo acumulado em 12 meses - Resultado primário - Total - Setor público consolidado',
      observacoes: 'Necessidades de financiamento: valor positivo indica déficit. O sítio apresenta o resultado primário com sinal de superávit (= −NFSP).',
    },
  },
  {
    id: 'dbgg',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'Dívida bruta do governo geral (DBGG)',
    codigo: 'SGS 13762',
    unidade: '% do PIB',
    frequencia: 'mensal',
    url_publica: sgsPublica(13762),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(13762, ANO_INICIAL, 5),
    verificacao: { data: '2026-10-20', metodo: VERIF_SGS, nome_oficial: 'Dívida bruta do governo geral (% PIB) - Metodologia utilizada a partir de 2008' },
  },
  {
    id: 'dlsp',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'Dívida líquida do setor público (DLSP)',
    codigo: 'SGS 4513',
    unidade: '% do PIB',
    frequencia: 'mensal',
    url_publica: sgsPublica(4513),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(4513, ANO_INICIAL, 5),
    verificacao: { data: '2026-10-20', metodo: VERIF_SGS, nome_oficial: 'Dívida Líquida do Setor Público (% PIB) - Total - Setor público consolidado' },
  },
  {
    id: 'focus_anual',
    painel: 'panorama',
    fonte: 'bcb-olinda',
    instituicao: 'Banco Central do Brasil',
    nome: 'Expectativas de mercado (Focus) — indicadores anuais, mediana',
    codigo: `Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0; Indicador ∈ {${FOCUS_ANUAIS.join('; ')}}`,
    unidade: 'conforme o indicador (% ; R$/US$ ; % do PIB)',
    frequencia: 'diária (dias úteis)',
    url_publica: 'https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas',
    licenca_fonte: LIC_BCB,
    requisicoes: (hoje) => FOCUS_ANUAIS.filter((i) => i !== 'IPCA').map((ind, k) => ({
      // Janela de 120 dias: o painel usa a pesquisa mais recente; janelas longas pesariam ~4 MB por vintage.
      url: odata('ExpectativasMercadoAnuais', `Indicador eq '${ind}' and baseCalculo eq 0 and Data ge '${isoDia(new Date(hoje.getTime() - 120 * 86_400_000))}'`, 'Indicador,Data,DataReferencia,Mediana,numeroRespondentes'),
      arquivo: `indicador-${k + 1}.json`,
    })),
    verificacao: {
      data: '2026-10-20',
      metodo: 'Consulta à entidade ExpectativasMercadoAnuais listando os indicadores distintos retornados pela API',
      nome_oficial: FOCUS_ANUAIS.join('; '),
      observacoes: 'IPCA anual vem da série focus_ipca (painel Conjuntura).',
    },
  },
  {
    id: 'focus_mensal_ipca',
    painel: 'panorama',
    fonte: 'bcb-olinda',
    instituicao: 'Banco Central do Brasil',
    nome: 'Expectativas de mercado (Focus) — IPCA mensal, mediana',
    codigo: "Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0",
    unidade: '% (variação no mês de referência)',
    frequencia: 'diária (dias úteis)',
    url_publica: 'https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas',
    licenca_fonte: LIC_BCB,
    requisicoes: (hoje) => [{
      url: odata('ExpectativaMercadoMensais', `Indicador eq 'IPCA' and baseCalculo eq 0 and Data ge '${isoDia(new Date(hoje.getTime() - 45 * 86_400_000))}'`, 'Data,DataReferencia,Mediana,numeroRespondentes'),
      arquivo: 'resposta.json',
    }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'OData $metadata (entidade ExpectativaMercadoMensal) e consulta de amostra',
      nome_oficial: 'ExpectativaMercadoMensais: Indicador, Data, DataReferencia (MM/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
      observacoes: 'Horizonte observado em 16/10/2026: até 10/2028. Usado para compor a trajetória do IPCA em 12 meses (cálculo do CEE).',
    },
  },
  {
    id: 'focus_12m_ipca',
    painel: 'panorama',
    fonte: 'bcb-olinda',
    instituicao: 'Banco Central do Brasil',
    nome: 'Expectativas de mercado (Focus) — IPCA para os 12 meses seguintes, suavizada, mediana',
    codigo: "Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', Suavizada='S', baseCalculo=0",
    unidade: '% (próximos 12 meses)',
    frequencia: 'diária (dias úteis)',
    url_publica: 'https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas',
    licenca_fonte: LIC_BCB,
    requisicoes: () => [{
      url: odata('ExpectativasMercadoInflacao12Meses', `Indicador eq 'IPCA' and Suavizada eq 'S' and baseCalculo eq 0 and Data ge '${ANO_INICIAL}-01-01'`, 'Data,Mediana,numeroRespondentes'),
      arquivo: 'resposta.json',
    }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'OData $metadata (entidade ExpectativaMercadoInflacao12Meses) e consulta de amostra',
      nome_oficial: 'ExpectativasMercadoInflacao12Meses: Indicador, Data, Suavizada (S/N), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
    },
  },
  {
    id: 'metas_inflacao',
    painel: 'panorama',
    fonte: 'bcb-site',
    instituicao: 'Banco Central do Brasil',
    nome: 'Metas para a inflação e intervalos de tolerância',
    codigo: 'Página "Histórico: meta de inflação vs. inflação efetiva" (API de conteúdo do sítio do BCB)',
    unidade: '%',
    frequencia: 'anual (1999–2024); meta contínua desde 2025',
    url_publica: 'https://www.bcb.gov.br/controleinflacao/historicometas',
    licenca_fonte: 'Conteúdo público do sítio do Banco Central do Brasil',
    requisicoes: () => [{ url: 'https://www.bcb.gov.br/api/paginasite/sitebcb/controleinflacao/historicometas', arquivo: 'resposta.json' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'Leitura da página oficial (navegador) e da API de conteúdo que a alimenta',
      nome_oficial: 'Histórico do regime de metas de inflação (1999–2024): Ano, Norma, Data, Meta (%), Tamanho do intervalo (p.p.), Intervalo de tolerância (%); desde jan/2025, meta contínua de 3,00% ± 1,5 p.p. (Resolução CMN nº 5.141, de 26/6/2024)',
    },
  },
  {
    id: 'pwt',
    painel: 'panorama',
    fonte: 'pwt',
    instituicao: 'Groningen Growth and Development Centre',
    nome: 'Penn World Table, versão 11.0',
    codigo: 'pwt110.xlsx (Dataverse, DOI 10.34894/FABVLR, arquivo 554105)',
    unidade: 'conforme a variável',
    frequencia: 'anual (1950–2023)',
    url_publica: 'https://doi.org/10.34894/FABVLR',
    licenca_fonte: 'CC BY 4.0 (Penn World Table)',
    formato: 'binario',
    sha1_oficial: 'f6045409aae2b7e468ba7e97952cbd7cd530a9eb',
    requisicoes: () => [{ url: 'https://dataverse.nl/api/access/datafile/554105', arquivo: 'pwt110.xlsx' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'API do Dataverse (lista de arquivos do DOI 10.34894/FABVLR com checksum SHA-1); o arquivo enviado pela coordenação é idêntico (mesmo SHA-1)',
      nome_oficial: 'rgdpna "Real GDP at constant 2021 national prices (in mil. 2021US$)"; pop "Population (in millions)"; emp "Number of persons engaged (in millions)"; cgdpo "Output-side real GDP at current PPPs (in mil. 2021US$)"; pl_gdpo "Price level of CGDPo (PPP/XR), price level of USA GDPo in 2021=1"',
      observacoes: 'Fonte estática (versão 11.0). Cita-se: Feenstra, Inklaar e Timmer (2015), American Economic Review 105(10).',
    },
  },
  {
    id: 'pib_usd',
    painel: 'panorama',
    fonte: 'bcb-sgs',
    instituicao: 'Banco Central do Brasil',
    nome: 'PIB acumulado dos últimos 12 meses, em US$ milhões',
    codigo: 'SGS 4192',
    unidade: 'US$ milhões (12 meses)',
    frequencia: 'mensal',
    url_publica: sgsPublica(4192),
    licenca_fonte: LIC_BCB,
    requisicoes: sgs(4192, 2014, 5),
    verificacao: {
      data: '2026-10-20',
      metodo: 'Webservice SOAP do SGS (FachadaWSSGS.getUltimoValorXML, código 4192); a série não consta do catálogo CKAN',
      nome_oficial: 'PIB acumulado dos últimos 12 meses - Em US$ milhões (periodicidade M, unidade US$ (milhões))',
    },
  },
  {
    id: 'comercio',
    painel: 'panorama',
    fonte: 'mdic-comexstat',
    instituicao: 'MDIC/Secex — ComexStat',
    nome: 'Exportações e importações brasileiras de bens, total mensal',
    codigo: 'ComexStat API /general: flow export e import, monthDetail, metricFOB',
    unidade: 'US$ FOB',
    frequencia: 'mensal',
    url_publica: 'https://comexstat.mdic.gov.br/pt/geral',
    licenca_fonte: 'Dados abertos do MDIC (ComexStat); reutilização com citação da fonte',
    requisicoes: comexstat(2014),
    verificacao: {
      data: '2026-10-20',
      metodo: 'API do ComexStat (/general/filters e /general/dates/updated; consulta /general por fluxo, sem filtros)',
      nome_oficial: 'Dados Gerais de Exportação e Importação — métrica Valor US$ FOB',
      observacoes: 'Comércio de bens (Siscomex). Importações também em US$ FOB, para somar com exportações na mesma base.',
    },
  },
  {
    id: 'pobreza',
    painel: 'panorama',
    fonte: 'ibge-sis',
    instituicao: 'IBGE — Síntese de Indicadores Sociais',
    nome: 'Proporção de pessoas abaixo das linhas de pobreza do Banco Mundial (Tabela 2.18)',
    codigo: `SIS ${SIS_EDICAO}, Tabela 2.18 (Pobr_Geo), Brasil: menos de US$ 6,85 e US$ 2,15 PPC 2017 por dia`,
    unidade: '% da população',
    frequencia: 'anual (2012–)',
    url_publica: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html',
    licenca_fonte: LIC_IBGE,
    formato: 'binario',
    requisicoes: () => [{ url: SIS_RENDA, arquivo: '2_Distribuicao_Renda_ods.zip' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'Arquivo oficial no FTP do IBGE; cabeçalhos e notas da Tabela 2.18 conferidos (2024: 23,1 % e 3,5 %, iguais aos divulgados pela Agência IBGE em 3/12/2025)',
      nome_oficial: 'Tabela 2.18 — Proporção de pessoas por classes de rendimento domiciliar per capita: menos de US$ 2,15, US$ 3,65 e US$ 6,85 PPC 2017',
      observacoes: 'PNAD Contínua, acumulado de primeiras visitas. Conversão PPC para consumo privado (R$ 2,3273771 por US$ 1,00 PPC 2017), valores mensais inflacionados pelo IPCA. A tabela SIDRA 5877 (ODS 1.2.1) não foi usada: dá valores diferentes (26,5 % em 2024) e a linha não está documentada na API.',
    },
  },
];
