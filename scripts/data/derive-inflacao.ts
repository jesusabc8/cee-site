/**
 * Inflação ampliada e regional (A2.3; ADR-030). Lê data/processed/{conjuntura,opm}/ e escreve data/processed/opm/indicadores/:
 *  - inflacao_medidas.csv: IPCA, IPCA-15, INPC (consumidor) e IPP (produtor), variação em 12 meses e mensal;
 *  - inflacao_classificacoes.csv: classificações do BCB (livres/administrados, serviços/industriais/alimentação, comercializáveis),
 *    núcleos de médias aparadas (MA) e percentil 55 (P55), em 12 meses, e índice de difusão;
 *  - ipca_grupos.csv: grupos e subgrupos do IPCA no último mês (variação mensal, 12 meses, peso e contribuição);
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
import { acumula } from './opm/inflacao.ts';

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

// ——— Classificações e núcleos (séries mensais do SGS acumuladas em 12 meses: Π(1 + π/100) − 1) ———
const CLASS = ['ipca_livres', 'ipca_administrados', 'ipca_servicos', 'ipca_industriais', 'ipca_alim_dom', 'ipca_comercializaveis', 'ipca_nao_comercializaveis', 'nucleo_ma', 'nucleo_p55'] as const;
const mensais = Object.fromEntries(await Promise.all(CLASS.map(async (id) => [id, new Map((await ler(`opm/${id}.csv`)).map((r) => [r.periodo!, Number(r.valor)]))] as const)));
const difusao = await ler('opm/ipca_difusao.csv');
const anteriores = (p: string, k: number) => { const [a, m] = p.split('-').map(Number); const out: string[] = []; for (let i = k - 1; i >= 0; i--) { const d = new Date(Date.UTC(a!, m! - 1 - i, 1)); out.push(d.toISOString().slice(0, 7)); } return out; };
await grava('inflacao_classificacoes', difusao.filter((r) => r.periodo! >= '2013-01').map((r) => {
  const p = r.periodo!;
  const l: Linha = { periodo: p };
  for (const id of CLASS) {
    const vs = anteriores(p, 12).map((q) => mensais[id]!.get(q));
    l[`${id.replace(/^ipca_/, '')}_12m`] = vs.every((v) => v !== undefined && Number.isFinite(v)) ? r4(acumula(vs as number[])) : null;
  }
  const d12 = anteriores(p, 12).map((q) => difusao.find((x) => x.periodo === q)?.valor);
  l.difusao = n(r.valor);
  l.difusao_media_12m = d12.every((v) => v !== undefined && v !== '') ? r4(d12.reduce((s2, v) => s2 + Number(v), 0) / 12) : null;
  return l;
}));

// ——— Grupos e subgrupos (SIDRA 7060, Brasil), último mês ———
const itens = await ler('opm/ipca_itens.csv');
const pItens = [...new Set(itens.map((r) => r.periodo!))].sort();
const uItens = pItens.at(-1)!;
const porCod = new Map<string, Map<string, number>>();
for (const r of itens) if (r.variacao_mensal !== '' && (r.nivel === '1' || r.nivel === '2')) {
  if (!porCod.has(r.codigo!)) porCod.set(r.codigo!, new Map());
  porCod.get(r.codigo!)!.set(r.periodo!, Number(r.variacao_mensal));
}
// Grupo de cada subgrupo: o maior código de grupo ≤ o código do subgrupo, salvo os subgrupos criados com a POF 2017-2018,
// cujos códigos (classificação 315 do SIDRA) ficam fora da sequência. O teste "pesos dos subgrupos somam o peso do grupo"
// acusa qualquer atribuição errada.
const FORA_DA_SEQUENCIA: Record<string, string> = { '47656': '7712' }; // Recreação e fumo → Despesas pessoais
const gruposCod = [...new Set(itens.filter((r) => r.nivel === '1').map((r) => Number(r.codigo)))].sort((a, b) => a - b);
const paiDe = (c: string) => FORA_DA_SEQUENCIA[c] ?? String(gruposCod.filter((g) => g <= Number(c)).at(-1));
await grava('ipca_grupos', itens.filter((r) => r.periodo === uItens && (r.nivel === '1' || r.nivel === '2')).map((r) => {
  const pai = r.nivel === '1' ? r.codigo! : paiDe(r.codigo!);
  const vs = anteriores(uItens, 12).map((q) => porCod.get(r.codigo!)?.get(q));
  const v = n(r.variacao_mensal), w = n(r.peso);
  return {
    periodo: uItens, codigo: Number(r.codigo), nivel: Number(r.nivel), grupo: Number(pai), nome: r.nome!.trim(), peso: w, variacao_mensal: v,
    variacao_12m: vs.every((x) => x !== undefined) ? r4(acumula(vs as number[])) : null,
    contribuicao_mes_pp: v === null || w === null ? null : r4((w * v) / 100),
  };
}).sort((a, b) => a.grupo - b.grupo || a.nivel - b.nivel || a.codigo - b.codigo));

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
