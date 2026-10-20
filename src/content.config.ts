/**
 * Coleções de conteúdo. Os esquemas são estritos: o build falha se faltar campo obrigatório.
 * Fontes: Proposta v3.0 (§4 áreas e linhas; §5 produtos; §6 qualidade; §9 LGPD).
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { publicacaoSchema } from './schemas/publicacao';
import { painelSchema } from './schemas/painel';

const bi = z.object({ pt: z.string().min(1), en: z.string().min(1) });
const biList = z.object({ pt: z.array(z.string()).min(1), en: z.array(z.string()).min(1) });

export const ESTADOS = ['prevista', 'ativa', 'latente', 'planejada'] as const;

const areas = defineCollection({
  loader: file('src/data/areas.yaml'),
  schema: z.object({
    id: z.string(),
    codigo: z.string(),
    tipo: z.enum(['area', 'lente']),
    ordem: z.number().int(),
    nome: bi,
    pergunta_guia: bi,
    descricao: bi,
    produtos: bi,
  }).strict(),
});

const linhas = defineCollection({
  loader: file('src/data/linhas.yaml'),
  schema: z.object({
    id: z.string(),
    codigo: z.string().regex(/^[ABC]\d$/),
    area: z.enum(['a', 'b', 'c']),
    estado: z.enum(ESTADOS),
    ano: z.number().int().min(1),
    nome: bi,
    pergunta_guia: bi,
    perguntas: biList,
    metodos: biList,
    fontes: z.string(),
    nota: bi.optional(),
  }).strict(),
});

/** Páginas institucionais em MDX: src/content/paginas/<lang>/<slug>.mdx */
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    eyebrow: z.string().optional(),
    bajada: z.string().optional(),
    /** Seções da Proposta v3.0 de onde vem o conteúdo (rastreabilidade). */
    fonte_proposta: z.string(),
    atualizado: z.coerce.date(),
  }).strict(),
});

/** Pessoas: sem consentimento registrado, não são renderizadas (ver src/lib/equipe.ts). */
const equipe = defineCollection({
  loader: file('src/data/equipe.yaml'),
  schema: z.object({
    id: z.string(),
    nome: z.string(),
    funcao: bi,
    instancia: z.string(),
    consentimento: z.boolean().optional(),
    data_consentimento: z.coerce.date().optional(),
  }).strict(),
});

const parcerias = defineCollection({
  loader: file('src/data/parcerias.yaml'),
  schema: z.object({
    id: z.string(),
    nome: z.string(),
    descricao: bi,
    acordo_escrito: z.literal(true),
    documento: z.string().min(1),
    data: z.coerce.date(),
  }).strict(),
});

/** Publicações em MDX: src/content/publicacoes/<slug>.mdx — o slug é a URL permanente. */
const publicacoes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publicacoes' }),
  schema: publicacaoSchema,
});

const paineis = defineCollection({
  loader: file('src/data/paineis.yaml'),
  schema: z.object({ id: z.string() }).and(painelSchema),
});

export const collections = { areas, linhas, paginas, equipe, parcerias, publicacoes, paineis };
