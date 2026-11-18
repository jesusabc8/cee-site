/**
 * Figuras estáticas do estilo publicação (ADR-029/030), geradas no build: mapa de símbolos, múltiplos pequenos e barras
 * horizontais por categoria. Não têm cursor nem troca de período; o cliente só oferece exportação (PNG/SVG).
 * Cores por classe (serie-s*, preenche-s*, seq-*) para valer nos temas claro e escuro; nenhum atributo style.
 */
import { fmtNum } from './render';

type Lang = 'pt-BR' | 'en';
const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const raiz = (W: number, H: number, rotulo: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="viz viz-estatico" role="img" aria-label="${esc(rotulo)}">`;
/** Largura aproximada de um texto de 12 px na fonte da interface (média 6,4 px por caractere). */
export const larguraTexto = (t: string, px = 12) => t.length * px * 0.54;

// ——— Mapa de símbolos ———
export interface PontoMapa { id: string; nome: string; lon: number; lat: number; peso: number; valor: number; destaque?: boolean }
/** Posição do rótulo em relação ao círculo: direita, esquerda, acima, abaixo. Fixada por área (as áreas do IPCA são fixas). */
export type Lado = 'd' | 'e' | 'a' | 'b';
export interface Classe { ate: number | null; rotulo: string }

export function mapaSimbolos(pts: PontoMapa[], o: { largura: number; lados: Record<string, Lado>; classes: Classe[]; rotular: (p: PontoMapa) => boolean; lang: Lang; titulo: string; legendaTamanho: string; legendaCor: string }) {
  const LON0 = -75, LON1 = -27, LAT0 = 7, LAT1 = -35;
  const cosL = Math.cos((15 * Math.PI) / 180);
  const pad = 8, W = o.largura;
  const k = (W - 2 * pad) / ((LON1 - LON0) * cosL);
  const Hm = (LAT0 - LAT1) * k;
  const sx = (lon: number) => pad + (lon - LON0) * cosL * k;
  const sy = (lat: number) => pad + (LAT0 - lat) * k;
  const rMax = W > 500 ? 16 : 11;
  const pMax = Math.max(...pts.map((p) => p.peso));
  const raio = (w: number) => Math.max(3, rMax * Math.sqrt(w / pMax));
  const classe = (v: number) => { const i = o.classes.findIndex((c) => c.ate === null || v < c.ate); return `seq-${i + 1}`; };
  const legH = 64;
  const H = Math.round(Hm + 2 * pad + legH);
  const out = [raiz(W, H, o.titulo)];
  // Gradícula a cada 10°, com rótulos discretos (referência de posição; não há contorno de fronteiras, ver ADR-030).
  for (let lat = 0; lat >= -30; lat -= 10) {
    out.push(`<line x1="${pad}" x2="${f1(W - pad)}" y1="${f1(sy(lat))}" y2="${f1(sy(lat))}" class="viz-grid"/>`);
    out.push(`<text x="${pad + 2}" y="${f1(sy(lat) - 4)}" class="viz-tick viz-tick--peq">${lat === 0 ? '0°' : `${Math.abs(lat)}°S`}</text>`);
  }
  for (let lon = -70; lon <= -30; lon += 10) {
    out.push(`<line x1="${f1(sx(lon))}" x2="${f1(sx(lon))}" y1="${pad}" y2="${f1(pad + Hm)}" class="viz-grid"/>`);
    out.push(`<text x="${f1(sx(lon) + 3)}" y="${f1(pad + Hm - 4)}" class="viz-tick viz-tick--peq">${Math.abs(lon)}°O</text>`);
  }
  // Círculos: maiores primeiro (os menores ficam por cima e visíveis).
  for (const p of [...pts].sort((a, b) => b.peso - a.peso)) {
    out.push(`<circle cx="${f1(sx(p.lon))}" cy="${f1(sy(p.lat))}" r="${f1(raio(p.peso))}" class="${classe(p.valor)} mapa-ponto${p.destaque ? ' mapa-ponto--destaque' : ''}" data-area="${esc(p.id)}"><title>${esc(`${p.nome}: ${fmtNum(p.valor, 2, o.lang)}%`)}</title></circle>`);
  }
  for (const p of pts.filter(o.rotular)) {
    const r = raio(p.peso), x = sx(p.lon), y = sy(p.lat);
    const lado = o.lados[p.id] ?? 'd';
    const [tx, ty, anc] = lado === 'd' ? [x + r + 5, y + 4, 'start'] : lado === 'e' ? [x - r - 5, y + 4, 'end'] : lado === 'a' ? [x, y - r - 6, 'middle'] : [x, y + r + 14, 'middle'];
    out.push(`<text x="${f1(tx)}" y="${f1(ty)}" text-anchor="${anc}" class="viz-end viz-halo${p.destaque ? ' mapa-rotulo--destaque' : ''}">${esc(p.nome)} <tspan class="mapa-valor">${fmtNum(p.valor, 2, o.lang)}</tspan></text>`);
  }
  // Legendas: cor (classes) e tamanho (peso).
  const y0 = Math.round(Hm + 2 * pad + 14);
  out.push(`<text x="${pad}" y="${y0}" class="viz-eixo">${esc(o.legendaCor)}</text>`);
  let lx = pad;
  const cw = Math.min(92, (W - 2 * pad) / o.classes.length);
  o.classes.forEach((c, i) => {
    out.push(`<rect x="${f1(lx)}" y="${y0 + 8}" width="${f1(cw - 4)}" height="10" class="seq-${i + 1}"/>`);
    out.push(`<text x="${f1(lx)}" y="${y0 + 32}" class="viz-tick viz-tick--peq">${esc(c.rotulo)}</text>`);
    lx += cw;
  });
  if (W > 500) {
    const ax = W - pad - 150;
    out.push(`<text x="${ax}" y="${y0}" class="viz-eixo">${esc(o.legendaTamanho)}</text>`);
    [5, 15, 30].forEach((w, i) => {
      const r = raio(w);
      out.push(`<circle cx="${f1(ax + 12 + i * 46)}" cy="${f1(y0 + 24)}" r="${f1(r)}" class="mapa-escala"/>`);
      out.push(`<text x="${f1(ax + 12 + i * 46 + r + 3)}" y="${f1(y0 + 28)}" class="viz-tick viz-tick--peq">${w}%</text>`);
    });
  }
  out.push('</svg>');
  return out.join('');
}

// ——— Múltiplos pequenos ———
export interface Painel { id: string; nome: string; pontos: { x: number; y: number | null }[]; destaque?: boolean }
export function multiplos(paineis: Painel[], ref: { x: number; y: number | null }[], o: { largura: number; colunas: number; lang: Lang; titulo: string; rotuloRef: string; casas?: number }) {
  const W = o.largura, gap = 14, cols = o.colunas;
  const pw = (W - gap * (cols - 1)) / cols;
  const ph = W > 500 ? 112 : 96;
  const cab = 30;
  const rows = Math.ceil(paineis.length / cols);
  const legH = 22;
  const H = legH + rows * (cab + ph + 22) + (rows - 1) * gap;
  const todos = [...paineis.flatMap((p) => p.pontos), ...ref].filter((p) => p.y !== null) as { x: number; y: number }[];
  const x0 = Math.min(...todos.map((p) => p.x)), x1 = Math.max(...todos.map((p) => p.x));
  const y0 = Math.floor(Math.min(0, ...todos.map((p) => p.y))), y1 = Math.ceil(Math.max(...todos.map((p) => p.y)));
  const passo = y1 - y0 > 10 ? 5 : 2;
  const ticks: number[] = []; for (let t = Math.ceil(y0 / passo) * passo; t <= y1; t += passo) ticks.push(t);
  const anoIni = new Date(x0).getUTCFullYear(), anoFim = new Date(x1).getUTCFullYear();
  const out = [raiz(W, H, o.titulo)];
  // Legenda única.
  out.push(`<line x1="0" x2="18" y1="8" y2="8" class="serie-s1" stroke-width="2"/><text x="24" y="12" class="viz-tick">${o.lang === 'en' ? 'Area' : 'Área'}</text>`);
  out.push(`<line x1="70" x2="88" y1="8" y2="8" class="serie-s3" stroke-width="1.6" stroke-dasharray="4 3"/><text x="94" y="12" class="viz-tick">${esc(o.rotuloRef)}</text>`);
  paineis.forEach((p, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const ox = c * (pw + gap), oy = legH + r * (cab + ph + 22 + gap);
    const left = 26, right = 6;
    const sx = (x: number) => ox + left + ((x - x0) / (x1 - x0)) * (pw - left - right);
    const sy = (y: number) => oy + cab + ph - ((y - y0) / (y1 - y0)) * ph;
    const ult = [...p.pontos].reverse().find((q) => q.y !== null);
    out.push(`<line x1="${f1(ox)}" x2="${f1(ox + pw)}" y1="${oy}" y2="${oy}" class="${p.destaque ? 'mm-topo mm-topo--destaque' : 'mm-topo'}"/>`);
    out.push(`<text x="${f1(ox)}" y="${oy + 17}" class="viz-end${p.destaque ? ' mapa-rotulo--destaque' : ''}">${esc(p.nome)}</text>`);
    if (ult) out.push(`<text x="${f1(ox + pw)}" y="${oy + 17}" text-anchor="end" class="viz-end mapa-valor">${fmtNum(ult.y!, o.casas ?? 2, o.lang)}</text>`);
    for (const t of ticks) {
      out.push(`<line x1="${f1(ox + left)}" x2="${f1(ox + pw - right)}" y1="${f1(sy(t))}" y2="${f1(sy(t))}" class="${t === 0 ? 'viz-zero' : 'viz-grid'}"/>`);
      if (c === 0 || W > 500) out.push(`<text x="${f1(ox + left - 4)}" y="${f1(sy(t) + 4)}" text-anchor="end" class="viz-tick viz-tick--peq">${t}</text>`);
    }
    out.push(`<text x="${f1(ox + left)}" y="${f1(oy + cab + ph + 16)}" class="viz-tick viz-tick--peq">${anoIni}</text>`);
    out.push(`<text x="${f1(ox + pw - right)}" y="${f1(oy + cab + ph + 16)}" text-anchor="end" class="viz-tick viz-tick--peq">${anoFim}</text>`);
    const caminho = (pts: { x: number; y: number | null }[]) => {
      let d = '', pen = false;
      for (const q of pts) { if (q.y === null) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${f1(sx(q.x))} ${f1(sy(q.y))}`; pen = true; }
      return d;
    };
    out.push(`<path d="${caminho(ref)}" fill="none" class="serie-s3" stroke-width="1.4" stroke-dasharray="4 3"/>`);
    out.push(`<path d="${caminho(p.pontos)}" fill="none" class="serie-s1" stroke-width="${p.destaque ? 2.4 : 1.8}" stroke-linejoin="round"/>`);
  });
  out.push('</svg>');
  return out.join('');
}

