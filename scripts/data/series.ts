/**
 * Catálogo das séries do Observatório. Cada série foi verificada contra a fonte oficial
 * (ver data/CATALOGO.md, gerado a partir deste arquivo por `npm run data:catalogo`).
 * Não acrescente série sem registrar `verificacao`.
 */

export interface Requisicao { url: string; arquivo: string }

export interface Serie {
  id: string;
  painel: 'conjuntura';
  fonte: 'bcb-sgs' | 'ibge-sidra' | 'bcb-olinda';
  instituicao: string;
  nome: string;
  codigo: string;
  unidade: string;
  frequencia: string;
  /** Página pública de consulta (para leitores humanos). */
  url_publica: string;
  licenca_fonte: string;
  /** Requisições que compõem uma extração (uma série pode exigir várias, ex.: janelas anuais do SGS). */
  requisicoes: (hoje: Date) => Requisicao[];
  verificacao: { data: string; metodo: string; nome_oficial: string; observacoes?: string };
}

const pad = (n: number) => String(n).padStart(2, '0');
const brDate = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;

const SIDRA = 'https://servicodados.ibge.gov.br/api/v3/agregados';
const sidra = (tabela: number, inicio: string, variaveis: number[]) =>
  `${SIDRA}/${tabela}/periodos/${inicio}-209912/variaveis/${variaveis.join('%7C')}?localidades=N1%5Ball%5D`;

/** Ano inicial das séries de conjuntura no painel. */
export const ANO_INICIAL = 2012;

export const SERIES: Serie[] = [
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
    licenca_fonte: 'Dados públicos do IBGE; reutilização com citação da fonte',
    requisicoes: () => [{ url: sidra(1737, `${ANO_INICIAL}01`, [63, 2265]), arquivo: 'resposta.json' }],
    verificacao: {
      data: '2026-10-20',
      metodo: 'GET /api/v3/agregados/1737/metadados (API de agregados do IBGE)',
      nome_oficial: 'IPCA - Série histórica com número-índice, variação mensal e variações acumuladas em 3 meses, em 6 meses, no ano e em 12 meses (a partir de dezembro/1979); var. 63 "IPCA - Variação mensal" (%); var. 2265 "IPCA - Variação acumulada em 12 meses" (%)',
      observacoes: 'Fonte primária do índice. O IPCA cheio não foi localizado com código SGS no catálogo de dados abertos do BCB; por isso usa-se o SIDRA.',
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
    url_publica: 'https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432',
    licenca_fonte: 'Dados abertos do Banco Central do Brasil',
    requisicoes: (hoje) => {
      const out: Requisicao[] = [];
      for (let ano = ANO_INICIAL; ano <= hoje.getUTCFullYear(); ano++) {
        const fim = ano === hoje.getUTCFullYear() ? brDate(hoje) : `31/12/${ano}`;
        out.push({
          url: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=${fim}`,
          arquivo: `${ano}.json`,
        });
      }
      return out;
    },
    verificacao: {
      data: '2026-10-20',
      metodo: 'Portal de dados abertos do BCB (CKAN package_search, conjunto "432-taxa-de-juros---meta-selic-definida-pelo-copom")',
      nome_oficial: 'Taxa de juros - Meta Selic definida pelo Copom; série temporal diária; unidade: percentual ao ano; fonte: Comitê de Política Monetária',
      observacoes: 'A API retorna valores para datas futuras (até a próxima reunião do Copom); o processamento descarta datas posteriores à extração. Consultas JSON exigem janelas curtas: janelas próximas de 10 anos retornam página de erro HTML com status 200, por isso a extração é feita por ano.',
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
    licenca_fonte: 'Dados públicos do IBGE; reutilização com citação da fonte',
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
    licenca_fonte: 'Dados abertos do Banco Central do Brasil',
    requisicoes: (hoje) => {
      const desde = `${hoje.getUTCFullYear() - 2}-01-01`;
      const q = [
        `$filter=${encodeURIComponent(`Indicador eq 'IPCA' and baseCalculo eq 0 and Data ge '${desde}'`)}`,
        `$select=${encodeURIComponent('Data,DataReferencia,Mediana,numeroRespondentes')}`,
        `$orderby=${encodeURIComponent('Data asc')}`,
        '$format=json',
        '$top=20000',
      ].join('&');
      return [{ url: `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?${q}`, arquivo: 'resposta.json' }];
    },
    verificacao: {
      data: '2026-10-20',
      metodo: 'OData $metadata do serviço Expectativas v1 (entidade ExpectativaMercadoAnual) e documentação do serviço no Olinda',
      nome_oficial: 'ExpectativasMercadoAnuais: Indicador, Data, DataReferencia, Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo',
      observacoes: 'baseCalculo 0 = "uso das expectativas mais recentes informadas pelas instituições participantes a partir do 30º dia anterior à data de cálculo das estatísticas" (documentação oficial do serviço).',
    },
  },
];
