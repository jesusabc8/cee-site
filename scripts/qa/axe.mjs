/**
 * Auditoria axe (WCAG 2.0/2.1/2.2 A e AA) em todas as páginas do build, nos modos claro e escuro.
 * Uso: node scripts/qa/axe.mjs <baseURL>   (com o sítio servido por `npm run preview`)
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const rotas = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) { if (!['pagefind', 'og', 'dados', '_astro'].includes(f)) walk(p); }
  else if (f === 'index.html') rotas.push('/' + relative('dist', d).replace(/\\/g, '/') + (d === 'dist' ? '' : '/'));
});
walk('dist');
rotas.sort();

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let total = 0;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  for (const r of rotas) {
    const rota = r.replace('//', '/');
    await page.goto(base + rota, { waitUntil: 'networkidle' });
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    for (const v of res.violations) {
      total++;
      console.log(`✗ [${scheme}] ${rota} ${v.id} (${v.impact}): ${v.help} — ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`${rotas.length} páginas × 2 temas; ${total} violação(ões).`);
process.exit(total ? 1 : 0);
