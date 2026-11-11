// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeTableScroll from './src/lib/rehype-table-scroll.mjs';

// SITE_URL e BASE_PATH são definidos pelo workflow de deploy (Cloudflare: SITE_URL = vars.SITE_URL, BASE_PATH=/).
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  // CSP (public/_headers, ADR-018): nenhum script nem estilo inline. CSS e JS sempre em arquivos externos, sem
  // source maps. O suporte nativo security.csp do Astro emite <meta> com hashes; como a política vai no cabeçalho
  // e as duas se somariam, optou-se por externalizar tudo.
  build: { format: 'directory', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0, sourcemap: false } },
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
