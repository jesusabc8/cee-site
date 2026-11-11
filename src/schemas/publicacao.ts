/**
 * Esquema das publicações — catálogo de produtos do Manual de Programas e Produtos, Parte II (Quadro 2),
 * e fluxo editorial do Regimento Interno. Regras validadas no build (erro):
 * - `identificador` no formato `CEE-NT 2027/03 v1.0`, com sigla, ano e versão coerentes com tipo, data e versao
 *   (Manual, Parte II, "Identificação"); o Relatório Anual não tem série.
 * - `recomendacoes` só em Nota Técnica, Texto para Discussão, Relatório de Projeto e Policy Brief.
 * - Nota de Conjuntura: `tese` e `incerteza_principal`. Nota Técnica: `limites` (seção "robustez e limitações").
 * - Texto para Discussão: `resumo` de até 200 palavras, 3 a 5 `palavras_chave` e códigos `jel`.
 * - Policy Brief: `origem` com o identificador de uma NT, TD ou RP (a existência é conferida em lib/publicacoes.ts).
 * - Blog: `modalidade` (pesquisa, dados ou relato).
 * - Aviso de errata em até sete dias corridos da identificação (Regimento Interno, art. sobre erratas).
 * Extensão fora da faixa do Manual gera apenas aviso no build (lib/publicacoes.ts), não erro.
 */
import { z } from 'astro/zod';
import { CREDIT_ROLES } from './credit';

type Bi = { pt: string; en: string };
export const BLOCOS = {
  dados: { pt: 'Dados e conjuntura', en: 'Data and current conditions' },
  pesquisa: { pt: 'Pesquisa', en: 'Research' },
  comunicacao: { pt: 'Comunicação de evidência', en: 'Communicating evidence' },
  institucionais: { pt: 'Institucionais', en: 'Institutional' },
} as const;
export type Bloco = keyof typeof BLOCOS;

interface TipoDef {
  sigla: string | null; bloco: Bloco; pt: string; en: string; plural: Bi;
  finalidade: Bi; extensao: Bi; revisao: Bi;
  /** Faixa de palavras do Manual (só onde a extensão é dada em palavras); fora dela, aviso no build. */
  palavras?: [number, number];
  /** Limite de palavras do resumo/chamada (Manual); aviso, salvo TD, em que é erro. */
  resumoMax?: number;
  recomenda: boolean;
}

