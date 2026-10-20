/**
 * Derivados do painel Panorama (cálculos do CEE), a partir de data/processed:
 *   juro_real.csv · ipca_meta.csv · pwt_pib_pc.csv · pwt_produtividade.csv · pwt_convergencia.csv ·
 *   divida.csv · abertura.csv · estabilizacao.json · indicadores.json · derivados.json (metadados e fórmulas)
 * Uso: node scripts/data/derive.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { csv, lerCsvTexto, type Linha } from './csv.ts';
import { fisher, jurosSimples, matrizSensibilidade, primarioEstabilizador, relativo, trajetoria12m } from './calc.ts';

const P = 'data/processed';
const ler = async (painel: string, id: string) => lerCsvTexto(await readFile(join(P, painel, `${id}.csv`), 'utf8'));
const n = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));
const r2 = (x: number) => Math.round(x * 100) / 100;
const OUT = join(P, 'panorama');

const vC = JSON.parse(await readFile(join(P, 'conjuntura', 'vintage.json'), 'utf8'));
const vP = JSON.parse(await readFile(join(P, 'panorama', 'vintage.json'), 'utf8'));
const V = { ...vC, ...vP } as Record<string, { extraido_em: string; codigo: string; instituicao: string; url_publica: string; desatualizado: boolean }>;

const ipca = await ler('conjuntura', 'ipca');
const selic = await ler('conjuntura', 'selic_meta');
const deso = await ler('conjuntura', 'desocupacao');
const focusIpca = await ler('conjuntura', 'focus_ipca');
const pib = await ler('panorama', 'pib');
const ptax = await ler('panorama', 'ptax');
const cc = await ler('panorama', 'conta_corrente');
const prim = await ler('panorama', 'primario');
const dbgg = await ler('panorama', 'dbgg');
const dlsp = await ler('panorama', 'dlsp');
const fAnual = await ler('panorama', 'focus_anual');
const fMensal = await ler('panorama', 'focus_mensal_ipca');
const f12 = await ler('panorama', 'focus_12m_ipca');
const metas = await ler('panorama', 'metas_inflacao');
const pwt = await ler('panorama', 'pwt');
const comercio = await ler('panorama', 'comercio');
const pibUsd = await ler('panorama', 'pib_usd');
const pobreza = await ler('panorama', 'pobreza');

// ——— 1. Juro real ex ante (mensal): Selic meta no fim do mês ÷ Focus IPCA 12 meses (suavizada) ———
const f12PorMes = new Map<string, { data: string; v: number }>();
for (const r of f12) if (r.mediana) f12PorMes.set(r.data!.slice(0, 7), { data: r.data!, v: Number(r.mediana) });
const juroReal: Linha[] = selic.filter((s) => f12PorMes.has(s.periodo!) && s.meta_selic).map((s) => {
  const e = f12PorMes.get(s.periodo!)!;
  const i = Number(s.meta_selic);
  return {
    periodo: s.periodo!, selic_meta: i, data_selic: s.data_referencia!, focus_ipca_12m: e.v, data_focus: e.data,
    juro_real_fisher: r2(fisher(i, e.v)), juro_real_simples: r2(jurosSimples(i, e.v)),
  };
});
await writeFile(join(OUT, 'juro_real.csv'), csv(juroReal));

// ——— 2. IPCA 12 meses × meta × intervalo × trajetória Focus (cálculo do CEE) ———
const metaDoAno = (ano: number) => {
  const anual = metas.filter((m) => Number(m.ano) <= ano).at(-1)!; // 2025 em diante: meta contínua
  return { meta: Number(anual.meta), inf: Number(anual.limite_inferior), sup: Number(anual.limite_superior) };
};
const observado = new Map(ipca.filter((r) => r.variacao_mensal).map((r) => [r.periodo!, Number(r.variacao_mensal)]));
const dataFocusMensal = fMensal.map((r) => r.data!).sort().at(-1)!;
const esperado = new Map(fMensal.filter((r) => r.data === dataFocusMensal && r.mediana).map((r) => [r.mes_referencia!, Number(r.mediana)]));
const projecao = trajetoria12m(observado, esperado);
const ipcaMeta: Linha[] = [
  ...ipca.map((r) => {
    const m = metaDoAno(Number(r.periodo!.slice(0, 4)));
    return { periodo: r.periodo!, ipca_12m: n(r.acumulada_12m), ipca_12m_focus: null, meta: m.meta, limite_inferior: m.inf, limite_superior: m.sup };
  }),
  ...projecao.map((p) => {
    const m = metaDoAno(Number(p.periodo.slice(0, 4)));
    return { periodo: p.periodo, ipca_12m: null, ipca_12m_focus: p.ipca_12m_projetado, meta: m.meta, limite_inferior: m.inf, limite_superior: m.sup };
  }),
];
// Liga visualmente a projeção ao último observado (mesmo valor, sem criar dado novo).
const ultimoObs = ipcaMeta.filter((r) => r.ipca_12m !== null).at(-1)!;
ultimoObs.ipca_12m_focus = ultimoObs.ipca_12m ?? null;
await writeFile(join(OUT, 'ipca_meta.csv'), csv(ipcaMeta));

// ——— 3. PWT 11.0 ———
type P = { pais: string; ano: number; rgdpna: number | null; pop: number | null; emp: number | null; cgdpo: number | null; pl_gdpo: number | null };
const pw: P[] = pwt.map((r) => ({ pais: r.pais!, ano: Number(r.ano), rgdpna: n(r.rgdpna), pop: n(r.pop), emp: n(r.emp), cgdpo: n(r.cgdpo), pl_gdpo: n(r.pl_gdpo) }));
const pwtDe = (pais: string, ano: number) => pw.find((x) => x.pais === pais && x.ano === ano);
const PAISES_PC = ['BRA', 'CHN', 'CHL', 'MEX', 'ARG', 'PER'];
const pibPc: Linha[] = [];
for (const x of pw.filter((x) => PAISES_PC.includes(x.pais) && x.rgdpna && x.pop)) {
  pibPc.push({ pais: x.pais, ano: x.ano, pib_pc_ppc_usd2021: Math.round((x.rgdpna! / x.pop!) * 10) / 10 });
}
await writeFile(join(OUT, 'pwt_pib_pc.csv'), csv(pibPc));
const prod: Linha[] = [];
const conv: Linha[] = [];
for (const x of pw.filter((x) => ['BRA', 'KOR'].includes(x.pais))) {
  const us = pwtDe('USA', x.ano);
  if (!us || !x.rgdpna || !x.emp || !us.rgdpna || !us.emp) continue;
  prod.push({ pais: x.pais, ano: x.ano, produtividade_rel_eua: r2(relativo(x.rgdpna / x.emp, us.rgdpna / us.emp)) });
  if (x.pais === 'BRA' && x.pop && x.cgdpo && x.pl_gdpo && us.pop && us.cgdpo && us.pl_gdpo) {
    conv.push({
      ano: x.ano,
      proximidade_fronteira_mercado: r2(relativo((x.cgdpo * x.pl_gdpo) / x.pop, (us.cgdpo * us.pl_gdpo) / us.pop)),
      pib_pc_rel_ppc_rgdpna: r2(relativo(x.rgdpna / x.pop, us.rgdpna / us.pop)),
    });
  }
}
await writeFile(join(OUT, 'pwt_produtividade.csv'), csv(prod));
await writeFile(join(OUT, 'pwt_convergencia.csv'), csv(conv));

// ——— 4. Dívida: DBGG e DLSP observadas + medianas Focus do ano corrente em diante ———
const dataFocus = fAnual.map((r) => r.data!).sort().at(-1)!;
const focusUlt = fAnual.filter((r) => r.data === dataFocus);
const focusVal = (ind: string, ano: number) => {
  const r = focusUlt.find((x) => x.indicador === ind && Number(x.ano_referencia) === ano);
  return r?.mediana ? Number(r.mediana) : null;
};
const anoAtual = Number(dataFocus.slice(0, 4));
const divida: Linha[] = dbgg.map((r, k) => ({ periodo: r.periodo!, dbgg_pib: n(r.dbgg_pib), dlsp_pib: n(dlsp[k]?.periodo === r.periodo ? dlsp[k]!.dlsp_pib : undefined), tipo: 'observado' }));
for (let ano = anoAtual; ano <= anoAtual + 4; ano++) {
  const b = focusVal('Dívida bruta do governo geral', ano);
  const l = focusVal('Dívida líquida do setor público', ano);
  if (b !== null || l !== null) divida.push({ periodo: `${ano}-12`, dbgg_pib: b, dlsp_pib: l, tipo: `focus ${dataFocus}` });
}
await writeFile(join(OUT, 'divida.csv'), csv(divida));

// ——— 5. Primário que estabiliza a dívida ———
const dUlt = dbgg.at(-1)!;
const d = Number(dUlt.dbgg_pib);
const anosHorizonte = [anoAtual + 1, anoAtual + 2, anoAtual + 3];
const componentes = anosHorizonte.map((ano) => {
  const s = focusVal('Selic', ano);
  const p = focusVal('IPCA', ano) ?? (() => {
    const r = focusIpca.filter((x) => x.data === dataFocus && Number(x.ano_referencia) === ano).at(-1);
    return r?.mediana ? Number(r.mediana) : null;
  })();
  const g = focusVal('PIB Total', ano);
  return { ano, selic: s, ipca: p, pib: g, juro_real: s !== null && p !== null ? fisher(s, p) : null };
}).filter((c) => c.juro_real !== null && c.pib !== null);
if (componentes.length === 0) throw new Error('Sem horizonte Focus para r e g.');
const rCentral = componentes.reduce((a, c) => a + c.juro_real!, 0) / componentes.length;
const gCentral = componentes.reduce((a, c) => a + c.pib!, 0) / componentes.length;
const sStar = primarioEstabilizador(d, rCentral, gCentral);
const primUlt = prim.at(-1)!;
const RS = [4, 5, 6, 7, 8];
const GS = [1.0, 1.5, 2.0, 2.5, 3.0];
const estabilizacao = {
  formula: 's* = d (r − g) / (1 + g)',
  d, d_periodo: dUlt.periodo, d_fonte: 'BCB, SGS 13762 (DBGG, % do PIB)',
  r: r2(rCentral), g: r2(gCentral), s_estrela: r2(sStar),
  horizonte: componentes.map((c) => ({ ano: c.ano, selic: c.selic, ipca: c.ipca, juro_real: r2(c.juro_real!), pib: c.pib })),
  data_focus: dataFocus,
  primario_atual: Number(primUlt.superavit_primario_pib), primario_periodo: primUlt.periodo, primario_fonte: 'BCB, SGS 5793 (NFSP primária 12 meses, sinal invertido)',
  matriz: { r: RS, g: GS, valores: matrizSensibilidade(d, RS, GS).map((l) => l.map(r2)) },
  metodo_r: 'Média, nos anos t+1 a t+3, do juro real implícito nas medianas Focus de fim de ano: (1 + Selic)/(1 + IPCA) − 1.',
  metodo_g: 'Média das medianas Focus do PIB Total para t+1 a t+3.',
};
await writeFile(join(OUT, 'estabilizacao.json'), JSON.stringify(estabilizacao, null, 2) + '\n');

// ——— Abertura comercial: (X + M de bens, 12 meses, US$ FOB) ÷ PIB em US$ acumulado em 12 meses (SGS 4192) ———
const pibUsdMes = new Map(pibUsd.map((r) => [r.periodo!, n(r.pib_usd_milhoes_12m)]));
const abertura: Linha[] = [];
for (let i = 11; i < comercio.length; i++) {
  const janela = comercio.slice(i - 11, i + 1);
  const periodo = comercio[i]!.periodo!;
  const contiguo = janela.every((r, k) => k === 0 || Date.UTC(Number(r.periodo!.slice(0, 4)), Number(r.periodo!.slice(5, 7)) - 1) - Date.UTC(Number(janela[k - 1]!.periodo!.slice(0, 4)), Number(janela[k - 1]!.periodo!.slice(5, 7)) - 1) < 32 * 864e5);
  const y = pibUsdMes.get(periodo);
  if (!contiguo || !y || janela.some((r) => !r.exportacao_usd || !r.importacao_usd)) continue;
  const x12 = janela.reduce((a, r) => a + Number(r.exportacao_usd), 0) / 1e6;
  const m12 = janela.reduce((a, r) => a + Number(r.importacao_usd), 0) / 1e6;
  abertura.push({ periodo, exportacoes_12m_usd_milhoes: r2(x12), importacoes_12m_usd_milhoes: r2(m12), pib_12m_usd_milhoes: y, abertura_pib: r2(((x12 + m12) / y) * 100) });
}
if (!abertura.length) throw new Error('Abertura comercial: nenhum mês com comércio e PIB em US$.');
await writeFile(join(OUT, 'abertura.csv'), csv(abertura));

// ——— 6. Indicadores "Brasil em números" ———
type Tile = Record<string, unknown>;
const spark = <T>(arr: T[], k: number, f: (x: T) => number | null) => arr.slice(-k).map(f).filter((x): x is number => x !== null);
const sinal = (a: number | null, b: number | null) => (a === null || b === null ? '■' : a > b ? '▲' : a < b ? '▼' : '■');
const fonte = (id: string) => ({ fonte: V[id]!.instituicao, serie: V[id]!.codigo, extraido_em: V[id]!.extraido_em, url: V[id]!.url_publica, desatualizado: V[id]!.desatualizado });
const ult = <T>(a: T[]) => a.at(-1)!;
const pen = <T>(a: T[]) => a.at(-2)!;

const tiles: Tile[] = [];
{ const u = ult(pib), p = pen(pib);
  tiles.push({ id: 'pib', grupo: 'atividade', icone: 'trending-up', titulo: 'PIB real', valor: n(u.var_trimestral_sa), unidade: '% t/t', descricao: 'Variação ante o trimestre anterior, com ajuste sazonal', referencia: u.trimestre, tipo_ref: 'trimestre', variacao: sinal(n(u.var_trimestral_sa), n(p.var_trimestral_sa)), spark: spark(pib, 40, (x) => n(x.var_trimestral_sa)), ancora: 'grafico-pib', ...fonte('pib') }); }
{ const u = ult(ipca), p = pen(ipca);
  tiles.push({ id: 'ipca', grupo: 'precos', icone: 'tag', titulo: 'IPCA', valor: n(u.acumulada_12m), unidade: '% 12m', descricao: `Acumulado em 12 meses · meta ${metaDoAno(Number(u.periodo!.slice(0, 4))).meta.toString().replace('.', ',')}% ± 1,5 p.p.`, referencia: u.periodo, tipo_ref: 'mes', variacao: sinal(n(u.acumulada_12m), n(p.acumulada_12m)), spark: spark(ipca, 120, (x) => n(x.acumulada_12m)), ancora: 'grafico-ipca-meta', ...fonte('ipca') }); }
{ const u = ult(selic), p = pen(selic);
  tiles.push({ id: 'selic', grupo: 'precos', icone: 'landmark', titulo: 'Selic meta', valor: n(u.meta_selic), unidade: '% a.a.', descricao: 'Definida pelo Copom', referencia: u.data_referencia, tipo_ref: 'dia', variacao: sinal(n(u.meta_selic), n(p.meta_selic)), spark: spark(selic, 120, (x) => n(x.meta_selic)), ancora: 'grafico-juros', ...fonte('selic_meta') }); }
{ const u = ult(ptax), p = pen(ptax);
  tiles.push({ id: 'cambio', grupo: 'externo', icone: 'arrow-left-right', titulo: 'Câmbio', valor: n(u.fim_periodo), unidade: 'R$/US$', descricao: 'PTAX venda, última cotação', referencia: u.data_ultimo, tipo_ref: 'dia', variacao: sinal(n(u.fim_periodo), n(p.fim_periodo)), spark: spark(ptax, 120, (x) => n(x.media_mensal)), ancora: 'grafico-cambio', ...fonte('ptax') }); }
{ const u = ult(cc), p = pen(cc);
  tiles.push({ id: 'conta_corrente', grupo: 'externo', icone: 'globe', titulo: 'Conta corrente', valor: n(u.transacoes_correntes_pib), unidade: '% PIB', descricao: 'Transações correntes, acumulado em 12 meses', referencia: u.periodo, tipo_ref: 'mes', variacao: sinal(n(u.transacoes_correntes_pib), n(p.transacoes_correntes_pib)), spark: spark(cc, 120, (x) => n(x.transacoes_correntes_pib)), ancora: null, ...fonte('conta_corrente') }); }
{ const u = ult(abertura), p = pen(abertura);
  tiles.push({ id: 'abertura', grupo: 'externo', icone: 'ship', titulo: 'Abertura comercial', valor: u.abertura_pib, unidade: '% PIB', descricao: '(Exportações + importações de bens) ÷ PIB, 12 meses', referencia: u.periodo, tipo_ref: 'mes', variacao: sinal(u.abertura_pib as number, p.abertura_pib as number), spark: spark(abertura, 120, (x) => x.abertura_pib as number), ancora: null, calculado: true, ...fonte('comercio'), fonte: 'MDIC, BCB', serie: 'ComexStat · SGS 4192' }); }
{ const u = ult(prim), p = pen(prim);
  tiles.push({ id: 'primario', grupo: 'fiscal', icone: 'wallet', titulo: 'Resultado primário', valor: n(u.superavit_primario_pib), unidade: '% PIB', descricao: 'Setor público consolidado, 12 meses (+ superávit, − déficit)', referencia: u.periodo, tipo_ref: 'mes', variacao: sinal(n(u.superavit_primario_pib), n(p.superavit_primario_pib)), spark: spark(prim, 120, (x) => n(x.superavit_primario_pib)), ancora: 'grafico-estabilizacao', ...fonte('primario') }); }
{ const u = ult(dbgg), p = pen(dbgg);
  tiles.push({ id: 'dbgg', grupo: 'fiscal', icone: 'building-2', titulo: 'Dívida bruta', valor: n(u.dbgg_pib), unidade: '% PIB', descricao: 'Governo geral (DBGG)', referencia: u.periodo, tipo_ref: 'mes', variacao: sinal(n(u.dbgg_pib), n(p.dbgg_pib)), spark: spark(dbgg, 120, (x) => n(x.dbgg_pib)), ancora: 'grafico-divida', ...fonte('dbgg') }); }
{ const u = ult(deso), p = pen(deso);
  tiles.push({ id: 'desocupacao', grupo: 'trabalho', icone: 'users', titulo: 'Desocupação', valor: n(u.taxa), unidade: '%', descricao: 'PNAD Contínua, trimestre móvel, sem ajuste sazonal', referencia: u.periodo_fim_trimestre, tipo_ref: 'trimestre-movel', variacao: sinal(n(u.taxa), n(p.taxa)), spark: spark(deso, 120, (x) => n(x.taxa)), ancora: null, ...fonte('desocupacao') }); }
{ const u = ult(pobreza), p = pen(pobreza);
  tiles.push({ id: 'pobreza', grupo: 'trabalho', icone: 'hand-coins', titulo: 'Pobreza', valor: n(u.pobreza_us685_ppc2017), unidade: '% pop.', descricao: 'Abaixo de US$ 6,85 PPC 2017 por dia (Banco Mundial)', secundario: n(u.extrema_us215_ppc2017), referencia: u.ano, tipo_ref: 'ano', variacao: sinal(n(u.pobreza_us685_ppc2017), n(p.pobreza_us685_ppc2017)), spark: spark(pobreza, 20, (x) => n(x.pobreza_us685_ppc2017)), ancora: null, ...fonte('pobreza'), serie: `SIS ${V.pobreza!.codigo.slice(4, 8)}, Tabela 2.18` }); }
await writeFile(join(OUT, 'indicadores.json'), JSON.stringify(tiles, null, 2) + '\n');

// ——— Metadados dos derivados ———
await writeFile(join(OUT, 'derivados.json'), JSON.stringify({
  gerado_em: new Date().toISOString(),
  juro_real: { entradas: ['selic_meta', 'focus_12m_ipca'], formula_principal: '(1 + Selic meta) / (1 + Focus IPCA 12 meses, suavizada) − 1', formula_alternativa: 'Selic meta − Focus IPCA 12 meses (convenção de bancos centrais)' },
  ipca_meta: { entradas: ['ipca', 'metas_inflacao', 'focus_mensal_ipca'], data_focus_mensal: dataFocusMensal, metodo: 'IPCA 12 meses observado; meta e limites do ano (meta contínua desde 2025); trajetória: acumulação de 12 meses com variações observadas e, nos meses futuros, a mediana Focus mensal.' },
  pwt: { entradas: ['pwt'], pib_pc: 'rgdpna / pop', produtividade: '(rgdpna/emp)_i ÷ (rgdpna/emp)_EUA × 100', proximidade: '(cgdpo × pl_gdpo / pop)_i ÷ (cgdpo × pl_gdpo / pop)_EUA × 100', pib_pc_rel_ppc: '(rgdpna/pop)_i ÷ (rgdpna/pop)_EUA × 100' },
  divida: { entradas: ['dbgg', 'dlsp', 'focus_anual'], data_focus: dataFocus },
  abertura: { entradas: ['comercio', 'pib_usd'], formula: '(exportações + importações de bens, US$ FOB, soma de 12 meses) / PIB em US$ acumulado em 12 meses × 100' },
  estabilizacao: { entradas: ['dbgg', 'primario', 'focus_anual', 'focus_ipca'] },
}, null, 2) + '\n');
console.log(`✓ derivados: juro real (${juroReal.length}), IPCA×meta (${ipcaMeta.length}, projeção até ${projecao.at(-1)?.periodo}), PWT, dívida, s* = ${r2(sStar)} (d=${d}, r=${r2(rCentral)}, g=${r2(gCentral)}), ${tiles.length} indicadores`);
