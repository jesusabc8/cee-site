/**
 * Gera os SVG da marca (opção B, "matriz de dados") em public/brand/, com o texto convertido
 * em contornos (sem depender de fontes instaladas). Geometria e cores medidas sobre a arte
 * aprovada (docs/design/logo-opcoes.png). Para trocar pela versão final do designer, basta
 * substituir os arquivos em public/brand/ mantendo os nomes.
 * Uso: node scripts/brand/build-logo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import opentype from 'opentype.js';

const fonte = (f) => opentype.parse(readFileSync(`node_modules/@fontsource/ibm-plex-sans/files/${f}`).buffer.slice(0));
const bold = fonte('ibm-plex-sans-latin-600-normal.woff');
const medium = fonte('ibm-plex-sans-latin-500-normal.woff');

const CORES = {
  claro: { cel: ['#0A2259', '#10357F', '#1D5FA6', '#3E85C4', '#C0E0F0'], meio4: '#8AA4B3', ponto: '#8AA4B3', texto: '#0A2259', regua: '#1D5FA6', sub: '#0A2259' },
  escuro: { cel: ['#FFFFFF', '#E3F0F9', '#C0E0F0', '#8DBBE0', '#4F8FC8'], meio4: '#46628A', ponto: '#46628A', texto: '#FFFFFF', regua: '#8DBBE0', sub: '#FFFFFF' },
};

// Ícone: grade 5×5, passo 17 u., quadrado 16 u. (fresta de 1 u.), ponto 4,4 u.
const P = 17, Q = 16, D = 4.4;
function icone(c, x0 = 0, y0 = 0) {
  const r = [];
  const sq = (col, lin, cor) => r.push(`<rect x="${x0 + col * P}" y="${y0 + lin * P}" width="${Q}" height="${Q}" fill="${cor}"/>`);
  const pt = (col, lin) => r.push(`<rect x="${(x0 + col * P + (Q - D) / 2).toFixed(1)}" y="${(y0 + lin * P + (Q - D) / 2).toFixed(1)}" width="${D}" height="${D}" fill="${c.ponto}"/>`);
  for (const lin of [0, 4]) c.cel.forEach((cor, col) => sq(col, lin, cor));
  c.cel.slice(0, 4).forEach((cor, col) => sq(col, 2, cor));
  pt(4, 2);
  for (const lin of [1, 3]) { sq(0, lin, c.cel[0]); for (let col = 1; col < 5; col++) pt(col, lin); }
  return r.join('');
}
const LADO = 4 * P + Q; // 84

/** Texto em contornos com espaçamento (tracking em unidades do tamanho). */
function texto(font, str, x, y, size, tracking = 0) {
  let cx = x;
  const paths = [];
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    paths.push(g.getPath(cx, y, size).toPathData(2));
    cx += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: paths.join(''), w: cx - x - tracking };
}

mkdirSync('public/brand', { recursive: true });
for (const [modo, c] of Object.entries(CORES)) {
  const suf = modo === 'escuro' ? '-white' : '';
  // 1) Assinatura horizontal compacta (cabeçalho): ícone + "CEE".
  const cee = texto(bold, 'CEE', LADO + 24, 70, 84, 9);
  const wMark = Math.ceil(LADO + 24 + cee.w + 2);
  writeFileSync(`public/brand/cee-mark${suf}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wMark} ${LADO}" role="img" aria-label="CEE — Centro de Estudos Econômicos"><title>CEE — Centro de Estudos Econômicos</title>${icone(c)}<path fill="${c.texto}" d="${cee.d}"/></svg>\n`);

  // 2) Assinatura completa (rodapé, OG, 404): ícone + CEE + régua + nome por extenso.
  // Proporções medidas na arte: CEE com altura de versal ≈ 65 % do ícone; régua logo abaixo
  // da base do ícone; nome por extenso abaixo da régua, com espaçamento largo.
  const x = LADO + 50;
  const big = texto(bold, 'CEE', x, 65, 78, 14);
  const sub = texto(medium, 'CENTRO DE ESTUDOS ECONÔMICOS', x, 120, 15.5, 4.6);
  const largura = Math.max(big.w, sub.w);
  const wFull = Math.ceil(x + largura + 2);
  writeFileSync(`public/brand/cee-lockup${suf}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wFull} 126" role="img" aria-label="CEE — Centro de Estudos Econômicos"><title>CEE — Centro de Estudos Econômicos</title>${icone(c, 0, 0)}<path fill="${c.texto}" d="${big.d}"/><rect x="${x}" y="88" width="${largura.toFixed(1)}" height="2.4" fill="${c.regua}"/><path fill="${c.sub}" d="${sub.d}"/></svg>\n`);
}
// 3) Favicon: ícone claro sobre quadrado marinho (versão escura do ícone).
writeFileSync('public/brand/cee-favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect width="112" height="112" fill="#0A2259"/>${icone(CORES.escuro, 14, 14)}</svg>\n`);
console.log('✓ public/brand: cee-mark(.svg|-white.svg), cee-lockup(.svg|-white.svg), cee-favicon.svg');
