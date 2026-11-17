/** Leitura das respostas do SIDRA (IBGE) nos dois formatos usados pelo pipeline. */
/**
 * Séries do SIDRA por variável: { variavel: { periodo: valor } }. Aceita os dois formatos do IBGE:
 * API v3 de agregados (lista de variáveis com resultados) e apisidra (tabela com linha de cabeçalho D1C…DnN).
 */
export function sidraSeriesDe(dados: unknown): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  if (Array.isArray(dados) && dados[0] && typeof dados[0] === 'object' && 'NC' in dados[0]) {
    const cab = dados[0] as Record<string, string>;
    const dim = (re: RegExp) => Object.keys(cab).find((k) => /^D\dC$/.test(k) && re.test(cab[k]!));
    const kVar = dim(/^Variável \(Código\)$/);
    const kPer = dim(/^(Mês|Trimestre|Trimestre Móvel|Ano) \(Código\)$/);
    if (!kVar || !kPer) throw new Error('apisidra: cabeçalho sem dimensões de variável e período.');
    for (const l of dados.slice(1) as Record<string, string>[]) (out[l[kVar]!] ??= {})[l[kPer]!] = l.V!;
    return out;
  }
  for (const v of dados as { id: string; resultados: { series: { serie: Record<string, string> }[] }[] }[]) out[v.id] = v.resultados[0]!.series[0]!.serie;
  return out;
}
