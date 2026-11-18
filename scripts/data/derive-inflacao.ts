/**
 * Inflação ampliada e regional (A2.3; ADR-030). Lê data/processed/{conjuntura,opm}/ e escreve data/processed/opm/indicadores/:
 *  - inflacao_medidas.csv: IPCA, IPCA-15, INPC (consumidor) e IPP (produtor), variação em 12 meses e mensal;
 *  - regional_ultimo.csv: por área do IPCA, último mês: variação mensal, 12 meses, grupos, peso regional e coordenadas;
 *  - regional_12m.csv: trajetória em 12 meses do índice geral por área e do Brasil;
 *  - regional_dispersao.csv: dispersão entre áreas (desvio-padrão e intervalo interquartil ponderados pelos pesos regionais);
 *  - regional_contribuicao.csv: diferença de cada área em relação ao Brasil decomposta por grupo do IPCA.
 * Não existe IPCA por unidade da federação: as áreas são 10 regiões metropolitanas e 6 capitais (IBGE).
 * Uso: node scripts/data/derive-inflacao.ts
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { csv, lerCsvTexto, type Linha } from './csv.ts';
import { CAPITAIS } from './opm/areas.ts';
import { desvioPonderado, quantilPonderado } from './opm/estat.ts';

const P = 'data/processed';
const OUT = `${P}/opm/indicadores`;
const ler = async (f: string) => lerCsvTexto(await readFile(`${P}/${f}`, 'utf8'));
const r4 = (x: number) => Math.round(x * 10000) / 10000;
const grava = async (nome: string, linhas: Linha[]) => {
  if (!linhas.length) throw new Error(`${nome}: sem linhas`);
  await writeFile(`${OUT}/${nome}.csv`, csv(linhas));
  console.log(`✓ ${nome}: ${linhas.length} linhas`);
};
await mkdir(OUT, { recursive: true });

// ——— Medidas nacionais ———
const ipca = await ler('conjuntura/ipca.csv');
const ipca15 = new Map((await ler('opm/ipca15.csv')).map((r) => [r.periodo!, r]));
const inpc = new Map((await ler('opm/inpc.csv')).map((r) => [r.periodo!, r]));
const ipp = new Map((await ler('opm/ipp.csv')).map((r) => [r.periodo!, r]));
const n = (v: string | undefined) => (v === undefined || v === '' ? null : Number(v));
await grava('inflacao_medidas', ipca.filter((r) => r.periodo! >= '2014-01').map((r) => {
  const p = r.periodo!;
  return {
    periodo: p, ipca_mensal: n(r.variacao_mensal), ipca_12m: n(r.acumulada_12m),
    ipca15_mensal: n(ipca15.get(p)?.variacao_mensal), ipca15_12m: n(ipca15.get(p)?.acumulada_12m),
    inpc_mensal: n(inpc.get(p)?.variacao_mensal), inpc_12m: n(inpc.get(p)?.acumulada_12m),
    ipp_transformacao_mensal: n(ipp.get(p)?.transformacao_mensal), ipp_transformacao_12m: n(ipp.get(p)?.transformacao_12m),
    ipp_geral_12m: n(ipp.get(p)?.geral_12m),
  };
}));

// ——— Regional ———
const reg = await ler('opm/ipca_regional.csv');
const pesos = await ler('opm/pesos_regionais.csv');
const coords = new Map((await ler('opm/capitais_coordenadas.csv')).map((r) => [r.municipio!, r]));
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/^Grande /, '').toLowerCase();
const AREAS = CAPITAIS.map(([mun, area, nome]) => {
  const p = pesos.find((x) => norm(x.area_nome!) === norm(nome));
  const c = coords.get(mun);
  if (!p || !c) throw new Error(`Área sem peso ou coordenada: ${nome}`);
  return { area, nome, mun, peso: Number(p.peso_ipca), lon: Number(c.longitude), lat: Number(c.latitude) };
});
const GRUPOS = [...new Map(reg.filter((r) => r.categoria !== '7169').map((r) => [r.categoria!, r.categoria_nome!])).entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
const chave = (p: string, a: string, c: string) => `${p}|${a}|${c}`;
const idx = new Map(reg.map((r) => [chave(r.periodo!, r.area!, r.categoria!), r]));
const meses = [...new Set(reg.map((r) => r.periodo!))].sort();
const ultimo = meses.filter((p) => AREAS.every((a) => idx.get(chave(p, a.area, '7169'))?.variacao_mensal)).at(-1)!;

await grava('regional_ultimo', AREAS.map((a) => {
  const g = idx.get(chave(ultimo, a.area, '7169'))!;
  const linha: Linha = { periodo: ultimo, area: a.area, area_nome: a.nome, peso_regional_ipca: a.peso, longitude: a.lon, latitude: a.lat, variacao_mensal: n(g.variacao_mensal), variacao_12m: n(g.variacao_12m) };
  for (const [c] of GRUPOS) linha[`grupo_${c}`] = n(idx.get(chave(ultimo, a.area, c))?.variacao_mensal);
  linha.grupos = GRUPOS.map(([c, nome]) => `${c}=${nome}`).join('; ');
  return linha;
}).sort((x, y) => Number(y.variacao_12m) - Number(x.variacao_12m)));

const doze: Linha[] = [];
for (const p of meses) {
  const br = idx.get(chave(p, '1', '7169'));
  if (!br?.variacao_12m) continue;
  const l: Linha = { periodo: p, brasil: n(br.variacao_12m) };
  for (const a of AREAS) l[`a${a.area}`] = n(idx.get(chave(p, a.area, '7169'))?.variacao_12m);
  doze.push(l);
}
await grava('regional_12m', doze);

const disp: Linha[] = [];
for (const p of meses) {
  const vs = AREAS.map((a) => ({ a, v: n(idx.get(chave(p, a.area, '7169'))?.variacao_12m) })).filter((x) => x.v !== null) as { a: (typeof AREAS)[number]; v: number }[];
  if (vs.length !== AREAS.length) continue;
  const xs = vs.map((x) => x.v), ws = vs.map((x) => x.a.peso);
  const mn = vs.reduce((m, x) => (x.v < m.v ? x : m)), mx = vs.reduce((m, x) => (x.v > m.v ? x : m));
  disp.push({
    periodo: p, brasil_12m: n(idx.get(chave(p, '1', '7169'))?.variacao_12m),
    media_ponderada_12m: r4(xs.reduce((s, x, i) => s + x * ws[i]!, 0) / ws.reduce((s, w) => s + w, 0)),
    desvio_padrao_ponderado: r4(desvioPonderado(xs, ws)),
    q1_ponderado: quantilPonderado(xs, ws, 0.25), q3_ponderado: quantilPonderado(xs, ws, 0.75),
    iqr_ponderado: r4(quantilPonderado(xs, ws, 0.75) - quantilPonderado(xs, ws, 0.25)),
    minimo: mn.v, area_minimo: mn.a.nome, maximo: mx.v, area_maximo: mx.a.nome,
  });
}
await grava('regional_dispersao', disp);

// Contribuição por grupo à diferença área − Brasil: c_g = (w_ag·π_ag − w_Bg·π_Bg)/100, com pesos e variações do mês.
// No mês, Σ_g c_g = π_a − π_B (agregação de Laspeyres, a menos de arredondamento). Em 12 meses, soma das 12 contribuições
// mensais: aproximação aditiva (a composição dos meses não é aditiva) — declarada.
const ult12 = meses.slice(meses.indexOf(ultimo) - 11, meses.indexOf(ultimo) + 1);
const contrib: Linha[] = [];
for (const a of AREAS) for (const [c, nome] of GRUPOS) {
  const cm = (p: string) => {
    const ra = idx.get(chave(p, a.area, c)), rb = idx.get(chave(p, '1', c));
    if (!ra?.peso || !ra.variacao_mensal || !rb?.peso || !rb.variacao_mensal) return null;
    return (Number(ra.peso) * Number(ra.variacao_mensal) - Number(rb.peso) * Number(rb.variacao_mensal)) / 100;
  };
  const m0 = cm(ultimo);
  const soma12 = ult12.map(cm);
  contrib.push({ area: a.area, area_nome: a.nome, grupo: Number(c), grupo_nome: nome, periodo: ultimo, contribuicao_mes_pp: m0 === null ? null : r4(m0), contribuicao_12m_pp: soma12.every((x) => x !== null) ? r4(soma12.reduce((s, x) => s + x!, 0)) : null });
}
await grava('regional_contribuicao', contrib);
