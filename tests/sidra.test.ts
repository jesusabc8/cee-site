/** O pipeline lê o SIDRA pela API v3 ou, se ela falhar, pela apisidra: os dois formatos têm de dar o mesmo resultado. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { sidraSeriesDe } from '../scripts/data/sidra.ts';

const ler = (f: string) => JSON.parse(readFileSync(`tests/fixtures/${f}`, 'utf8'));

describe('SIDRA: API v3 e apisidra equivalentes', () => {
  it('IPCA (tabela 1737, variáveis 63 e 2265), set–out/2026', () => {
    const v3 = sidraSeriesDe(ler('sidra-v3-1737.json'));
    const api = sidraSeriesDe(ler('apisidra-1737.json'));
    expect(api).toEqual(v3);
    expect(api['63']!['202610']).toBe('0.14'); // IBGE, série histórica do IPCA: outubro/2026 = 0,14 %
    expect(api['2265']!['202610']).toBe('4.63'); // 12 meses = 4,63 %
  });
  it('PIB (tabela 5932, com classificação 11255), 2026.I–II', () => {
    expect(sidraSeriesDe(ler('apisidra-5932.json'))).toEqual(sidraSeriesDe(ler('sidra-v3-5932.json')));
  });
  it('cabeçalho apisidra sem variável ou período é rejeitado', () => {
    expect(() => sidraSeriesDe([{ NC: 'x', D1C: 'Brasil (Código)' }])).toThrow(/cabeçalho/);
  });
});
