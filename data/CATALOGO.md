# Catálogo de dados e fontes

> Gerado por `npm run data:catalogo` a partir de `scripts/data/series.ts`. Não edite à mão.
> Toda série publicada foi verificada contra a fonte oficial; séries não verificadas ficam em `docs/PENDIENTES.md`.

| Série | Painel | Código | Unidade | Frequência | Verificada em | Última extração | Cobertura |
|---|---|---|---|---|---|---|---|
| IPCA — variação mensal e acumulada em 12 meses | conjuntura | SIDRA 1737, variáveis 63 e 2265 (Brasil) | % | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-09 |
| Taxa de juros — Meta Selic definida pelo Copom | conjuntura | SGS 432 | % a.a. | diária | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-10 |
| Taxa de desocupação (PNAD Contínua), trimestre móvel | conjuntura | SIDRA 6381, variáveis 4099 e 4103 (Brasil) | % | trimestre móvel (mensal) | 2026-10-20 | 2026-10-20 | 2012-03 → 2026-08 |
| Expectativas de mercado (Focus) — IPCA anual, mediana | conjuntura | Olinda Expectativas v1, ExpectativasMercadoAnuais, Indicador='IPCA', baseCalculo=0 | % (variação no ano de referência) | diária (dias úteis) | 2026-10-20 | 2026-10-20 | 2024-01-02 → 2026-10-16 |
| PIB a preços de mercado — taxa interanual e taxa contra o trimestre anterior (dessazonalizada) | panorama | SIDRA 5932, variáveis 6561 e 6564, classificação 11255 [90707] (Brasil) | % | trimestral | 2026-10-20 | 2026-10-20 | 1996-T1 → 2026-T2 |
| Taxa de câmbio — livre — dólar americano (venda), PTAX | panorama | SGS 1 | R$/US$ | diária | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-10 |
| Transações correntes acumuladas em 12 meses em relação ao PIB | panorama | SGS 23079 | % do PIB | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-08 |
| NFSP — resultado primário do setor público consolidado, acumulado em 12 meses | panorama | SGS 5793 | % do PIB (NFSP: positivo = déficit) | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-08 |
| Dívida bruta do governo geral (DBGG) | panorama | SGS 13762 | % do PIB | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-08 |
| Dívida líquida do setor público (DLSP) | panorama | SGS 4513 | % do PIB | mensal | 2026-10-20 | 2026-10-20 | 2012-01 → 2026-08 |
| Expectativas de mercado (Focus) — indicadores anuais, mediana | panorama | Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0; Indicador ∈ {IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário} | conforme o indicador (% ; R$/US$ ; % do PIB) | diária (dias úteis) | 2026-10-20 | 2026-10-20 | 2026-06-22 → 2026-10-16 |
| Expectativas de mercado (Focus) — IPCA mensal, mediana | panorama | Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0 | % (variação no mês de referência) | diária (dias úteis) | 2026-10-20 | 2026-10-20 | 2026-09-08 → 2026-10-16 |
| Expectativas de mercado (Focus) — IPCA para os 12 meses seguintes, suavizada, mediana | panorama | Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', Suavizada='S', baseCalculo=0 | % (próximos 12 meses) | diária (dias úteis) | 2026-10-20 | 2026-10-20 | 2012-01-02 → 2026-10-16 |
| Metas para a inflação e intervalos de tolerância | panorama | Página "Histórico: meta de inflação vs. inflação efetiva" (API de conteúdo do sítio do BCB) | % | anual (1999–2024); meta contínua desde 2025 | 2026-10-20 | 2026-10-20 | 2005 → 2025 |
| Penn World Table, versão 11.0 | panorama | pwt110.xlsx (Dataverse, DOI 10.34894/FABVLR, arquivo 554105) | conforme a variável | anual (1950–2023) | 2026-10-20 | 2026-10-20 | ARG → USA |

## ipca — IPCA — variação mensal e acumulada em 12 meses

