// Captura de uma rota em larguras dadas: node scripts/qa/frame.mjs <base> <rota> <out> <w1,w2> [altura]
import { chromium } from 'playwright';
const [base, rota, out, ws, h] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const w of ws.split(',').map(Number)) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(base + rota, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')));
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}-${w}.png`, fullPage: !h, clip: h ? { x: 0, y: 0, width: w, height: Number(h) } : undefined });
  await p.close();
}
await b.close();
