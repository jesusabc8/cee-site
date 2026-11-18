/**
 * I.1 e I.2 — juro real ex ante e ex post (especificação, seção I.1 e I.2). Fisher exata, não a diferença simples.
 */
import { proximoDiaUtil, proximosDiasUteis } from './calendario.ts';

export const fisher = (i: number, pi: number) => 100 * ((1 + i / 100) / (1 + pi / 100) - 1);

/** Reunião com a data em que a nova meta passa a vigorar (dia útil seguinte ao 2º dia da reunião). */
export interface ReuniaoFutura { reuniao: string; vigencia: string; mediana: number }

/**
 * Selic acumulada esperada nos próximos 252 dias úteis a partir da data de coleta `d`:
 * vale a meta corrente até a vigência da próxima decisão, depois a mediana Focus de cada reunião (base 252).
 * Devolve também se a trajetória cobriu os 252 dias (falta de calendário/expectativa → `completa: false`).
 */
export function selicEsperada12m(d: string, metaCorrente: number, reunioes: ReuniaoFutura[]) {
  const dias = proximosDiasUteis(d, 252);
  const futuras = reunioes.filter((r) => r.vigencia > d).sort((a, b) => a.vigencia.localeCompare(b.vigencia));
  let fator = 1, k = 0, taxa = metaCorrente;
  for (const dia of dias) {
    while (k < futuras.length && futuras[k]!.vigencia <= dia) taxa = futuras[k++]!.mediana;
    fator *= (1 + taxa / 100) ** (1 / 252);
  }
  // Completa se não há dia útil sem reunião conhecida por mais de ~60 dias corridos no fim do horizonte.
  const ultimaVig = futuras.length ? futuras[futuras.length - 1]!.vigencia : d;
  const completa = futuras.length > 0 && (new Date(dias.at(-1)!).getTime() - new Date(ultimaVig).getTime()) / 86_400_000 <= 60;
  return { selic_12m: 100 * (fator - 1), completa, reunioes_usadas: k };
}

export const vigenciaDe = (fimReuniao: string) => proximoDiaUtil(fimReuniao);

/** Selic efetiva acumulada nos últimos 252 dias úteis observados (SGS 1178, % a.a. base 252), composta diariamente. */
export function selicAcumulada252(taxas: number[]): number {
  if (taxas.length < 252) throw new Error('São necessários 252 dias úteis.');
  return 100 * (taxas.slice(-252).reduce((f, i) => f * (1 + i / 100) ** (1 / 252), 1) - 1);
}
