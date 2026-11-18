# Catálogo de dados e fontes

> Gerado por `npm run data:catalogo` a partir de `scripts/data/series.ts`. Não edite à mão.
> Toda série publicada foi verificada contra a fonte oficial; séries não verificadas ficam em `docs/PENDIENTES.md`.

| Série | Painel | Código | Unidade | Frequência | Verificada em | Última extração | Cobertura |
|---|---|---|---|---|---|---|---|
| IPCA — variação mensal e acumulada em 12 meses | conjuntura | SIDRA 1737, variáveis 63 e 2265 (Brasil) | % | mensal | 2026-10-20 | 2026-11-17 | 2012-01 → 2026-10 |
| Taxa de juros — Meta Selic definida pelo Copom | conjuntura | SGS 432 | % a.a. | diária | 2026-10-20 | 2026-11-17 | 2012-01 → 2026-11 |
| Taxa de desocupação (PNAD Contínua), trimestre móvel | conjuntura | SIDRA 6381, variáveis 4099 e 4103 (Brasil) | % | trimestre móvel (mensal) | 2026-10-20 | 2026-11-17 | 2012-03 → 2026-09 |
| Expectativas de mercado (Focus) — IPCA anual, mediana | conjuntura | Olinda Expectativas v1, ExpectativasMercadoAnuais, Indicador='IPCA', baseCalculo=0 | % (variação no ano de referência) | diária (dias úteis) | 2026-10-20 | 2026-11-16 | 2024-01-02 → 2026-11-13 |
| PIB a preços de mercado — taxa interanual e taxa contra o trimestre anterior (dessazonalizada) | panorama | SIDRA 5932, variáveis 6561 e 6564, classificação 11255 [90707] (Brasil) | % | trimestral | 2026-10-20 | 2026-10-20 | 1996-T1 → 2026-T2 |
| Taxa de câmbio — livre — dólar americano (venda), PTAX | panorama | SGS 1 | R$/US$ | diária | 2026-10-20 | 2026-11-17 | 2012-01 → 2026-11 |
| Índice da taxa de câmbio real efetiva (IPCA), jun/1994 = 100 | panorama | SGS 11752 | índice (jun/1994 = 100) | mensal | 2026-11-17 | 2026-11-17 | 2012-01 → 2026-08 |
| Transações correntes acumuladas em 12 meses em relação ao PIB | panorama | SGS 23079 | % do PIB | mensal | 2026-10-20 | 2026-10-28 | 2012-01 → 2026-09 |
| NFSP — resultado primário do setor público consolidado, acumulado em 12 meses | panorama | SGS 5793 | % do PIB (NFSP: positivo = déficit) | mensal | 2026-10-20 | 2026-11-02 | 2012-01 → 2026-09 |
| Dívida bruta do governo geral (DBGG) | panorama | SGS 13762 | % do PIB | mensal | 2026-10-20 | 2026-11-16 | 2012-01 → 2026-09 |
| Dívida líquida do setor público (DLSP) | panorama | SGS 4513 | % do PIB | mensal | 2026-10-20 | 2026-11-16 | 2012-01 → 2026-09 |
| Expectativas de mercado (Focus) — indicadores anuais, mediana | panorama | Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0; Indicador ∈ {IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário} | conforme o indicador (% ; R$/US$ ; % do PIB) | diária (dias úteis) | 2026-10-20 | 2026-11-16 | 2026-07-20 → 2026-11-13 |
| Expectativas de mercado (Focus) — IPCA mensal, mediana | panorama | Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0 | % (variação no mês de referência) | diária (dias úteis) | 2026-10-20 | 2026-11-17 | 2026-10-05 → 2026-11-13 |
| Expectativas de mercado (Focus) — IPCA para os 12 meses seguintes, suavizada, mediana | panorama | Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', Suavizada='S', baseCalculo=0 | % (próximos 12 meses) | diária (dias úteis) | 2026-10-20 | 2026-11-16 | 2012-01-02 → 2026-11-13 |
| Metas para a inflação e intervalos de tolerância | panorama | Página "Histórico: meta de inflação vs. inflação efetiva" (API de conteúdo do sítio do BCB) | % | anual (1999–2024); meta contínua desde 2025 | 2026-10-20 | 2026-10-20 | 2005 → 2025 |
| Penn World Table, versão 11.0 | panorama | pwt110.xlsx (Dataverse, DOI 10.34894/FABVLR, arquivo 554105) | conforme a variável | anual (1950–2023) | 2026-10-20 | 2026-10-20 | ARG → USA |
| PIB acumulado dos últimos 12 meses, em US$ milhões | panorama | SGS 4192 | US$ milhões (12 meses) | mensal | 2026-10-20 | 2026-11-16 | 2014-01 → 2026-10 |
| Exportações e importações brasileiras de bens, total mensal | panorama | ComexStat API /general: flow export e import, monthDetail, metricFOB | US$ FOB | mensal | 2026-10-20 | 2026-11-09 | 2014-01 → 2026-10 |
| Proporção de pessoas abaixo das linhas de pobreza do Banco Mundial (Tabela 2.18) | panorama | SIS 2025, Tabela 2.18 (Pobr_Geo), Brasil: menos de US$ 6,85 e US$ 2,15 PPC 2017 por dia | % da população | anual (2012–) | 2026-10-20 | 2026-10-20 | 2012 → 2024 |
| Taxa Selic efetiva, anualizada base 252 | opm | SGS 1178 | % a.a. | diária | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-17 |
| Histórico das taxas de juros fixadas pelo Copom | opm | API de conteúdo do BCB: /api/servico/sitebcb/historicotaxasjuros | % a.a. | por reunião | 2026-11-18 | 2026-11-18 | 1 → 99 |
| Histórico de votações das reuniões do Copom | opm | historico-votacoes-Copom.xlsx (sítio do BCB, página do Copom) | placar e votos (p.p.) | por reunião | 2026-11-18 | 2026-11-18 | 100 → 99 |
| Calendário das reuniões ordinárias do Copom | opm | Comunicados BCB nº 43383, 45452 (API de normativos) | datas | anual | 2026-11-18 | 2026-11-18 | R1/2026 → R8/2027 |
| Comunicados das decisões do Copom (texto integral) | opm | API de conteúdo do BCB: /api/servico/sitebcb/copom/comunicados_detalhes | texto (HTML) | por reunião | 2026-11-18 | 2026-11-18 | 200 → 282 |
| Atas das reuniões do Copom (texto integral) | opm | API de conteúdo do BCB: /api/servico/sitebcb/copom/atas_detalhes | texto (HTML) | por reunião | 2026-11-18 | 2026-11-18 | 200 → 282 |
| Focus — Selic por reunião do Copom | opm | Olinda Expectativas v1, ExpectativasMercadoSelic, baseCalculo=0 | % a.a. | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus Top 5 (curto prazo) — Selic por reunião do Copom | opm | Olinda Expectativas v1, ExpectativasMercadoTop5Selic, tipoCalculo='C' | % a.a. | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus — indicadores anuais (IPCA, Selic, PIB, câmbio), todas as estatísticas | opm | Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0, Indicador ∈ {IPCA; Selic; PIB Total; Câmbio} | conforme o indicador | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus — IPCA mensal, todas as estatísticas | opm | Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0 | % (variação no mês) | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus — IPCA nos 12 meses seguintes (suavizada e não suavizada), todas as estatísticas | opm | Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', baseCalculo=0 | % (próximos 12 meses) | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus Top 5 (curto prazo) — IPCA e Selic anuais | opm | Olinda Expectativas v1, ExpectativasMercadoTop5Anuais, tipoCalculo='C', Indicador ∈ {IPCA; Selic} | conforme o indicador | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| Focus Top 5 (curto prazo) — IPCA mensal | opm | Olinda Expectativas v1, ExpectativasMercadoTop5Mensais, Indicador='IPCA', tipoCalculo='C' | % (variação no mês) | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-13 |
| IPCA — preços livres | opm | SGS 11428 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — preços administrados (monitorados) | opm | SGS 4449 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — serviços | opm | SGS 10844 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — bens industriais | opm | SGS 27863 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — alimentação no domicílio | opm | SGS 27864 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — comercializáveis | opm | SGS 4447 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — não comercializáveis | opm | SGS 4448 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — bens duráveis | opm | SGS 10843 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — bens semiduráveis | opm | SGS 10842 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — bens não duráveis | opm | SGS 10841 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX0 | opm | SGS 11427 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX1 | opm | SGS 16121 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX2 | opm | SGS 27838 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX3 | opm | SGS 27839 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX-FE (ex-alimentação e energia) | opm | SGS 28751 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — médias aparadas com suavização (MS) | opm | SGS 4466 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — médias aparadas sem suavização (MA) | opm | SGS 11426 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — dupla ponderação (DP) | opm | SGS 16122 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — percentil 55 (P55) | opm | SGS 28750 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX3 serviços | opm | SGS 29683 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Núcleo do IPCA — EX3 industriais | opm | SGS 29684 | % (variação mensal) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — índice de difusão | opm | SGS 21379 | % dos subitens com variação positiva | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPCA — variação mensal e peso de grupos, subgrupos, itens e subitens | opm | SIDRA 7060, variáveis 63 e 66, classificação 315 (todas as categorias), Brasil | % (variação mensal) e % (peso) | mensal (desde jan./2020) | 2026-11-18 | 2026-11-18 | 2020-01 → 2026-10 |
| Taxa média de juros das operações de crédito — total | opm | SGS 20714 | % a.a. | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Taxa média de juros das operações de crédito — pessoas jurídicas | opm | SGS 20715 | % a.a. | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Taxa média de juros do crédito livre — pessoas físicas | opm | SGS 20740 | % a.a. | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Spread médio das operações de crédito — total | opm | SGS 20783 | p.p. | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Indicador de Custo do Crédito (ICC) — total | opm | SGS 25351 | % a.a. | mensal | 2026-11-18 | 2026-11-18 | 2013-01 → 2026-09 |
| Índice de Commodities — Brasil (IC-Br) | opm | SGS 27574 | índice | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IC-Br — agropecuária | opm | SGS 27575 | índice | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IC-Br — metal | opm | SGS 27576 | índice | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IC-Br — energia | opm | SGS 27577 | índice | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IBC-Br com ajuste sazonal | opm | SGS 24364 | índice (2002 = 100) | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| PIB acumulado dos últimos 12 meses, valores correntes | opm | SGS 4382 | R$ milhões | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| Fed funds — limite superior do intervalo-alvo | opm | FRED DFEDTARU | % a.a. | diária | 2026-11-18 | 2026-11-18 | 2012-01-01 → 2026-11-17 |
| Rendimento do Tesouro americano de 10 anos | opm | FRED DGS10 | % a.a. | diária | 2026-11-18 | 2026-11-18 | 2012-01-03 → 2026-11-16 |
| Rendimento real do Tesouro americano de 5 anos (TIPS) | opm | FRED DFII5 | % a.a. | diária | 2026-11-18 | 2026-11-18 | 2012-01-03 → 2026-11-16 |
| Índice amplo nominal do dólar americano | opm | FRED DTWEXBGS | índice (jan./2006 = 100) | diária | 2026-11-18 | 2026-11-18 | 2012-01-03 → 2026-11-13 |
| Petróleo Brent — preço à vista (Europa) | opm | FRED DCOILBRENTEU | US$ por barril | diária | 2026-11-18 | 2026-11-18 | 2012-01-03 → 2026-11-11 |
| Taxas e preços dos títulos ofertados pelo Tesouro Direto | opm | Tesouro Transparente (CKAN), conjunto "Taxas dos Títulos Ofertados pelo Tesouro Direto", arquivo precotaxatesourodireto.csv | % a.a. (base 252) e R$ | diária (dias úteis) | 2026-11-18 | 2026-11-18 | 2012-01-02 → 2026-11-17 |
| PIB — índice de volume trimestral com ajuste sazonal | opm | SIDRA 1621, variável 584, classificação 11255 [90707] (Brasil) | índice (média de 1995 = 100) | trimestral | 2026-11-18 | 2026-11-18 | 1996-T1 → 2026-T2 |
| IPCA-15 — variação mensal e acumulada em 12 meses | opm | SIDRA 3065, variáveis 355 e 1120 (Brasil) | % | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| INPC — variação mensal e acumulada em 12 meses | opm | SIDRA 1736, variáveis 44 e 2292 (Brasil) | % | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-10 |
| IPP — indústria geral e indústrias de transformação, variação mensal e em 12 meses | opm | SIDRA 6903, variáveis 1396 e 1394, classificação 842 [46608, 46610] (Brasil) | % | mensal (desde dez./2013) | 2026-11-18 | 2026-11-18 | 2014-01 → 2026-09 |
| IPCA por área — índice geral e grupos (variação mensal, 12 meses e peso) | opm | SIDRA 7060, variáveis 63, 2265, 66, classificação 315 (índice geral e 9 grupos), Brasil, regiões metropolitanas (N7) e municípios (N6) | % e peso (%) | mensal (desde jan./2020) | 2026-11-18 | 2026-11-18 | 2020-01 → 2026-10 |
| INPC por área — índice geral e grupos (variação mensal, 12 meses e peso) | opm | SIDRA 7063, variáveis 44, 2292, 45, classificação 315 (índice geral e 9 grupos), Brasil, regiões metropolitanas (N7) e municípios (N6) | % e peso (%) | mensal (desde jan./2020) | 2026-11-18 | 2026-11-18 | 2020-01 → 2026-10 |
| Pesos regionais do IPCA e do INPC (POF 2017-2018) | opm | FTP IBGE, Atualizacao_das_Estruturas_POF2017-2018/Pesos_Regionais_IPCA_e_INPC.zip | % do índice nacional | fixo (estrutura POF 2017-2018, em vigor desde jan./2020) | 2026-11-18 | 2026-11-18 | Aracaju → Vitória |
| Centroides dos municípios-sede das áreas do IPCA | opm | API de malhas v3 do IBGE, /malhas/municipios/{id}/metadados (campo centroide) | graus (longitude, latitude) | fixo | 2026-11-18 | 2026-11-18 | 1200401 → 5300108 |
| Base monetária restrita (saldo em final de período) | opm | SGS 1788 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Papel-moeda em circulação (emitido), componente da base (saldo em final de período) | opm | SGS 1786 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Reservas bancárias (saldo em final de período) | opm | SGS 1787 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Base monetária ampliada (saldo em final de período) | opm | SGS 1833 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Base ampliada — depósitos compulsórios em espécie (saldo em final de período) | opm | SGS 1828 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2012-01 → 2026-09 |
| Papel-moeda em poder do público (saldo em final de período) — Novo | opm | SGS 27789 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |
| Depósitos à vista (saldo em final de período) — Novo | opm | SGS 27790 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |
| M1 (saldo em final de período) — Novo | opm | SGS 27791 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |
| M2 (saldo em final de período) — Novo | opm | SGS 27810 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |
| M3 (saldo em final de período) — Novo | opm | SGS 27813 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |
| M4 (saldo em final de período) — Novo | opm | SGS 27815 | R$ mil | mensal | 2026-11-18 | 2026-11-18 | 2002-01 → 2026-09 |

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

