/** Validações do catálogo de produtos que dependem do conjunto das publicações (sem dependência de astro:content). */
import { contaPalavras, tipoDef, type Publicacao } from '../schemas/publicacao';

export interface PubLike { id: string; body?: string | undefined; data: Publicacao }

/** Texto corrido aproximado de um corpo MDX: sem import/export, JSX, código, URLs e marcação. */
export function textoCorrido(body: string): string {
  return body
    .replace(/^(import|export)\s.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\^[^\]]+\]:?/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>`|[\]{}-]+/g, ' ');
}

/**
 * Validações que dependem do conjunto das publicações (o esquema Zod vê uma entrada por vez):
 * - erro: identificador repetido; Policy Brief cuja `origem` não existe ou não é NT, TD ou RP.
 * - aviso: extensão ou resumo fora da faixa do Manual (Parte II), que não bloqueia o build.
 */
export function validarCatalogo(all: PubLike[]): void {
  const ids = new Map<string, string>();
  for (const p of all) {
    const id = p.data.identificador;
    if (!id) continue;
    const base = id.replace(/ v\d+\.\d+$/, '');
    if (ids.has(base)) throw new Error(`[publicacoes] ${p.id}: série e número ${base} já usados por ${ids.get(base)}.`);
    ids.set(base, p.id);
  }
  for (const p of all) {
    const d = p.data;
    if (d.tipo === 'policy-brief' && d.origem) {
      const o = all.find((x) => x.data.identificador === d.origem);
      if (!o) throw new Error(`[publicacoes] ${p.id}: \`origem\` ${d.origem} não corresponde a nenhuma publicação.`);
      if (!['nota-tecnica', 'texto-para-discussao', 'relatorio-de-projeto'].includes(o.data.tipo)) {
        throw new Error(`[publicacoes] ${p.id}: \`origem\` ${d.origem} não é Nota Técnica, Texto para Discussão nem Relatório de Projeto.`);
      }
    }
    const def = tipoDef(d.tipo);
    if (d.demo) continue; // demonstrações não têm extensão real
    if (def.palavras && p.body) {
      const n = contaPalavras(textoCorrido(p.body));
      const [min, max] = def.palavras;
      if (n < min || n > max) console.warn(`[publicacoes] aviso: ${p.id} tem ~${n} palavras; o Manual prevê ${def.extensao.pt} para ${def.pt}.`);
    }
    if (def.resumoMax && d.tipo !== 'texto-para-discussao') {
      const n = contaPalavras(d.resumo);
      if (n > def.resumoMax) console.warn(`[publicacoes] aviso: ${p.id} tem resumo de ${n} palavras; o Manual prevê até ${def.resumoMax}.`);
    }
  }
}

