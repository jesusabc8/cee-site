/** Aviso da ODbL para as bases derivadas do Tesouro Direto (ADR-031), gerado da lista única scripts/data/opm/odbl.ts. */
import type { APIRoute } from 'astro';
import { ODBL, ODBL_URL } from '../../../../scripts/data/opm/odbl.ts';

export const GET: APIRoute = () => new Response([
  'Aviso de licença — bases derivadas do Tesouro Direto / Licence notice — databases derived from Tesouro Direto',
  '',
  'Contém informações do Tesouro Nacional (Tesouro Transparente), conjunto "Taxas dos Títulos Ofertados pelo Tesouro Direto",',
  `disponibilizadas sob a Open Database License (ODbL) v1.0: ${ODBL_URL}`,
  'As bases abaixo, publicadas pelo Centro de Estudos Econômicos (CEE), são bases derivadas e estão disponíveis sob a mesma',
  'licença ODbL v1.0. Os demais arquivos do CEE em /dados/ seguem CC BY 4.0; as séries das fontes, os termos de cada instituição.',
  '',
  'Contains information from Tesouro Nacional (Tesouro Transparente), made available under the ODbL v1.0. The files below are',
  'derivative databases published by CEE under the same ODbL v1.0.',
  '',
  ...ODBL.map((a) => `/dados/opm/${a}`),
  '',
].join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