## cambio_real — Índice da taxa de câmbio real efetiva (IPCA), jun/1994 = 100

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 11752
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=11752
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-17):** Página pública de consulta do SGS (consultarValoresSeries, versão em português), que lista código, nome completo, unidade, periodicidade, início e último valor; valores conferidos com a API do SGS
- **Nome oficial retornado pela fonte:** Índice da taxa de câmbio real efetiva (IPCA) - Jun/1994=100
- **Observações:** Unidade "Índice", periodicidade M, início 01/01/1988, último valor ago/2026 (consulta de 17/11/2026). Alta = depreciação real. A versão em inglês da mesma página traz "Jun/1994=101", erro de tradução do SGS; vale o nome em português. Valores de referência conferidos: jul/2011 71,76; set/2015 129,34; mai/2020 149,83; ago/2025 127,44; jul/2026 119,67; ago/2026 123,23.
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11752/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11752/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11752/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

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
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.23079/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

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
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.5793/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

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
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

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
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4513/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## focus_anual — Expectativas de mercado (Focus) — indicadores anuais, mediana

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0; Indicador ∈ {IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário}
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Consulta à entidade ExpectativasMercadoAnuais listando os indicadores distintos retornados pela API
- **Nome oficial retornado pela fonte:** IPCA; Selic; PIB Total; Câmbio; Dívida bruta do governo geral; Dívida líquida do setor público; Resultado primário
- **Observações:** IPCA anual vem da série focus_ipca (painel Conjuntura).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'Selic'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-07-21'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'PIB%20Total'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-07-21'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=Indicador%20eq%20'C%C3%A2mbio'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-07-21'&$select=Indicador%2CData%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
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
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2026-10-04'&$select=Data%2CDataReferencia%2CMediana%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`

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
- **Nome oficial retornado pela fonte:** rgdpna "Real GDP at constant 2021 national prices (in mil. 2021US$)"; pop "Population (in millions)"; emp "Number of persons engaged (in millions)"; cgdpo "Output-side real GDP at current PPPs (in mil. 2021US$)"; pl_gdpo "Price level of CGDPo (PPP/XR), price level of USA GDPo in 2021=1"; csh_x "Share of merchandise exports at current PPPs"; csh_m "Share of merchandise imports at current PPPs"; pl_x "Price level of exports, price level of USA GDPo in 2021=1"; pl_m "Price level of imports, price level of USA GDPo in 2021=1"
- **Observações:** Fonte estática (versão 11.0). Cita-se: Feenstra, Inklaar e Timmer (2015), American Economic Review 105(10). Apesar do rótulo "merchandise" na Legend, o guia do usuário (PWT 11.0, User guide to data files) informa que exportações e importações vêm das contas nacionais; conferido em 2026-11-11: (csh_x·pl_x − csh_m·pl_m)/pl_gdpo do Brasil em 2023 = 33,7 %, igual à razão (exportação + importação de bens e serviços)/PIB das Contas Nacionais Trimestrais do IBGE (SIDRA 1846, 2023: 33,67 %). Logo, cobre bens e serviços.
- **Requisições da extração:**
  - `https://dataverse.nl/api/access/datafile/554105`

