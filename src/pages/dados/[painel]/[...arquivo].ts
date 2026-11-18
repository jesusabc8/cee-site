/**
 * Downloads dos CSV processados e dos registros JSON: /dados/<painel>/<arquivo>, incluindo subpastas
 * (ex.: /dados/opm/indicadores/i1_juro_real_ex_ante.csv, /dados/opm/dessaz/ipca.csv, /dados/opm/safras/…; ADR-026).
 */
import type { APIRoute } from 'astro';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BASE = 'data/processed';

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(csv|json)$/.test(f) ? [p] : [];
  });
}

export function getStaticPaths() {
  return readdirSync(BASE).filter((p) => statSync(join(BASE, p)).isDirectory()).flatMap((painel) =>
    arquivos(join(BASE, painel)).map((p) => ({ params: { painel, arquivo: relative(join(BASE, painel), p).split('\\').join('/') } })));
}

export const GET: APIRoute = ({ params }) => {
  const nome = params.arquivo!;
  if (nome.split('/').includes('..')) return new Response('Not found', { status: 404 });
  const body = readFileSync(join(BASE, params.painel!, nome), 'utf8');
  const type = nome.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8';
  return new Response(body, { headers: { 'Content-Type': type } });
};
