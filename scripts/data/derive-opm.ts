/**
 * Indicadores diretos do OPM (camada 1; ADR-022): I.1, I.2, I.4(a), I.5, I.7, I.8, I.10, I.18–I.20 e a média dos núcleos.
 * Lê data/processed/{conjuntura,panorama,opm}/ (e a saída do X-13 em opm/dessaz/) e escreve data/processed/opm/indicadores/.
 * Os indicadores que dependem de estimação (I.3, I.4 b e a faixa de juro neutro) são calculados em analysis/opm.
 * Uso: node scripts/data/derive-opm.ts
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { csv, lerCsvTexto, type Linha } from './csv.ts';
import { somaDias } from './opm/calendario.ts';
import { credibilidade, metaHorizonte12m, surpresa, ultimaAntes } from './opm/expectativas.ts';
import { acumula, contadorRegime, media, NUCLEOS_MEDIA, saar3m } from './opm/inflacao.ts';
import { fisher, selicAcumulada252, selicEsperada12m, selicEsperadaHorizonte, vigenciaDe, type ReuniaoFutura } from './opm/juros.ts';
import { coeficientes, cresc12, real, velocidade } from './opm/moeda.ts';

const P = 'data/processed';
const OUT = `${P}/opm/indicadores`;
const ler = async (f: string) => lerCsvTexto(await readFile(`${P}/${f}`, 'utf8'));
const n = (v: string | undefined) => (v === undefined || v === '' ? null : Number(v));
const r4 = (x: number) => Math.round(x * 10000) / 10000;
const r2 = (x: number) => Math.round(x * 100) / 100;
const grava = async (nome: string, linhas: Linha[]) => {
  if (!linhas.length) throw new Error(`${nome}: sem linhas`);
  await writeFile(`${OUT}/${nome}.csv`, csv(linhas));
  console.log(`✓ ${nome}: ${linhas.length} linhas`);
};
await mkdir(OUT, { recursive: true });

// ——— Insumos ———
const ipca = await ler('conjuntura/ipca.csv');
const ipca12 = new Map(ipca.filter((r) => r.acumulada_12m).map((r) => [r.periodo!, Number(r.acumulada_12m)]));
const metas = await ler('panorama/metas_inflacao.csv');
const metaCont = metas.find((m) => m.sistematica!.startsWith('contínua'))!;
const metaAno = (ano: number) => {
  if (ano >= Number(metaCont.ano)) return Number(metaCont.meta);
  const m = metas.find((x) => Number(x.ano) === ano);
  if (!m) throw new Error(`Meta de ${ano} ausente`);
  return Number(m.meta);
};
const decisoes = await ler('opm/copom_decisoes.csv');
const calendario = await ler('opm/copom_calendario.csv');
const focusSelic = await ler('opm/focus_selic.csv');
const focusTop5 = (await ler('opm/focus_selic_top5.csv')).filter((r) => r.tipo_calculo === 'C');
const focusAnuais = await ler('opm/focus_anuais.csv');
type ComData = Record<string, string> & { data: string };
const focus12 = (await ler('opm/focus_inflacao_12m.csv')).filter((r) => r.suavizada === 'S') as ComData[];
const votos = new Map((await ler('opm/copom_votos.csv')).map((v) => [Number(v.reuniao), v]));

// ——— Reuniões: rótulo Focus (Rk/AAAA) → fim da reunião e vigência ———
// Passadas: k-ésima reunião ordinária do ano no histórico de decisões; futuras: comunicado do calendário.
const fimReuniao = new Map<string, { fim: string; inicio: string; numero?: number }>();
const ordinarias = decisoes.filter((d) => d.extraordinaria === '0' && d.reuniao);
const unicas = [...new Map(ordinarias.map((d) => [d.reuniao!, d])).values()].sort((a, b) => a.data_reuniao!.localeCompare(b.data_reuniao!));
const porAno = new Map<number, typeof unicas>();
for (const d of unicas) { const a = Number(d.data_reuniao!.slice(0, 4)); porAno.set(a, [...(porAno.get(a) ?? []), d]); }
for (const [ano, lista] of porAno) lista.forEach((d, k) => fimReuniao.set(`R${k + 1}/${ano}`, { fim: d.data_reuniao!, inicio: somaDias(d.data_reuniao!, -1), numero: Number(d.reuniao) }));
for (const c of calendario) if (!fimReuniao.has(c.reuniao_ano!)) fimReuniao.set(c.reuniao_ano!, { fim: c.fim!, inicio: c.inicio! });
// Conferência: o calendário oficial e o histórico devem coincidir nas reuniões já realizadas.
for (const c of calendario) {
  const h = fimReuniao.get(c.reuniao_ano!);
  if (h?.numero && h.fim !== c.fim) throw new Error(`${c.reuniao_ano}: histórico (${h.fim}) ≠ calendário (${c.fim})`);
}

/** Meta Selic vigente na data `d`. */
const vigencias = decisoes.filter((d) => d.meta_selic).map((d) => ({ ini: d.inicio_vigencia!, fim: d.fim_vigencia || '9999-12-31', meta: Number(d.meta_selic) }))
  .sort((a, b) => a.ini.localeCompare(b.ini));
