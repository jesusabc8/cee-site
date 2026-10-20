/** Dicionário de dados dos CSV do painel de Conjuntura (Proposta §6.3: cada variável, unidade e origem). */
export const DICIONARIO_CONJUNTURA = [
  { arquivo: 'ipca.csv', variavel: 'periodo', descricao: 'Mês de referência (AAAA-MM)', unidade: '—', origem: 'SIDRA 1737' },
  { arquivo: 'ipca.csv', variavel: 'variacao_mensal', descricao: 'IPCA — variação mensal', unidade: '%', origem: 'SIDRA 1737, var. 63' },
  { arquivo: 'ipca.csv', variavel: 'acumulada_12m', descricao: 'IPCA — variação acumulada em 12 meses', unidade: '%', origem: 'SIDRA 1737, var. 2265' },
  { arquivo: 'selic_meta.csv', variavel: 'periodo', descricao: 'Mês de referência (AAAA-MM)', unidade: '—', origem: 'derivado' },
  { arquivo: 'selic_meta.csv', variavel: 'meta_selic', descricao: 'Meta Selic vigente no último dia disponível do mês', unidade: '% a.a.', origem: 'SGS 432' },
  { arquivo: 'selic_meta.csv', variavel: 'data_referencia', descricao: 'Dia cujo valor foi usado (≤ data de extração)', unidade: 'data', origem: 'SGS 432' },
  { arquivo: 'desocupacao.csv', variavel: 'periodo_fim_trimestre', descricao: 'Último mês do trimestre móvel (AAAA-MM)', unidade: '—', origem: 'SIDRA 6381' },
  { arquivo: 'desocupacao.csv', variavel: 'taxa', descricao: 'Taxa de desocupação, 14 anos ou mais', unidade: '%', origem: 'SIDRA 6381, var. 4099' },
  { arquivo: 'desocupacao.csv', variavel: 'coef_variacao', descricao: 'Coeficiente de variação da taxa', unidade: '%', origem: 'SIDRA 6381, var. 4103' },
  { arquivo: 'focus_ipca.csv', variavel: 'data', descricao: 'Data de cálculo da estatística', unidade: 'data', origem: 'Olinda, campo Data' },
  { arquivo: 'focus_ipca.csv', variavel: 'ano_referencia', descricao: 'Ano a que se refere a expectativa', unidade: 'ano', origem: 'Olinda, campo DataReferencia' },
  { arquivo: 'focus_ipca.csv', variavel: 'mediana', descricao: 'Mediana das expectativas de variação do IPCA no ano', unidade: '%', origem: 'Olinda, campo Mediana (baseCalculo = 0)' },
  { arquivo: 'focus_ipca.csv', variavel: 'respondentes', descricao: 'Número de instituições respondentes', unidade: 'contagem', origem: 'Olinda, campo numeroRespondentes' },
] as const;
