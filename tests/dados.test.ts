/**
 * Testes dos dados processados (rodam no CI e no workflow de atualização):
 * formato, intervalos plausíveis, ausência de duplicatas, ordem cronológica e
 * integridade do dado bruto (hash SHA-256 registrado no meta.json).
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SERIES } from '../scripts/data/series.ts';

const DIR = 'data/processed/conjuntura';
const vintage = JSON.parse(readFileSync(join(DIR, 'vintage.json'), 'utf8'));

function lerCsv(nome: string) {
  const [cab, ...linhas] = readFileSync(join(DIR, `${nome}.csv`), 'utf8').trim().split('\n');
  const cols = cab!.split(',');
  return linhas.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v])));
}

/** Intervalos plausíveis: fora deles, algo mudou na fonte ou no processamento. */
const LIMITES: Record<string, Record<string, [number, number]>> = {
  ipca: { variacao_mensal: [-2, 5], acumulada_12m: [-2, 30] },
  selic_meta: { meta_selic: [1, 30] },
  desocupacao: { taxa: [2, 25], coef_variacao: [0, 10] },
  focus_ipca: { mediana: [-2, 30] },
};

describe.each(SERIES.map((s) => s.id))('série %s', (id) => {
  const linhas = lerCsv(id);
  const chave = Object.keys(linhas[0]!)[0]!;

  it('tem registro de vintage com data de extração e arquivos', () => {
    expect(vintage[id]).toBeDefined();
    expect(Number.isNaN(Date.parse(vintage[id].extraido_em))).toBe(false);
    expect(vintage[id].arquivos.length).toBeGreaterThan(0);
  });

  it('dado bruto íntegro (SHA-256 confere)', () => {
    for (const a of vintage[id].arquivos) {
      const p = join(vintage[id].vintage_dir, a.arquivo);
      expect(existsSync(p), p).toBe(true);
      expect(createHash('sha256').update(readFileSync(p, 'utf8')).digest('hex')).toBe(a.sha256);
    }
  });

  it('valores dentro de intervalos plausíveis', () => {
    for (const [col, [min, max]] of Object.entries(LIMITES[id]!)) {
      for (const l of linhas) {
        if (l[col] === '') continue;
        const v = Number(l[col]);
        expect(Number.isFinite(v), `${col}=${l[col]}`).toBe(true);
        expect(v, `${l[chave]} ${col}`).toBeGreaterThanOrEqual(min);
        expect(v, `${l[chave]} ${col}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it('sem duplicatas e em ordem cronológica', () => {
    const chaves = id === 'focus_ipca' ? linhas.map((l) => `${l.data}|${l.ano_referencia}`) : linhas.map((l) => l[chave]!);
    expect(new Set(chaves).size).toBe(chaves.length);
    const datas = linhas.map((l) => l[chave]!);
    expect([...datas].sort()).toEqual(datas);
  });

  it('nenhuma observação posterior à data de extração', () => {
    const limite = vintage[id].extraido_em.slice(0, 10);
    for (const l of linhas) expect(String(l[chave]) <= limite).toBe(true);
  });
});
