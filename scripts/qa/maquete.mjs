// Captura da maquete de referência: node scripts/qa/maquete.mjs <outDir>
import { chromium } from 'playwright';
import { resolve } from 'node:path';
const out = process.argv[2];
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const w of [1440, 768, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('file://' + resolve('docs/design/CEE_home_maquete.html'));
  await p.evaluate(() => document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')));
  await p.waitForTimeout(3500);
  await p.screenshot({ path: `${out}/maquete-${w}.png`, fullPage: true });
  await p.close();
}
await b.close();
