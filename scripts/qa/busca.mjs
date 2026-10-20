// Teste de fumaça da busca Pagefind: node scripts/qa/busca.mjs <baseURL> <termo>
import { chromium } from 'playwright';
const [base, termo] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage();
await p.goto(`${base}/busca/`);
await p.waitForSelector('.pagefind-ui__search-input');
await p.fill('.pagefind-ui__search-input', termo);
await p.waitForSelector('.pagefind-ui__result', { timeout: 10000 });
const res = await p.$$eval('.pagefind-ui__result-link', (as) => as.map((a) => `${a.textContent?.trim()} → ${a.getAttribute('href')}`));
console.log(`${res.length} resultado(s) para "${termo}":\n` + res.slice(0, 6).join('\n'));
await b.close();
