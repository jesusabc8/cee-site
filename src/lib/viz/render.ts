/**
 * Renderizador SVG isomórfico (build e navegador) para os gráficos do CEE.
 * Estilo editorial de organismos internacionais: grade horizontal fina, rótulos do eixo y à
 * esquerda sem linha de eixo, linha de base no x, rótulos diretos no fim das séries, faixas de
 * projeção sombreadas. Um único eixo y, sempre. Sem dependências: só gera strings SVG.
 */

export type XFormat = 'year' | 'quarter' | 'month' | 'day';

export interface Ponto { x: number; y: number | null }

export interface SerieSpec {
  id: string;
  label: string;
  /** Rótulo curto para o fim da linha (padrão: label). */
  endLabel?: string | false;
  color: string;
  kind?: 'line' | 'step' | 'bar' | 'dots';
  width?: number;
  dash?: string;
  /** Marcadores em todos os pontos (codificação secundária). */
  markers?: 'circle' | 'square' | 'diamond';
  points: Ponto[];
  /** Série de fundo (comparação): mais fina e mais clara; realça ao passar o cursor. */
  muted?: boolean;
  /** Não aparece no tooltip (ex.: limites da meta, que já estão na legenda). */
  noTooltip?: boolean;
}

export interface BandaSpec { id: string; label: string; lo: Ponto[]; hi: Ponto[]; fill: string; step?: boolean }

