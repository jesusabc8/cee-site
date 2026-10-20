/** Escrita e leitura de CSV simples (vírgula, aspas quando necessário, UTF-8). */
export type Linha = Record<string, string | number | null>;

export function csv(linhas: Linha[]): string {
  const cols = Object.keys(linhas[0] ?? {});
  const esc = (v: unknown) => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v));
  return [cols.join(','), ...linhas.map((l) => cols.map((c) => esc(l[c])).join(','))].join('\n') + '\n';
}

/** Leitor de CSV que respeita campos entre aspas. */
export function lerCsvTexto(texto: string): Record<string, string>[] {
  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i]!;
    if (aspas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === ',') { linha.push(campo); campo = ''; }
    else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas;
  return resto.filter((l) => l.length > 1 || l[0] !== '').map((l) => Object.fromEntries(cab!.map((c, i) => [c, l[i] ?? ''])));
}
