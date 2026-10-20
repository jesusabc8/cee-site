/**
 * Verificador de links internos no build estático (sem rede).
 * Uso: node scripts/qa/links.mjs [dist] [base]   ex.: node scripts/qa/links.mjs dist /cee-site
 * Confere href/src internos (inclusive âncoras #id na mesma página e em outras páginas).
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const base = (process.argv[3] ?? '').replace(/\/$/, '');
const arquivos = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) walk(p);
  else if (p.endsWith('.html')) arquivos.push(p);
});
walk(dist);

const ids = new Map();
const idsDe = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};
const alvo = (pathname) => {
  let p = decodeURIComponent(pathname);
  if (base && !p.startsWith(base + '/') && p !== base) return { erro: `fora do base ${base}` };
  p = p.slice(base.length) || '/';
  const f = join(dist, p);
  if (p.endsWith('/')) return { file: join(f, 'index.html') };
  if (existsSync(f) && statSync(f).isFile()) return { file: f };
  if (existsSync(join(f, 'index.html'))) return { file: join(f, 'index.html') };
  return { file: f };
};

let erros = 0, total = 0;
for (const file of arquivos) {
  const html = readFileSync(file, 'utf8');
  const pagina = '/' + relative(dist, file).replace(/index\.html$/, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|data:|tel:|javascript:)/.test(url) || url.startsWith('//')) continue;
    total++;
    const u = new URL(url, `http://x${base}${pagina}`);
    const t = alvo(u.pathname);
    let problema = t.erro;
    if (!problema && !existsSync(t.file)) problema = 'arquivo inexistente';
    if (!problema && u.hash && t.file.endsWith('.html') && !idsDe(t.file).has(decodeURIComponent(u.hash.slice(1)))) problema = `âncora ${u.hash} inexistente`;
    if (problema) { erros++; console.log(`✗ ${pagina} → ${url} (${problema})`); }
  }
}
console.log(`${total} links internos em ${arquivos.length} páginas; ${erros} quebrado(s).`);
process.exit(erros ? 1 : 0);
