/** Esquema dos painéis do Observatório (Proposta §4.2, §5.2 e §6.4). */
import { z } from 'astro/zod';

const bi = z.object({ pt: z.string().min(1), en: z.string().min(1) });

export const painelSchema = z.object({
  titulo: bi,
  resumo: bi,
  area: z.enum(['a', 'b', 'c']),
  linha: z.string().regex(/^[ABC]\d$/),
  ordem: z.number().int(),
  /**
   * publicado: com dados verificados; em-construcao / em-institucionalizacao: sem cifras no sítio;
   * previsto: só aparece como cartão no índice do Observatório ("Previsto · ano N"), sem página própria.
   */
  estado: z.enum(['publicado', 'em-construcao', 'em-institucionalizacao', 'previsto']),
  /** Ano do plano em que o painel entra (1, 2…). Os rótulos "Previsto · ano N" e as contagens saem daqui. */
  ano: z.number().int().min(1),
  situacao: bi.optional(),
  /** Edição numerada (obrigatória quando publicado). */
  versao: z.string().optional(),
  /** Diretório em data/processed/ com os dados do painel (obrigatório quando publicado). */
  dados_dir: z.string().optional(),
  fontes_previstas: z.string().optional(),
  metodologia: bi.optional(),
  changelog: z.array(z.object({ versao: z.string(), data: z.coerce.date(), nota: z.string() }).strict()).default([]),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
}).strict().superRefine((p, ctx) => {
  if (p.estado !== 'previsto') {
    for (const k of ['situacao', 'fontes_previstas'] as const) {
      if (!p[k]) ctx.addIssue({ code: 'custom', path: [k], message: `Painel com página exige \`${k}\`.` });
    }
  }
  if (p.estado === 'publicado') {
    for (const k of ['versao', 'dados_dir', 'metodologia'] as const) {
      if (!p[k]) ctx.addIssue({ code: 'custom', path: [k], message: `Painel publicado exige \`${k}\`.` });
    }
    if (p.changelog.length === 0) ctx.addIssue({ code: 'custom', path: ['changelog'], message: 'Painel publicado exige changelog.' });
  }
});
