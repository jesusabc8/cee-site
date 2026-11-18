/**
 * Coerência entre o texto gerado e os dados publicados (ADR-029): todo número decimal de títulos e subtítulos das fichas,
 * da faixa de indicadores-chave e das mensagens-chave tem de coincidir, nas casas exibidas, com um valor do CSV publicado
 * (tabela da ficha, que é a tabela de /dados/, ou a origem declarada). Também barra formas proibidas do português.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lerCsvTexto } from '../scripts/data/csv.ts';
import { graficosModulo, kpisOpm, mensagensOpm, type FichaOpm, type Origem } from '../src/lib/opm';
import { MODULOS } from '../src/lib/opm-dados';

/** Constantes normativas citadas nos textos, com fonte: meta contínua e intervalo (Resolução CMN 5.141/2024),
 *  juro neutro do BCB (RPM set./2026, p. 80) e hiato do BCB no 3º tri de 2026 (RPM set./2026, p. 83). */
const CONSTANTES = [3.0, 1.5, 4.5, 5.0, 0.4];

/** Números decimais do texto ("13,75", "−1,63", "4.22"), com o número de casas exibidas. */
function decimais(texto: string, lang: 'pt-BR' | 'en'): { v: number; casas: number; bruto: string }[] {
  const sep = lang === 'en' ? '\\.' : ',';
  const re = new RegExp(`[−-]?\\d{1,3}(?:${lang === 'en' ? ',' : '\\.'}\\d{3})*${sep}\\d+`, 'g');
  return [...texto.matchAll(re)].map((m) => {
    const bruto = m[0];
    const limpo = bruto.replace('−', '-').replace(lang === 'en' ? /,/g : /\./g, '').replace(',', '.');
    return { v: Number(limpo), casas: bruto.split(lang === 'en' ? '.' : ',')[1]!.length, bruto };
  });
}
const confere = (v: number, casas: number, valores: number[]) =>
  valores.some((x) => Math.abs(Math.abs(v) - Math.abs(x)) <= 0.5 * 10 ** -casas + 1e-9);

function valoresDaFicha(g: FichaOpm): number[] {
  const out: number[] = [...CONSTANTES];
  for (const l of g.tabela.linhas) for (const c of l.slice(1)) if (typeof c === 'number') out.push(c);
  for (const r of g.spec.refs ?? []) out.push(r.y);
  return out;
}

const lerArq = (arq: string) => lerCsvTexto(readFileSync(`data/processed/${arq}`, 'utf8'));
const valorOrigem = (o: Origem) => {
  const r = lerArq(o.arquivo).find((x) => x[o.chave] === o.valor && Object.entries(o.filtro ?? {}).every(([k, v]) => x[k] === v));
  if (!r) throw new Error(`origem sem linha: ${o.arquivo} ${o.chave}=${o.valor}`);
  return Number(r[o.coluna]);
};

describe.each(['pt-BR', 'en'] as const)('textos gerados do OPM (%s)', (lang) => {
  const fichas = MODULOS.flatMap((m) => {
    const g = graficosModulo(m.id, lang);
    return [...g.graficos, ...(g.dessaz ?? []).flatMap((d) => [d.original, d.ajustada])];
  });

  it.each(fichas.map((g) => [g.id, g] as const))('ficha %s: números do título e do subtítulo vêm do CSV publicado', (_, g) => {
    const vals = valoresDaFicha(g);
    for (const n of decimais(`${g.titulo} ${g.subtitulo}`, lang)) {
      expect(confere(n.v, n.casas, vals), `${g.id}: "${n.bruto}" não está nos dados da ficha`).toBe(true);
    }
  });

  it('português sem formas proibidas ("ia de"; mês sem data de referência)', () => {
    if (lang !== 'pt-BR') return;
    for (const g of fichas) {
      const t = `${g.titulo} ${g.subtitulo}`;
      expect(t, g.id).not.toMatch(/\bia de\b/);
      expect(t, g.id).not.toMatch(/\bEm (jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez) \d{4}\b/);
    }
  });

  it('faixa de indicadores-chave: valor e valor anterior conferem com o CSV de origem', () => {
    for (const k of kpisOpm(lang)) {
      expect(valorOrigem(k.origem), k.id).toBeCloseTo(k.valor, 8);
      if (k.origemAnterior && k.anterior !== null) expect(valorOrigem(k.origemAnterior), `${k.id} anterior`).toBeCloseTo(k.anterior, 8);
    }
  });

  it('mensagens-chave: cada número decimal tem origem declarada no CSV', () => {
    const msgs = mensagensOpm(lang);
    expect(msgs.length).toBeGreaterThanOrEqual(3);
    expect(msgs.length).toBeLessThanOrEqual(5);
    for (const m of msgs) {
      const vals = [...CONSTANTES, ...m.origens.map(valorOrigem)];
      for (const n of decimais(m.texto, lang)) expect(confere(n.v, n.casas, vals), `"${n.bruto}" em: ${m.texto}`).toBe(true);
    }
  });
});
