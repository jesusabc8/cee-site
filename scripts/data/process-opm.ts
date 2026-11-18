/**
 * Processadores das séries do OPM (ADR-022): leem a resposta bruta do vintage e devolvem linhas de CSV.
 * Os processadores genéricos (SGS mensal/diária, FRED) cobrem as séries marcadas com `generico` em series-opm.ts.
 */
import readXlsxFile from 'read-excel-file/node';
import { unzipSync } from 'fflate';
import { lerCsvTexto, type Linha } from './csv.ts';
import { sidraSeriesDe } from './sidra.ts';

type Corpos = Record<string, Buffer>;
type Proc = (c: Corpos, extraido: Date) => Linha[] | Promise<Linha[]>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  const n = Number(s);
  return s === '' || s === '.' || Number.isNaN(n) ? null : n;
};
const json = (b: Buffer | undefined) => JSON.parse(b!.toString('utf8'));
const brParaIso = (d: string) => `${d.slice(6, 10)}-${d.slice(3, 5)}-${d.slice(0, 2)}`;
const arquivos = (c: Corpos, re = /\.json$/) => Object.keys(c).filter((k) => re.test(k)).sort();

/** SGS em janelas → lista ordenada sem datas posteriores à extração (a API publica valores futuros da meta). */
export function sgsLista(c: Corpos, extraido: Date) {
  const limite = extraido.toISOString().slice(0, 10);
  const vistos = new Map<string, number | null>();
  for (const k of arquivos(c)) for (const r of json(c[k]) as { data: string; valor: string }[]) vistos.set(brParaIso(r.data), num(r.valor));
  return [...vistos.entries()].filter(([d]) => d <= limite).sort(([a], [b]) => a.localeCompare(b)).map(([data, valor]) => ({ data, valor }));
}

export const genericos: Record<'sgs-mensal' | 'sgs-diaria' | 'fred', Proc> = {
  'sgs-mensal': (c, e) => sgsLista(c, e).map((r) => ({ periodo: r.data.slice(0, 7), valor: r.valor })),
  'sgs-diaria': (c, e) => sgsLista(c, e).map((r) => ({ data: r.data, valor: r.valor })),
  // FRED: "observation_date,<ID>"; dias sem negociação vêm vazios e são omitidos.
  fred: (c) => {
    const [k] = arquivos(c, /\.csv$/);
    return lerCsvTexto(c[k!]!.toString('utf8').replace(/\r/g, '')).map((r) => {
      const [col] = Object.keys(r).filter((x) => x !== 'observation_date');
      return { data: r.observation_date!, valor: num(r[col!]) };
    }).filter((r) => r.valor !== null);
  },
};

const odata = (c: Corpos) => arquivos(c).flatMap((k) => json(c[k]).value as Record<string, unknown>[]);
const mesRef = (mmaaaa: string) => `${mmaaaa.slice(3, 7)}-${mmaaaa.slice(0, 2)}`;
const stats = (r: Record<string, unknown>, min = false) => min
  ? { media: num(r.media), mediana: num(r.mediana), desvio_padrao: num(r.desvioPadrao), minimo: num(r.minimo), maximo: num(r.maximo) }
  : { media: num(r.Media), mediana: num(r.Mediana), desvio_padrao: num(r.DesvioPadrao), minimo: num(r.Minimo), maximo: num(r.Maximo) };
/** "Rk/AAAA" → chave ordenável "AAAA-Rk". */
const reuniaoChave = (r: string) => { const m = /^R(\d)\/(\d{4})$/.exec(r); return m ? `${m[2]}-R${m[1]}` : r; };
const limpaHtml = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();

const MESES: Record<string, number> = { janeiro: 1, fevereiro: 2, 'março': 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };

