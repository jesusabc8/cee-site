/**
 * Navegação por teclado: percorre a página com Tab e registra a ordem de foco, se o foco é
 * visível (outline) e se o link "Pular para o conteúdo" leva ao <main>. Também grava o
 * árbol de acessibilidade (ARIA snapshot) e um PDF de impressão.
 * Uso: node scripts/qa/teclado.mjs <baseURL> <rota> <saidaDir>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [base, rota, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const slug = rota.replace(/\W+/g, '_') || 'home';
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(base + rota, { waitUntil: 'networkidle' });
const linhas = [];
let semFoco = 0;
for (let i = 0; i < 40; i++) {
  await p.keyboard.press('Tab');
  const info = await p.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const visivel = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    const txt = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('value') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    return `${el.tagName.toLowerCase()} "${txt}" foco-visível=${visivel}`;
  });
  if (info?.includes('foco-visível=false')) semFoco++;
  linhas.push(`${String(i + 1).padStart(2)}. ${info}`);
}
// Link de salto
await p.goto(base + rota);
await p.keyboard.press('Tab');
const primeiro = await p.evaluate(() => document.activeElement?.textContent?.trim());
await p.keyboard.press('Enter');
const destino = await p.evaluate(() => document.activeElement?.id);
const aria = await p.locator('body').ariaSnapshot();
writeFileSync(`${out}/aria-${slug}.yml`, aria);
await p.emulateMedia({ media: 'print' });
await p.pdf({ path: `${out}/impressao-${slug}.pdf`, format: 'A4', printBackground: false });
writeFileSync(`${out}/teclado-${slug}.txt`, `Rota: ${rota}\nPrimeiro Tab: "${primeiro}" → Enter leva o foco a #${destino}\nElementos sem foco visível: ${semFoco}\n\n${linhas.join('\n')}\n`);
console.log(`${rota}: 1º Tab "${primeiro}" → #${destino}; ${semFoco} sem foco visível em 40 Tabs`);
await b.close();
