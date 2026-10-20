import type { APIRoute } from 'astro';
import { config } from '../config';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site).href;
  const body = config.launched
    ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`
    : `# Versão preliminar: indexação desativada até o lançamento (config.launched).\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
