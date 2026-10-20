/**
 * Gráficos renderizados no build (Observable Plot → SVG estático, sem JavaScript obrigatório).
 * Regras (ver /_estilo/ e docs/DECISIONES.md): no máximo 3 séries; um único eixo y;
 * cores por classe CSS (.serie-1..3) para funcionar nos modos claro e escuro;
 * legenda para ≥ 2 séries e rótulo direto no último ponto; tabela alternativa sempre.
 */
import * as Plot from '@observablehq/plot';
import { parseHTML } from 'linkedom';
import { tickStep } from 'd3';

export interface Ponto { t: Date; v: number | null }
export interface SerieGrafico {
  nome: string;
  pontos: Ponto[];
  /** 'linha' (padrão), 'degrau' (taxa vigente até mudar) ou 'barra' (mensal). */
  tipo?: 'linha' | 'degrau' | 'barra';
  /** Faixa de incerteza (ex.: IC de 95%) — desenhada atrás da linha. */
  faixa?: { t: Date; lo: number; hi: number }[];
}
export interface Variante {
  id: string;
  rotulo: string;
  /** Uma renderização por largura (larga e estreita), trocadas por CSS conforme a tela. */
  svgs: { w: number; svg: string; x: { d0: number; d1: number; r0: number; r1: number; w: number } }[];
  pontos: { t: number; rotulo: string; valores: (number | null)[] }[];
}

const NF = (lang: string, d = 1) => new Intl.NumberFormat(lang, { minimumFractionDigits: d, maximumFractionDigits: d });

