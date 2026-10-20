import { chromium } from 'playwright';
const [url, out, w = '1100'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: Number(w), height: 800 } });
await p.goto(url); await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true }); await b.close();
