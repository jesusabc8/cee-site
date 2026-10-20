/**
 * Lighthouse (mobile, configuração padrão) nas páginas-chave. Meta: ≥ 0,95 nas quatro categorias.
 * Uso: CHROME_PATH=... node scripts/qa/lighthouse.mjs <baseURL> [saidaDir]
 * Para medir SEO sem o noindex da versão preliminar, sirva um build feito com CEE_LANCADO=1.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = process.argv[2] ?? 'http://localhost:4321';
const out = process.argv[3] ?? 'docs/qa/lighthouse';
mkdirSync(out, { recursive: true });
const rotas = ['/', '/observatorio/conjuntura/', '/sobre/', '/publicacoes/', '/pesquisa/a/', '/en/'];
const linhas = ['| Página | Performance | Acessibilidade | Boas práticas | SEO |', '|---|---|---|---|---|'];
let falhou = false;
for (const r of rotas) {
  const json = execFileSync('npx', ['lighthouse', base + r, '--output=json', '--quiet',
    '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'],
    { maxBuffer: 64 * 1024 * 1024, env: process.env }).toString();
  const rep = JSON.parse(json);
  const c = rep.categories;
  const s = ['performance', 'accessibility', 'best-practices', 'seo'].map((k) => Math.round(c[k].score * 100));
  if (s.some((x) => x < 95)) falhou = true;
  linhas.push(`| \`${r}\` | ${s.join(' | ')} |`);
  console.log(r, s.join(' / '));
  for (const k of ['performance', 'accessibility', 'best-practices', 'seo']) {
    for (const ref of c[k].auditRefs) {
      const a = rep.audits[ref.id];
      if (ref.weight > 0 && a.score !== null && a.score < 0.9) console.log(`   ${k}: ${a.id} = ${a.score} ${a.displayValue ?? ''}`);
    }
  }
}
writeFileSync(`${out}/resumo.md`, `# Lighthouse (mobile, padrão) — ${new Date().toISOString().slice(0, 10)}\n\n${linhas.join('\n')}\n`);
process.exit(falhou ? 1 : 0);