export interface ChartSpec {
  id: string;
  height: number;
  xFormat: XFormat;
  yDigits: number;
  yUnit: string;
  /** Sufixo curto nos rótulos do eixo y (ex.: "%"). */
  yTickSuffix?: string;
  /** Formato do eixo y: número simples ou milhares ("mil"). */
  yThousands?: boolean;
  series: SerieSpec[];
  bands?: BandaSpec[];
  /** Linhas horizontais de referência. */
  refs?: { y: number; label: string; color?: string; dash?: string }[];
  /** Área de projeção (de x0 até o fim), sombreada com rótulo. */
  projection?: { x0: number; label: string };
  zero?: boolean;
  yMin?: number;
  yMax?: number;
  lang: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f1 = (n: number) => Math.round(n * 10) / 10;

/** Passo "bonito" (1, 2, 2,5, 5 × 10^k) para ~n marcas no intervalo. */
export function niceTicks(min: number, max: number, n: number): number[] {
  if (min === max) { min -= 1; max += 1; }
  const raw = (max - min) / Math.max(1, n);
  const mag = 10 ** Math.floor(Math.log10(raw));
  // Passo 1-2-5 cuja quantidade de marcas fica mais perto da pedida (empate: mais marcas).
  const conta = (s: number) => Math.ceil(max / s - 1e-9) - Math.floor(min / s + 1e-9) + 1;
  const step = [0.5, 1, 2, 5, 10].map((m) => m * mag)
    .map((s) => ({ s, d: Math.abs(conta(s) - (n + 1)) }))
    .sort((a, b) => a.d - b.d || a.s - b.s)[0]!.s;
  const out: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

const MESES: Record<string, string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function fmtX(x: number, f: XFormat, lang: string): string {
  const d = new Date(x);
  const y = d.getUTCFullYear();
  const m = MESES[lang.startsWith('en') ? 'en' : 'pt']!;
  if (f === 'year') return String(y);
  if (f === 'quarter') return lang.startsWith('en') ? `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${y}` : `${Math.floor(d.getUTCMonth() / 3) + 1}º tri ${y}`;
  if (f === 'month') return `${m[d.getUTCMonth()]} ${y}`;
  return `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${y}`;
}

export function fmtNum(v: number, digits: number, lang: string, thousands = false): string {
  if (thousands) return new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(v / 1000) + (lang.startsWith('en') ? 'k' : ' mil');
  return new Intl.NumberFormat(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

export interface Layout {
  width: number; height: number; left: number; right: number; top: number; bottom: number;
  x0: number; x1: number; y0: number; y1: number;
  sx: (x: number) => number; sy: (y: number) => number;
}

/** Calcula escalas para um intervalo de x (filtra os dados ao período pedido). */
export function layout(spec: ChartSpec, width: number, xFrom?: number): Layout {
  const all = spec.series.flatMap((s) => s.points).filter((p) => p.y !== null && (xFrom === undefined || p.x >= xFrom));
  const bandPts = (spec.bands ?? []).flatMap((b) => [...b.lo, ...b.hi]).filter((p) => p.y !== null && (xFrom === undefined || p.x >= xFrom));
  const xs = all.map((p) => p.x);
  const ys = [...all, ...bandPts].map((p) => p.y as number).concat((spec.refs ?? []).map((r) => r.y));
  if (spec.zero) ys.push(0);
  let yMin = spec.yMin ?? Math.min(...ys);
  let yMax = spec.yMax ?? Math.max(...ys);
  const pad = (yMax - yMin) * 0.06;
  if (spec.yMin === undefined && !(spec.zero && yMin >= 0)) yMin -= pad;
  if (spec.yMax === undefined) yMax += pad;
  const narrow = width < 480;
  const hasEnd = spec.series.some((s) => s.endLabel !== false && s.kind !== 'bar' && s.kind !== 'dots');
  const right = hasEnd ? (narrow ? 64 : 92) : 16;
  const top = 14;
  const bottom = 30;
  const ticks = niceTicks(yMin, yMax, Math.max(3, Math.round(spec.height / 56)));
  const y0 = Math.min(yMin, ticks[0]!);
  const y1 = Math.max(yMax, ticks.at(-1)!);
  const maxLabel = Math.max(...ticks.map((t) => (fmtNum(t, tickDigits(ticks), spec.lang, spec.yThousands) + (spec.yTickSuffix ?? '')).length));
  const left = Math.max(28, maxLabel * 6.6 + 12);
  const x0 = xFrom ?? Math.min(...xs);
  const x1 = Math.max(...xs);
  const w = width - left - right;
  const h = spec.height - top - bottom;
  return {
    width, height: spec.height, left, right, top, bottom, x0, x1, y0, y1,
    sx: (x) => left + ((x - x0) / (x1 - x0 || 1)) * w,
    sy: (y) => top + (1 - (y - y0) / (y1 - y0 || 1)) * h,
  };
}

function tickDigits(ticks: number[]) {
  const d = (v: number) => (Number.isInteger(Math.round(v * 1e6) / 1e6) ? 0 : Number.isInteger(Math.round(v * 10 * 1e6) / 1e6) ? 1 : 2);
  return Math.max(...ticks.map(d));
}

/** Marcas do eixo x: anos com passo que caiba na largura, ou meses em períodos curtos. */
function xTicks(L: Layout, f: XFormat): { x: number; label: string }[] {
  const anos = (L.x1 - L.x0) / (365.25 * 86_400_000);
  const max = Math.max(2, Math.floor((L.width - L.left - L.right) / 64));
  const out: { x: number; label: string }[] = [];
  if (anos >= 2.5 || f === 'year') {
    const step = [1, 2, 5, 10, 20, 25].find((s) => anos / s <= max) ?? 25;
    const yA = new Date(L.x0).getUTCFullYear();
    const yB = new Date(L.x1).getUTCFullYear();
    for (let y = Math.ceil(yA / step) * step; y <= yB; y += step) {
      const x = f === 'year' ? Date.UTC(y, 6, 1) : Date.UTC(y, 0, 1);
      if (x >= L.x0 && x <= L.x1) out.push({ x, label: String(y) });
    }
  } else {
    const meses = Math.round(anos * 12);
    const step = [1, 2, 3, 6, 12].find((s) => meses / s <= max) ?? 12;
    const d = new Date(L.x0);
    let m = d.getUTCFullYear() * 12 + d.getUTCMonth();
    m = Math.ceil(m / step) * step;
    for (; ; m += step) {
      const x = Date.UTC(Math.floor(m / 12), m % 12, 1);
      if (x > L.x1) break;
      if (x >= L.x0) out.push({ x, label: fmtX(x, 'month', 'pt').replace(/^(\w+) (\d{4})$/, (_, a, b) => `${a}/${b.slice(2)}`) });
    }
  }
  return out;
}

function pathFor(pts: Ponto[], L: Layout, step: boolean): string {
  let d = '';
  let pen = false;
  let prev: { x: number; y: number } | null = null;
  for (const p of pts) {
    if (p.y === null || p.x < L.x0 || p.x > L.x1 + 1) { pen = false; prev = null; continue; }
    const X = f1(L.sx(p.x));
    const Y = f1(L.sy(p.y));
    if (!pen) d += `M${X} ${Y}`;
    else if (step && prev) d += `H${X}V${Y}`;
    else d += `L${X} ${Y}`;
    pen = true;
    prev = { x: X, y: Y };
  }
  return d;
}

function marker(kind: string, x: number, y: number, color: string, r = 3.2) {
  if (kind === 'square') return `<rect x="${f1(x - r)}" y="${f1(y - r)}" width="${r * 2}" height="${r * 2}" fill="${color}" stroke="#fff" stroke-width="1"/>`;
  if (kind === 'diamond') return `<path d="M${f1(x)} ${f1(y - r - 1)}L${f1(x + r + 1)} ${f1(y)}L${f1(x)} ${f1(y + r + 1)}L${f1(x - r - 1)} ${f1(y)}Z" fill="${color}" stroke="#fff" stroke-width="1"/>`;
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${color}" stroke="#fff" stroke-width="1"/>`;
}

/** Gera o SVG completo do gráfico para a largura dada, a partir de `xFrom` (recorte de período). */
export function renderSvg(spec: ChartSpec, width: number, xFrom?: number): string {
  const L = layout(spec, width, xFrom);
  const out: string[] = [];
  const W = width;
  const H = spec.height;
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="viz" aria-hidden="true" focusable="false">`);

  // Projeção (fundo sombreado + rótulo)
  if (spec.projection && spec.projection.x0 <= L.x1) {
    const px = L.sx(Math.max(spec.projection.x0, L.x0));
    out.push(`<rect x="${f1(px)}" y="${L.top}" width="${f1(W - L.right - px)}" height="${H - L.top - L.bottom}" fill="#EEF4F9"/>`);
    out.push(`<text x="${f1(px + 6)}" y="${L.top + 12}" class="viz-note">${esc(spec.projection.label)}</text>`);
  }

  // Grade e eixo y
  const ticks = niceTicks(L.y0, L.y1, Math.max(3, Math.round(H / 56))).filter((t) => t >= L.y0 - 1e-9 && t <= L.y1 + 1e-9);
  const dig = tickDigits(ticks);
  for (const t of ticks) {
    const y = f1(L.sy(t));
    const isZero = Math.abs(t) < 1e-9 && L.y0 < 0;
    out.push(`<line x1="${L.left}" x2="${W - L.right}" y1="${y}" y2="${y}" class="${isZero ? 'viz-zero' : 'viz-grid'}"/>`);
    out.push(`<text x="${L.left - 8}" y="${y + 4}" text-anchor="end" class="viz-tick">${esc(fmtNum(t, dig, spec.lang, spec.yThousands) + (spec.yTickSuffix ?? ''))}</text>`);
  }

  // Faixas (ex.: intervalo de tolerância da meta)
  for (const b of spec.bands ?? []) {
    const lo = b.lo.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1);
    const hi = b.hi.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1);
    if (lo.length < 2) continue;
    const top = pathFor(hi, L, !!b.step);
    const bottomPts = [...lo].reverse();
    let back = '';
    for (const [k, p] of bottomPts.entries()) {
      const X = f1(L.sx(p.x)); const Y = f1(L.sy(p.y as number));
      if (b.step && k > 0) back += `V${Y}H${X}`; else back += `L${X} ${Y}`;
    }
    out.push(`<path d="${top}${back}Z" fill="${b.fill}" class="viz-band"/>`);
  }

  // Referências horizontais
  for (const r of spec.refs ?? []) {
    if (r.y < L.y0 || r.y > L.y1) continue;
    const y = f1(L.sy(r.y));
    out.push(`<line x1="${L.left}" x2="${W - L.right}" y1="${y}" y2="${y}" stroke="${r.color ?? '#56667A'}" stroke-width="1.2" stroke-dasharray="${r.dash ?? '5 4'}"/>`);
    out.push(`<text x="${W - L.right - 4}" y="${y - 6}" text-anchor="end" class="viz-note">${esc(r.label)}</text>`);
  }

  // Eixo x
  out.push(`<line x1="${L.left}" x2="${W - L.right}" y1="${H - L.bottom}" y2="${H - L.bottom}" class="viz-base"/>`);
  for (const t of xTicks(L, spec.xFormat)) {
    const x = f1(L.sx(t.x));
    out.push(`<line x1="${x}" x2="${x}" y1="${H - L.bottom}" y2="${H - L.bottom + 4}" class="viz-base"/>`);
    out.push(`<text x="${x}" y="${H - L.bottom + 18}" text-anchor="middle" class="viz-tick">${esc(t.label)}</text>`);
  }

  // Barras primeiro (atrás das linhas)
  for (const s of spec.series.filter((s) => s.kind === 'bar')) {
    const pts = s.points.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1);
    const dx = pts.length > 1 ? (L.sx(pts[1]!.x) - L.sx(pts[0]!.x)) : 10;
    const bw = Math.max(1.2, Math.min(18, dx * 0.72));
    const y0 = L.sy(Math.max(0, L.y0));
    const g = pts.map((p) => {
      const y = L.sy(p.y as number);
      return `<rect x="${f1(L.sx(p.x) - bw / 2)}" y="${f1(Math.min(y, y0))}" width="${f1(bw)}" height="${f1(Math.max(0.6, Math.abs(y0 - y)))}"/>`;
    }).join('');
    out.push(`<g fill="${s.color}" data-serie="${s.id}" class="viz-bars">${g}</g>`);
  }

  // Linhas (as de fundo primeiro, depois as principais)
  const linhas = spec.series.filter((s) => s.kind !== 'bar');
  const ordenadas = [...linhas.filter((s) => s.muted), ...linhas.filter((s) => !s.muted)];
  for (const s of ordenadas) {
    if (s.kind === 'dots') {
      const g = s.points.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1).map((p) => marker(s.markers ?? 'circle', L.sx(p.x), L.sy(p.y as number), s.color, 4)).join('');
      out.push(`<g data-serie="${s.id}">${g}</g>`);
      continue;
    }
    const d = pathFor(s.points, L, s.kind === 'step');
    if (!d) continue;
    out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width ?? 2}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round" data-serie="${s.id}" class="viz-line${s.muted ? ' is-muted' : ''}"/>`);
    if (s.markers) {
      const g = s.points.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1).map((p) => marker(s.markers!, L.sx(p.x), L.sy(p.y as number), s.color, 2.6)).join('');
      out.push(`<g data-serie="${s.id}">${g}</g>`);
    }
  }

  // Rótulos diretos no fim (com afastamento mínimo de 14 px)
  const fins = linhas.filter((s) => s.endLabel !== false && s.kind !== 'dots').map((s) => {
    const pts = s.points.filter((p) => p.y !== null && p.x >= L.x0 && p.x <= L.x1);
    const u = pts.at(-1);
    return u ? { s, x: L.sx(u.x), y: L.sy(u.y as number), v: u.y as number } : null;
  }).filter((r): r is NonNullable<typeof r> => r !== null).sort((a, b) => a.y - b.y);
  const ys = fins.map((f) => f.y);
  for (let i = 1; i < ys.length; i++) if (ys[i]! - ys[i - 1]! < 14) ys[i] = ys[i - 1]! + 14;
  const narrow = width < 480;
  fins.forEach((f, i) => {
    out.push(marker('circle', f.x, f.y, f.s.color, 3.4));
    const txt = `${narrow ? '' : `${f.s.endLabel ?? f.s.label} `}${fmtNum(f.v, spec.yDigits, spec.lang, spec.yThousands)}`;
    out.push(`<text x="${f1(W - L.right + 8)}" y="${f1(ys[i]! + 4)}" class="viz-end${f.s.muted ? ' is-muted' : ''}" data-serie="${f.s.id}">${esc(txt)}</text>`);
  });

  // Camada de interação (cursor), preenchida no navegador
  out.push(`<g class="viz-hover" style="display:none"><line class="viz-cursor" y1="${L.top}" y2="${H - L.bottom}"/></g>`);
  out.push('</svg>');
  return out.join('');
}

/** Sparkline das fichas: linha fina, último ponto destacado. */
export function sparkline(values: number[], w = 200, h = 34, color = '#1D5FA6', last = '#0A2259'): string {
  if (values.length < 2) return '';
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const r = mx - mn || 1;
  const pts = values.map((v, k) => [(k * w) / (values.length - 1), h - 4 - ((v - mn) / r) * (h - 8)] as const);
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`).join('');
  const [lx, ly] = pts.at(-1)!;
  return `<svg class="spark" viewBox="-4 -2 ${w + 8} ${h + 4}" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${f1(lx)}" cy="${f1(ly)}" r="3" fill="${last}"/></svg>`;
}