/** Datas das reuniões no texto do comunicado de calendário: "27 e 28 de janeiro", "16 e 17 junho". */
export function datasCalendario(texto: string, ano: number) {
  const trecho = texto.slice(texto.indexOf('Datas das Reuniões'), texto.indexOf('2.', texto.indexOf('Datas das Reuniões')));
  const out: { reuniao_ano: string; inicio: string; fim: string }[] = [];
  for (const m of trecho.matchAll(/(\d{1,2}) e (\d{1,2}) (?:de )?([a-zç]+)/g)) {
    const mes = MESES[m[3]!];
    if (!mes) throw new Error(`Mês desconhecido no calendário do Copom: ${m[3]}`);
    const d = (dia: string) => `${ano}-${String(mes).padStart(2, '0')}-${dia.padStart(2, '0')}`;
    out.push({ reuniao_ano: `R${out.length + 1}/${ano}`, inicio: d(m[1]!), fim: d(m[2]!) });
  }
  if (out.length !== 8) throw new Error(`Calendário do Copom ${ano}: ${out.length} reuniões lidas (esperadas 8).`);
  return out;
}


/** SIDRA v3 em formato longo: uma linha por período × localidade × categoria × variável. Aceita também apisidra. */
export function sidraLongo(c: Corpos): { periodo: string; loc: string; locNome: string; cat: string; catNome: string; v: string; valor: number | null }[] {
  const out: { periodo: string; loc: string; locNome: string; cat: string; catNome: string; v: string; valor: number | null }[] = [];
  for (const k of arquivos(c)) {
    const dados = json(c[k]);
    if (Array.isArray(dados) && dados[0] && 'NC' in dados[0]) {
      const cab = dados[0] as Record<string, string>;
      const dim = (re: RegExp) => Object.keys(cab).find((x) => /^D\dC$/.test(x) && re.test(cab[x]!));
      const kV = dim(/^Variável \(Código\)$/)!, kP = dim(/^(Mês|Trimestre|Ano) \(Código\)$/)!, kL = dim(/^(Brasil|Município|Região Metropolitana) \(Código\)$/);
      const kC = Object.keys(cab).find((x) => /^D\dC$/.test(x) && ![kV, kP, kL].includes(x));
      for (const l of dados.slice(1) as Record<string, string>[]) {
        out.push({ periodo: `${l[kP]!.slice(0, 4)}-${l[kP]!.slice(4)}`, loc: kL ? l[kL]! : '1', locNome: kL ? l[kL.replace(/C$/, 'N')]! : 'Brasil', cat: kC ? l[kC]! : '', catNome: kC ? l[kC.replace(/C$/, 'N')]! : '', v: l[kV]!, valor: num(l.V) });
      }
      continue;
    }
    for (const v of dados as { id: string; resultados: { classificacoes: { categoria: Record<string, string> }[]; series: { localidade: { id: string; nome: string }; serie: Record<string, string> }[] }[] }[]) {
      for (const r of v.resultados) {
        const [cat, catNome] = r.classificacoes[0] ? Object.entries(r.classificacoes[0].categoria)[0]! : ['', ''];
        for (const s of r.series) for (const [p, val] of Object.entries(s.serie)) out.push({ periodo: `${p.slice(0, 4)}-${p.slice(4)}`, loc: s.localidade.id, locNome: s.localidade.nome, cat, catNome, v: v.id, valor: num(val) });
      }
    }
  }
  return out;
}

/** Formato largo por período a partir do longo: {periodo, <nome>: valor} para pares (variável, categoria). */
function largo(l: ReturnType<typeof sidraLongo>, cols: Record<string, { v: string; cat?: string }>): Linha[] {
  const m = new Map<string, Linha>();
  for (const r of l) for (const [nome, f] of Object.entries(cols)) {
    if (r.v !== f.v || (f.cat !== undefined && r.cat !== f.cat)) continue;
    const linha = m.get(r.periodo) ?? { periodo: r.periodo };
    linha[nome] = r.valor; m.set(r.periodo, linha);
  }
  return [...m.values()].sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)));
}

