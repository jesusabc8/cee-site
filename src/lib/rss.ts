import rss from '@astrojs/rss';
import { getPublicacoes } from './publicacoes';
import { TIPOS, type Tipo } from '../schemas/publicacao';
import { href } from '../i18n/routing';

/** Feed RSS 2.0 das publicações (demonstrações excluídas). */
export async function feed(site: URL, tipo?: Tipo) {
  const pubs = (await getPublicacoes()).filter((p) => !tipo || p.data.tipo === tipo);
  return rss({
    title: tipo ? `CEE · ${TIPOS[tipo].plural.pt}` : 'CEE · Publicações',
    description: 'Centro de Estudos Econômicos — iniciativa estudantil de análise econômica empírica sobre a economia brasileira.',
    site: new URL(href('/'), site).href,
    customData: '<language>pt-BR</language>',
    items: pubs.map((p) => ({
      title: `${TIPOS[p.data.tipo].pt}: ${p.data.titulo}`,
      description: p.data.resumo,
      pubDate: p.data.data,
      link: href(`/publicacoes/${p.id}/`),
      author: p.data.autoria.map((a) => a.nome).join(', '),
      categories: [TIPOS[p.data.tipo].pt, p.data.area.toUpperCase()],
    })),
  });
}