## pib_usd — PIB acumulado dos últimos 12 meses, em US$ milhões

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4192
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4192
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-10-20):** Webservice SOAP do SGS (FachadaWSSGS.getUltimoValorXML, código 4192); a série não consta do catálogo CKAN
- **Nome oficial retornado pela fonte:** PIB acumulado dos últimos 12 meses - Em US$ milhões (periodicidade M, unidade US$ (milhões))
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4192/dados?formato=json&dataInicial=01/01/2014&dataFinal=31/12/2018`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4192/dados?formato=json&dataInicial=01/01/2019&dataFinal=31/12/2023`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4192/dados?formato=json&dataInicial=01/01/2024&dataFinal=18/11/2026`

## comercio — Exportações e importações brasileiras de bens, total mensal

- **Instituição:** MDIC/Secex — ComexStat
- **Código:** ComexStat API /general: flow export e import, monthDetail, metricFOB
- **Consulta pública:** https://comexstat.mdic.gov.br/pt/geral
- **Termos de uso:** Dados abertos do MDIC (ComexStat); reutilização com citação da fonte
- **Verificação (2026-10-20):** API do ComexStat (/general/filters e /general/dates/updated; consulta /general por fluxo, sem filtros)
- **Nome oficial retornado pela fonte:** Dados Gerais de Exportação e Importação — métrica Valor US$ FOB
- **Observações:** Comércio de bens (Siscomex). Importações também em US$ FOB, para somar com exportações na mesma base.
- **Requisições da extração:**
  - `https://api-comexstat.mdic.gov.br/general`
  - `https://api-comexstat.mdic.gov.br/general`

## pobreza — Proporção de pessoas abaixo das linhas de pobreza do Banco Mundial (Tabela 2.18)

- **Instituição:** IBGE — Síntese de Indicadores Sociais
- **Código:** SIS 2025, Tabela 2.18 (Pobr_Geo), Brasil: menos de US$ 6,85 e US$ 2,15 PPC 2017 por dia
- **Consulta pública:** https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-10-20):** Arquivo oficial no FTP do IBGE; cabeçalhos e notas da Tabela 2.18 conferidos (2024: 23,1 % e 3,5 %, iguais aos divulgados pela Agência IBGE em 3/12/2025)
- **Nome oficial retornado pela fonte:** Tabela 2.18 — Proporção de pessoas por classes de rendimento domiciliar per capita: menos de US$ 2,15, US$ 3,65 e US$ 6,85 PPC 2017
- **Observações:** PNAD Contínua, acumulado de primeiras visitas. Conversão PPC para consumo privado (R$ 2,3273771 por US$ 1,00 PPC 2017), valores mensais inflacionados pelo IPCA. A tabela SIDRA 5877 (ODS 1.2.1) não foi usada: dá valores diferentes (26,5 % em 2024) e a linha não está documentada na API.
- **Requisições da extração:**
  - `https://ftp.ibge.gov.br/Indicadores_Sociais/Sintese_de_Indicadores_Sociais/Sintese_de_Indicadores_Sociais_2025/Tabelas/ods/2_Distribuicao_Renda_ods.zip`

