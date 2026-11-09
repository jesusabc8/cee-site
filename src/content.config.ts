/**
 * Coleções de conteúdo. Os esquemas são estritos: o build falha se faltar campo obrigatório.
 * Fontes: Estatuto, Regimento Interno e Manual de Programas e Produtos (docs/fuentes/normas/; ADR-017).
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { publicacaoSchema } from './schemas/publicacao';
import { painelSchema } from './schemas/painel';

const bi = z.object({ pt: z.string().min(1), en: z.string().min(1) });

export const ESTADOS = ['prevista', 'ativa', 'latente', 'planejada'] as const;

/** Códigos de programa aceitos em linhas, painéis e publicações (Manual, Parte I). */
export const PROGRAMA_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'transversal'] as const;
const pergunta = z.object({ codigo: z.string().regex(/^[A-FT](\.\d)+$/), pt: z.string().min(1), en: z.string().min(1) }).strict();

/** Programas de pesquisa, Transversal e lentes (src/data/programas.yaml; Manual, Parte I; Estatuto, art. 35). */
const programas = defineCollection({
  loader: file('src/data/programas.yaml'),
  schema: z.object({
    id: z.string(),
    codigo: z.string(),
    tipo: z.enum(['programa', 'transversal', 'lente']),
    ordem: z.number().int(),
    /** Rótulo derivado: "Ativo" / "Em formação". Lentes não têm situação. */
    situacao: z.enum(['ativo', 'em-formacao']).optional(),
    nome: bi,
    objeto: bi,
    nota: bi.optional(),
    abrange: bi.optional(),
    nao_abrange: bi.optional(),
    subprogramas: z.array(z.object({ codigo: z.string().regex(/^A\.\d$/), nome: bi, perguntas: z.array(pergunta).min(1) }).strict()).optional(),
    perguntas: z.array(pergunta).optional(),
    /** Painéis previstos para quando um programa em formação for ativado (Manual, Quadro 1). Não viram página. */
    paineis_previstos: z.array(z.object({ codigo: z.string().regex(/^[D-F]\d$/), pt: z.string(), en: z.string() }).strict()).optional(),
    dados: z.string().optional(),
    referencias: z.string().optional(),
  }).strict().superRefine((p, ctx) => {
    if (p.tipo !== 'lente' && !p.situacao) ctx.addIssue({ code: 'custom', path: ['situacao'], message: 'Programa exige `situacao`.' });
    if (p.tipo !== 'lente' && !p.perguntas?.length && !p.subprogramas?.length) ctx.addIssue({ code: 'custom', path: ['perguntas'], message: 'Programa exige perguntas (Manual, Parte I).' });
    if (p.situacao === 'em-formacao' && p.tipo !== 'programa') ctx.addIssue({ code: 'custom', path: ['situacao'], message: 'Só programas temáticos ficam em formação.' });
  }),
});

const linhas = defineCollection({
  loader: file('src/data/linhas.yaml'),
  schema: z.object({
    id: z.string(),
    codigo: z.string().regex(/^[A-F]\d$/),
    /** Programa da linha (o nome do campo é histórico). */
    area: z.enum(PROGRAMA_IDS),
    /** Subprograma do Programa A, quando houver (A.1, A.2). */
    subprograma: z.string().regex(/^A\.\d$/).optional(),
    estado: z.enum(ESTADOS),
    /** Ano do plano; ausente quando os documentos não o definem. */
    ano: z.number().int().min(1).optional(),
    nome: bi,
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
    /** Artigos do Estatuto, do Regimento e do Manual de onde vem o conteúdo (rastreabilidade). */
    fonte_normas: z.string(),
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
    consentimento: z.boolean(),
    data_consentimento: z.coerce.date(),
    /** Consentimento revogado: a pessoa deixa de aparecer imediatamente. */
    revogado: z.boolean().default(false),
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

export const collections = { programas, linhas, paginas, equipe, parcerias, publicacoes, paineis };