const regional = (vars: [string, string, string]) => (c: Corpos) => {
  const l = sidraLongo(c);
  const m = new Map<string, Linha>();
  for (const r of l) {
    const k = `${r.periodo}|${r.loc}|${r.cat}`;
    const linha = m.get(k) ?? { periodo: r.periodo, area: r.loc, area_nome: r.locNome, nivel: r.loc === '1' ? 'N1' : r.loc.length === 7 ? 'N6' : 'N7', categoria: Number(r.cat), categoria_nome: r.catNome.replace(/^\d+\./, ''), variacao_mensal: null, variacao_12m: null, peso: null };
    if (r.v === vars[0]) linha.variacao_mensal = r.valor; else if (r.v === vars[1]) linha.variacao_12m = r.valor; else if (r.v === vars[2]) linha.peso = r.valor;
    m.set(k, linha);
  }
  return [...m.values()].sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)) || String(a.area).localeCompare(String(b.area)) || Number(a.categoria) - Number(b.categoria));
};

export const processadoresOpm: Record<string, Proc> = {
  copom_decisoes: (c) => (json(c['resposta.json']).conteudo as Record<string, unknown>[])
    .map((r) => ({
      reuniao: num(r.NumeroReuniaoCopom), extraordinaria: r.ReuniaoExtraordinaria ? 1 : 0, data_reuniao: String(r.DataReuniaoCopom).slice(0, 10),
      meta_selic: num(r.MetaSelic), vies: r.Vies === 'n/a' ? '' : String(r.Vies ?? ''), inicio_vigencia: String(r.DataInicioVigencia).slice(0, 10),
      fim_vigencia: r.DataFimVigencia ? String(r.DataFimVigencia).slice(0, 10) : '', selic_efetiva_vigencia: num(r.TaxaSelicEfetivaVigencia),
      selic_efetiva_anualizada: num(r.TaxaSelicEfetivaAnualizada),
    }))
    .sort((a, b) => a.inicio_vigencia.localeCompare(b.inicio_vigencia) || Number(a.reuniao) - Number(b.reuniao)),

  // Planilha oficial de votações: colunas K–R (Reunião, Data, Decisão, Variação, Placar, Votante, Voto var., Voto − decisão).
  // Publica-se só o placar e a contagem de votos; nomes de votantes não saem do dado bruto.
  copom_votos: async (c) => {
    const f = await readXlsxFile(c['historico-votacoes-Copom.xlsx']!) as unknown;
    const rows = (Array.isArray((f as unknown[])[0]) ? f : (f as { data: unknown[][] }[])[0]!.data) as unknown[][];
    const cab = rows.findIndex((r) => r[10] === 'Reunião' && r[14] === 'Placar');
    if (cab < 0) throw new Error('Cabeçalho da planilha de votações não encontrado (colunas K–R).');
    const por = new Map<number, { data: string; meta: number | null; variacao: number | null; placar: string; votantes: number; divergentes: number; soma_div: number }>();
    for (const r of rows.slice(cab + 1)) {
      const n = num(r[10]);
      if (n === null || !(r[11] instanceof Date || typeof r[11] === 'string')) continue;
      const m = por.get(n) ?? { data: new Date(r[11] as string).toISOString().slice(0, 10), meta: num(r[12]), variacao: num(r[13]), placar: String(r[14] ?? ''), votantes: 0, divergentes: 0, soma_div: 0 };
      if (r[15]) {
        m.votantes += 1;
        const dif = num(r[17]);
        if (dif !== null && dif !== 0) { m.divergentes += 1; m.soma_div += dif; }
      }
      por.set(n, m);
    }
    return [...por.entries()].sort(([a], [b]) => a - b).map(([reuniao, m]) => ({
      reuniao, data: m.data, meta_selic: m.meta, variacao_pp: m.variacao, placar: m.placar,
      votantes: m.votantes || null, votos_divergentes: m.votantes ? m.divergentes : null,
      divergencia_media_pp: m.divergentes ? Math.round((m.soma_div / m.divergentes) * 100) / 100 : null,
      unanime: m.placar === 'Unanimidade' ? 1 : m.votantes && m.divergentes === 0 ? 1 : 0,
    }));
  },

  copom_calendario: (c) => arquivos(c).flatMap((k) => {
    const ano = Number(/calendario-(\d{4})\.json/.exec(k)![1]);
    const reg = (json(c[k]).conteudo as { Titulo: string; Texto: string }[])[0];
    if (!reg) throw new Error(`Comunicado do calendário ${ano} vazio.`);
    return datasCalendario(limpaHtml(reg.Texto), ano).map((d) => ({ ...d, comunicado: reg.Titulo }));
  }),

  // Índice dos textos (o texto integral fica no dado bruto, com hash): uma linha por reunião com texto.
  copom_comunicados: (c) => arquivos(c).flatMap((k) => (json(c[k]).conteudo as Record<string, string | number>[]).map((r) => ({
    reuniao: Number(r.nro_reuniao), data: String(r.dataReferencia).slice(0, 10), titulo: limpaHtml(String(r.titulo)),
    caracteres: limpaHtml(String(r.textoComunicado ?? '')).length, arquivo_bruto: k,
  }))).sort((a, b) => a.reuniao - b.reuniao),
  copom_atas: (c) => arquivos(c).flatMap((k) => (json(c[k]).conteudo as Record<string, string | number | null>[]).map((r) => ({
    reuniao: Number(r.nroReuniao), data: String(r.dataReferencia).slice(0, 10), publicacao: String(r.dataPublicacao ?? '').slice(0, 10),
    caracteres: r.textoAta ? limpaHtml(String(r.textoAta)).length : 0, pdf: String(r.urlPdfAta ?? ''), arquivo_bruto: k,
  }))).sort((a, b) => a.reuniao - b.reuniao),

  focus_selic: (c) => odata(c).map((r) => ({
    data: String(r.Data), reuniao: String(r.Reuniao), reuniao_chave: reuniaoChave(String(r.Reuniao)), ...stats(r), respondentes: num(r.numeroRespondentes),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.reuniao_chave.localeCompare(b.reuniao_chave)),
  focus_selic_top5: (c) => odata(c).map((r) => ({
    data: String(r.Data), reuniao: String(r.reuniao), reuniao_chave: reuniaoChave(String(r.reuniao)), tipo_calculo: String(r.tipoCalculo), ...stats(r, true),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.reuniao_chave.localeCompare(b.reuniao_chave) || a.tipo_calculo.localeCompare(b.tipo_calculo)),
  focus_anuais: (c) => odata(c).map((r) => ({
    data: String(r.Data), indicador: String(r.Indicador), ano_referencia: Number(r.DataReferencia), ...stats(r), respondentes: num(r.numeroRespondentes),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.indicador.localeCompare(b.indicador) || a.ano_referencia - b.ano_referencia),
  focus_mensais: (c) => odata(c).map((r) => ({
    data: String(r.Data), mes_referencia: mesRef(String(r.DataReferencia)), ...stats(r), respondentes: num(r.numeroRespondentes),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.mes_referencia.localeCompare(b.mes_referencia)),
  focus_inflacao_12m: (c) => odata(c).map((r) => ({
    data: String(r.Data), suavizada: String(r.Suavizada), ...stats(r), respondentes: num(r.numeroRespondentes),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.suavizada.localeCompare(b.suavizada)),
  focus_top5_anuais: (c) => odata(c).map((r) => ({
    data: String(r.Data), indicador: String(r.Indicador), ano_referencia: Number(r.DataReferencia), tipo_calculo: String(r.tipoCalculo), ...stats(r),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.indicador.localeCompare(b.indicador) || a.ano_referencia - b.ano_referencia || a.tipo_calculo.localeCompare(b.tipo_calculo)),
  focus_top5_mensais: (c) => odata(c).map((r) => ({
    data: String(r.Data), mes_referencia: mesRef(String(r.DataReferencia)), tipo_calculo: String(r.tipoCalculo), ...stats(r),
  })).sort((a, b) => a.data.localeCompare(b.data) || a.mes_referencia.localeCompare(b.mes_referencia) || a.tipo_calculo.localeCompare(b.tipo_calculo)),

  // Tesouro Direto: CSV com ";" e vírgula decimal; desde 2012, títulos prefixados e IPCA+ (com e sem cupom).
  tesouro_direto: (c) => {
    const txt = c['precotaxatesourodireto.csv']!.toString('utf8').replace(/^\uFEFF/, '').replace(/\r/g, '');
    const [cab, ...linhas] = txt.split('\n').filter(Boolean);
    const cols = cab!.split(';');
    const i = (n: string) => { const k = cols.indexOf(n); if (k < 0) throw new Error(`Tesouro Direto: coluna ausente: ${n}`); return k; };
    const [kT, kV, kD, kC, kVd, kP] = ['Tipo Titulo', 'Data Vencimento', 'Data Base', 'Taxa Compra Manha', 'Taxa Venda Manha', 'PU Base Manha'].map(i);
    const TIPOS: Record<string, string> = { 'Tesouro Prefixado': 'LTN', 'Tesouro Prefixado com Juros Semestrais': 'NTN-F', 'Tesouro IPCA+': 'NTN-B Principal', 'Tesouro IPCA+ com Juros Semestrais': 'NTN-B' };
    const dec = (x: string | undefined) => num(x?.replace(/\./g, '').replace(',', '.'));
    const out: Linha[] = [];
    for (const l of linhas) {
      const f = l.split(';');
      const titulo = TIPOS[f[kT!]!];
      if (!titulo) continue;
      const data = brParaIso(f[kD!]!);
      if (data < '2012-01-01') continue;
      out.push({ data, titulo, vencimento: brParaIso(f[kV!]!), taxa_compra: dec(f[kC!]), taxa_venda: dec(f[kVd!]), pu_base: dec(f[kP!]) });
    }
    return out.sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.titulo).localeCompare(String(b.titulo)) || String(a.vencimento).localeCompare(String(b.vencimento)));
  },
  pib_volume_sa: (c) => {
    const s = sidraSeriesDe(json(c['resposta.json']));
    return Object.keys(s['584']!).sort().map((p) => ({ trimestre: `${p.slice(0, 4)}-T${Number(p.slice(4, 6))}`, indice: num(s['584']![p]) }));
  },

  ipca15: (c) => largo(sidraLongo(c), { variacao_mensal: { v: '355' }, acumulada_12m: { v: '1120' } }),
  inpc: (c) => largo(sidraLongo(c), { variacao_mensal: { v: '44' }, acumulada_12m: { v: '2292' } }),
  ipp: (c) => largo(sidraLongo(c), { geral_mensal: { v: '1396', cat: '46608' }, geral_12m: { v: '1394', cat: '46608' }, transformacao_mensal: { v: '1396', cat: '46610' }, transformacao_12m: { v: '1394', cat: '46610' } }),
  ipca_regional: regional(['63', '2265', '66']),
  inpc_regional: regional(['44', '2292', '45']),
  // Planilha oficial dos pesos regionais (zip do FTP do IBGE): área, peso no INPC e no IPCA.
  pesos_regionais: async (c) => {
    const z = unzipSync(new Uint8Array(c['Pesos_Regionais_IPCA_e_INPC.zip']!));
    const nome = Object.keys(z).find((k) => /\.xlsx$/i.test(k));
    if (!nome) throw new Error('Planilha de pesos regionais ausente no zip.');
    const f = await readXlsxFile(Buffer.from(z[nome]!)) as unknown;
    const rows = (Array.isArray((f as unknown[])[0]) ? f : (f as { data: unknown[][] }[])[0]!.data) as unknown[][];
    const cab = rows.findIndex((r) => r[1] === 'Áreas pesquisadas');
    if (cab < 0 || rows[cab]![2] !== 'INPC' || rows[cab]![3] !== 'IPCA') throw new Error('Cabeçalho inesperado na planilha de pesos regionais.');
    return rows.slice(cab + 1).filter((r) => typeof r[1] === 'string' && typeof r[3] === 'number' && r[1] !== 'Brasil')
      .map((r) => ({ area_nome: String(r[1]), peso_inpc: Number(r[2]), peso_ipca: Number(r[3]) }));
  },
  capitais_coordenadas: (c) => arquivos(c).filter((k) => /^\d+\.json$/.test(k)).map((k) => {
    const r = (json(c[k]) as { id: string; centroide: { longitude: number; latitude: number } }[])[0]!;
    return { municipio: r.id, longitude: r.centroide.longitude, latitude: r.centroide.latitude };
  }).sort((a, b) => a.municipio.localeCompare(b.municipio)),

  // SIDRA 7060: formato longo (período × categoria), com o nível hierárquico tirado do código "1.", "11.", "1101."…
  ipca_itens: (c) => {
    const out: Linha[] = [];
    for (const k of arquivos(c)) {
      const dados = json(c[k]);
      if (Array.isArray(dados) && dados[0] && 'NC' in dados[0]) {
        const cab = dados[0] as Record<string, string>;
        const dim = (re: RegExp) => Object.keys(cab).find((x) => /^D\dC$/.test(x) && re.test(cab[x]!))!;
        const kV = dim(/^Variável \(Código\)$/); const kP = dim(/^Mês \(Código\)$/); const kC = dim(/^Geral, grupo/);
        const kN = kC.replace(/C$/, 'N');
        for (const l of dados.slice(1) as Record<string, string>[]) out.push({ periodo: `${l[kP]!.slice(0, 4)}-${l[kP]!.slice(4)}`, var: l[kV]!, codigo: l[kC]!, nome: l[kN]!, valor: num(l.V) });
      } else {
        for (const v of dados as { id: string; resultados: { classificacoes: { categoria: Record<string, string> }[]; series: { serie: Record<string, string> }[] }[] }[]) {
          for (const res of v.resultados) {
            const [codigo, nome] = Object.entries(res.classificacoes[0]!.categoria)[0]!;
            for (const [p, val] of Object.entries(res.series[0]!.serie)) out.push({ periodo: `${p.slice(0, 4)}-${p.slice(4)}`, var: v.id, codigo, nome, valor: num(val) });
          }
        }
      }
    }
    // Junta variação (63) e peso (66) por período e categoria.
    const m = new Map<string, Linha>();
    for (const r of out) {
      const chave = `${r.periodo}|${r.codigo}`;
      const nome = String(r.nome);
      // Código no nome: grupo "1.", subgrupo "11.", item "1101.", subitem "1101002." (1, 2, 4 e 7 dígitos).
      const digitos = /^(\d+)\./.exec(nome)?.[1]?.length ?? 0;
      const nivel = ({ 0: 0, 1: 1, 2: 2, 4: 3, 7: 4 } as Record<number, number>)[digitos];
      if (nivel === undefined) throw new Error(`SIDRA 7060: categoria com código inesperado: ${nome}`);
      const l: Linha = m.get(chave) ?? { periodo: r.periodo ?? null, codigo: Number(r.codigo), nivel, nome: nome.replace(/^\d+\./, ''), variacao_mensal: null, peso: null };
      if (r.var === "63") l.variacao_mensal = r.valor ?? null; else if (r.var === "66") l.peso = r.valor ?? null;
      m.set(chave, l);
    }
    return [...m.values()].sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)) || Number(a.codigo) - Number(b.codigo));
  },
};

export { sidraSeriesDe };
