# Catálogo de dados e fontes

> Gerado por `npm run data:catalogo` a partir de `scripts/data/series.ts`. Não edite à mão.
> Toda série publicada foi verificada contra a fonte oficial; séries não verificadas ficam em `docs/PENDIENTES.md`.

| Série | Código | Unidade | Frequência | Verificada em | Última extração | Cobertura |
|---|---|---|---|---|---|---|
| IPCA — variação mensal e acumulada em 12 meses | SIDRA 1737, variáveis 63 e 2265 (Brasil) | % | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-09 |
| Taxa de juros — Meta Selic definida pelo Copom | SGS 432 | % a.a. | diária | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-10 |
| Taxa de desocupação (PNAD Contínua), trimestre móvel | SIDRA 6381, variáveis 4099 e 4103 (Brasil) | % | trimestre móvel (mensal) | 2026-10-20 | 2026-10-20 | 2012-03 → 2026-08 |
| Expectativas de mercado (Focus) — IPCA anual, mediana | Olinda Expectativas v1, ExpectativasMercadoAnuais, Indicador='IPCA', baseCalculo=0 | % (variação no ano de referência) | diária (dias úteis) | 2026-10-20 | 2026-10-20 | 2024-01-02 → 2026-10-16 |

## ipca — IPCA — variação mensal e acumulada em 12 meses

- **Instituição:** IBGE
- **Código:** SIDRA 1737, variáveis 63 e 2265 (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/1737
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-10-20):** GET /api/v3/agregados/1737/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** IPCA - Série histórica com número-índice, variação mensal e variações acumuladas em 3 meses, em 6 meses, no ano e em 12 meses (a partir de dezembro/1979); var. 63 "IPCA - Variação mensal" (%); var. 2265 "IPCA - Variação acumulada em 12 meses" (%)
- **Observações:** Fonte primária do índice. O IPCA cheio não foi localizado com código SGS no catálogo de dados abertos do BCB; por isso usa-se o SIDRA.
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/201201-209912/variaveis/63%7C2265?localidades=N1%5Ball%5D`

## selic_meta — Taxa de juros — Meta Selic definida pelo Copom

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 432
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search, conjunto "432-taxa-de-juros---meta-selic-definida-pelo-copom")
- **Nome oficial retornado pela fonte:** Taxa de juros - Meta Selic definida pelo Copom; série temporal diária; unidade: percentual ao ano; fonte: Comitê de Política Monetária
- **Observações:** A API retorna valores para datas futuras (até a próxima reunião do Copom); o processamento descarta datas posteriores à extração. Consultas JSON exigem janelas curtas: janelas próximas de 10 anos retornam página de erro HTML com status 200, por isso a extração é feita por ano.
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2012`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/01/2013&dataFinal=31/12/2013`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/01/2014&dataFinal=31/12/2014`
  - … (15 requisições, uma por ano)

## desocupacao — Taxa de desocupação (PNAD Contínua), trimestre móvel

- **Instituição:** IBGE
- **Código:** SIDRA 6381, variáveis 4099 e 4103 (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/6381
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-10-20):** GET /api/v3/agregados/6381/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** Taxa de desocupação, na semana de referência, das pessoas de 14 anos ou mais de idade (PNAD Contínua mensal); var. 4099 (%) e var. 4103 "Coeficiente de variação" (%)
- **Observações:** O período AAAAMM identifica o último mês do trimestre móvel. Série sem ajuste sazonal.
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/6381/periodos/201203-209912/variaveis/4099%7C4103?localidades=N1%5Ball%5D`

## focus_ipca — Expectativas de mercado (Focus) — IPCA anual, mediana

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoAnuais, Indicador='IPCA', baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** OData $metadata do serviço Expectativas v1 (entidade ExpectativaMercadoAnual) e documentação do serviço no Olinda
- **Nome oficial retornado pela fonte:** ExpectativasMercadoAnuais: Indicador, Data, DataReferencia, Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Observações:** baseCalculo 0 = "uso das expectativas mais recentes informadas pelas instituições participantes a partir do 30º dia anterior à data de cálculo das estatísticas" (documentação oficial do serviço).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2024-01-01'&$select=Data%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=20000`
