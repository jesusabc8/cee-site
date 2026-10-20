import type { APIRoute } from 'astro';
import { feed } from '../../../../lib/rss';
import { TIPO_KEYS, type Tipo } from '../../../../schemas/publicacao';

export function getStaticPaths() {
  return TIPO_KEYS.map((tipo) => ({ params: { tipo } }));
}
export const GET: APIRoute = ({ site, params }) => feed(site!, params.tipo as Tipo);
