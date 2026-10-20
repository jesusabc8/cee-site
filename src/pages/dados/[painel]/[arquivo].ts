/** Downloads dos CSV processados e do registro de vintage: /dados/<painel>/<serie>.csv e vintage.json */
import type { APIRoute } from 'astro';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'data/processed';

export function getStaticPaths() {
  return readdirSync(BASE).flatMap((painel) =>
    readdirSync(join(BASE, painel)).filter((f) => /\.(csv|json)$/.test(f)).map((arquivo) => ({ params: { painel, arquivo } })));
}

export const GET: APIRoute = ({ params }) => {
  const nome = params.arquivo!;
  const body = readFileSync(join(BASE, params.painel!, nome), 'utf8');
  const type = nome.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8';
  return new Response(body, { headers: { 'Content-Type': type } });
};