## selic_efetiva — Taxa Selic efetiva, anualizada base 252

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1178
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1178
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Taxa de juros - Selic anualizada base 252 (unidade: % a.a.; periodicidade: D)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2012`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json&dataInicial=01/01/2013&dataFinal=31/12/2013`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json&dataInicial=01/01/2014&dataFinal=31/12/2014`
  - … (15 requisições, uma por ano)

## copom_decisoes — Histórico das taxas de juros fixadas pelo Copom

- **Instituição:** Banco Central do Brasil
- **Código:** API de conteúdo do BCB: /api/servico/sitebcb/historicotaxasjuros
- **Consulta pública:** https://www.bcb.gov.br/controleinflacao/historicotaxasjuros
- **Termos de uso:** Conteúdo público do sítio do Banco Central do Brasil
- **Verificação (2026-11-18):** Consulta à API que alimenta a página "Histórico das taxas de juros"; conferida contra os comunicados das reuniões 281 e 282
- **Nome oficial retornado pela fonte:** Campos: NumeroReuniaoCopom, ReuniaoExtraordinaria, DataReuniaoCopom, Vies, MetaSelic, DataInicioVigencia, DataFimVigencia, TaxaSelicEfetivaVigencia, TaxaSelicEfetivaAnualizada
- **Observações:** 281ª (16/9/2026) e 282ª (4/11/2026): meta de 13,75 % a.a.
- **Requisições da extração:**
  - `https://www.bcb.gov.br/api/servico/sitebcb/historicotaxasjuros`

## copom_votos — Histórico de votações das reuniões do Copom

- **Instituição:** Banco Central do Brasil
- **Código:** historico-votacoes-Copom.xlsx (sítio do BCB, página do Copom)
- **Consulta pública:** https://www.bcb.gov.br/controleinflacao/copom
- **Termos de uso:** Banco Central do Brasil: "Sua reprodução e edição é autorizada, desde que citada a fonte: Histórico de votações das reuniões do Copom"
- **Verificação (2026-11-18):** Arquivo oficial vinculado na página do Copom; cabeçalhos e notas lidos
- **Nome oficial retornado pela fonte:** Histórico de votações do Copom: Reunião, Data, Decisão Selic (% a.a.), Variação Selic (p.p.), Placar, Votante, Voto variação Selic (p.p.), Voto menos decisão (p.p.)
- **Observações:** O sítio publica só o placar e a contagem de votos divergentes, sem nomes. 282ª: Unanimidade (7 votantes).
- **Requisições da extração:**
  - `https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx`

## copom_calendario — Calendário das reuniões ordinárias do Copom

- **Instituição:** Banco Central do Brasil
- **Código:** Comunicados BCB nº 43383, 45452 (API de normativos)
- **Consulta pública:** https://www.bcb.gov.br/controleinflacao/copom
- **Termos de uso:** Ato normativo público do Banco Central do Brasil
- **Verificação (2026-11-18):** Texto dos comunicados lido pela API de normativos (exibeoutrasnormas)
- **Nome oficial retornado pela fonte:** Comunicado nº 43.383 (24/6/2025) e nº 45.452 (23/6/2026): "Divulga o Calendário das Reuniões Ordinárias do Comitê de Política Monetária (Copom)"
- **Observações:** 2026: 27–28/1, 17–18/3, 28–29/4, 16–17/6, 4–5/8, 15–16/9, 3–4/11, 8–9/12. 2027: 26–27/1, 16–17/3, 27–28/4, 15–16/6, 3–4/8, 21–22/9, 26–27/10, 7–8/12.
- **Requisições da extração:**
  - `https://www.bcb.gov.br/api/conteudo/app/normativos/exibeoutrasnormas?p1=Comunicado&p2=43383`
  - `https://www.bcb.gov.br/api/conteudo/app/normativos/exibeoutrasnormas?p1=Comunicado&p2=45452`

## copom_comunicados — Comunicados das decisões do Copom (texto integral)

- **Instituição:** Banco Central do Brasil
- **Código:** API de conteúdo do BCB: /api/servico/sitebcb/copom/comunicados_detalhes
- **Consulta pública:** https://www.bcb.gov.br/controleinflacao/comunicadoscopom
- **Termos de uso:** Conteúdo público do sítio do Banco Central do Brasil
- **Verificação (2026-11-18):** Consulta à API que alimenta a página de comunicados (reuniões 200, 281, 282 e 283, esta ainda vazia)
- **Nome oficial retornado pela fonte:** Campos: nro_reuniao, dataReferencia, titulo, textoComunicado (HTML)
- **Observações:** Guardado em bruto, com hash, para o índice de tom (I.14, camada 3). Reuniões ainda não realizadas retornam {"conteudo":[]}.
- **Requisições da extração:**
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/comunicados_detalhes?nro_reuniao=200`
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/comunicados_detalhes?nro_reuniao=201`
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/comunicados_detalhes?nro_reuniao=202`
  - … (85 requisições, uma por ano)

## copom_atas — Atas das reuniões do Copom (texto integral)

- **Instituição:** Banco Central do Brasil
- **Código:** API de conteúdo do BCB: /api/servico/sitebcb/copom/atas_detalhes
- **Consulta pública:** https://www.bcb.gov.br/publicacoes/atascopom
- **Termos de uso:** Conteúdo público do sítio do Banco Central do Brasil
- **Verificação (2026-11-18):** Consulta à API que alimenta a página de atas (reuniões 200 e 282)
- **Nome oficial retornado pela fonte:** Campos: nroReuniao, dataReferencia, dataPublicacao, titulo, urlPdfAta, textoAta (HTML; nulo nas atas antigas, que só têm PDF)
- **Observações:** Guardado em bruto, com hash. Atas sem texto (textoAta nulo) ficam fora do índice de tom até a extração do PDF.
- **Requisições da extração:**
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/atas_detalhes?nro_reuniao=200`
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/atas_detalhes?nro_reuniao=201`
  - `https://www.bcb.gov.br/api/servico/sitebcb/copom/atas_detalhes?nro_reuniao=202`
  - … (85 requisições, uma por ano)

