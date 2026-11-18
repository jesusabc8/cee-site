// Lógica pura do portão de auditoria (ADR-021), separada para teste.
const NIVEL = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/** Compara versões x.y.z (ignora sufixos de pré-lançamento). */
export function cmpVersao(a, b) {
  const pa = a.split(/[.+-]/).slice(0, 3).map(Number);
  const pb = b.split(/[.+-]/).slice(0, 3).map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

/**
 * true se `versao` está fora do intervalo afetado (isto é, é uma correção). Só entende os limites superiores
 * "<=X" e "<X" (com ou sem limite inferior); para outro formato devolve null, e o chamador deve falhar.
 */
export function corrige(range, versao) {
  const m = /(<=?)\s*(\d+\.\d+\.\d+)\s*$/.exec(range.trim());
  if (!m) return null;
  const c = cmpVersao(versao, m[2]);
  return m[1] === '<=' ? c > 0 : c >= 0;
}

/** Avisos (objetos `via`) de severidade ≥ nível, deduplicados pelo ID GHSA. */
export function avisos(audit, nivel = 'high') {
  const out = new Map();
  for (const v of Object.values(audit.vulnerabilities ?? {})) {
    for (const w of v.via) {
      if (typeof w !== 'object' || NIVEL[w.severity] < NIVEL[nivel]) continue;
      const id = w.url?.split('/').pop() ?? String(w.source);
      out.set(id, { id, pacote: w.name, severidade: w.severity, range: w.range, titulo: w.title });
    }
  }
  return [...out.values()];
}

/**
 * Decide o portão. `ultima` mapeia pacote → última versão publicada. Devolve { ok, linhas }.
 * Um aviso só passa se houver exceção com o mesmo ID e pacote, não vencida (hoje ≤ vence) e sem correção publicada.
 */
export function avaliar(lista, excecoes, hoje, ultima) {
  const linhas = [];
  let ok = true;
  for (const a of lista) {
    const e = excecoes.find((x) => x.id === a.id && x.pacote === a.pacote);
    if (!e) { ok = false; linhas.push(`FALHA ${a.id} (${a.pacote}, ${a.severidade}): sem exceção`); continue; }
    if (hoje > e.vence) { ok = false; linhas.push(`FALHA ${a.id}: exceção vencida em ${e.vence} (${e.adr})`); continue; }
    const v = ultima[a.pacote];
    const fix = v ? corrige(a.range, v) : null;
    if (fix === null) { ok = false; linhas.push(`FALHA ${a.id}: não foi possível verificar se há correção (range "${a.range}", última ${v ?? '?'})`); continue; }
    if (fix) { ok = false; linhas.push(`FALHA ${a.id}: ${a.pacote}@${v} corrige o aviso; atualize e retire a exceção (${e.adr})`); continue; }
    linhas.push(`exceção ${a.id} (${a.pacote} ${a.range}; última ${v}) válida até ${e.vence} — ${e.adr}`);
  }
  return { ok, linhas };
}
