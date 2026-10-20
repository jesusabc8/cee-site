/**
 * Processamento: lê o vintage mais recente de cada série em data/raw e gera, só por código,
 *   data/processed/conjuntura/<serie>.csv  e  data/processed/conjuntura/vintage.json
 * Uso: node scripts/data/process.ts
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { SERIES, type Serie } from './series.ts';

const RAW = 'data/raw';
const OUT = 'data/processed/conjuntura';

type Linha = Record<string, string | number | null>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  return String(v).trim() === '' || Number.isNaN(n) ? null : n;
};
const ym = (p: string) => `${p.slice(0, 4)}-${p.slice(4, 6)}`;

async function ultimoVintage(s: Serie) {
  const base = join(RAW, s.fonte, s.id);
  const dias = (await readdir(base).catch(() => [])).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const dia = dias.at(-1);
  if (!dia) throw new Error(`Sem vintage para ${s.id}`);
  const dir = join(base, dia);
  const meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  const corpos: Record<string, string> = {};
  for (const a of meta.arquivos) {
    const body = await readFile(join(dir, a.arquivo), 'utf8');
    const h = createHash('sha256').update(body).digest('hex');
    if (h !== a.sha256) throw new Error(`Hash divergente em ${join(dir, a.arquivo)}: o dado bruto foi alterado.`);
    corpos[a.arquivo] = body;
  }
  return { dir, meta, corpos };
}

function sidraSeries(body: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const v of JSON.parse(body)) out[v.id] = v.resultados[0].series[0].serie;
  return out;
}

const processadores: Record<string, (c: Record<string, string>, extraido: Date) => Linha[]> = {
  ipca: (c) => {
    const s = sidraSeries(c['resposta.json']!);
    return Object.keys(s['63']!).sort().map((p) => ({ periodo: ym(p), variacao_mensal: num(s['63']![p]), acumulada_12m: num(s['2265']?.[p]) }));
  },
  desocupacao: (c) => {
    const s = sidraSeries(c['resposta.json']!);
    return Object.keys(s['4099']!).sort().map((p) => ({ periodo_fim_trimestre: ym(p), taxa: num(s['4099']![p]), coef_variacao: num(s['4103']?.[p]) }));
  },
  selic_meta: (c, extraido) => {
    // Diária → valor vigente no último dia disponível de cada mês, até a data de extração.
    const limite = extraido.toISOString().slice(0, 10);
    const diarios = Object.keys(c).sort().flatMap((k) => JSON.parse(c[k]!) as { data: string; valor: string }[])
      .map((r) => ({ data: `${r.data.slice(6, 10)}-${r.data.slice(3, 5)}-${r.data.slice(0, 2)}`, valor: num(r.valor) }))
      .filter((r) => r.data <= limite)
      .sort((a, b) => a.data.localeCompare(b.data));
    const porMes = new Map<string, { data: string; valor: number | null }>();
    for (const r of diarios) porMes.set(r.data.slice(0, 7), r);
    return [...porMes.entries()].map(([periodo, r]) => ({ periodo, meta_selic: r.valor, data_referencia: r.data }));
  },
  focus_ipca: (c) => {
    const rows = JSON.parse(c['resposta.json']!).value as { Data: string; DataReferencia: string; Mediana: number; numeroRespondentes: number }[];
    return rows.map((r) => ({ data: r.Data, ano_referencia: Number(r.DataReferencia), mediana: num(r.Mediana), respondentes: r.numeroRespondentes }))
      .sort((a, b) => a.data.localeCompare(b.data) || a.ano_referencia - b.ano_referencia);
  },
};

function csv(linhas: Linha[]): string {
  const cols = Object.keys(linhas[0] ?? {});
  const esc = (v: unknown) => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v));
  return [cols.join(','), ...linhas.map((l) => cols.map((c) => esc(l[c])).join(','))].join('\n') + '\n';
}

const falhas: { serie: string; erro: string; data: string }[] =
  await readFile(join(RAW, '_falhas.json'), 'utf8').then(JSON.parse).catch(() => []);
await mkdir(OUT, { recursive: true });
const vintage: Record<string, unknown> = {};
for (const s of SERIES) {
  const { dir, meta, corpos } = await ultimoVintage(s);
  const extraido = new Date(meta.extraido_em);
  const linhas = processadores[s.id]!(corpos, extraido);
  if (linhas.length === 0) throw new Error(`${s.id}: processamento sem linhas.`);
  await writeFile(join(OUT, `${s.id}.csv`), csv(linhas));
  const falha = falhas.find((f) => f.serie === s.id);
  const chave = Object.keys(linhas[0]!)[0]!;
  vintage[s.id] = {
    nome: s.nome, instituicao: s.instituicao, codigo: s.codigo, unidade: s.unidade, frequencia: s.frequencia,
    url_publica: s.url_publica, extraido_em: meta.extraido_em, vintage_dir: dir,
    arquivos: meta.arquivos.map((a: { arquivo: string; sha256: string }) => ({ arquivo: a.arquivo, sha256: a.sha256 })),
    linhas: linhas.length, primeiro: linhas[0]![chave], ultimo: linhas.at(-1)![chave],
    desatualizado: Boolean(falha), falha: falha?.erro ?? null,
  };
  console.log(`✓ ${s.id}: ${linhas.length} linhas (${String(linhas[0]![chave])} → ${String(linhas.at(-1)![chave])})`);
}
await writeFile(join(OUT, 'vintage.json'), JSON.stringify(vintage, null, 2) + '\n');
