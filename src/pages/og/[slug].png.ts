import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ogPng } from '../../lib/og';
import { TIPOS } from '../../schemas/publicacao';
import { getPublicacoes } from '../../lib/publicacoes';

export async function getStaticPaths() {
  const pubs = await getPublicacoes();
  const paineis = await getCollection('paineis', (p) => p.data.estado !== 'previsto');
  const lic = 'Iniciativa estudantil · Acesso aberto · CC BY 4.0';
  return [
    { params: { slug: 'default' }, props: { rotulo: 'Análise econômica empírica sobre o Brasil', titulo: 'Rigorosa, reprodutível e de acesso aberto', meta: lic } },
    ...pubs.map((p) => ({
      params: { slug: `pub-${p.id}` },
      props: { rotulo: TIPOS[p.data.tipo].pt, titulo: p.data.titulo, meta: `${p.data.autoria.map((a) => a.nome).join(', ')} · ${p.data.data.toISOString().slice(0, 10)} · v${p.data.versao}` },
    })),
    ...paineis.map((p) => ({
      params: { slug: `painel-${p.id}` },
      props: { rotulo: 'Observatório CEE', titulo: `${p.data.linha}. ${p.data.titulo.pt}`, meta: p.data.versao ? `Edição ${p.data.versao} · ${lic}` : lic },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await ogPng(props as { rotulo: string; titulo: string; meta: string });
  return new Response(Buffer.from(png), { headers: { 'Content-Type': 'image/png' } });
};