const metaEm = (d: string) => { let m: number | null = null; for (const v of vigencias) if (v.ini <= d) m = v.meta; return m; };

// ——— I.1 Juro real ex ante 12 meses ———
const selicPorData = new Map<string, typeof focusSelic>();
for (const r of focusSelic) selicPorData.set(r.data!, [...(selicPorData.get(r.data!) ?? []), r]);
const focus12PorData = new Map(focus12.map((r) => [r.data!, r]));
const i1: Linha[] = [];
for (const [d, linhas] of [...selicPorData.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const pi = focus12PorData.get(d);
  const meta = metaEm(d);
  if (!pi?.mediana || meta === null) continue;
  const reunioes: ReuniaoFutura[] = [];
  for (const l of linhas) {
    const f = fimReuniao.get(l.reuniao!);
    if (f && l.mediana) reunioes.push({ reuniao: l.reuniao!, vigencia: vigenciaDe(f.fim), mediana: Number(l.mediana) });
  }
  const e = selicEsperada12m(d, meta, reunioes);
  const piE = Number(pi.mediana);
  i1.push({
    data: d, meta_selic_vigente: meta, selic_esperada_12m: r4(e.selic_12m), ipca_esperado_12m: piE,
    juro_real_ex_ante: r4(fisher(e.selic_12m, piE)), diferenca_simples: r4(e.selic_12m - piE),
    reunioes_na_trajetoria: e.reunioes_usadas, trajetoria_completa: e.completa ? 1 : 0,
  });
}
await grava('i1_juro_real_ex_ante', i1);

// ——— I.16 (Focus; ADR-031): Selic média esperada em 12, 24 e 36 meses pela Focus ———
// O prêmio (taxa prefixada da curva − Selic média esperada) é calculado em analysis/opm/acm.py, que lê a curva.
const anuaisSelic = new Map<string, { ano: number; mediana: number }[]>();
for (const r of focusAnuais) if (r.indicador === 'Selic' && r.mediana) anuaisSelic.set(r.data!, [...(anuaisSelic.get(r.data!) ?? []), { ano: Number(r.ano_referencia), mediana: Number(r.mediana) }]);
const i16f: Linha[] = [];
for (const [d, linhas] of [...selicPorData.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const meta = metaEm(d);
  const fa = anuaisSelic.get(d);
  if (meta === null || !fa) continue;
  const reunioes: ReuniaoFutura[] = [];
  for (const l of linhas) { const f = fimReuniao.get(l.reuniao!); if (f && l.mediana) reunioes.push({ reuniao: l.reuniao!, vigencia: vigenciaDe(f.fim), mediana: Number(l.mediana) }); }
  const e = [252, 504, 756].map((n) => selicEsperadaHorizonte(d, meta, reunioes, fa, n));
  i16f.push({ data: d, meta_selic_vigente: meta, selic_esperada_12m: r4(e[0]!.selic_media), selic_esperada_24m: r4(e[1]!.selic_media), selic_esperada_36m: r4(e[2]!.selic_media), horizonte_36m_coberto: e[2]!.coberto ? 1 : 0 });
}
await grava('i16_selic_esperada_focus', i16f);

// ——— I.2 Juro real ex post 12 meses (SGS 1178 composta diariamente / IPCA 12m) ———
const selicEf = (await ler('opm/selic_efetiva.csv')).filter((r) => r.valor);
const i2: Linha[] = [];
for (let k = 251; k < selicEf.length; k++) {
  const mes = selicEf[k]!.data!.slice(0, 7);
  const prox = selicEf[k + 1]?.data?.slice(0, 7);
  if (prox === mes) continue; // último dia útil observado do mês
  const pi = ipca12.get(mes);
  if (pi === undefined) continue;
  const i = selicAcumulada252(selicEf.slice(0, k + 1).map((r) => Number(r.valor)));
  i2.push({ periodo: mes, data_selic: selicEf[k]!.data!, selic_efetiva_12m: r4(i), ipca_12m: pi, juro_real_ex_post: r4(fisher(i, pi)) });
}
await grava('i2_juro_real_ex_post', i2);

// ——— I.4(a) Juro neutro: juro real esperado para t+4 pela Focus anual (Selic de fim de ano e IPCA do ano) ———
const anuaisPorData = new Map<string, Map<string, number>>();
for (const r of focusAnuais) if (r.mediana) (anuaisPorData.get(r.data!) ?? anuaisPorData.set(r.data!, new Map()).get(r.data!)!).set(`${r.indicador}|${r.ano_referencia}`, Number(r.mediana));
const i4a: Linha[] = [];
for (const [d, m] of [...anuaisPorData.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const alvo = Number(d.slice(0, 4)) + 4;
  const s = m.get(`Selic|${alvo}`), p = m.get(`IPCA|${alvo}`);
  if (s === undefined || p === undefined) continue;
  i4a.push({ data: d, ano_referencia: alvo, selic_mediana: s, ipca_mediana: p, juro_real_t4: r4(fisher(s, p)) });
}
await grava('i4a_neutro_focus_t4', i4a);

// ——— I.5 Surpresa de política monetária ———
const i5: Linha[] = [];
for (const [rot, f] of [...fimReuniao.entries()].sort(([, a], [, b]) => a.fim.localeCompare(b.fim))) {
  if (!f.numero) continue;
  const dec = unicas.find((d) => Number(d.reuniao) === f.numero)!;
  const med = ultimaAntes(focusSelic.filter((r) => r.reuniao === rot && r.mediana).map((r) => ({ data: r.data!, mediana: Number(r.mediana), desvio_padrao: n(r.desvio_padrao), respondentes: n(r.respondentes) })), f.inicio);
  if (!med) continue;
  const top = ultimaAntes(focusTop5.filter((r) => r.reuniao === rot && r.mediana).map((r) => ({ data: r.data!, mediana: Number(r.mediana) })), f.inicio);
  const decidida = Number(dec.meta_selic);
  const s = surpresa(decidida, med.mediana, med.desvio_padrao);
  const v = votos.get(f.numero);
  i5.push({
    reuniao: f.numero, rotulo_focus: rot, data_reuniao: f.fim, meta_decidida: decidida, coleta_focus: med.data,
    mediana_focus: med.mediana, desvio_padrao_focus: med.desvio_padrao, respondentes: med.respondentes,
    ...s, top5_mediana: top?.mediana ?? null, surpresa_top5_pp: top ? r4(decidida - top.mediana) : null,
    placar: v?.placar ?? null, votos_divergentes: v?.votos_divergentes ? Number(v.votos_divergentes) : v ? 0 : null,
  });
}
await grava('i5_surpresa', i5);

// ——— I.7 Credibilidade e I.8 desancoragem/dispersão (último dado de cada mês) ———
const ultimoDoMes = <T extends { data?: string }>(xs: T[]) => {
  const m = new Map<string, T>();
  for (const x of xs) m.set(x.data!.slice(0, 7), x);
  return m;
};
const datasAnuais = [...anuaisPorData.keys()].sort();
const anuaisDetalhe = new Map<string, (typeof focusAnuais)[number]>();
for (const r of focusAnuais) if (r.indicador === 'IPCA') anuaisDetalhe.set(`${r.data}|${r.ano_referencia}`, r);
const i7: Linha[] = [];
for (const [mes, d] of ultimoDoMes(datasAnuais.map((data) => ({ data })))) {
  const ano = Number(mes.slice(0, 4));
  const t1 = anuaisDetalhe.get(`${d.data}|${ano + 1}`), t3 = anuaisDetalhe.get(`${d.data}|${ano + 3}`);
  const f12 = ultimaAntes(focus12, somaDias(d.data!, 1));
  if (!t1?.mediana || !t3?.mediana || !f12?.mediana || f12.data!.slice(0, 7) !== mes) continue;
  const m12 = metaHorizonte12m(mes, metaAno), m1 = metaAno(ano + 1), m3 = metaAno(ano + 3);
  const e12 = Number(f12.mediana), e1 = Number(t1.mediana), e3 = Number(t3.mediana);
  const cv = (dp: string | undefined, med: number) => (dp ? r4(Number(dp) / med) : null);
  i7.push({
    periodo: mes, data_coleta: d.data!,
    esperado_12m: e12, meta_12m: r4(m12), ic_12m: r4(credibilidade(e12, m12)),
    esperado_t1: e1, meta_t1: m1, ic_t1: r4(credibilidade(e1, m1)),
    esperado_t3: e3, meta_t3: m3, ic_t3: r4(credibilidade(e3, m3)),
    desancoragem_t3_pp: r4(e3 - m3),
    dp_12m: n(f12.desvio_padrao), cv_12m: cv(f12.desvio_padrao, e12),
    dp_t1: n(t1.desvio_padrao), cv_t1: cv(t1.desvio_padrao, e1),
    dp_t3: n(t3.desvio_padrao), cv_t3: cv(t3.desvio_padrao, e3),
  });
}
await grava('i7_i8_credibilidade_desancoragem', i7);

// ——— I.10 Contador do regime de meta contínua (desde jan./2025) ———
const inf = Number(metaCont.limite_inferior), sup = Number(metaCont.limite_superior);
const i10 = contadorRegime([...ipca12.entries()].filter(([p]) => p >= '2025-01').sort(([a], [b]) => a.localeCompare(b)).map(([periodo, v]) => ({ periodo, ipca12m: v })), inf, sup)
  .map((r) => ({ ...r, limite_inferior: inf, limite_superior: sup }));
await grava('i10_regime_meta_continua', i10);

// ——— Média dos núcleos (EX0, EX3, MS, DP, P55): três convenções, documentadas ———
// Principal (`media_12m`): média mensal dos cinco núcleos arredondada a duas casas (como o BCB divulga a variação mensal)
// e composta em 12 meses. É a única das três que reproduz o RPM de set./2026 (p. 35): 4,52 % em maio e 4,35 % em agosto.
// As alternativas ficam no CSV: média das cinco taxas de 12 meses (4,36 % em agosto) e composição da média sem arredondar.
const nuc = await Promise.all(NUCLEOS_MEDIA.map(async (id) => new Map((await ler(`opm/${id}.csv`)).filter((r) => r.valor).map((r) => [r.periodo!, Number(r.valor)]))));
const mesesNuc = [...nuc[0]!.keys()].filter((p) => nuc.every((m) => m.has(p))).sort();
const nucleos: Linha[] = [];
for (let k = 0; k < mesesNuc.length; k++) {
  const p = mesesNuc[k]!;
  const mensal = media(nuc.map((m) => m.get(p)!));
  let a12: number | null = null, b12: number | null = null;
  if (k >= 11) {
    const janela = mesesNuc.slice(k - 11, k + 1);
    a12 = media(nuc.map((m) => acumula(janela.map((q) => m.get(q)!)))); // média das variações em 12 meses
    b12 = acumula(janela.map((q) => media(nuc.map((m) => m.get(q)!)))); // 12 meses da média mensal
  }
  let c12: number | null = null;
  if (k >= 11) c12 = acumula(mesesNuc.slice(k - 11, k + 1).map((q) => r2(media(nuc.map((m) => m.get(q)!)))));
  nucleos.push({ periodo: p, media_mensal: r2(mensal), media_12m: c12 === null ? null : r4(c12), media_12m_das_taxas: a12 === null ? null : r4(a12), media_12m_composta_sem_arredondar: b12 === null ? null : r4(b12) });
}
await grava('media_nucleos', nucleos);

// ——— I.18–I.20 Agregados, coeficientes e velocidade ———
const nivel = async (id: string) => new Map((await ler(`opm/${id}.csv`)).filter((r) => r.valor).map((r) => [r.periodo!, Number(r.valor)]));
const dess = async (id: string) => existsSync(`${P}/opm/dessaz/${id}.csv`) ? new Map((await ler(`opm/dessaz/${id}.csv`)).map((r) => [r.periodo!, Number(r.ajustada)])) : null;
const AGREG = ['base_restrita', 'm1', 'm2', 'm3', 'm4'] as const;
const ag = Object.fromEntries(await Promise.all(AGREG.map(async (id) => [id, await nivel(id)] as const)));
const agSa = Object.fromEntries(await Promise.all(AGREG.map(async (id) => [id, await dess(id)] as const)));
const pmpp = await nivel('pmpp'), dv = await nivel('depositos_vista'), res = await nivel('reservas_bancarias'), pib = await nivel('pib_nominal_12m');
const mesesAg = [...ag.m4!.keys()].filter((p) => AGREG.every((id) => ag[id]!.has(p))).sort();
const menos = (p: string, k: number) => { const [a, m] = p.split('-').map(Number) as [number, number]; const t = a * 12 + (m - 1) - k; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`; };
const i18: Linha[] = [], i19: Linha[] = [], i20: Linha[] = [];
for (const p of mesesAg) {
  const linha: Linha = { periodo: p };
  for (const id of AGREG) {
    const x = ag[id]!.get(p)!, x12 = ag[id]!.get(menos(p, 12));
    linha[`${id}_saldo_mil`] = x;
    const c = x12 ? cresc12(x, x12) : null;
    linha[`${id}_cresc_12m`] = c === null ? null : r2(c);
    linha[`${id}_real_12m`] = c !== null && ipca12.has(p) ? r2(real(c, ipca12.get(p)!)) : null;
    const sa = agSa[id], s0 = sa?.get(p), s1 = sa?.get(menos(p, 1));
    linha[`${id}_mensal_sa`] = s0 && s1 ? r2(100 * (s0 / s1 - 1)) : null;
  }
  i18.push(linha);
  const b = ag.base_restrita!.get(p)!, pm = pmpp.get(p), d = dv.get(p), rr = res.get(p);
  if (pm && d && rr) {
    const c = coeficientes(ag.m1!.get(p)!, b, pm, d, rr);
    i19.push({ periodo: p, multiplicador_m1: r4(c.multiplicador_m1), c_pmpp_dv: r4(c.c_pmpp_dv), r_reservas_dv: r4(c.r_reservas_dv) });
  }
  const y = pib.get(p);
  const jan = Array.from({ length: 12 }, (_, k) => menos(p, 11 - k));
  if (y && jan.every((q) => ag.m1!.has(q) && ag.m2!.has(q))) {
    const v1 = velocidade(y, jan.map((q) => ag.m1!.get(q)!)), v2 = velocidade(y, jan.map((q) => ag.m2!.get(q)!));
    i20.push({ periodo: p, pib_nominal_12m_milhoes: y, velocidade_m1: r4(v1.velocidade), m1_pib_pct: r2(v1.monetizacao_pct), velocidade_m2: r4(v2.velocidade), m2_pib_pct: r2(v2.monetizacao_pct) });
  }
}
await grava('i18_agregados', i18);
await grava('i19_multiplicador_coeficientes', i19);
await grava('i20_velocidade_monetizacao', i20);

// ——— Camada 2 — I.9: SAAR de 3 meses sobre as séries dessazonalizadas pelo CEE (X-13; ADR-023) ———
const SAAR_SERIES = ['ipca', 'ipca_livres', 'ipca_administrados', 'ipca_servicos', 'ipca_industriais', 'ipca_alim_dom', 'nucleo_ex3_servicos', 'nucleo_ex3_industriais'] as const;
const saMensal = async (id: string) => new Map((await ler(`opm/dessaz/${id}.csv`)).map((r) => [r.periodo!, Number(r.ajustada)]));
if (existsSync(`${P}/opm/dessaz/ipca.csv`)) {
  const sa = Object.fromEntries(await Promise.all(SAAR_SERIES.map(async (id) => [id, await saMensal(id)] as const)));
  const nucSa = await Promise.all(NUCLEOS_MEDIA.map(saMensal));
  const meses = [...sa.ipca!.keys()].sort();
  const i9: Linha[] = [];
  for (let k = 2; k < meses.length; k++) {
    const jan = meses.slice(k - 2, k + 1);
    const linha: Linha = { periodo: meses[k]! };
    for (const id of SAAR_SERIES) linha[`${id}_saar`] = jan.every((p) => sa[id]!.has(p)) ? r2(saar3m(jan.map((p) => sa[id]!.get(p)!))) : null;
    linha.media_nucleos_saar = jan.every((p) => nucSa.every((m) => m.has(p))) ? r2(saar3m(jan.map((p) => media(nucSa.map((m) => m.get(p)!))))) : null;
    i9.push(linha);
  }
  await grava('i9_saar', i9);
}
