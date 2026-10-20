/** Leitura (no build) dos dados processados do Observatório. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'data/processed';

export interface VintageSerie {
  nome: string; instituicao: string; codigo: string; unidade: string; frequencia: string; url_publica: string;
  extraido_em: string; vintage_dir: string; arquivos: { arquivo: string; sha256: string }[];
  linhas: number; primeiro: string; ultimo: string; desatualizado: boolean; falha: string | null;
}

export function lerVintage(painel: string): Record<string, VintageSerie> {
  return JSON.parse(readFileSync(join(BASE, painel, 'vintage.json'), 'utf8'));
}

export function lerCsv(painel: string, serie: string): Record<string, string>[] {
  const [cab, ...linhas] = readFileSync(join(BASE, painel, `${serie}.csv`), 'utf8').trim().split('\n');
  const cols = cab!.split(',');
  return linhas.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i]!, v])));
}

export function csvBruto(painel: string, serie: string): string {
  return readFileSync(join(BASE, painel, `${serie}.csv`), 'utf8');
}

export const mes = (p: string) => new Date(`${p}-01T00:00:00Z`);
export const dia = (d: string) => new Date(`${d}T00:00:00Z`);
