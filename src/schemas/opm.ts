/** Esquemas dos dados do Observatório de Política Monetária (src/data/opm/; ADR-022). Validados no build. */
import { z } from 'astro/zod';

const bi = z.object({ pt: z.string().min(1), en: z.string().min(1) }).strict();

export const moduloSchema = z.object({
  id: z.string().regex(/^a2-[1-8]-[a-z0-9-]+$/),
  codigo: z.string().regex(/^A2\.[1-8]$/),
  /** Nome curto para a navegação por módulos. */
  curto: bi,
  titulo: bi,
  pergunta: bi,
}).strict();

export const indicadorSchema = z.object({
  codigo: z.string().regex(/^I\.(?:[1-9]|1\d|2[01])$/),
  modulo: z.string(),
  camada: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** publicado = com dados no sítio; em-construcao = sem cifras. A camada 3 publicada leva o selo "experimental". */
  estado: z.enum(['publicado', 'em-construcao']),
  nome: bi,
  formula: z.string().min(3),
  descricao: bi,
  convencao: bi.optional(),
  /** Caminho em data/processed/opm/ (obrigatório quando publicado). */
  arquivo: z.string().regex(/^indicadores\/[a-z0-9_]+\.csv$/).optional(),
  /** Pendência que impede a publicação (obrigatória quando em construção). */
  pendencia: bi.optional(),
}).strict().refine((i) => i.estado !== 'publicado' || Boolean(i.arquivo), { message: 'indicador publicado precisa de arquivo' })
  .refine((i) => i.estado !== 'em-construcao' || Boolean(i.pendencia), { message: 'indicador em construção precisa de pendência' });

export const estadoPartidaSchema = z.object({
  id: z.string(),
  rotulo: bi,
  bcb: z.number(),
  unidade: z.string(),
  fonte: z.string().min(3),
  cee: z.string().nullable(),
}).strict();