- **Instituição:** IBGE
- **Código:** SIDRA 1737, variáveis 63 e 2265 (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/1737
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-10-20):** GET /api/v3/agregados/1737/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** IPCA - Série histórica com número-índice, variação mensal e variações acumuladas em 3 meses, em 6 meses, no ano e em 12 meses (a partir de dezembro/1979); var. 63 "IPCA - Variação mensal" (%); var. 2265 "IPCA - Variação acumulada em 12 meses" (%)
- **Observações:** Fonte primária do índice. Conferido contra a tabela "meta vs. inflação efetiva" do BCB (set/26 = 4,58; ago/26 = 4,22).
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/201201-209912/variaveis/63%7C2265?localidades=N1%5Ball%5D`

## selic_meta — Taxa de juros — Meta Selic definida pelo Copom

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 432
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=432
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** Taxa de juros - Meta Selic definida pelo Copom; série temporal diária; unidade: percentual ao ano; fonte: Comitê de Política Monetária
- **Observações:** A API retorna valores para datas futuras (até a próxima reunião do Copom); o processamento descarta datas posteriores à extração.
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
- **Observações:** baseCalculo 0 = "uso das expectativas mais recentes informadas pelas instituições participantes a partir do 30º dia anterior à data de cálculo das estatísticas".
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2024-01-01'&$select=Data%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`

## pib — PIB a preços de mercado — taxa interanual e taxa contra o trimestre anterior (dessazonalizada)

- **Instituição:** IBGE
- **Código:** SIDRA 5932, variáveis 6561 e 6564, classificação 11255 [90707] (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/5932
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-10-20):** GET /api/v3/agregados/5932/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** Taxa de variação do índice de volume trimestral; var. 6561 "Taxa trimestral (em relação ao mesmo período do ano anterior)" (%); var. 6564 "Taxa trimestre contra trimestre imediatamente anterior" (%); categoria 90707 "PIB a preços de mercado"
- **Observações:** A taxa 6564 foi conferida contra a variação do índice com ajuste sazonal (SIDRA 1621, var. 584): diferenças de no máximo 0,1 p.p., por arredondamento do índice.
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/5932/periodos/all/variaveis/6561%7C6564?localidades=N1%5Ball%5D&classificacao=11255%5B90707%5D`

## ptax — Taxa de câmbio — livre — dólar americano (venda), PTAX

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** Taxa de câmbio - Livre - Dólar americano (venda) - diário
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2012`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial=01/01/2013&dataFinal=31/12/2013`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial=01/01/2014&dataFinal=31/12/2014`
  - … (15 requisições, uma por ano)

## conta_corrente — Transações correntes acumuladas em 12 meses em relação ao PIB

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 23079
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=23079
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** Transações Correntes acumulado em 12 meses em relação ao PIB - mensal
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.23079/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.23079/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.23079/dados?formato=json&dataInicial=01/01/2022&dataFinal=20/10/2026`

## primario — NFSP — resultado primário do setor público consolidado, acumulado em 12 meses

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 5793
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=5793
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** NFSP sem desvalorização cambial (% PIB) - Fluxo acumulado em 12 meses - Resultado primário - Total - Setor público consolidado
- **Observações:** Necessidades de financiamento: valor positivo indica déficit. O sítio apresenta o resultado primário com sinal de superávit (= −NFSP).
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.5793/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.5793/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.5793/dados?formato=json&dataInicial=01/01/2022&dataFinal=20/10/2026`

## dbgg — Dívida bruta do governo geral (DBGG)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 13762
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=13762
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** Dívida bruta do governo geral (% PIB) - Metodologia utilizada a partir de 2008
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/01/2022&dataFinal=20/10/2026`

## dlsp — Dívida líquida do setor público (DLSP)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4513
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4513
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Portal de dados abertos do BCB (CKAN package_search pelo código da série)
- **Nome oficial retornado pela fonte:** Dívida Líquida do Setor Público (% PIB) - Total - Setor público consolidado
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4513/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4513/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4513/dados?formato=json&dataInicial=01/01/2022&dataFinal=20/10/2026`

