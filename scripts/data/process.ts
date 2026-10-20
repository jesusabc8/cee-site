/**
 * Processamento: lê o vintage mais recente de cada série em data/raw, confere o hash e gera, só por código,
 *   data/processed/<painel>/<serie>.csv  e  data/processed/<painel>/vintage.json
 * Depois, scripts/data/derive.ts calcula os indicadores derivados (juro real, PWT, estabilização da dívida…).
 * Uso: node scripts/data/process.ts
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import readXlsxFile from 'read-excel-file/node';
import { SERIES, type Serie } from './series.ts';
import { csv, type Linha } from './csv.ts';

const RAW = 'data/raw';
const OUT = 'data/processed';

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  const n = Number(s);
  return s === '' || Number.isNaN(n) ? null : n;
};
const ym = (p: string) => `${p.slice(0, 4)}-${p.slice(4, 6)}`;
const brParaIso = (d: string) => `${d.slice(6, 10)}-${d.slice(3, 5)}-${d.slice(0, 2)}`;

async function ultimoVintage(s: Serie) {
  const base = join(RAW, s.fonte, s.id);
  const dias = (await readdir(base).catch(() => [])).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const dia = dias.at(-1);
  if (!dia) throw new Error(`Sem vintage para ${s.id}`);
  const dir = join(base, dia);
  const meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  const corpos: Record<string, Buffer> = {};
  for (const a of meta.arquivos) {
    const body = await readFile(join(dir, a.arquivo));
    const h = createHash('sha256').update(body).digest('hex');
    if (h !== a.sha256) throw new Error(`Hash divergente em ${join(dir, a.arquivo)}: o dado bruto foi alterado.`);
    corpos[a.arquivo] = body;
  }
  return { dir, meta, corpos };
}

const json = (b: Buffer | undefined) => JSON.parse(b!.toString('utf8'));
function sidraSeries(body: Buffer): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const v of json(body)) out[v.id] = v.resultados[0].series[0].serie;
  return out;
}
/** SGS em janelas → lista diária/mensal ordenada, sem datas posteriores à extração. */
function sgsLista(c: Record<string, Buffer>, extraido: Date) {
  const limite = extraido.toISOString().slice(0, 10);
  const vistos = new Map<string, number | null>();
  for (const k of Object.keys(c).sort()) {
    for (const r of json(c[k]) as { data: string; valor: string }[]) vistos.set(brParaIso(r.data), num(r.valor));
  }
  return [...vistos.entries()].filter(([d]) => d <= limite).sort(([a], [b]) => a.localeCompare(b)).map(([data, valor]) => ({ data, valor }));
}
const mensalSgs = (c: Record<string, Buffer>, e: Date) => sgsLista(c, e).map((r) => ({ periodo: r.data.slice(0, 7), valor: r.valor }));
/** Diária → último valor disponível de cada mês (e a data desse valor). */
function fimDeMes(lista: { data: string; valor: number | null }[]) {
  const porMes = new Map<string, { data: string; valor: number | null }>();
  for (const r of lista) if (r.valor !== null) porMes.set(r.data.slice(0, 7), r);
  return porMes;
}
const odataValores = (c: Record<string, Buffer>) => Object.keys(c).sort().flatMap((k) => json(c[k]).value as Record<string, unknown>[]);

const PWT_PAISES = ['BRA', 'USA', 'KOR', 'CHN', 'CHL', 'MEX', 'ARG', 'PER'];
const PWT_VARS = ['rgdpna', 'pop', 'emp', 'cgdpo', 'pl_gdpo'] as const;

