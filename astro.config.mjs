// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeTableScroll from './src/lib/rehype-table-scroll.mjs';

// SITE_URL e BASE_PATH são definidos pelo workflow de deploy.
// Em GitHub Pages de projeto: SITE_URL=https://<usuario>.github.io  BASE_PATH=/cee-site
// Em domínio próprio: SITE_URL=https://dominio  BASE_PATH=/
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  i18n: {
    locales: ['pt-BR', 'en'],
    defaultLocale: 'pt-BR',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    rehypePlugins: [rehypeTableScroll],
    remarkRehype: { footnoteLabel: 'Notas', footnoteBackLabel: 'Voltar ao texto' },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'pt-BR', locales: { 'pt-BR': 'pt-BR', en: 'en' } },
      filter: (page) => !/\/(_estilo|busca|og|dados)\/|\/publicacoes\/demo-|\/404/.test(page),
    }),
  ],
});
