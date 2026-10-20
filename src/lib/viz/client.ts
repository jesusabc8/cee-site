/**
 * Interação dos gráficos (navegador): redesenha na largura real do contêiner, troca de período
 * (tablist acessível), cursor com tooltip e realce de série pela legenda. Um único módulo para
 * todos os gráficos da página.
 */
import { fmtNum, fmtX, layout, renderSvg, type ChartSpec } from './render';

type Range = { id: string; years: number | null };

function iniciar(fig: HTMLElement) {
  const specEl = fig.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const plot = fig.querySelector<HTMLElement>('[data-viz-plot]');
  const tip = fig.querySelector<HTMLElement>('[data-viz-tip]');
  if (!specEl || !plot || !tip) return;
  const spec = JSON.parse(specEl.textContent ?? '{}') as ChartSpec & { ranges?: Range[]; defaultRange?: string };
  const xMax = Math.max(...spec.series.flatMap((s) => s.points.map((p) => p.x)));
  let range = spec.ranges?.find((r) => r.id === spec.defaultRange) ?? spec.ranges?.[0];
  const xFrom = () => (range?.years ? Date.UTC(new Date(xMax).getUTCFullYear() - range.years, new Date(xMax).getUTCMonth(), 1) : undefined);
  let largura = 0;

  const desenhar = () => {
    largura = Math.round(plot.clientWidth);
    if (largura < 40) return;
    plot.innerHTML = renderSvg(spec, largura, xFrom());
  };

  // Períodos (tablist)
  const tabs = [...fig.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const selecionar = (b: HTMLButtonElement, foco = false) => {
    tabs.forEach((t) => { const on = t === b; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    range = spec.ranges?.find((r) => r.id === b.dataset.range) ?? range;
    desenhar();
    if (foco) b.focus();
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => selecionar(b));
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selecionar(tabs[(i + d + tabs.length) % tabs.length]!, true); }
    });
  });

  // Realce pela legenda
  fig.querySelectorAll<HTMLElement>('[data-legend]').forEach((li) => {
    const id = li.dataset.legend ?? '';
    const on = () => {
      plot.dataset.focus = id;
      plot.querySelectorAll<SVGElement>('[data-serie]').forEach((el) => el.classList.toggle('is-hl', el.dataset.serie === id));
    };
    const off = () => {
      delete plot.dataset.focus;
      plot.querySelectorAll('.is-hl').forEach((el) => el.classList.remove('is-hl'));
    };
    li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off);
    li.addEventListener('focus', on); li.addEventListener('blur', off);
  });

  // Cursor e tooltip
  const series = spec.series.filter((s) => !s.noTooltip);
  const xs = [...new Set(series.flatMap((s) => s.points.filter((p) => p.y !== null).map((p) => p.x)))].sort((a, b) => a - b);
  const mover = (clientX: number, clientY: number) => {
    const svg = plot.querySelector('svg');
    if (!svg) return;
    const L = layout(spec, largura, xFrom());
    const box = svg.getBoundingClientRect();
    const px = ((clientX - box.left) / box.width) * largura;
    if (px < L.left - 6 || px > largura - L.right + 6) return esconder();
    const alvo = L.x0 + ((px - L.left) / (largura - L.left - L.right)) * (L.x1 - L.x0);
    let melhor = xs[0]!;
    for (const x of xs) if (x >= L.x0 && Math.abs(x - alvo) < Math.abs(melhor - alvo)) melhor = x;
    if (melhor < L.x0) return esconder();
    const cx = L.sx(melhor);
    const hover = svg.querySelector<SVGGElement>('.viz-hover');
    if (!hover) return;
    hover.style.display = '';
    const cur = hover.querySelector('line')!;
    cur.setAttribute('x1', String(cx)); cur.setAttribute('x2', String(cx));
    hover.querySelectorAll('circle').forEach((c) => c.remove());
    const linhas: string[] = [];
    for (const s of [...series].reverse()) {
      const p = s.points.find((q) => q.x === melhor);
      if (!p || p.y === null) continue;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(cx)); c.setAttribute('cy', String(L.sy(p.y)));
      c.setAttribute('r', '4.5'); c.setAttribute('fill', s.color); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', '2');
      hover.appendChild(c);
      linhas.push(`<span class="viz-tip__row"><i style="background:${s.color}"></i>${s.label}<b>${fmtNum(p.y, spec.yDigits, spec.lang, spec.yThousands)}${spec.yTickSuffix && !spec.yThousands ? spec.yTickSuffix : ''}</b></span>`);
    }
    if (!linhas.length) return esconder();
    tip.innerHTML = `<span class="viz-tip__x">${fmtX(melhor, spec.xFormat, spec.lang)}</span>${linhas.join('')}`;
    tip.hidden = false;
    const k = box.width / largura;
    const w = tip.offsetWidth;
    const left = cx * k + 14;
    tip.style.left = `${plot.offsetLeft + (left + w > box.width ? cx * k - w - 14 : left)}px`;
    const topo = plot.offsetTop + (clientY - box.top) - tip.offsetHeight - 14;
    tip.style.top = `${Math.max(plot.offsetTop, topo)}px`;
  };
  const esconder = () => {
    tip.hidden = true;
    const hover = plot.querySelector<SVGGElement>('.viz-hover');
    if (hover) hover.style.display = 'none';
  };
  plot.addEventListener('pointermove', (e) => mover(e.clientX, e.clientY));
  plot.addEventListener('pointerleave', esconder);

  desenhar();
  let raf = 0;
  new ResizeObserver(() => {
    if (Math.abs(plot.clientWidth - largura) < 2) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(desenhar);
  }).observe(plot);
}

document.querySelectorAll<HTMLElement>('[data-viz]').forEach(iniciar);
