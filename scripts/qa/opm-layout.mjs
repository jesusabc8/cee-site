/**
 * QA de layout do Observatório de Política Monetária (critérios de aceitação do redesenho; ADR-029).
 * Para cada página do OPM, PT e EN, em 360, 768, 1024, 1440 e 1920 px:
 *  1. página sem rolagem horizontal: scrollWidth <= clientWidth;
 *  2. nenhum elemento com conteúdo vazando (scrollWidth > clientWidth + 1), salvo contêineres roláveis marcados
 *     (.table-scroll, .formula, [data-rolavel]) e seus descendentes;
 *  3. nenhum vão vertical > 96 px entre blocos consecutivos do conteúdo principal;
 *  4. nenhuma colisão entre rótulos de texto dentro de um mesmo gráfico SVG;
 *  5. nenhum contêiner (seção, ficha) com mais de 40 % da altura sem conteúdo.
 * Uso: node scripts/qa/opm-layout.mjs [base] [--json saida.json]  (com `npm run preview` no ar)
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:4321';
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const MOD = ['a2-1-copom', 'a2-2-juro-real', 'a2-3-inflacao', 'a2-4-expectativas', 'a2-5-transmissao', 'a2-6-externo-fiscal', 'a2-7-projecoes', 'a2-8-moeda'];
const extra = (process.env.EXTRA ?? '').split(',').filter(Boolean);
const rotas = ['', ...MOD.map((m) => `${m}/`), 'safras/', ...extra];
const LARGURAS = [360, 768, 1024, 1440, 1920];

const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const achados = [];
for (const w of LARGURAS) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  for (const lang of ['pt', 'en']) for (const r of rotas) {
    const url = `${base}${lang === 'en' ? '/en' : ''}/observatorio/politica-monetaria/${r}`;
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(150);
    const res = await p.evaluate(() => {
      const out = [];
      const de = document.documentElement;
      if (de.scrollWidth > de.clientWidth + 1) out.push({ tipo: 'rolagem-pagina', det: `${de.scrollWidth} > ${de.clientWidth}` });
      const rolavel = (el) => el.closest('.table-scroll, .formula, [data-rolavel], pre, code');
      for (const el of document.querySelectorAll('main *')) {
        if (rolavel(el) || el.closest('svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'absolute' || cs.position === 'fixed') continue;
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && cs.overflowX !== 'visible' && cs.overflowX !== 'clip') {
          out.push({ tipo: 'vazamento', det: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${el.scrollWidth}>${el.clientWidth}` });
        }
        // Conteúdo que sai da caixa do pai sem rolagem (vazamento visível)
        const r = el.getBoundingClientRect();
        const pai = el.parentElement?.getBoundingClientRect();
        if (pai && r.width > 0 && r.right > pai.right + 2 && getComputedStyle(el.parentElement).overflowX === 'visible' && !el.closest('.chart-card__plot')) {
          if (r.right > de.clientWidth) out.push({ tipo: 'fora-da-tela', det: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)}` });
        }
      }
      // Vãos verticais: união das faixas verticais ocupadas por conteúdo visível (texto, gráficos, tabelas, controles)
      // dentro de main; qualquer faixa vazia > 96 px entre conteúdos é um vão, seja margem, padding ou contêiner oco.
      const folhas = [...document.querySelectorAll('main *')].filter((n) => {
        if (n.closest('svg') && n.tagName !== 'svg') return false;
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const temTexto = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
        return temTexto || ['svg', 'img', 'canvas', 'input', 'hr', 'math'].includes(n.tagName.toLowerCase()) || (cs.borderTopWidth !== '0px' && n.getBoundingClientRect().height < 4);
      }).map((n) => n.getBoundingClientRect()).filter((r) => r.height > 0 && r.width > 0).map((r) => [r.top + scrollY, r.bottom + scrollY]).sort((a, b) => a[0] - b[0]);
      let fim = folhas[0]?.[1] ?? 0;
      for (const [t, f] of folhas.slice(1)) {
        if (t - fim > 96) out.push({ tipo: 'vao', det: `${Math.round(t - fim)}px em y=${Math.round(fim)}` });
        fim = Math.max(fim, f);
      }
      // Contêineres com > 40 % de altura vazia
      for (const el of document.querySelectorAll('main section, main .chart-card, main figure, main article')) {
        const r = el.getBoundingClientRect();
        if (r.height < 120) continue;
        let topo = Infinity, fundo = -Infinity;
        const rng = document.createRange();
        for (const n of el.querySelectorAll('*')) {
          if (n.children.length && n.tagName !== 'svg') continue;
          const b = n.getBoundingClientRect();
          if (b.height === 0 || b.width === 0) continue;
          topo = Math.min(topo, b.top); fundo = Math.max(fundo, b.bottom);
        }
        rng.detach?.();
        if (topo === Infinity) { out.push({ tipo: 'conteiner-vazio', det: `${el.tagName.toLowerCase()}#${el.id}` }); continue; }
        const vazio = 1 - (fundo - topo) / r.height;
        if (vazio > 0.4) out.push({ tipo: 'conteiner-oco', det: `${el.tagName.toLowerCase()}#${el.id} ${Math.round(vazio * 100)}% vazio` });
      }
      // Colisões de rótulos em SVG
      for (const svg of document.querySelectorAll('main svg')) {
        const txt = [...svg.querySelectorAll('text')].map((t) => t.getBoundingClientRect()).filter((r) => r.width > 0);
        for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
          const a = txt[i], c = txt[j];
          const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
          const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (ox > 1 && oy > 1) out.push({ tipo: 'colisao-rotulos', det: `${svg.closest('[id]')?.id ?? 'svg'}: "${svg.querySelectorAll('text')[i]?.textContent}" × "${svg.querySelectorAll('text')[j]?.textContent}"` });
        }
      }
      return out;
    });
    for (const a of res) achados.push({ largura: w, lang, rota: r || '(principal)', ...a });
  }
  await ctx.close();
}
await b.close();
const porTipo = achados.reduce((m, a) => ({ ...m, [a.tipo]: (m[a.tipo] ?? 0) + 1 }), {});
console.log(`${rotas.length} páginas × 2 idiomas × ${LARGURAS.length} larguras; achados por tipo:`, porTipo);
for (const a of achados.slice(0, 40)) console.log(`  [${a.tipo}] ${a.largura}px ${a.lang} ${a.rota}: ${a.det}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(achados, null, 1));
process.exit(achados.length ? 1 : 0);
