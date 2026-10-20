import { defaultLang, locales, type Lang } from './ui';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Caminho relativo à raiz do sítio, sem o `base` (ex.: "/en/sobre/"). */
export function stripBase(pathname: string): string {
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

export function getLang(url: URL): Lang {
  const seg = stripBase(url.pathname).split('/')[1] ?? '';
  return (locales as readonly string[]).includes(seg) && seg !== defaultLang ? (seg as Lang) : defaultLang;
}

/** Caminho sem o prefixo de língua (ex.: "/en/sobre/" → "/sobre/"). */
export function neutralPath(url: URL): string {
  const p = stripBase(url.pathname);
  for (const l of locales) {
    if (l !== defaultLang && (p === `/${l}` || p.startsWith(`/${l}/`))) return p.slice(l.length + 1) || '/';
  }
  return p;
}

/** Constrói o link interno para uma língua, com `base` e barra final. */
export function href(path: string, lang: Lang = defaultLang): string {
  let p = path.startsWith('/') ? path : `/${path}`;
  const isFile = /\.[a-z0-9]+$/i.test(p) || p.includes('#') || p.includes('?');
  if (!isFile && !p.endsWith('/')) p += '/';
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return `${base}${prefix}${p}`;
}

/** Link para a mesma página em outra língua. */
export function switchHref(url: URL, target: Lang): string {
  return href(neutralPath(url), target);
}
