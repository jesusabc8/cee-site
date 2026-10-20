/**
 * Imagens Open Graph tipográficas (1200×630), geradas no build com Satori + resvg.
 * Sem fotografia nem ilustração: marca em texto, tipo de conteúdo, título e linha de metadados.
 */
import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const font = (pkg: string, file: string) => readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`);
const FONTS = [
  { name: 'Serif', data: font('source-serif-4', 'source-serif-4-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Sans', data: font('source-sans-3', 'source-sans-3-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Sans', data: font('source-sans-3', 'source-sans-3-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function ogPng(o: { rotulo: string; titulo: string; meta: string }): Promise<Uint8Array> {
  const tamanho = o.titulo.length > 90 ? 50 : o.titulo.length > 60 ? 58 : 66;
  const tree = h('div', {
    // Satori não aplica box-sizing: as dimensões descontam o padding (64/72 px) e a borda (14 px).
    width: 1200 - 144, height: 630 - 128 - 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    background: '#ffffff', padding: '64px 72px', borderTop: '14px solid #1f3a5f', boxSizing: 'content-box',
  }, [
    h('div', { display: 'flex', alignItems: 'baseline', gap: '16px', fontFamily: 'Serif', fontSize: 34, color: '#16202c' }, [
      h('span', { color: '#1f3a5f', fontWeight: 600, letterSpacing: 2 }, 'CEE'),
      h('span', { color: '#5f6670' }, '·'),
      h('span', {}, 'Centro de Estudos Econômicos'),
    ]),
    h('div', { display: 'flex', flexDirection: 'column', gap: '22px' }, [
      h('div', { fontFamily: 'Sans', fontWeight: 600, fontSize: 26, color: '#9c6b1e', textTransform: 'uppercase', letterSpacing: 2 }, o.rotulo),
      h('div', { fontFamily: 'Serif', fontWeight: 600, fontSize: tamanho, lineHeight: 1.15, color: '#16202c', maxWidth: 1040 }, o.titulo),
    ]),
    h('div', { display: 'flex', borderTop: '1px solid #d5d9df', paddingTop: '20px', fontFamily: 'Sans', fontSize: 24, color: '#5f6670' }, o.meta),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