const processadores: Record<string, (c: Record<string, Buffer>, extraido: Date) => Linha[] | Promise<Linha[]>> = {
  ipca: (c) => {
    const s = sidraSeries(c['resposta.json']!);
    return Object.keys(s['63']!).sort().map((p) => ({ periodo: ym(p), variacao_mensal: num(s['63']![p]), acumulada_12m: num(s['2265']?.[p]) }));
  },
  desocupacao: (c) => {
    const s = sidraSeries(c['resposta.json']!);
    return Object.keys(s['4099']!).sort().map((p) => ({ periodo_fim_trimestre: ym(p), taxa: num(s['4099']![p]), coef_variacao: num(s['4103']?.[p]) }));
  },
  selic_meta: (c, e) => [...fimDeMes(sgsLista(c, e)).entries()].map(([periodo, r]) => ({ periodo, meta_selic: r.valor, data_referencia: r.data })),
  focus_ipca: (c) => (json(c['resposta.json']).value as { Data: string; DataReferencia: string; Mediana: number; numeroRespondentes: number }[])
    .map((r) => ({ data: r.Data, ano_referencia: Number(r.DataReferencia), mediana: num(r.Mediana), respondentes: r.numeroRespondentes }))
    .sort((a, b) => a.data.localeCompare(b.data) || a.ano_referencia - b.ano_referencia),

  pib: (c) => {
    const s = sidraSeries(c['resposta.json']!);
    return Object.keys(s['6561']!).sort().map((p) => ({
      trimestre: `${p.slice(0, 4)}-T${Number(p.slice(4, 6))}`,
      var_interanual: num(s['6561']![p]),
      var_trimestral_sa: num(s['6564']?.[p]),
    }));
  },
  ptax: (c, e) => {
    const lista = sgsLista(c, e).filter((r) => r.valor !== null);
    const meses = new Map<string, { soma: number; n: number; ultimo: number; data: string }>();
    for (const r of lista) {
      const m = meses.get(r.data.slice(0, 7)) ?? { soma: 0, n: 0, ultimo: 0, data: '' };
      m.soma += r.valor!; m.n += 1; m.ultimo = r.valor!; m.data = r.data;
      meses.set(r.data.slice(0, 7), m);
    }
    return [...meses.entries()].map(([periodo, m]) => ({
      periodo, media_mensal: Math.round((m.soma / m.n) * 10000) / 10000, fim_periodo: m.ultimo, data_ultimo: m.data, dias: m.n,
    }));
  },
  conta_corrente: (c, e) => mensalSgs(c, e).map((r) => ({ periodo: r.periodo, transacoes_correntes_pib: r.valor })),
  primario: (c, e) => mensalSgs(c, e).map((r) => ({
    periodo: r.periodo, nfsp_primario_pib: r.valor, superavit_primario_pib: r.valor === null ? null : Math.round(-r.valor * 100) / 100,
  })),
  dbgg: (c, e) => mensalSgs(c, e).map((r) => ({ periodo: r.periodo, dbgg_pib: r.valor })),
  dlsp: (c, e) => mensalSgs(c, e).map((r) => ({ periodo: r.periodo, dlsp_pib: r.valor })),
  focus_anual: (c) => (odataValores(c) as { Indicador: string; Data: string; DataReferencia: string; Mediana: number; numeroRespondentes: number }[])
    .map((r) => ({ data: r.Data, indicador: r.Indicador, ano_referencia: Number(r.DataReferencia), mediana: num(r.Mediana), respondentes: r.numeroRespondentes }))
    .sort((a, b) => a.data.localeCompare(b.data) || a.indicador.localeCompare(b.indicador) || a.ano_referencia - b.ano_referencia),
  focus_mensal_ipca: (c) => (json(c['resposta.json']).value as { Data: string; DataReferencia: string; Mediana: number; numeroRespondentes: number }[])
    .map((r) => ({ data: r.Data, mes_referencia: `${r.DataReferencia.slice(3, 7)}-${r.DataReferencia.slice(0, 2)}`, mediana: num(r.Mediana), respondentes: r.numeroRespondentes }))
    .sort((a, b) => a.data.localeCompare(b.data) || a.mes_referencia.localeCompare(b.mes_referencia)),
  focus_12m_ipca: (c) => (json(c['resposta.json']).value as { Data: string; Mediana: number; numeroRespondentes: number }[])
    .map((r) => ({ data: r.Data, mediana: num(r.Mediana), respondentes: r.numeroRespondentes }))
    .sort((a, b) => a.data.localeCompare(b.data)),

  metas_inflacao: (c) => {
    const pagina = json(c['resposta.json']);
    const conteudo = String(pagina.conteudo);
    const limpa = (x: string) => x.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8203;|\u200b/g, '').replace(/\s+/g, ' ').trim();
    const linhas: Linha[] = [];
    for (const tr of conteudo.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []) {
      const cel = (tr.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) ?? []).map(limpa);
      // Anos com uma única meta vigente (2005 em diante; 2003–2004 tiveram metas ajustadas e ficam fora).
      if (cel.length >= 6 && /^\d{4}$/.test(cel[0]!) && Number(cel[0]) >= 2005) {
        const meta = num(cel[3]!.replace(',', '.'));
        const tol = num(cel[4]!.replace(',', '.'));
        if (meta === null || tol === null) throw new Error(`Meta ilegível para ${cel[0]}`);
        linhas.push({ ano: Number(cel[0]), meta, tolerancia_pp: tol, limite_inferior: Math.round((meta - tol) * 100) / 100, limite_superior: Math.round((meta + tol) * 100) / 100, norma: cel[1]!, sistematica: 'ano-calendário' });
      }
    }
    // Meta contínua (desde jan/2025): extraída do texto oficial; falha se o texto mudar.
    const texto = limpa(conteudo);
    const m = texto.match(/Resolução CMN nº ([\d.]+), de (\d+ de \w+ de \d{4}).{0,40}?é de ([\d,]+)%, com intervalo de tolerância de ±([\d,]+) ponto percentual/);
    if (!m) throw new Error('Texto da meta contínua não encontrado na página do BCB (a página mudou?).');
    const metaC = Number(m[3]!.replace(',', '.'));
    const tolC = Number(m[4]!.replace(',', '.'));
    linhas.push({ ano: 2025, meta: metaC, tolerancia_pp: tolC, limite_inferior: metaC - tolC, limite_superior: metaC + tolC, norma: `Resolução CMN nº ${m[1]} (${m[2]})`, sistematica: 'contínua (12 meses) desde 2025' });
    return linhas.sort((a, b) => Number(a.ano) - Number(b.ano));
  },

  pwt: async (c) => {
    const folhas = (await readXlsxFile(c['pwt110.xlsx']!)) as unknown as { sheet: string; data: unknown[][] }[];
    const dados = folhas.find((f) => f.sheet === 'Data');
    if (!dados) throw new Error('Folha "Data" não encontrada na PWT.');
    const [cab, ...rows] = dados.data as (string | number | null)[][];
    const idx = Object.fromEntries(cab!.map((h, i) => [String(h), i]));
    for (const v of ['countrycode', 'year', ...PWT_VARS]) if (idx[v] === undefined) throw new Error(`Variável ${v} ausente na PWT.`);
    return rows.filter((r) => PWT_PAISES.includes(String(r[idx.countrycode!])))
      .map((r) => ({
        pais: String(r[idx.countrycode!]), ano: Number(r[idx.year!]),
        ...Object.fromEntries(PWT_VARS.map((v) => [v, num(r[idx[v]!])])),
      }))
      .sort((a, b) => a.pais.localeCompare(b.pais) || a.ano - b.ano);
  },
};

