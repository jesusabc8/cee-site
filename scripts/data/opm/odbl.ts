/**
 * Bases derivadas dos dados do Tesouro Direto (Tesouro Transparente, Open Database License v1.0; ADR-031).
 * A ODbL exige que toda base derivada publicada seja oferecida sob a mesma licença, com aviso. A lista é o fecho
 * transitivo a partir de tesouro_direto.csv: curvas → inflação implícita, prêmio a termo, faixa de juro neutro (método c)
 * → hiato de juros, regras de Taylor e índice de condições financeiras. tests/odbl.test.ts recalcula o fecho a partir
 * do código de analysis/opm e de scripts/data e falha se esta lista divergir.
 * Caminhos relativos a data/processed/opm/ (servidos em /dados/opm/).
 */
export const ODBL: readonly string[] = [
  'tesouro_direto.csv',
  'indicadores/curvas_nss.csv',
  'indicadores/curva_nominal_grade.csv',
  'indicadores/i12_inflacao_implicita.csv',
  'indicadores/i16_premio_termo_acm.csv',
  'indicadores/i16_acm_diagnostico.csv',
  'indicadores/i16_criterio_plausibilidade.csv',
  'indicadores/i4_faixa_neutro.csv',
  'indicadores/i3_hiato_juros.csv',
  'indicadores/i6_taylor.csv',
  'indicadores/i6_taylor_t3_parametros.csv',
  'indicadores/i17_condicoes_financeiras.csv',
  'indicadores/i17_cargas.csv',
];
export const ehOdbl = (caminho: string) => ODBL.some((a) => caminho.endsWith(`/dados/opm/${a}`) || caminho === a);
export const ODBL_URL = 'https://opendatacommons.org/licenses/odbl/1-0/';