// ——— Barras horizontais divergentes ———
export interface Barra { rotulo: string; valor: number; destaque?: boolean }
export function barrasH(bs: Barra[], o: { largura: number; lang: Lang; titulo: string; unidade: string; casas?: number; ref?: { valor: number; rotulo: string }; destaqueSo?: boolean }) {
  const W = o.largura, linha = 26, topo = 22;
  const rotW = Math.min(W * 0.42, Math.max(...bs.map((b) => larguraTexto(b.rotulo))) + 10);
  const valW = 46;
  const H = topo + bs.length * linha + 8 + (o.ref ? 16 : 0);
  const vmin = Math.min(0, ...bs.map((b) => b.valor)), vmax = Math.max(0, ...bs.map((b) => b.valor));
  const span = vmax - vmin || 1;
  const a0 = rotW + valW, a1 = W - valW;
  const sx = (v: number) => a0 + ((v - vmin) / span) * (a1 - a0);
  const out = [raiz(W, H, o.titulo)];
  out.push(`<text x="${f1(a1)}" y="12" text-anchor="end" class="viz-eixo">${esc(o.unidade)}</text>`);
  bs.forEach((b, i) => {
    const y = topo + i * linha;
    const xa = sx(Math.min(0, b.valor)), xb = sx(Math.max(0, b.valor));
    out.push(`<text x="${f1(rotW - 6)}" y="${y + 16}" text-anchor="end" class="viz-tick${b.destaque ? ' mapa-rotulo--destaque' : ''}">${esc(b.rotulo)}</text>`);
    out.push(`<rect x="${f1(xa)}" y="${y + 5}" width="${f1(Math.max(1, xb - xa))}" height="${linha - 10}" class="${o.destaqueSo ? (b.destaque ? 'preenche-s1' : 'preenche-s4') : b.valor >= 0 ? 'preenche-s1' : 'preenche-s2'}"/>`);
    const neg = b.valor < 0;
    out.push(`<text x="${f1(neg ? xa - 4 : xb + 4)}" y="${y + 16}" text-anchor="${neg ? 'end' : 'start'}" class="viz-tick viz-halo">${fmtNum(b.valor, o.casas ?? 2, o.lang)}</text>`);
  });
  out.push(`<line x1="${f1(sx(0))}" x2="${f1(sx(0))}" y1="${topo - 2}" y2="${topo + bs.length * linha + 2}" class="viz-zero"/>`);
  if (o.ref) {
    const xr = sx(o.ref.valor);
    out.push(`<line x1="${f1(xr)}" x2="${f1(xr)}" y1="${topo - 2}" y2="${topo + bs.length * linha + 4}" class="ref-linha" stroke-dasharray="3 3" stroke-width="1.2"/>`);
    out.push(`<text x="${f1(xr)}" y="${topo + bs.length * linha + 18}" text-anchor="middle" class="viz-note">${esc(o.ref.rotulo)} ${fmtNum(o.ref.valor, o.casas ?? 2, o.lang)}</text>`);
  }
  out.push('</svg>');
  return out.join('');
}
