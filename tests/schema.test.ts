/** As regras do catálogo de produtos (Manual, Parte II) e do Regimento precisam fazer o build falhar quando violadas. */
import { describe, expect, it } from 'vitest';
import { publicacaoSchema } from '../src/schemas/publicacao.ts';

const base = {
  tipo: 'nota-tecnica', titulo: 'T', subtitulo: 'S', data: '2026-10-20', versao: '1.0', identificador: 'CEE-NT 2026/01 v1.0', area: 'b',
  autoria: [{ nome: 'A B', funcao_credit: ['redacao'] }], resumo: 'R',
  fontes: [{ instituicao: 'IBGE', serie: 'X', codigo: '1', unidade: '%', extraido_em: '2026-10-20', url: 'https://example.org' }],
  dados: [{ rotulo: 'csv', url: '/x.csv' }], conflitos: 'Nenhum', declaracao_ia: 'Nenhum',
};
const msgs = (r: ReturnType<typeof publicacaoSchema.safeParse>) => (r.success ? [] : r.error.issues.map((i) => i.message).join(' | '));

describe('regras por tipo de publicação', () => {
  it('Nota Técnica sem `limites` é rejeitada', () => {
    const r = publicacaoSchema.safeParse(base);
    expect(r.success).toBe(false);
    expect(msgs(r)).toMatch(/limites/);
  });
  it('Nota Técnica com `limites` é aceita', () => {
    expect(publicacaoSchema.safeParse({ ...base, limites: ['Não identifica causalidade.'] }).success).toBe(true);
  });
  it('recomendações só em NT, TD, RP e PB', () => {
    for (const [tipo, sigla] of [['data-insight', 'DI'], ['nota-de-conjuntura', 'NC'], ['avaliacao-de-conjuntura', 'AC'], ['blog', 'BL']]) {
      const r = publicacaoSchema.safeParse({ ...base, tipo, identificador: `CEE-${sigla} 2026/01 v1.0`, recomendacoes: ['Fazer X'] });
      expect(msgs(r)).toMatch(/Recomendações/);
    }
    const rp = publicacaoSchema.safeParse({ ...base, tipo: 'relatorio-de-projeto', identificador: 'CEE-RP 2026/01 v1.0', recomendacoes: ['Fazer X'] });
    expect(rp.success).toBe(true);
  });
  it('identificador: formato, sigla, ano e versão coerentes', () => {
    expect(msgs(publicacaoSchema.safeParse({ ...base, limites: ['x'], identificador: undefined }))).toMatch(/identificador/);
    expect(msgs(publicacaoSchema.safeParse({ ...base, limites: ['x'], identificador: 'NT 2026/01' }))).toMatch(/formato/);
    expect(msgs(publicacaoSchema.safeParse({ ...base, limites: ['x'], identificador: 'CEE-TD 2026/01 v1.0' }))).toMatch(/Sigla TD/);
    expect(msgs(publicacaoSchema.safeParse({ ...base, limites: ['x'], identificador: 'CEE-NT 2027/01 v1.0' }))).toMatch(/Ano 2027/);
    expect(msgs(publicacaoSchema.safeParse({ ...base, limites: ['x'], identificador: 'CEE-NT 2026/01 v1.1' }))).toMatch(/Versão/);
  });
  it('Relatório Anual não tem identificador', () => {
    expect(publicacaoSchema.safeParse({ ...base, tipo: 'relatorio-anual', identificador: undefined }).success).toBe(true);
    expect(publicacaoSchema.safeParse({ ...base, tipo: 'relatorio-anual' }).success).toBe(false);
  });
  it('Texto para Discussão exige resumo ≤ 200 palavras, 3–5 palavras-chave e JEL', () => {
    const td = { ...base, tipo: 'texto-para-discussao', identificador: 'CEE-TD 2026/01 v1.0' };
    const r = publicacaoSchema.safeParse({ ...td, resumo: 'p '.repeat(201) });
    expect(msgs(r)).toMatch(/200 palavras/);
    expect(msgs(r)).toMatch(/palavras-chave/);
    expect(msgs(r)).toMatch(/JEL/);
    expect(publicacaoSchema.safeParse({ ...td, palavras_chave: ['a', 'b', 'c'], jel: ['E52', 'O4'] }).success).toBe(true);
    expect(publicacaoSchema.safeParse({ ...td, palavras_chave: ['a', 'b', 'c', 'd', 'e', 'f'], jel: ['E52'] }).success).toBe(false);
  });
  it('Policy Brief exige origem em NT, TD ou RP', () => {
    const pb = { ...base, tipo: 'policy-brief', identificador: 'CEE-PB 2026/01 v1.0' };
    expect(msgs(publicacaoSchema.safeParse(pb))).toMatch(/origem/);
    expect(publicacaoSchema.safeParse({ ...pb, origem: 'CEE-DI 2026/01 v1.0' }).success).toBe(false);
    expect(publicacaoSchema.safeParse({ ...pb, origem: 'CEE-TD 2026/02 v1.0' }).success).toBe(true);
  });
  it('Blog exige modalidade', () => {
    const bl = { ...base, tipo: 'blog', identificador: 'CEE-BL 2026/01 v1.0' };
    expect(msgs(publicacaoSchema.safeParse(bl))).toMatch(/modalidade/);
    expect(publicacaoSchema.safeParse({ ...bl, modalidade: 'dados' }).success).toBe(true);
  });
  it('licença padrão CC BY 4.0 e declaração de IA obrigatória', () => {
    const r = publicacaoSchema.safeParse({ ...base, limites: ['x'] });
    expect(r.success && r.data.licenca).toBe('CC-BY-4.0');
    expect(publicacaoSchema.safeParse({ ...base, declaracao_ia: undefined, limites: ['x'] }).success).toBe(false);
  });
  it('Nota de Conjuntura exige tese e incerteza principal', () => {
    const r = publicacaoSchema.safeParse({ ...base, tipo: 'nota-de-conjuntura' });
    expect(msgs(r)).toMatch(/tese/);
    expect(msgs(r)).toMatch(/incerteza_principal/);
  });
  it('tipos retirados não existem mais', () => {
    for (const tipo of ['working-paper', 'replicacao', 'edicao-especial']) expect(publicacaoSchema.safeParse({ ...base, tipo }).success).toBe(false);
  });
  it('aviso de errata após sete dias corridos após a identificação é rejeitada', () => {
    const errata = { identificado_em: '2026-10-01', descricao: 'd', efeito: 'e', correcao: 'c', versao_corrigida: '1.1' };
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], erratas: [{ ...errata, data: '2026-10-10' }] }).success).toBe(false);
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], erratas: [{ ...errata, data: '2026-10-05' }] }).success).toBe(true);
  });
  it('autoria exige função CRediT válida', () => {
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], autoria: [{ nome: 'A', funcao_credit: ['autor'] }] }).success).toBe(false);
  });
});

