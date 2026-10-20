// Capturas de tela para revisão visual: node scripts/qa/screens.mjs <baseURL> <outDir> <rota...>
import { chromium } from 'playwright';
const [base, out, ...routes] = process.argv.slice(2);
// Em ambientes com Chromium pré-instalado, CHROMIUM_PATH evita baixar navegadores.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const scheme of ['light', 'dark']) {
  for (const [name, vp] of [['desk', { width: 1280, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport: vp, colorScheme: scheme });
    for (const r of routes) {
      await page.goto(base + r, { waitUntil: 'networkidle' });
      const slug = r.replace(/\W+/g, '_') || 'home';
      await page.screenshot({ path: `${out}/${slug}-${name}-${scheme}.png`, fullPage: true });
    }
    await page.close();
  }
}
await browser.close();