## focus_anual — Expectativas de mercado (Focus) — indicadores anuais, mediana

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0; Indicador ∈ {IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário}
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Consulta à entidade ExpectativasMercadoAnuais listando os indicadores distintos retornados pela API
- **Nome oficial retornado pela fonte:** IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário
- **Observações:** IPCA anual vem da série focus_ipca (painel Conjuntura).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'Selic'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-06-22'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'PIB%20Total'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-06-22'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'C%C3%A2mbio'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-06-22'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - … (6 requisições, uma por ano)

## focus_mensal_ipca — Expectativas de mercado (Focus) — IPCA mensal, mediana

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** OData $metadata (entidade ExpectativaMercadoMensal) e consulta de amostra
- **Nome oficial retornado pela fonte:** ExpectativaMercadoMensais: Indicador, Data, DataReferencia (MM/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Observações:** Horizonte observado em 16/10/2026: até 10/2028. Usado para compor a trajetória do IPCA em 12 meses (cálculo do CEE).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-09-05'&$select=Data%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`

## focus_12m_ipca — Expectativas de mercado (Focus) — IPCA para os 12 meses seguintes, suavizada, mediana

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', Suavizada='S', baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** OData $metadata (entidade ExpectativaMercadoInflacao12Meses) e consulta de amostra
- **Nome oficial retornado pela fonte:** ExpectativasMercadoInflacao12Meses: Indicador, Data, Suavizada (S/N), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador%20eq%20'IPCA'%20and%20Suavizada%20eq%20'S'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2012-01-01'&$select=Data%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`

## metas_inflacao — Metas para a inflação e intervalos de tolerância

- **Instituição:** Banco Central do Brasil
- **Código:** Página "Histórico: meta de inflação vs. inflação efetiva" (API de conteúdo do sítio do BCB)
- **Consulta pública:** https://www.bcb.gov.br/controleinflacao/historicometas
- **Termos de uso:** Conteúdo público do sítio do Banco Central do Brasil
- **Verificação (2026-10-20):** Leitura da página oficial (navegador) e da API de conteúdo que a alimenta
- **Nome oficial retornado pela fonte:** Histórico do regime de metas de inflação (1999–2024): Ano, Norma, Data, Meta (%), Tamanho do intervalo (p.p.), Intervalo de tolerância (%); desde jan/2025, meta contínua de 3,00% ± 1,5 p.p. (Resolução CMN nº 5.141, de 26/6/2024)
- **Requisições da extração:**
  - `https://www.bcb.gov.br/api/paginasite/sitebcb/controleinflacao/historicometas`

## pwt — Penn World Table, versão 11.0

- **Instituição:** Groningen Growth and Development Centre
- **Código:** pwt110.xlsx (Dataverse, DOI 10.34894/FABVLR, arquivo 554105)
- **Consulta pública:** https://doi.org/10.34894/FABVLR
- **Termos de uso:** CC BY 4.0 (Penn World Table)
- **Verificação (2026-10-20):** API do Dataverse (lista de arquivos do DOI 10.34894/FABVLR com checksum SHA-1); o arquivo enviado pela coordenação é idêntico (mesmo SHA-1)
- **Nome oficial retornado pela fonte:** rgdpna "Real GDP at constant 2021 national prices (in mil. 2021US$)"; pop "Population (in millions)"; emp "Number of persons engaged (in millions)"; cgdpo "Output-side real GDP at current PPPs (in mil. 2021US$)"; pl_gdpo "Price level of CGDPo (PPP/XR), price level of USA GDPo in 2021=1"
- **Observações:** Fonte estática (versão 11.0). Cita-se: Feenstra, Inklaar e Timmer (2015), American Economic Review 105(10).
- **Requisições da extração:**
  - `https://dataverse.nl/api/access/datafile/554105`
