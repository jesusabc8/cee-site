/**
 * Imagens Open Graph (1200×630), geradas no build com Satori + resvg, no sistema visual do sítio:
 * banda marinha com grade fina, marca do CEE, rótulo, título e metadados. A linha de fundo é dado
 * real (IPCA em 12 meses, IBGE), a mesma do herói da página inicial.
 */
import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { serieHero } from './panorama';

const font = (pkg: string, file: string) => readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`);
const FONTS = [
  { name: 'Sans', data: font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Sans', data: font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Mono', data: font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const MARCA = uri(readFileSync('public/brand/cee-mark-white.svg', 'utf8'));

// Fundo: grade e linha do IPCA 12m, desenhadas uma vez por build.
const FUNDO = (() => {
  const pts = serieHero().filter((p): p is { x: number; y: number } => p.y !== null);
  const x0 = pts[0]!.x, x1 = pts.at(-1)!.x;
  const ys = pts.map((p) => p.y);
  const lo = Math.min(0, ...ys), hi = Math.max(...ys);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(620 + ((p.x - x0) / (x1 - x0)) * 560).toFixed(1)} ${(560 - ((p.y - lo) / (hi - lo)) * 220).toFixed(1)}`).join('');
  const grade = [126, 252, 378, 504].map((y) => `<path d="M0 ${y}H1200" />`).join('') + [200, 400, 600, 800, 1000].map((x) => `<path d="M${x} 0V630" />`).join('');
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><g stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none">${grade}</g><path d="${d}" fill="none" stroke="#C0E0F0" stroke-opacity="0.55" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
})();

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({ type, props: { style, children, ...extra } });

export async function ogPng(o: { rotulo: string; titulo: string; meta: string }): Promise<Uint8Array> {
  const tamanho = o.titulo.length > 90 ? 48 : o.titulo.length > 60 ? 56 : 64;
  const tree = h('div', {
    width: 1200, height: 630, display: 'flex', position: 'relative',
    background: 'linear-gradient(135deg, #071A47 0%, #0A2259 55%, #2C5D84 130%)',
  }, [
    h('img', { position: 'absolute', left: 0, top: 0, width: 1200, height: 630 }, undefined, { src: FUNDO, width: 1200, height: 630 }),
    h('div', {
      // Satori não aplica box-sizing: as dimensões descontam o padding.
      position: 'absolute', left: 0, top: 0, width: 1200 - 144, height: 630 - 128,
      padding: '64px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }, [
      h('div', { display: 'flex', alignItems: 'center', gap: '18px' }, [
        h('img', { width: 189, height: 56 }, undefined, { src: MARCA, width: 189, height: 56 }),
        h('span', { fontFamily: 'Sans', fontSize: 20, color: '#B9C9D9', borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '18px' }, 'Centro de Estudos Econômicos'),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 1000 }, [
        h('div', { fontFamily: 'Sans', fontWeight: 600, fontSize: 22, color: '#C0E0F0', textTransform: 'uppercase', letterSpacing: 4 }, o.rotulo),
        h('div', { fontFamily: 'Sans', fontWeight: 600, fontSize: tamanho, lineHeight: 1.1, color: '#ffffff', letterSpacing: -1 }, o.titulo),
      ]),
      h('div', { display: 'flex', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '18px', fontFamily: 'Mono', fontSize: 20, color: '#B9C9D9' }, o.meta),
    ]),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