describe('validações do catálogo (conjunto das publicações)', async () => {
  const { validarCatalogo } = await import('../src/lib/catalogo.ts');
  const parse = (o: object) => publicacaoSchema.parse({ ...base, limites: ['x'], ...o });
  const nt = { id: 'nt', data: parse({}) };
  it('Policy Brief com origem inexistente ou de tipo errado falha', () => {
    const pb = (origem: string) => ({ id: 'pb', data: parse({ tipo: 'policy-brief', identificador: 'CEE-PB 2026/01 v1.0', origem, limites: undefined }) });
    expect(() => validarCatalogo([nt, pb('CEE-NT 2026/01 v1.0')])).not.toThrow();
    expect(() => validarCatalogo([nt, pb('CEE-TD 2026/09 v1.0')])).toThrow(/não corresponde/);
  });
  it('série e número repetidos falham', () => {
    expect(() => validarCatalogo([nt, { id: 'nt2', data: parse({ versao: '1.1', identificador: 'CEE-NT 2026/01 v1.1' }) }])).toThrow(/já usados/);
  });
  it('extensão fora da faixa só gera aviso', () => {
    const warn = console.warn;
    const avisos: string[] = [];
    console.warn = (m: string) => avisos.push(m);
    expect(() => validarCatalogo([{ ...nt, body: 'curto demais' }])).not.toThrow();
    console.warn = warn;
    expect(avisos.join()).toMatch(/palavras/);
  });
});

describe('modelos em docs/modelos/ (Manual, Parte III)', async () => {
  const fs = await import('node:fs');
  const { parse } = await import('yaml');
  const dir = new URL('../docs/modelos/', import.meta.url);
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  it('há um modelo por série do catálogo', () => {
    expect(arquivos.length).toBe(9);
  });
  for (const f of arquivos) {
    it(`${f} valida no esquema depois de preencher o número`, () => {
      const fm = fs.readFileSync(new URL(f, dir), 'utf8').split(/^---$/m)[1]!.replaceAll('/NN ', '/01 ');
      const r = publicacaoSchema.safeParse(parse(fm));
      expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([]);
    });
  }
});
