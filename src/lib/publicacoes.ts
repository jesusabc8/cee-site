import { getCollection, type CollectionEntry } from 'astro:content';

export type Pub = CollectionEntry<'publicacoes'>;

/** Publicações listáveis: exclui demonstrações. Ordem: mais recente primeiro. */
export async function getPublicacoes(): Promise<Pub[]> {
  const all = await getCollection('publicacoes', (p) => !p.data.demo);
  return all.sort((a, b) => b.data.data.getTime() - a.data.data.getTime());
}

/** Todas, inclusive demonstrações (para gerar as rotas). */
export async function getTodasPublicacoes(): Promise<Pub[]> {
  return getCollection('publicacoes');
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function fmtDate(d: Date, lang: string, style: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat(lang, style === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}
