import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
for (const r of process.argv.slice(2)) {
  await p.goto('http://localhost:4321' + r);
  const res = await p.evaluate(() => {
    const W = document.documentElement.clientWidth; const out = [];
    for (const el of document.querySelectorAll('body *')) { const rc = el.getBoundingClientRect(); if (rc.right > W + 1 && rc.width > 0) out.push(`${el.tagName}.${el.className} ${Math.round(rc.right)}`); }
    return { sw: document.documentElement.scrollWidth, W, out: out.slice(0, 8) };
  });
  console.log(r, JSON.stringify(res));
}
await b.close();
