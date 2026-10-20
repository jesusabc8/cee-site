// Rolagem horizontal da página em 360/768/1024/1440/1920 px: node scripts/qa/larguras.mjs <baseURL> [rotas...]
import { chromium } from 'playwright';
const [base = 'http://localhost:4321', ...arg] = process.argv.slice(2);
const rotas = arg.length ? arg : ['/', '/en/', '/observatorio/', '/observatorio/panorama/', '/observatorio/conjuntura/', '/observatorio/catalogo/', '/pesquisa/', '/pesquisa/a/', '/publicacoes/', '/publicacoes/demo-nota-tecnica/', '/metodologia/', '/sobre/', '/participe/', '/404.html'];
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let falhas = 0;
for (const w of [360, 768, 1024, 1440, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const r of rotas) {
    await p.goto(base + r, { waitUntil: 'networkidle' });
    const [sw, cw] = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (sw > cw) { falhas++; console.log(`✗ ${w}px ${r}: scrollWidth ${sw} > ${cw}`); }
  }
  await p.close();
}
console.log(`${rotas.length} rotas × 5 larguras; ${falhas} com rolagem horizontal.`);
await b.close();
process.exit(falhas ? 1 : 0);