const falhas: { serie: string; erro: string; data: string }[] =
  await readFile(join(RAW, '_falhas.json'), 'utf8').then(JSON.parse).catch(() => []);
const vintages: Record<string, Record<string, unknown>> = {};
for (const s of SERIES) {
  const { dir, meta, corpos } = await ultimoVintage(s);
  const extraido = new Date(meta.extraido_em);
  const proc = processadores[s.id];
  if (!proc) throw new Error(`Sem processador para ${s.id}`);
  const linhas = await proc(corpos, extraido);
  if (linhas.length === 0) throw new Error(`${s.id}: processamento sem linhas.`);
  await mkdir(join(OUT, s.painel), { recursive: true });
  await writeFile(join(OUT, s.painel, `${s.id}.csv`), csv(linhas));
  const falha = falhas.find((f) => f.serie === s.id);
  const chave = Object.keys(linhas[0]!)[0]!;
  const ordem = [...linhas.map((l) => String(l[chave]))].sort();
  (vintages[s.painel] ??= {})[s.id] = {
    nome: s.nome, instituicao: s.instituicao, codigo: s.codigo, unidade: s.unidade, frequencia: s.frequencia,
    url_publica: s.url_publica, extraido_em: meta.extraido_em, vintage_dir: dir,
    arquivos: meta.arquivos.map((a: { arquivo: string; sha256: string }) => ({ arquivo: a.arquivo, sha256: a.sha256 })),
    linhas: linhas.length, primeiro: ordem[0], ultimo: ordem.at(-1),
    desatualizado: Boolean(falha), falha: falha?.erro ?? null,
  };
  console.log(`✓ ${s.id}: ${linhas.length} linhas (${ordem[0]} → ${ordem.at(-1)})`);
}
for (const [painel, v] of Object.entries(vintages)) {
  await writeFile(join(OUT, painel, 'vintage.json'), JSON.stringify(v, null, 2) + '\n');
}
