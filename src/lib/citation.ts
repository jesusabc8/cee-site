/**
 * Referências em ABNT (NBR 6023:2018, aproximada), BibTeX e RIS.
 * Nomes: "Nome Sobrenome" → ABNT "SOBRENOME, Nome"; BibTeX "Sobrenome, Nome".
 */
import type { Publicacao } from '../schemas/publicacao';
import { TIPOS } from '../schemas/publicacao';

const MESES_ABNT = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

function partes(nome: string) {
  const t = nome.trim().split(/\s+/);
  const sobrenome = t.length > 1 ? t.pop()! : t[0]!;
  return { sobrenome, prenomes: t.length ? t.join(' ') : '' };
}
const abntNome = (n: string) => { const p = partes(n); return p.prenomes ? `${p.sobrenome.toUpperCase()}, ${p.prenomes}` : p.sobrenome.toUpperCase(); };
const bibNome = (n: string) => { const p = partes(n); return p.prenomes ? `${p.sobrenome}, ${p.prenomes}` : p.sobrenome; };
const abntData = (d: Date) => `${d.getUTCDate()} ${MESES_ABNT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export interface CiteInput { p: Publicacao; url: string; slug: string; acesso?: Date }

function serie(p: Publicacao) {
  const tipo = TIPOS[p.tipo].pt;
  return p.numero ? `${tipo}, n. ${p.numero}` : tipo;
}

export function abnt({ p, url, acesso = new Date() }: CiteInput): string {
  const autores = p.autoria.length > 3
    ? `${abntNome(p.autoria[0]!.nome)} et al.`
    : p.autoria.map((a) => abntNome(a.nome)).join('; ');
  const doi = p.doi ? ` DOI: https://doi.org/${p.doi}.` : '';
  return `${autores}. ${p.titulo}: ${p.subtitulo.charAt(0).toLowerCase()}${p.subtitulo.slice(1)}. Belo Horizonte: Centro de Estudos Econômicos (CEE), ${p.data.getUTCFullYear()}. (${serie(p)}; versão ${p.versao}).${doi} Disponível em: ${url}. Acesso em: ${abntData(acesso)}.`;
}

export function bibtex({ p, url, slug }: CiteInput): string {
  const key = `cee${p.data.getUTCFullYear()}${slug.replace(/[^a-z0-9]/gi, '').slice(0, 24)}`;
  const tipo = p.tipo === 'working-paper' ? 'techreport' : 'misc';
  const campos: [string, string | undefined][] = [
    ['author', p.autoria.map((a) => bibNome(a.nome)).join(' and ')],
    ['title', `{${p.titulo}: ${p.subtitulo}}`],
    [tipo === 'techreport' ? 'institution' : 'publisher', 'Centro de Estudos Econômicos (CEE)'],
    ['type', TIPOS[p.tipo].pt],
    ['number', p.numero],
    ['year', String(p.data.getUTCFullYear())],
    ['month', String(p.data.getUTCMonth() + 1)],
    ['version', p.versao],
    ['doi', p.doi],
    ['url', url],
    ['note', 'Licença CC BY 4.0'],
  ];
  const body = campos.filter(([, v]) => v).map(([k, v]) => `  ${k} = {${v}}`).join(',\n');
  return `@${tipo}{${key},\n${body}\n}`;
}

export function ris({ p, url }: CiteInput): string {
  const d = p.data;
  const pad = (n: number) => String(n).padStart(2, '0');
  const linhas = [
    ['TY', p.tipo === 'working-paper' ? 'RPRT' : 'GEN'],
    ...p.autoria.map((a) => ['AU', bibNome(a.nome)]),
    ['TI', `${p.titulo}: ${p.subtitulo}`],
    ['PY', String(d.getUTCFullYear())],
    ['DA', `${d.getUTCFullYear()}/${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}`],
    ['PB', 'Centro de Estudos Econômicos (CEE)'],
    ['CY', 'Belo Horizonte'],
    ['M3', TIPOS[p.tipo].pt],
    ...(p.numero ? [['IS', p.numero]] : []),
    ['ET', p.versao],
    ...(p.doi ? [['DO', p.doi]] : []),
    ['UR', url],
    ['AB', p.resumo],
    ['LA', p.idioma],
    ['ER', ''],
  ];
  return linhas.map(([k, v]) => `${k}  - ${v}`).join('\n');
}
