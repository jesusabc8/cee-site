import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo JS sem tipos
import { avaliar, avisos, corrige } from '../scripts/qa/audit-lib.mjs';

const ex = [{ id: 'GHSA-fc5q-39xc-vjpf', pacote: 'picomatch', vence: '2026-12-18', adr: 'ADR-021' }];
const aviso = { id: 'GHSA-fc5q-39xc-vjpf', pacote: 'picomatch', severidade: 'high', range: '<=4.0.7' };

describe('portão de auditoria (ADR-021)', () => {
  it('reconhece correção pelo limite superior', () => {
    expect(corrige('<=4.0.7', '4.0.7')).toBe(false);
    expect(corrige('<=4.0.7', '4.0.8')).toBe(true);
    expect(corrige('>=7.0.0 <11.0.1', '11.0.1')).toBe(true);
    expect(corrige('*', '1.0.0')).toBeNull();
  });
  it('aceita a exceção vigente e sem parche', () => {
    expect(avaliar([aviso], ex, '2026-11-18', { picomatch: '4.0.7' }).ok).toBe(true);
  });
  it('falha depois do vencimento', () => {
    expect(avaliar([aviso], ex, '2026-12-19', { picomatch: '4.0.7' }).ok).toBe(false);
  });
  it('falha quando sai o parche', () => {
    expect(avaliar([aviso], ex, '2026-11-18', { picomatch: '4.0.8' }).ok).toBe(false);
  });
  it('falha com outro aviso alto sem exceção', () => {
    const outro = { ...aviso, id: 'GHSA-xxxx-yyyy-zzzz' };
    expect(avaliar([aviso, outro], ex, '2026-11-18', { picomatch: '4.0.7' }).ok).toBe(false);
  });
  it('ignora avisos abaixo de high e deduplica', () => {
    const audit = { vulnerabilities: {
      a: { via: [{ name: 'a', url: 'x/GHSA-1', severity: 'moderate', range: '<1.0.0' }] },
      p: { via: [{ name: 'picomatch', url: 'x/GHSA-fc5q-39xc-vjpf', severity: 'high', range: '<=4.0.7' }] },
      q: { via: ['p', { name: 'picomatch', url: 'x/GHSA-fc5q-39xc-vjpf', severity: 'high', range: '<=4.0.7' }] },
    } };
    expect(avisos(audit).map((a: { id: string }) => a.id)).toEqual(['GHSA-fc5q-39xc-vjpf']);
  });
});
