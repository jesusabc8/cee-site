import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

/** Página institucional por língua e slug (arquivo src/content/paginas/<lang>/<slug>.mdx). */
export async function getPagina(lang: Lang, slug: string): Promise<CollectionEntry<'paginas'>> {
  const all = await getCollection('paginas');
  const id = `${lang}/${slug}`.toLowerCase();
  const entry = all.find((e) => e.id.toLowerCase() === id);
  if (!entry) throw new Error(`Página institucional não encontrada: ${id}`);
  return entry;
}
