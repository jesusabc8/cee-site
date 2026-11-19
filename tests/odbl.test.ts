/**
 * ODbL (ADR-031): toda base derivada dos dados do Tesouro Direto está em scripts/data/opm/odbl.ts. O fecho é recalculado
 * do código: um módulo que lê um arquivo ODbL torna ODbL tudo o que ele grava.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ODBL } from '../scripts/data/opm/odbl.ts';

const fontes = [
  ...readdirSync('analysis/opm').filter((f) => f.endsWith('.py')).map((f) => `analysis/opm/${f}`),
  ...readdirSync('scripts/data').filter((f) => f.endsWith('.ts')).map((f) => `scripts/data/${f}`),
];
const modulos = fontes.map((f) => {
  const s = readFileSync(f, 'utf8');
  const saidas = new Set([...s.matchAll(/to_csv\([^)]*?"([a-z0-9_]+\.csv)"/g), ...s.matchAll(/grava\('([a-z0-9_]+)'/g)].map((m) => (m[1]!.endsWith('.csv') ? m[1]! : `${m[1]}.csv`)));
  const citados = new Set([...s.matchAll(/([a-z0-9_]+\.csv)/g)].map((m) => m[1]!));
  return { f, saidas, entradas: [...citados].filter((c) => !saidas.has(c)) };
});

describe('licença ODbL das bases derivadas do Tesouro Direto', () => {
  it('a lista coincide com o fecho transitivo calculado do código', () => {
    const odbl = new Set(['tesouro_direto.csv']);
    for (let mudou = true; mudou;) {
      mudou = false;
      for (const m of modulos) if (m.f.startsWith('analysis/') && m.entradas.some((e) => odbl.has(e))) for (const s of m.saidas) if (!odbl.has(s)) { odbl.add(s); mudou = true; }
    }
    expect([...odbl].sort()).toEqual(ODBL.map((a) => a.split('/').pop()!).sort());
  });
});
