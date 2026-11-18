/**
 * Dias úteis brasileiros para composição da Selic (base 252).
 * Feriados nacionais: 1/1, Carnaval (segunda e terça), Sexta-feira da Paixão, 21/4, 1/5, Corpus Christi, 7/9, 12/10,
 * 2/11, 15/11, 20/11 (feriado nacional desde 2024, Lei nº 14.759/2023) e 25/12; fins de semana excluídos.
 * É o calendário dos dias sem expediente bancário nacional; calendários estaduais ou municipais não entram.
 */
const DIA = 86_400_000;

export function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const cache = new Map<number, Set<string>>();

export function feriados(ano: number): Set<string> {
  const c = cache.get(ano);
  if (c) return c;
  const p = pascoa(ano).getTime();
  const fixos = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '12-25', ...(ano >= 2024 ? ['11-20'] : [])];
  const s = new Set<string>([
    ...fixos.map((md) => `${ano}-${md}`),
    iso(new Date(p - 48 * DIA)), iso(new Date(p - 47 * DIA)), // Carnaval
    iso(new Date(p - 2 * DIA)), // Paixão
    iso(new Date(p + 60 * DIA)), // Corpus Christi
  ]);
  cache.set(ano, s);
  return s;
}

export function diaUtil(d: string): boolean {
  const dt = new Date(`${d}T00:00:00Z`);
  const w = dt.getUTCDay();
  return w !== 0 && w !== 6 && !feriados(dt.getUTCFullYear()).has(d);
}

export const somaDias = (d: string, n: number) => iso(new Date(new Date(`${d}T00:00:00Z`).getTime() + n * DIA));

/** Próximos `n` dias úteis estritamente depois de `d`. */
export function proximosDiasUteis(d: string, n: number): string[] {
  const out: string[] = [];
  let x = d;
  while (out.length < n) { x = somaDias(x, 1); if (diaUtil(x)) out.push(x); }
  return out;
}

/** Primeiro dia útil estritamente depois de `d`. */
export const proximoDiaUtil = (d: string) => proximosDiasUteis(d, 1)[0]!;