/** Quadro 2 do Manual. A ordem é a do Quadro. */
export const TIPOS = {
  'data-insight': { sigla: 'DI', bloco: 'dados', pt: 'Data Insight', en: 'Data Insight', plural: { pt: 'Data Insights', en: 'Data Insights' },
    finalidade: { pt: 'Um fato relevante mostrado em um gráfico', en: 'One relevant fact shown in one chart' },
    extensao: { pt: '400–700 palavras', en: '400–700 words' }, revisao: { pt: 'Numérica e editorial', en: 'Numerical and editorial' },
    palavras: [400, 700], recomenda: false },
  'nota-de-conjuntura': { sigla: 'NC', bloco: 'dados', pt: 'Nota de Conjuntura', en: 'Business-Cycle Note', plural: { pt: 'Notas de Conjuntura', en: 'Business-Cycle Notes' },
    finalidade: { pt: 'Evolução recente de um tema', en: 'Recent developments in a topic' },
    extensao: { pt: '2.000–3.500 palavras', en: '2,000–3,500 words' }, revisao: { pt: 'Numérica e editorial', en: 'Numerical and editorial' },
    palavras: [2000, 3500], resumoMax: 100, recomenda: false },
  'avaliacao-de-conjuntura': { sigla: 'AC', bloco: 'dados', pt: 'Avaliação de Conjuntura', en: 'Economic Assessment', plural: { pt: 'Avaliações de Conjuntura', en: 'Economic Assessments' },
    finalidade: { pt: 'Declaração colegiada sobre a economia', en: 'Collegiate statement on the economy' },
    extensao: { pt: '800–1.500 palavras', en: '800–1,500 words' }, revisao: { pt: 'Factual e numérica', en: 'Factual and numerical' },
    palavras: [800, 1500], recomenda: false },
  'relatorio-semestral': { sigla: 'RS', bloco: 'dados', pt: 'Relatório Semestral de Conjuntura', en: 'Semiannual Economic Report', plural: { pt: 'Relatórios Semestrais de Conjuntura', en: 'Semiannual Economic Reports' },
    finalidade: { pt: 'Panorama da economia por programa', en: 'Overview of the economy by programme' },
    extensao: { pt: '20–40 páginas', en: '20–40 pages' }, revisao: { pt: 'Numérica, editorial e docente', en: 'Numerical, editorial and faculty' },
    recomenda: false },
  'nota-tecnica': { sigla: 'NT', bloco: 'pesquisa', pt: 'Nota Técnica', en: 'Technical Note', plural: { pt: 'Notas Técnicas', en: 'Technical Notes' },
    finalidade: { pt: 'Estudo aplicado com método explícito', en: 'Applied study with an explicit method' },
    extensao: { pt: '4.000–8.000 palavras', en: '4,000–8,000 words' }, revisao: { pt: 'Numérica, editorial e docente', en: 'Numerical, editorial and faculty' },
    palavras: [4000, 8000], resumoMax: 150, recomenda: true },
  'texto-para-discussao': { sigla: 'TD', bloco: 'pesquisa', pt: 'Texto para Discussão', en: 'Discussion Paper', plural: { pt: 'Textos para Discussão', en: 'Discussion Papers' },
    finalidade: { pt: 'Pesquisa original para evento ou periódico', en: 'Original research for a conference or journal' },
    extensao: { pt: 'Sem limite fixo', en: 'No fixed limit' }, revisao: { pt: 'Numérica, editorial, docente e externa', en: 'Numerical, editorial, faculty and external' },
    resumoMax: 200, recomenda: true },
  'relatorio-de-projeto': { sigla: 'RP', bloco: 'pesquisa', pt: 'Relatório de Projeto', en: 'Project Report', plural: { pt: 'Relatórios de Projeto', en: 'Project Reports' },
    finalidade: { pt: 'Resultado de projeto quando o artigo não é viável', en: 'Project results when a paper is not feasible' },
    extensao: { pt: '15–40 páginas', en: '15–40 pages' }, revisao: { pt: 'Numérica, editorial e docente', en: 'Numerical, editorial and faculty' },
    recomenda: true },
  'policy-brief': { sigla: 'PB', bloco: 'comunicacao', pt: 'Policy Brief', en: 'Policy Brief', plural: { pt: 'Policy Briefs', en: 'Policy Briefs' },
    finalidade: { pt: 'Implicações de política de uma pesquisa concluída', en: 'Policy implications of completed research' },
    extensao: { pt: '2–4 páginas, até 2.000 palavras', en: '2–4 pages, up to 2,000 words' }, revisao: { pt: 'Editorial e docente', en: 'Editorial and faculty' },
    palavras: [0, 2000], recomenda: true },
  blog: { sigla: 'BL', bloco: 'comunicacao', pt: 'Blog CEE', en: 'CEE Blog', plural: { pt: 'Blog CEE', en: 'CEE Blog' },
    finalidade: { pt: 'Pesquisa e dados para público amplo', en: 'Research and data for a broad audience' },
    extensao: { pt: '800–1.200 palavras', en: '800–1,200 words' }, revisao: { pt: 'Editorial', en: 'Editorial' },
    palavras: [800, 1200], resumoMax: 50, recomenda: false },
  'relatorio-anual': { sigla: null, bloco: 'institucionais', pt: 'Relatório Anual', en: 'Annual Report', plural: { pt: 'Relatórios Anuais', en: 'Annual Reports' },
    finalidade: { pt: 'Prestação de contas e resultados do ano', en: 'Accountability and results for the year' },
    extensao: { pt: 'Conforme o Regimento Interno', en: 'As set by the Internal Rules' }, revisao: { pt: 'Comissão de Avaliação', en: 'Evaluation Committee' },
    recomenda: false },
} as const satisfies Record<string, TipoDef>;
export type Tipo = keyof typeof TIPOS;
export const TIPO_KEYS = Object.keys(TIPOS) as [Tipo, ...Tipo[]];
export const tipoDef = (t: Tipo): TipoDef => TIPOS[t];
export const SIGLAS = Object.fromEntries(TIPO_KEYS.filter((t) => tipoDef(t).sigla).map((t) => [tipoDef(t).sigla, t])) as Record<string, Tipo>;
/** `CEE-NT 2027/03 v1.0` → sigla, ano, número, versão. */
export const IDENTIFICADOR_RE = /^CEE-([A-Z]{2}) (\d{4})\/(\d{2,3}) v(\d+\.\d+)$/;
/** Conta palavras de um texto simples. */
export const contaPalavras = (t: string) => (t.trim().match(/\S+/g) ?? []).length;

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
  /** Série, número no ano e versão (Manual, Parte II): `CEE-NT 2027/03 v1.0`. */
  identificador: z.string().regex(IDENTIFICADOR_RE, 'identificador no formato `CEE-NT 2027/03 v1.0`').optional(),
  /** Programa (Manual, Parte I): o produto pertence ao programa cuja pergunta principal responde. */
  area: z.enum(['a', 'b', 'c', 'd', 'e', 'f', 'transversal']),
  /** Painel/linha do Observatório (A1…F1). */
  linha: z.string().regex(/^[A-F]\d$/).optional(),
  /** Pergunta de pesquisa do Manual a que o produto responde (ex.: A.1.2, B.3). */
  pergunta: z.string().regex(/^[A-FT](\.\d)+$/).optional(),
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
  /** Texto para Discussão: 3 a 5 palavras-chave e códigos JEL. */
  palavras_chave: z.array(z.string().min(1)).optional(),
  jel: z.array(z.string().regex(/^[A-Z]\d{1,2}$/, 'código JEL no formato E52')).optional(),
  /** Policy Brief: identificador do produto de origem (NT, TD ou RP já aprovados). */
  origem: z.string().regex(/^CEE-(NT|TD|RP) \d{4}\/\d{2,3} v\d+\.\d+$/, 'origem deve ser o identificador de uma NT, TD ou RP').optional(),
  /** Blog: modalidade (Manual, Parte II). */
  modalidade: z.enum(['pesquisa', 'dados', 'relato']).optional(),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
  /** CC BY 4.0, salvo restrição de terceiros (Manual, Parte II). */
  licenca: z.string().min(1).default('CC-BY-4.0'),
  fontes: z.array(fonteSchema).min(1),
  dados: z.array(z.object({ rotulo: z.string(), url: z.string() }).strict()).min(1),
  codigo_url: z.url().optional(),
  pdf_url: z.string().optional(),
  conflitos: z.string().min(1),
  /** Declaração de uso de ferramentas de IA (Manual, Parte II; Anexo H). */
  declaracao_ia: z.string().min(1),
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
  const def = tipoDef(p.tipo);
  if (def.sigla) {
    const m = p.identificador ? IDENTIFICADOR_RE.exec(p.identificador) : null;
    if (!p.identificador) err('identificador', `${def.pt} exige \`identificador\` (ex.: CEE-${def.sigla} ${p.data.getUTCFullYear()}/01 v${p.versao}).`);
    else if (m) {
      if (m[1] !== def.sigla) err('identificador', `Sigla ${m[1]} incoerente com o tipo ${def.pt} (esperado ${def.sigla}).`);
      if (Number(m[2]) !== p.data.getUTCFullYear()) err('identificador', `Ano ${m[2]} do identificador difere do ano da data (${p.data.getUTCFullYear()}).`);
      if (m[4] !== p.versao) err('identificador', `Versão v${m[4]} do identificador difere de \`versao\` (${p.versao}).`);
    }
  } else if (p.identificador) err('identificador', `${def.pt} não tem série nem identificador.`);
  if (p.recomendacoes && !def.recomenda) {
    err('recomendacoes', 'Recomendações de política só são admitidas em Nota Técnica, Texto para Discussão, Relatório de Projeto e Policy Brief (Manual, Parte II).');
  }
  if (p.tipo === 'nota-de-conjuntura') {
    if (!p.tese) err('tese', 'Nota de Conjuntura exige `tese` (conclusão principal no início; Manual, Anexo B).');
    if (!p.incerteza_principal) err('incerteza_principal', 'Nota de Conjuntura exige `incerteza_principal` (riscos e sua direção).');
  }
  if (p.tipo === 'nota-tecnica' && (!p.limites || p.limites.length === 0)) {
    err('limites', 'Nota Técnica exige `limites` — robustez e limitações (Manual, Parte II e Anexo C).');
  }
  if (p.tipo === 'texto-para-discussao') {
    const n = contaPalavras(p.resumo);
    if (n > 200) err('resumo', `Texto para Discussão: resumo de até 200 palavras (tem ${n}).`);
    const k = p.palavras_chave?.length ?? 0;
    if (k < 3 || k > 5) err('palavras_chave', `Texto para Discussão exige de 3 a 5 palavras-chave (tem ${k}).`);
    if (!p.jel || p.jel.length === 0) err('jel', 'Texto para Discussão exige códigos JEL.');
  }
  if (p.tipo === 'policy-brief' && !p.origem) err('origem', 'Policy Brief exige `origem`: identificador da NT, TD ou RP de que deriva.');
  if (p.tipo !== 'policy-brief' && p.origem) err('origem', '`origem` só se aplica a Policy Brief.');
  if (p.tipo === 'blog' && !p.modalidade) err('modalidade', 'Blog exige `modalidade`: pesquisa, dados ou relato.');
  if (p.tipo !== 'blog' && p.modalidade) err('modalidade', '`modalidade` só se aplica ao Blog.');
  for (const e of p.erratas) {
    const dias = (e.data.getTime() - e.identificado_em.getTime()) / 86_400_000;
    if (dias > 7) err('erratas', `Aviso de errata publicado ${dias} dias após a identificação; o Regimento Interno exige até sete dias corridos.`);
  }
});

export type Publicacao = z.infer<typeof publicacaoSchema>;