## focus_selic — Focus — Selic por reunião do Copom

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoSelic, baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativaMercadoSelic: Indicador, Data, Reuniao (Rk/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Observações:** A 282ª reunião (3–4/11/2026) é R7/2026; mediana na coleta de 30/10/2026: 13,50 % (139 respondentes).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoSelic?$filter=baseCalculo%20eq%200%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Data%2CReuniao%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoSelic?$filter=baseCalculo%20eq%200%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Data%2CReuniao%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoSelic?$filter=baseCalculo%20eq%200%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Data%2CReuniao%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_selic_top5 — Focus Top 5 (curto prazo) — Selic por reunião do Copom

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoTop5Selic, tipoCalculo='C'
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativasMercadoSelicTop5: indicador, Data, reuniao, tipoCalculo (C curto, M médio, L longo prazo), media, mediana, desvioPadrao, coeficienteVariacao, minimo, maximo
- **Observações:** Os campos desta entidade vêm em minúsculas e sem número de respondentes. Só o ranking de curto prazo (tipoCalculo C), o usado na surpresa (I.5): os rankings de médio e longo prazo triplicariam o volume sem uso nos indicadores.
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Selic?$filter=indicador%20eq%20'Selic'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Data%2Creuniao%2CtipoCalculo%2Cmedia%2Cmediana%2CdesvioPadrao%2Cminimo%2Cmaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Selic?$filter=indicador%20eq%20'Selic'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Data%2Creuniao%2CtipoCalculo%2Cmedia%2Cmediana%2CdesvioPadrao%2Cminimo%2Cmaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Selic?$filter=indicador%20eq%20'Selic'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Data%2Creuniao%2CtipoCalculo%2Cmedia%2Cmediana%2CdesvioPadrao%2Cminimo%2Cmaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_anuais — Focus — indicadores anuais (IPCA, Selic, PIB, câmbio), todas as estatísticas

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoAnuais, baseCalculo=0, Indicador ∈ {IPCA; Selic; PIB Total; Câmbio}
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativaMercadoAnual: Indicador, IndicadorDetalhe, Data, DataReferencia, Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Observações:** Difere de focus_ipca e focus_anual (Panorama), que guardam só a mediana numa janela curta. Na coleta de 30/10/2026: IPCA 2026 = 5,2166 e 2027 = 4,7646 (medianas).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=baseCalculo%20eq%200%20and%20(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic'%20or%20Indicador%20eq%20'PIB%20Total'%20or%20Indicador%20eq%20'C%C3%A2mbio')%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Indicador%2CData%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=baseCalculo%20eq%200%20and%20(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic'%20or%20Indicador%20eq%20'PIB%20Total'%20or%20Indicador%20eq%20'C%C3%A2mbio')%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Indicador%2CData%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=baseCalculo%20eq%200%20and%20(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic'%20or%20Indicador%20eq%20'PIB%20Total'%20or%20Indicador%20eq%20'C%C3%A2mbio')%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Indicador%2CData%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_mensais — Focus — IPCA mensal, todas as estatísticas

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativaMercadoMensais, Indicador='IPCA', baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativaMercadoMensal: Indicador, Data, DataReferencia (MM/AAAA), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Data%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Data%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Data%2CDataReferencia%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_inflacao_12m — Focus — IPCA nos 12 meses seguintes (suavizada e não suavizada), todas as estatísticas

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoInflacao12Meses, Indicador='IPCA', baseCalculo=0
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativaMercadoInflacao12Meses: Indicador, Data, Suavizada (S/N), Media, Mediana, DesvioPadrao, Minimo, Maximo, numeroRespondentes, baseCalculo
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Data%2CSuavizada%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Data%2CSuavizada%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador%20eq%20'IPCA'%20and%20baseCalculo%20eq%200%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Data%2CSuavizada%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo%2CnumeroRespondentes&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_top5_anuais — Focus Top 5 (curto prazo) — IPCA e Selic anuais

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoTop5Anuais, tipoCalculo='C', Indicador ∈ {IPCA; Selic}
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativasMercadoTop5Anual: Indicador, Data, DataReferencia, tipoCalculo (C, M, L), Media, Mediana, DesvioPadrao, Minimo, Maximo
- **Observações:** Só o ranking de curto prazo (tipoCalculo C).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Anuais?$filter=(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic')%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Indicador%2CData%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Anuais?$filter=(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic')%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Indicador%2CData%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Anuais?$filter=(Indicador%20eq%20'IPCA'%20or%20Indicador%20eq%20'Selic')%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Indicador%2CData%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## focus_top5_mensais — Focus Top 5 (curto prazo) — IPCA mensal

- **Instituição:** Banco Central do Brasil
- **Código:** Olinda Expectativas v1, ExpectativasMercadoTop5Mensais, Indicador='IPCA', tipoCalculo='C'
- **Consulta pública:** https://www3.bcb.gov.br/expectativas2/#/consultaSeriesEstatisticas
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** OData $metadata do serviço Expectativas v1 (Olinda) e consulta de amostra (30/10/2026)
- **Nome oficial retornado pela fonte:** ExpectativasMercadoTop5Mensal: Indicador, Data, DataReferencia (MM/AAAA), tipoCalculo (C, M, L), Media, Mediana, DesvioPadrao, Minimo, Maximo
- **Observações:** Só o ranking de curto prazo (tipoCalculo C).
- **Requisições da extração:**
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Mensais?$filter=Indicador%20eq%20'IPCA'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2012-01-01'%20and%20Data%20le%20'2012-12-31'&$select=Data%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Mensais?$filter=Indicador%20eq%20'IPCA'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2013-01-01'%20and%20Data%20le%20'2013-12-31'&$select=Data%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoTop5Mensais?$filter=Indicador%20eq%20'IPCA'%20and%20tipoCalculo%20eq%20'C'%20and%20Data%20ge%20'2014-01-01'%20and%20Data%20le%20'2014-12-31'&$select=Data%2CDataReferencia%2CtipoCalculo%2CMedia%2CMediana%2CDesvioPadrao%2CMinimo%2CMaximo&$orderby=Data%20asc&$format=json&$top=50000`
  - … (15 requisições, uma por ano)

## ipca_livres — IPCA — preços livres

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 11428
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=11428
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Itens livres (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11428/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11428/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11428/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_administrados — IPCA — preços administrados (monitorados)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4449
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4449
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Administrados (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4449/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4449/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4449/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_servicos — IPCA — serviços

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 10844
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=10844
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Serviços (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_industriais — IPCA — bens industriais

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27863
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27863
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Industriais (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27863/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27863/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27863/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_alim_dom — IPCA — alimentação no domicílio

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27864
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27864
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Alimentação no domicílio (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27864/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27864/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27864/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_comercializaveis — IPCA — comercializáveis

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4447
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4447
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Comercializáveis (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4447/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4447/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4447/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_nao_comercializaveis — IPCA — não comercializáveis

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4448
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4448
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Não comercializáveis (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4448/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4448/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4448/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_duraveis — IPCA — bens duráveis

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 10843
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=10843
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Duráveis (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10843/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10843/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10843/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_semiduraveis — IPCA — bens semiduráveis

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 10842
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=10842
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Bens semiduráveis (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10842/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10842/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10842/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_nao_duraveis — IPCA — bens não duráveis

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 10841
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=10841
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Bens não duráveis (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10841/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10841/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10841/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex0 — Núcleo do IPCA — EX0

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 11427
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=11427
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo por exclusão - EX0 (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11427/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11427/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11427/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex1 — Núcleo do IPCA — EX1

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 16121
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=16121
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo por exclusão - EX1 (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16121/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16121/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16121/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex2 — Núcleo do IPCA — EX2

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27838
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27838
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo por exclusão - EX2 (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27838/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27838/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27838/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex3 — Núcleo do IPCA — EX3

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27839
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27839
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo por exclusão - EX3 (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27839/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27839/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27839/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_exfe — Núcleo do IPCA — EX-FE (ex-alimentação e energia)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 28751
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=28751
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo Ex-alimentação e energia (EX-FE) (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28751/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28751/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28751/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ms — Núcleo do IPCA — médias aparadas com suavização (MS)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4466
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4466
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo médias aparadas com suavização (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4466/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4466/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4466/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ma — Núcleo do IPCA — médias aparadas sem suavização (MA)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 11426
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=11426
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo médias aparadas sem suavização (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11426/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11426/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11426/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_dp — Núcleo do IPCA — dupla ponderação (DP)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 16122
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=16122
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo de dupla ponderação (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16122/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16122/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.16122/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_p55 — Núcleo do IPCA — percentil 55 (P55)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 28750
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=28750
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Núcleo Percentil 55 (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28750/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28750/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.28750/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex3_servicos — Núcleo do IPCA — EX3 serviços

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 29683
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=29683
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - EX3 Serviços (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29683/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29683/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29683/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## nucleo_ex3_industriais — Núcleo do IPCA — EX3 industriais

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 29684
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=29684
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - EX3 Industriais (unidade: Var. % mensal; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29684/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29684/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.29684/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_difusao — IPCA — índice de difusão

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 21379
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=21379
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice Nacional de Preços ao Consumidor Amplo (IPCA) - Índice de difusão (unidade: %; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.21379/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.21379/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.21379/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ipca_itens — IPCA — variação mensal e peso de grupos, subgrupos, itens e subitens

- **Instituição:** IBGE
- **Código:** SIDRA 7060, variáveis 63 e 66, classificação 315 (todas as categorias), Brasil
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/7060
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/7060/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** IPCA - Variação mensal, acumulada no ano, acumulada em 12 meses e peso mensal, para o índice geral, grupos, subgrupos, itens e subitens de produtos e serviços (a partir de janeiro/2020); var. 63 "IPCA - Variação mensal" (%); var. 66 "IPCA - Peso mensal" (%); classificação 315 "Geral, grupo, subgrupo, item e subitem" (457 categorias, níveis 0–4; subitens = nível 4)
- **Observações:** Usada no indicador I.11 (camada 2).
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202001-202012/variaveis/63%7C66?localidades=N1%5Ball%5D&classificacao=315%5Ball%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202101-202112/variaveis/63%7C66?localidades=N1%5Ball%5D&classificacao=315%5Ball%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202201-202212/variaveis/63%7C66?localidades=N1%5Ball%5D&classificacao=315%5Ball%5D`
  - … (7 requisições, uma por ano)

## juros_credito — Taxa média de juros das operações de crédito — total

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 20714
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=20714
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Taxa média de juros das operações de crédito - Total (unidade: % a.a.; periodicidade: M)
- **Observações:** Série compartilhada com o painel A4 (Crédito e Estabilidade Financeira), ainda não publicado.
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20714/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20714/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20714/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## juros_pj — Taxa média de juros das operações de crédito — pessoas jurídicas

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 20715
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=20715
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Taxa média de juros das operações de crédito - Pessoas jurídicas - Total (unidade: % a.a.; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20715/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20715/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20715/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## juros_pf_livres — Taxa média de juros do crédito livre — pessoas físicas

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 20740
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=20740
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Taxa média de juros das operações de crédito com recursos livres - Pessoas físicas - Total (unidade: % a.a.; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20740/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20740/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20740/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## spread_credito — Spread médio das operações de crédito — total

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 20783
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=20783
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Spread médio das operações de crédito - Total (unidade: p.p.; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20783/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20783/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.20783/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## icc — Indicador de Custo do Crédito (ICC) — total

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 25351
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=25351
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Indicador de Custo do Crédito - ICC - Total (unidade: % a.a.; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.25351/dados?formato=json&dataInicial=01/01/2013&dataFinal=31/12/2017`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.25351/dados?formato=json&dataInicial=01/01/2018&dataFinal=31/12/2022`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.25351/dados?formato=json&dataInicial=01/01/2023&dataFinal=18/11/2026`

## icbr — Índice de Commodities — Brasil (IC-Br)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27574
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27574
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice de Commodities - Brasil (unidade: Índice; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27574/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27574/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27574/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## icbr_agro — IC-Br — agropecuária

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27575
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27575
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice de Commodities - Brasil - Agropecuária (unidade: Índice; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27575/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27575/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27575/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## icbr_metal — IC-Br — metal

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27576
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27576
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice de Commodities - Brasil - Metal (unidade: Índice; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27576/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27576/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27576/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## icbr_energia — IC-Br — energia

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27577
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27577
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice de Commodities - Brasil - Energia (unidade: Índice; periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27577/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27577/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27577/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## ibcbr — IBC-Br com ajuste sazonal

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 24364
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=24364
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Índice de Atividade Econômica do Banco Central (IBC-Br) - com ajuste sazonal (unidade: Índice; periodicidade: M)
- **Observações:** Já dessazonalizado pela fonte: o CEE não reajusta (ADR-023).
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.24364/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.24364/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.24364/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## pib_nominal_12m — PIB acumulado dos últimos 12 meses, valores correntes

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 4382
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=4382
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** PIB acumulado dos últimos 12 meses - Valores correntes (R$ milhões) (unidade: R$ (milhões); periodicidade: M)
- **Observações:** Denominador da velocidade e do grau de monetização (I.20), em reais como os agregados. A série SGS 4192 (Panorama) está em US$ e não serve para M/PIB.
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4382/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4382/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4382/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## fed_funds_sup — Fed funds — limite superior do intervalo-alvo

- **Instituição:** Board of Governors of the Federal Reserve System (via FRED)
- **Código:** FRED DFEDTARU
- **Consulta pública:** https://fred.stlouisfed.org/series/DFEDTARU
- **Termos de uso:** Domínio público (Board of Governors of the Federal Reserve System: "Unless otherwise indicated, information on Board's website is in the public domain and may be copied and distributed without permission"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)
- **Verificação (2026-11-18):** Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial
- **Nome oficial retornado pela fonte:** Federal Funds Target Range - Upper Limit, Percent, Daily, Not Seasonally Adjusted
- **Observações:** A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.
- **Requisições da extração:**
  - `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFEDTARU&cosd=2012-01-01`

## ust10 — Rendimento do Tesouro americano de 10 anos

- **Instituição:** Board of Governors of the Federal Reserve System, H.15 (via FRED)
- **Código:** FRED DGS10
- **Consulta pública:** https://fred.stlouisfed.org/series/DGS10
- **Termos de uso:** Domínio público (Board of Governors of the Federal Reserve System: "Unless otherwise indicated, information on Board's website is in the public domain and may be copied and distributed without permission"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)
- **Verificação (2026-11-18):** Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial
- **Nome oficial retornado pela fonte:** Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis, Percent, Daily, Not Seasonally Adjusted
- **Observações:** A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.
- **Requisições da extração:**
  - `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10&cosd=2012-01-01`

## tips5 — Rendimento real do Tesouro americano de 5 anos (TIPS)

- **Instituição:** Board of Governors of the Federal Reserve System, H.15 (via FRED)
- **Código:** FRED DFII5
- **Consulta pública:** https://fred.stlouisfed.org/series/DFII5
- **Termos de uso:** Domínio público (Board of Governors of the Federal Reserve System: "Unless otherwise indicated, information on Board's website is in the public domain and may be copied and distributed without permission"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)
- **Verificação (2026-11-18):** Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial
- **Nome oficial retornado pela fonte:** Market Yield on U.S. Treasury Securities at 5-Year Constant Maturity, Quoted on an Investment Basis, Inflation-Indexed, Percent, Daily, Not Seasonally Adjusted
- **Observações:** Insumo do método (d) do juro neutro (I.4, camada 3), sem prêmio de risco soberano (ADR-024). A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.
- **Requisições da extração:**
  - `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII5&cosd=2012-01-01`

## dolar_global — Índice amplo nominal do dólar americano

- **Instituição:** Board of Governors of the Federal Reserve System, H.10 (via FRED)
- **Código:** FRED DTWEXBGS
- **Consulta pública:** https://fred.stlouisfed.org/series/DTWEXBGS
- **Termos de uso:** Domínio público (Board of Governors of the Federal Reserve System: "Unless otherwise indicated, information on Board's website is in the public domain and may be copied and distributed without permission"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)
- **Verificação (2026-11-18):** Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial
- **Nome oficial retornado pela fonte:** Nominal Broad U.S. Dollar Index, Index Jan 2006=100, Daily, Not Seasonally Adjusted
- **Observações:** A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.
- **Requisições da extração:**
  - `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS&cosd=2012-01-01`

## brent — Petróleo Brent — preço à vista (Europa)

- **Instituição:** U.S. Energy Information Administration (via FRED)
- **Código:** FRED DCOILBRENTEU
- **Consulta pública:** https://fred.stlouisfed.org/series/DCOILBRENTEU
- **Termos de uso:** Domínio público (U.S. Energy Information Administration: "U.S. government publications are in the public domain and are not subject to copyright protection"); citar a fonte. Obtida via FRED (Federal Reserve Bank of St. Louis)
- **Verificação (2026-11-18):** Cabeçalho do arquivo oficial fredgraph.xlsx (título da série); termos de uso do órgão de origem lidos no sítio oficial
- **Nome oficial retornado pela fonte:** Crude Oil Prices: Brent - Europe, Dollars per Barrel, Daily, Not Seasonally Adjusted
- **Observações:** A nota de copyright da página da série no FRED não pôde ser lida deste ambiente (a página não responde a clientes automatizados); conferência visual registrada em docs/PENDIENTES.md.
- **Requisições da extração:**
  - `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU&cosd=2012-01-01`

## tesouro_direto — Taxas e preços dos títulos ofertados pelo Tesouro Direto

- **Instituição:** Tesouro Nacional (Tesouro Transparente)
- **Código:** Tesouro Transparente (CKAN), conjunto "Taxas dos Títulos Ofertados pelo Tesouro Direto", arquivo precotaxatesourodireto.csv
- **Consulta pública:** https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto
- **Termos de uso:** Open Data Commons Open Database License (ODbL): uso e redistribuição com atribuição; bases derivadas publicadas sob a mesma licença
- **Verificação (2026-11-18):** API CKAN do Tesouro Transparente (package_show: título, licença e recursos) e leitura do arquivo
- **Nome oficial retornado pela fonte:** Taxas dos Títulos Ofertados pelo Tesouro Direto; colunas: Tipo Titulo; Data Vencimento; Data Base; Taxa Compra Manha; Taxa Venda Manha; PU Compra Manha; PU Venda Manha; PU Base Manha
- **Observações:** Licença ODbL (permite redistribuição; exige atribuição e que as bases derivadas — as curvas NSS do CEE — sejam publicadas sob ODbL). Tipos usados: Tesouro Prefixado (LTN) e Tesouro IPCA+ (NTN-B Principal), sem cupom; os títulos com juros semestrais ficam no CSV, fora do ajuste.
- **Requisições da extração:**
  - `https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv`

## pib_volume_sa — PIB — índice de volume trimestral com ajuste sazonal

- **Instituição:** IBGE
- **Código:** SIDRA 1621, variável 584, classificação 11255 [90707] (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/1621
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/1621/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** Série encadeada do índice de volume trimestral com ajuste sazonal (Base: média 1995 = 100); var. 584; categoria 90707 "PIB a preços de mercado"
- **Observações:** Já dessazonalizado pela fonte: o CEE não reajusta (ADR-023). Base do hiato do produto (I.15).
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/1621/periodos/all/variaveis/584?localidades=N1%5Ball%5D&classificacao=11255%5B90707%5D`

## ipca15 — IPCA-15 — variação mensal e acumulada em 12 meses

- **Instituição:** IBGE
- **Código:** SIDRA 3065, variáveis 355 e 1120 (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/3065
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/3065/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** IPCA15 - Série histórica com número-índice, variação mensal e variações acumuladas (a partir de maio/2000); var. 355 "IPCA15 - Variação mensal" (%); var. 1120 "IPCA15 - Variação acumulada em 12 meses" (%)
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/3065/periodos/201201-209912/variaveis/355%7C1120?localidades=N1%5Ball%5D`

## inpc — INPC — variação mensal e acumulada em 12 meses

- **Instituição:** IBGE
- **Código:** SIDRA 1736, variáveis 44 e 2292 (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/1736
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/1736/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** INPC - Série histórica com número-índice, variação mensal e variações acumuladas (a partir de abril/1979); var. 44 "INPC - Variação mensal" (%); var. 2292 "INPC - Variação acumulada em 12 meses" (%)
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/1736/periodos/201201-209912/variaveis/44%7C2292?localidades=N1%5Ball%5D`

## ipp — IPP — indústria geral e indústrias de transformação, variação mensal e em 12 meses

- **Instituição:** IBGE
- **Código:** SIDRA 6903, variáveis 1396 e 1394, classificação 842 [46608, 46610] (Brasil)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/6903
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/6903/metadados (API de agregados do IBGE)
- **Nome oficial retornado pela fonte:** Índice de Preços ao Produtor, por tipo de índice, indústria geral, indústrias extrativas e indústrias de transformação e atividades (dezembro de 2018 = 100); var. 1396 "IPP - Variação mês/mês imediatamente anterior" (%); var. 1394 "IPP - Variação mês/mesmo mês do ano anterior" (%); categorias 46608 "Indústria Geral" e 46610 "C Indústrias de Transformação"
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/6903/periodos/201401-209912/variaveis/1396%7C1394?localidades=N1%5Ball%5D&classificacao=842%5B46608,46610%5D`

## ipca_regional — IPCA por área — índice geral e grupos (variação mensal, 12 meses e peso)

- **Instituição:** IBGE
- **Código:** SIDRA 7060, variáveis 63, 2265, 66, classificação 315 (índice geral e 9 grupos), Brasil, regiões metropolitanas (N7) e municípios (N6)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/7060
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/7060/metadados (níveis N1, N6, N7) e consulta das localidades retornadas
- **Nome oficial retornado pela fonte:** IPCA - Variação mensal, acumulada no ano, acumulada em 12 meses e peso mensal, para o índice geral, grupos, subgrupos, itens e subitens de produtos e serviços (a partir de janeiro/2020); 16 áreas: 10 regiões metropolitanas (Belém, Fortaleza, Recife, Salvador, Belo Horizonte, Grande Vitória, Rio de Janeiro, São Paulo, Curitiba, Porto Alegre) e 6 municípios (Rio Branco, São Luís, Aracaju, Campo Grande, Goiânia, Brasília)
- **Observações:** Não existe IPCA/INPC por unidade da federação: as áreas são regiões metropolitanas e capitais.
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202001-202012/variaveis/63%7C2265%7C66?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202101-202112/variaveis/63%7C2265%7C66?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/202201-202212/variaveis/63%7C2265%7C66?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - … (7 requisições, uma por ano)

## inpc_regional — INPC por área — índice geral e grupos (variação mensal, 12 meses e peso)

- **Instituição:** IBGE
- **Código:** SIDRA 7063, variáveis 44, 2292, 45, classificação 315 (índice geral e 9 grupos), Brasil, regiões metropolitanas (N7) e municípios (N6)
- **Consulta pública:** https://sidra.ibge.gov.br/tabela/7063
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** GET /api/v3/agregados/7063/metadados (níveis N1, N6, N7) e consulta das localidades retornadas
- **Nome oficial retornado pela fonte:** INPC - Variação mensal, acumulada no ano, acumulada em 12 meses e peso mensal, para o índice geral, grupos, subgrupos, itens e subitens de produtos e serviços (a partir de janeiro/2020); 16 áreas: 10 regiões metropolitanas (Belém, Fortaleza, Recife, Salvador, Belo Horizonte, Grande Vitória, Rio de Janeiro, São Paulo, Curitiba, Porto Alegre) e 6 municípios (Rio Branco, São Luís, Aracaju, Campo Grande, Goiânia, Brasília)
- **Observações:** Não existe IPCA/INPC por unidade da federação: as áreas são regiões metropolitanas e capitais.
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7063/periodos/202001-202012/variaveis/44%7C2292%7C45?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7063/periodos/202101-202112/variaveis/44%7C2292%7C45?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - `https://servicodados.ibge.gov.br/api/v3/agregados/7063/periodos/202201-202212/variaveis/44%7C2292%7C45?localidades=N1%5Ball%5D%7CN6%5Ball%5D%7CN7%5Ball%5D&classificacao=315%5B7169,7170,7445,7486,7558,7625,7660,7712,7766,7786%5D`
  - … (7 requisições, uma por ano)

## pesos_regionais — Pesos regionais do IPCA e do INPC (POF 2017-2018)

- **Instituição:** IBGE
- **Código:** FTP IBGE, Atualizacao_das_Estruturas_POF2017-2018/Pesos_Regionais_IPCA_e_INPC.zip
- **Consulta pública:** https://ftp.ibge.gov.br/Precos_Indices_de_Precos_ao_Consumidor/IPCA/Atualizacao_das_Estruturas_POF2017-2018/
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** Arquivo oficial no FTP do IBGE; planilha "IPCA e INPC - Pesos regionais.xlsx" lida (16 áreas; soma 100)
- **Nome oficial retornado pela fonte:** ESTRUTURAS DE PESOS REGIONAIS SEGUNDO AS ÁREAS PESQUISADAS — IPCA e INPC - POF 2017-2018
- **Requisições da extração:**
  - `https://ftp.ibge.gov.br/Precos_Indices_de_Precos_ao_Consumidor/IPCA/Atualizacao_das_Estruturas_POF2017-2018/Pesos_Regionais_IPCA_e_INPC.zip`

## capitais_coordenadas — Centroides dos municípios-sede das áreas do IPCA

- **Instituição:** IBGE
- **Código:** API de malhas v3 do IBGE, /malhas/municipios/{id}/metadados (campo centroide)
- **Consulta pública:** https://servicodados.ibge.gov.br/api/docs/malhas?versao=3
- **Termos de uso:** Dados públicos do IBGE; reutilização com citação da fonte
- **Verificação (2026-11-18):** Consulta à API de malhas v3 (metadados de município, centroide)
- **Nome oficial retornado pela fonte:** Metadados de município: id, nivel-geografico, centroide {longitude, latitude}, regiao-limitrofe, area
- **Observações:** Só os centroides (coordenadas) são usados. Os polígonos da malha não são publicados: os termos de uso remetem à nota "Informações técnicas e legais", inacessível a clientes automatizados (docs/PENDIENTES.md).
- **Requisições da extração:**
  - `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/1200401/metadados`
  - `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/1501402/metadados`
  - `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/2111300/metadados`
  - … (16 requisições, uma por ano)

## base_restrita — Base monetária restrita (saldo em final de período)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1788
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1788
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** BM - Base monetária restrita (saldo em final de período) (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1788/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1788/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1788/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## papel_moeda_circulacao — Papel-moeda em circulação (emitido), componente da base (saldo em final de período)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1786
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1786
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** BM - Papel moeda em circulação (saldo em final de período) (unidade: u.m.c. (mil); periodicidade: M)
- **Observações:** É o papel-moeda emitido (fora do BCB) da identidade da base: SGS 1788 = 1786 + 1787 com diferença de no máximo R$ 1 mil (jul.–set./2026).
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1786/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1786/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1786/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## reservas_bancarias — Reservas bancárias (saldo em final de período)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1787
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1787
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** BM - Reservas bancárias (saldo em final de período) (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1787/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1787/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1787/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## base_ampliada — Base monetária ampliada (saldo em final de período)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1833
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1833
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Base Monetária Ampliada (saldo em final de período) (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1833/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1833/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1833/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## bma_compulsorio — Base ampliada — depósitos compulsórios em espécie (saldo em final de período)

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 1828
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=1828
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Base monetária ampliada - Depósitos compulsórios em espécie (saldo em final de período) (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1828/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1828/dados?formato=json&dataInicial=01/01/2017&dataFinal=31/12/2021`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1828/dados?formato=json&dataInicial=01/01/2022&dataFinal=18/11/2026`

## pmpp — Papel-moeda em poder do público (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27789
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27789
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento - Papel moeda em poder do público (saldo em final de período) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27789/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27789/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27789/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)

## depositos_vista — Depósitos à vista (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27790
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27790
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento - Depósitos à vista (saldo em final de período) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27790/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27790/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27790/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)

## m1 — M1 (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27791
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27791
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento - M1 (saldo em final de período) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27791/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27791/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27791/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)

## m2 — M2 (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27810
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27810
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento amplos - M2 (saldo em final de período) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27810/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27810/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27810/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)

## m3 — M3 (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27813
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27813
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento amplos - M3 (saldo em final de período) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27813/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27813/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27813/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)

## m4 — M4 (saldo em final de período) — Novo

- **Instituição:** Banco Central do Brasil
- **Código:** SGS 27815
- **Consulta pública:** https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=27815
- **Termos de uso:** Dados abertos do Banco Central do Brasil
- **Verificação (2026-11-18):** Página pública de consulta do SGS em português (consultarValoresSeries), que lista código, nome completo, unidade, periodicidade, início e último valor; série consultada na API do SGS
- **Nome oficial retornado pela fonte:** Meios de pagamento amplos - M4 (saldo em final de periodo) - Novo (unidade: u.m.c. (mil); periodicidade: M)
- **Requisições da extração:**
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27815/dados?formato=json&dataInicial=01/01/2002&dataFinal=31/12/2006`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27815/dados?formato=json&dataInicial=01/01/2007&dataFinal=31/12/2011`
  - `https://api.bcb.gov.br/dados/serie/bcdata.sgs.27815/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2016`
  - … (5 requisições, uma por ano)
