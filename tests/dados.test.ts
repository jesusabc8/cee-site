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

import { lerCsvTexto } from '../scripts/data/csv.ts';

const painelDe = Object.fromEntries(SERIES.map((s) => [s.id, s.painel]));
const vintages = Object.fromEntries(['conjuntura', 'panorama'].map((p) => [p, JSON.parse(readFileSync(join('data/processed', p, 'vintage.json'), 'utf8'))]));
const vintage: Record<string, { extraido_em: string; arquivos: { arquivo: string; sha256: string }[]; vintage_dir: string }> =
  Object.assign({}, ...Object.values(vintages));
const lerCsv = (nome: string) => lerCsvTexto(readFileSync(join('data/processed', painelDe[nome]!, `${nome}.csv`), 'utf8'));

/** Intervalos plausíveis: fora deles, algo mudou na fonte ou no processamento. */
const LIMITES: Record<string, Record<string, [number, number]>> = {
  ipca: { variacao_mensal: [-2, 5], acumulada_12m: [-2, 30] },
  selic_meta: { meta_selic: [1, 30] },
  desocupacao: { taxa: [2, 25], coef_variacao: [0, 10] },
  focus_ipca: { mediana: [-2, 30] },
  pib: { var_interanual: [-15, 15], var_trimestral_sa: [-12, 12] },
  ptax: { media_mensal: [1, 15], fim_periodo: [1, 15] },
  conta_corrente: { transacoes_correntes_pib: [-10, 5] },
  primario: { nfsp_primario_pib: [-6, 15], superavit_primario_pib: [-15, 6] },
  dbgg: { dbgg_pib: [40, 120] },
  dlsp: { dlsp_pib: [20, 120] },
  focus_anual: {},
  focus_mensal_ipca: { mediana: [-3, 5] },
  focus_12m_ipca: { mediana: [-2, 30] },
  metas_inflacao: { meta: [1, 10], limite_inferior: [0, 10], limite_superior: [2, 12] },
  pwt: { rgdpna: [1, 5e7], pop: [0.1, 2000], emp: [0.01, 1000] },
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
      expect(createHash('sha256').update(readFileSync(p)).digest('hex')).toBe(a.sha256);
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
    const chaveComp: Record<string, (l: Record<string, string>) => string> = {
      focus_ipca: (l) => `${l.data}|${l.ano_referencia}`,
      focus_anual: (l) => `${l.data}|${l.indicador}|${l.ano_referencia}`,
      focus_mensal_ipca: (l) => `${l.data}|${l.mes_referencia}`,
      pwt: (l) => `${l.pais}|${l.ano}`,
    };
    const chaves = linhas.map((l) => (chaveComp[id] ?? ((x) => x[chave]!))(l));
    expect(new Set(chaves).size).toBe(chaves.length);
    if (id !== 'pwt') {
      const datas = linhas.map((l) => l[chave]!);
      expect([...datas].sort()).toEqual(datas);
    }
  });

  it('nenhuma observação posterior à data de extração', () => {
    const limite = vintage[id].extraido_em.slice(0, 10);
    if (['pwt', 'metas_inflacao'].includes(id)) return;
    // Trimestres (AAAA-Tn) comparados pelo último mês do trimestre.
    const comoData = (v: string) => (/^\d{4}-T\d$/.test(v) ? `${v.slice(0, 4)}-${String(Number(v.slice(6)) * 3).padStart(2, '0')}` : v);
    for (const l of linhas) expect(comoData(String(l[chave])) <= limite).toBe(true);
  });
});
