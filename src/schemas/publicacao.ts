/**
 * Esquema das publicações (Proposta v3.0, §5 e Anexo D). Regras por tipo validadas no build:
 * - Nota de Conjuntura: `tese` e `incerteza_principal` obrigatórias (Anexo D.1).
 * - Nota Técnica: `limites` obrigatório (§5.2; Regimento, Art. 18); único tipo que admite `recomendacoes`.
 * - Working Paper: `numero` no formato NN/AAAA (§5.2).
 * - Edição especial: `rubrica_url` obrigatória — rubrica publicada antes da aplicação (§4.6).
 */
import { z } from 'astro/zod';
import { CREDIT_ROLES } from './credit';

export const TIPOS = {
  'nota-de-conjuntura': { pt: 'Nota de Conjuntura', en: 'Business-Cycle Note', plural: { pt: 'Notas de Conjuntura', en: 'Business-Cycle Notes' } },
  'data-insight': { pt: 'Data Insight', en: 'Data Insight', plural: { pt: 'Data Insights', en: 'Data Insights' } },
  'nota-tecnica': { pt: 'Nota Técnica', en: 'Technical Note', plural: { pt: 'Notas Técnicas', en: 'Technical Notes' } },
  'working-paper': { pt: 'Working Paper', en: 'Working Paper', plural: { pt: 'Working Papers', en: 'Working Papers' } },
  replicacao: { pt: 'Replicação', en: 'Replication', plural: { pt: 'Replicações', en: 'Replications' } },
  'edicao-especial': { pt: 'Edição especial', en: 'Special edition', plural: { pt: 'Edições especiais', en: 'Special editions' } },
} as const;
export type Tipo = keyof typeof TIPOS;
export const TIPO_KEYS = Object.keys(TIPOS) as [Tipo, ...Tipo[]];

const dataISO = z.coerce.date();

export const fonteSchema = z.object({
  instituicao: z.string().min(1),
  serie: z.string().min(1),
  codigo: z.string().min(1),
  unidade: z.string().min(1),
  extraido_em: dataISO,
  url: z.url(),
}).strict();

export const publicacaoSchema = z.object({
  tipo: z.enum(TIPO_KEYS),
  titulo: z.string().min(1),
  subtitulo: z.string().min(1),
  data: dataISO,
  versao: z.string().regex(/^\d+\.\d+$/, 'versão no formato N.N'),
  area: z.enum(['a', 'b', 'c', 'instituicoes']),
  linha: z.string().regex(/^[ABC]\d$/).optional(),
  autoria: z.array(z.object({
    nome: z.string().min(1),
    funcao_credit: z.array(z.enum(CREDIT_ROLES)).min(1),
  }).strict()).min(1),
  resumo: z.string().min(1),
  titulo_en: z.string().optional(),
  resumo_en: z.string().optional(),
  tese: z.string().optional(),
  incerteza_principal: z.string().optional(),
  limites: z.array(z.string().min(1)).optional(),
  recomendacoes: z.array(z.string().min(1)).optional(),
  numero: z.string().optional(),
  rubrica_url: z.string().optional(),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
  licenca: z.enum(['CC-BY-4.0']).default('CC-BY-4.0'),
  fontes: z.array(fonteSchema).min(1),
  dados: z.array(z.object({ rotulo: z.string(), url: z.string() }).strict()).min(1),
  codigo_url: z.url().optional(),
  pdf_url: z.string().optional(),
  conflitos: z.string().min(1),
  uso_ia: z.string().min(1),
  versoes: z.array(z.object({ versao: z.string(), data: dataISO, nota: z.string() }).strict()).default([]),
  erratas: z.array(z.object({
    data: dataISO,
    identificado_em: dataISO,
    descricao: z.string(),
    efeito: z.string(),
    correcao: z.string(),
    versao_corrigida: z.string(),
  }).strict()).default([]),
  idioma: z.enum(['pt-BR', 'en']).default('pt-BR'),
  /** Publicação de demonstração: nunca listada, sempre noindex. */
  demo: z.boolean().default(false),
  noindex: z.boolean().default(false),
}).strict().superRefine((p, ctx) => {
  const err = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (p.tipo === 'nota-de-conjuntura') {
    if (!p.tese) err('tese', 'Nota de Conjuntura exige `tese` (duas frases, Anexo D.1).');
    if (!p.incerteza_principal) err('incerteza_principal', 'Nota de Conjuntura exige `incerteza_principal`.');
  }
  if (p.tipo === 'nota-tecnica' && (!p.limites || p.limites.length === 0)) {
    err('limites', 'Nota Técnica exige `limites` — o que a evidência não permite concluir (Regimento, Art. 18).');
  }
  if (p.recomendacoes && p.tipo !== 'nota-tecnica') {
    err('recomendacoes', 'Recomendações de política só são admitidas em Notas Técnicas (Proposta §3.5).');
  }
  if (p.tipo === 'working-paper' && !/^\d{2}\/\d{4}$/.test(p.numero ?? '')) {
    err('numero', 'Working Paper exige `numero` no formato NN/AAAA.');
  }
  if (p.tipo === 'edicao-especial' && !p.rubrica_url) {
    err('rubrica_url', 'Edição especial exige rubrica publicada antes da aplicação (Proposta §4.6).');
  }
  for (const e of p.erratas) {
    const dias = (e.data.getTime() - e.identificado_em.getTime()) / 86_400_000;
    if (dias > 7) err('erratas', `Errata publicada ${dias} dias após a identificação; a política exige menos de 7 dias (Proposta §6.5).`);
  }
});

export type Publicacao = z.infer<typeof publicacaoSchema>;
