// Movimento reduzido: com prefers-reduced-motion, tudo visível e sem animação. Uso: node scripts/qa/movimento.mjs <baseURL>
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4321';
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(base + '/', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const rev = [...document.querySelectorAll('.reveal')];
  const ocultos = rev.filter((e) => getComputedStyle(e).opacity !== '1').length;
  const linha = document.querySelector('.hero__line');
  const cs = linha ? getComputedStyle(linha) : null;
  return { reveal: rev.length, ocultos, animacao: cs?.animationName, offset: cs?.strokeDashoffset };
});
console.log(`reveal: ${r.reveal} elementos, ${r.ocultos} ocultos; linha do herói: animation=${r.animacao}, dashoffset=${r.offset}`);
await b.close();
process.exit(r.ocultos || (r.animacao && r.animacao !== 'none') ? 1 : 0);
