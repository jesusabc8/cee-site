import { getCollection, type CollectionEntry } from 'astro:content';
import { validarCatalogo } from './catalogo';

export type Pub = CollectionEntry<'publicacoes'>;

let validado: Promise<Pub[]> | undefined;
/** Todas, inclusive demonstrações (para gerar as rotas). Validadas uma vez por build. */
export async function getTodasPublicacoes(): Promise<Pub[]> {
  validado ??= getCollection('publicacoes').then((all) => { validarCatalogo(all); return all; });
  return validado;
}

/** Publicações listáveis: exclui demonstrações. Ordem: mais recente primeiro. */
export async function getPublicacoes(): Promise<Pub[]> {
  const all = (await getTodasPublicacoes()).filter((p) => !p.data.demo);
  return all.sort((a, b) => b.data.data.getTime() - a.data.data.getTime());
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function fmtDate(d: Date, lang: string, style: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat(lang, style === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}
