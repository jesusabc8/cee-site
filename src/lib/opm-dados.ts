/** Leitura e validação (Zod) dos arquivos de src/data/opm/, e fórmulas em MathML (temml) geradas no build. */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import temml from 'temml';
import { z } from 'astro/zod';
import { estadoPartidaSchema, indicadorSchema, moduloSchema } from '../schemas/opm';

const le = <T extends z.ZodTypeAny>(arq: string, s: T): z.infer<T>[] => z.array(s).parse(parse(readFileSync(`src/data/opm/${arq}`, 'utf8')));

export type Modulo = z.infer<typeof moduloSchema>;
export type Indicador = z.infer<typeof indicadorSchema>;
export type EstadoPartida = z.infer<typeof estadoPartidaSchema>;

export const MODULOS: Modulo[] = le('modulos.yaml', moduloSchema);
export const INDICADORES: Indicador[] = le('indicadores.yaml', indicadorSchema);
export const ESTADO_PARTIDA: EstadoPartida[] = le('estado-partida.yaml', estadoPartidaSchema);

// Integridade referencial: 21 indicadores únicos, cada um ligado a um módulo existente.
if (INDICADORES.length !== 21 || new Set(INDICADORES.map((i) => i.codigo)).size !== 21) throw new Error('OPM: são esperados 21 indicadores únicos (I.1–I.21).');
for (const i of INDICADORES) if (!MODULOS.some((m) => m.id === i.modulo)) throw new Error(`OPM: ${i.codigo} aponta para módulo inexistente ${i.modulo}`);
if (MODULOS.length !== 8) throw new Error('OPM: são esperados oito módulos (A2.1–A2.8).');

/**
 * Fórmula LaTeX → MathML, sem estilos inline (a CSP não admite `style=`). Falha o build se a fórmula não compilar
 * ou se o MathML trouxer atributo de estilo.
 */
export function mathml(latex: string, rotulo: string): string {
  const out = temml.renderToString(latex, { displayMode: true, throwOnError: true, annotate: true })
    // Estilos que o temml emite, trocados por classes (regras em src/components/opm/Formula.astro).
    .replace(/ style="display:block math;"/g, '')
    .replace(/ style="math-depth:0;"/g, ' class="tml-d0"')
    .replace(/<mtd([^>]*?) style="padding-left:0em;padding-right:0em;"/g, '<mtd$1 data-pad="0"')
    .replace(/<mtd([^>]*?) style="padding-left:1em;padding-right:0em;"/g, '<mtd$1 data-pad="1"');
  if (/\sstyle=/.test(out)) throw new Error(`MathML com estilo inline (CSP) em ${rotulo}`);
  return out.replace('<math', `<math aria-label="${rotulo.replace(/"/g, '&quot;')}"`);
}
