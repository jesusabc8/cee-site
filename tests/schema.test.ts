/** As regras editoriais da Proposta precisam fazer o build falhar quando violadas. */
import { describe, expect, it } from 'vitest';
import { publicacaoSchema } from '../src/schemas/publicacao.ts';

const base = {
  tipo: 'nota-tecnica', titulo: 'T', subtitulo: 'S', data: '2026-10-20', versao: '1.0', area: 'b',
  autoria: [{ nome: 'A B', funcao_credit: ['redacao'] }], resumo: 'R',
  fontes: [{ instituicao: 'IBGE', serie: 'X', codigo: '1', unidade: '%', extraido_em: '2026-10-20', url: 'https://example.org' }],
  dados: [{ rotulo: 'csv', url: '/x.csv' }], conflitos: 'Nenhum', uso_ia: 'Nenhum',
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
  it('recomendações fora de Nota Técnica são rejeitadas', () => {
    const r = publicacaoSchema.safeParse({ ...base, tipo: 'data-insight', recomendacoes: ['Fazer X'] });
    expect(msgs(r)).toMatch(/Recomendações/);
  });
  it('Nota de Conjuntura exige tese e incerteza principal', () => {
    const r = publicacaoSchema.safeParse({ ...base, tipo: 'nota-de-conjuntura' });
    expect(msgs(r)).toMatch(/tese/);
    expect(msgs(r)).toMatch(/incerteza_principal/);
  });
  it('Working Paper exige numeração NN/AAAA', () => {
    expect(publicacaoSchema.safeParse({ ...base, tipo: 'working-paper', numero: '1/27' }).success).toBe(false);
    expect(publicacaoSchema.safeParse({ ...base, tipo: 'working-paper', numero: '01/2027' }).success).toBe(true);
  });
  it('errata publicada em 7 dias ou mais após a identificação é rejeitada', () => {
    const errata = { identificado_em: '2026-10-01', descricao: 'd', efeito: 'e', correcao: 'c', versao_corrigida: '1.1' };
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], erratas: [{ ...errata, data: '2026-10-10' }] }).success).toBe(false);
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], erratas: [{ ...errata, data: '2026-10-05' }] }).success).toBe(true);
  });
  it('autoria exige função CRediT válida', () => {
    expect(publicacaoSchema.safeParse({ ...base, limites: ['x'], autoria: [{ nome: 'A', funcao_credit: ['autor'] }] }).success).toBe(false);
  });
});