export function renderVariantes(opts: {
  series: SerieGrafico[];
  periodos: { id: string; rotulo: string; desde: Date | null }[];
  lang: string;
  digitos?: number;
  rotuloData: (t: Date) => string;
  altura?: number;
  zeroNoEixo?: boolean;
}): Variante[] {
  const { series, periodos, lang, digitos = 1, rotuloData, altura = 340, zeroNoEixo = false } = opts;
  if (series.length > 3) throw new Error('No máximo 3 séries por gráfico.');
  const fmt = NF(lang, digitos);
  return periodos.map((p) => {
    const recorte = series.map((s) => ({
      ...s,
      pontos: s.pontos.filter((pt) => !p.desde || pt.t >= p.desde),
      faixa: s.faixa?.filter((f) => !p.desde || f.t >= p.desde),
    }));
    const ts = recorte.flatMap((s) => s.pontos.map((pt) => pt.t.getTime()));
    const anos = (Math.max(...ts) - Math.min(...ts)) / (365.25 * 86_400_000);
    const fmtMesCurto = new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' });
    // Eixo y: mesmo número de casas decimais em todas as marcas (o necessário para o passo).
    const vs = recorte.flatMap((s) => [
      ...s.pontos.flatMap((pt) => (pt.v === null ? [] : [pt.v])),
      ...(s.faixa ?? []).flatMap((f) => [f.lo, f.hi]),
    ]).concat(zeroNoEixo ? [0] : []);
    const passo = tickStep(Math.min(...vs), Math.max(...vs), altura / 35);
    const casas = passo >= 1 ? 0 : passo >= 0.1 ? 1 : 2;
    const fmtY = new Intl.NumberFormat(lang, { minimumFractionDigits: casas, maximumFractionDigits: casas });
    const fmtTick = (d: number) => fmtY.format(d);

    const renderLargura = (largura: number) => {
      const estreito = largura < 500;
      const marginRight = estreito ? 70 : 92;
      // Eixo x: intervalo de marcas escolhido para caber na largura (≈ 1 marca a cada 70–90 px).
      const maxMarcas = (largura - 44 - marginRight) / (estreito ? 62 : 80);
      const eixoX = anos >= 4
        ? { type: 'utc' as const, ticks: anos / maxMarcas > 2.6 ? '5 years' : anos / maxMarcas > 1 ? '2 years' : 'year', tickFormat: (d: Date) => String(d.getUTCFullYear()), label: null }
        : { type: 'utc' as const, ticks: (anos * 12) / maxMarcas > 6 ? 'year' : (anos * 12) / maxMarcas > 3 ? '6 months' : '3 months', tickFormat: (d: Date) => fmtMesCurto.format(d), label: null };
      const nomeCurto = (n: string) => (estreito ? n.replace(/ 12 meses| 12 months/, '').replace(/^Meta Selic$/, 'Selic').replace(/^Selic target$/, 'Selic').replace(/^Desocupação$/, '').replace(/^Unemployment$/, '') : n);

      const build = (rotulos: { t: Date; y: number; texto: string; i: number }[]) => {
        const { document } = parseHTML('<!doctype html><html><body></body></html>');
        const marks: Plot.Markish[] = [Plot.gridY({ className: 'grid', strokeOpacity: 1, stroke: 'currentColor' })];
        if (zeroNoEixo) marks.push(Plot.ruleY([0], { className: 'zero', stroke: 'currentColor' }));
        recorte.forEach((s, i) => {
          const cls = `serie-${i + 1}`;
          if (s.faixa) marks.push(Plot.areaY(s.faixa, { x: 't', y1: 'lo', y2: 'hi', fill: 'currentColor', fillOpacity: 0.16, className: cls }));
          const dados = s.pontos.filter((pt) => pt.v !== null);
          if (s.tipo === 'barra') {
            marks.push(Plot.rectY(dados, { x: 't', y: 'v', interval: 'month', fill: 'currentColor', insetLeft: 0.5, insetRight: 0.5, className: cls }));
          } else {
            marks.push(Plot.lineY(dados, { x: 't', y: 'v', stroke: 'currentColor', strokeWidth: 2, curve: s.tipo === 'degrau' ? 'step-after' : 'linear', className: cls }));
            const ult = dados.at(-1);
            if (ult) marks.push(Plot.dot([ult], { x: 't', y: 'v', r: 3.5, fill: 'currentColor', stroke: 'var(--bg)', strokeWidth: 1.5, className: cls }));
          }
        });
        if (rotulos.length) {
          marks.push(Plot.text(rotulos, { x: 't', y: 'y', text: 'texto', textAnchor: 'start', dx: 8, lineAnchor: 'middle', fill: 'currentColor', className: 'chart-label' }));
        }
        return Plot.plot({
          document,
          width: largura,
          height: estreito ? Math.round(altura * 0.85) : altura,
          marginLeft: 40,
          marginRight,
          marginTop: 16,
          marginBottom: 30,
          style: { background: 'transparent', overflow: 'visible' },
          x: eixoX,
          y: { grid: false, nice: true, label: null, tickFormat: fmtTick, ...(zeroNoEixo ? { zero: true } : {}) },
          marks,
        });
      };

      // 1ª passada: escala y para afastar rótulos diretos sobrepostos (mín. 15 px).
      const finais = recorte.map((s, i) => {
        const dados = s.pontos.filter((pt) => pt.v !== null);
        const u = dados.at(-1);
        return u && s.tipo !== 'barra' ? { t: u.t, y: u.v as number, texto: `${nomeCurto(s.nome)} ${fmt.format(u.v as number)}`.trim(), i } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null);
      const ys = build([]).scale('y')!;
      const [d0, d1] = ys.domain as [number, number];
      const [r0, r1] = ys.range as [number, number];
      const gap = 15 / Math.abs((r1 - r0) / (d1 - d0));
      const ordenados = [...finais].sort((a, b) => a.y - b.y);
      for (let i = 1; i < ordenados.length; i++) {
        if (ordenados[i]!.y - ordenados[i - 1]!.y < gap) ordenados[i]!.y = ordenados[i - 1]!.y + gap;
      }
      const el = build(ordenados);
      // A figura já tem descrição textual e tabela: o SVG é decorativo para leitores de tela.
      el.setAttribute('aria-hidden', 'true');
      el.removeAttribute('width');
      el.removeAttribute('height');
      const xs = el.scale('x')!;
      const [xd0, xd1] = (xs.domain as Date[]).map((d) => d.getTime());
      const [xr0, xr1] = xs.range as number[];
      return { w: largura, svg: el.outerHTML, x: { d0: xd0!, d1: xd1!, r0: xr0!, r1: xr1!, w: largura } };
    };

    // Pontos para o tooltip: união das datas das séries.
    const datas = [...new Set(recorte.flatMap((s) => s.pontos.map((pt) => pt.t.getTime())))].sort((a, b) => a - b);
    const idx = recorte.map((s) => new Map(s.pontos.map((pt) => [pt.t.getTime(), pt.v])));
    return {
      id: p.id,
      rotulo: p.rotulo,
      svgs: [renderLargura(720), renderLargura(400)],
      pontos: datas.map((t) => ({ t, rotulo: rotuloData(new Date(t)), valores: idx.map((m) => m.get(t) ?? null) })),
    };
  });
}
