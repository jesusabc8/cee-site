#!/usr/bin/env node
/**
 * Varredura de segurança de dist/ (ADR-018; CLAUDE.md, "Segurança"). Falha (exit 1) se encontrar:
 *  - e-mail diferente do institucional (CEE_EMAIL_INSTITUCIONAL; o [PLACEHOLDER] só é tolerado em versão preliminar);
 *  - telefone, CPF ou padrão de chave/segredo;
 *  - arquivos .map, .env, .tex, .docx, .sty ou .pdf fora de /documentos/;
 *  - nome da lista proibida (docs/seguranca/nomes-proibidos.txt, fora do git, ou segredo CEE_NOMES_PROIBIDOS no CI);
 *  - link para o repositório (github.com/jesusabc8);
 *  - DADO de fonte excluída (scripts/qa/fontes-excluidas.json; ADR-031): arquivo em /dados/ que cite a instituição ou o
 *    host, código SGS da série excluída em qualquer página, ou link de download (csv/xls/zip/api) para o host;
 *  - frase que cite GIEF, FIEMG ou FGV sem registrar exclusão (CLAUDE.md, regra 6: nunca como meta ou aspiração).
 *    A varredura é por dados, não por nomes: mencionar a fonte excluída e o motivo é permitido.
 * Lê HTML, XML, TXT, JSON, CSV, JS, CSS e os fragmentos comprimidos do Pagefind.
 * Uso: npm run build && npm run qa:seguranca  (DIST=outro/dir para outro diretório)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const RAIZ = new URL('../../', import.meta.url).pathname;
const DIST = process.env.DIST ?? join(RAIZ, 'dist');
if (!existsSync(DIST)) { console.error(`qa:seguranca: ${DIST} não existe; rode npm run build.`); process.exit(2); }

const configTxt = readFileSync(join(RAIZ, 'src/site.config.ts'), 'utf8');
const lancado = process.env.CEE_LANCADO === '1' || /launched:\s*true\b/.test(configTxt);
const institucional = (process.env.CEE_EMAIL_INSTITUCIONAL ?? (configTxt.match(/contato:\s*'([^']+)'/)?.[1] ?? '')).toLowerCase();

// Nomes proibidos: arquivo local (fora do git) e/ou segredo do CI, um por linha; # comenta.
const listaNomes = [
  existsSync(join(RAIZ, 'docs/seguranca/nomes-proibidos.txt')) ? readFileSync(join(RAIZ, 'docs/seguranca/nomes-proibidos.txt'), 'utf8') : '',
  process.env.CEE_NOMES_PROIBIDOS ?? '',
].join('\n').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
const semAcento = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const nomes = listaNomes.map((n) => ({ n, re: new RegExp(`\\b${semAcento(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}\\b`, 'i') }));

const REGRAS = [
  { id: 'cpf', re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g },
  { id: 'telefone', re: /(?:\+55\s?)?\(\d{2}\)\s?9?\d{4}-?\d{4}\b|\+55\s?\d{2}\s?9?\d{4}-?\d{4}\b/g },
  { id: 'chave-github', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/g },
  { id: 'chave-aws', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: 'chave-privada', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----|-----BEGIN [A-Z ]+-----/g },
  { id: 'api-key', re: /\bapi[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9_-]{12,}/gi },
  { id: 'token-cloudflare', re: /\bCLOUDFLARE_API_TOKEN\s*[:=]\s*\S{20,}/g },
  { id: 'repositorio', re: /github\.com\/jesusabc8/gi },
];
const EXCL = JSON.parse(readFileSync(join(RAIZ, 'scripts/qa/fontes-excluidas.json'), 'utf8'));
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SGS_EXCL = EXCL.fontes.flatMap((f) => f.sgs.map((c) => ({ f: f.id, re: new RegExp(`(?:\\bSGS\\s*${c}\\b|bcdata\\.sgs\\.${c}\\b|hdOidSeriesSelecionadas=${c}\\b)`, 'i') })));
const DADO_EXCL = EXCL.fontes.flatMap((f) => [...f.instituicoes.map((n) => ({ f: f.id, re: new RegExp(`\\b${escRe(n)}\\b`) })), ...f.hosts.map((h) => ({ f: f.id, re: new RegExp(escRe(h), 'i') }))]);
const LINK_EXCL = EXCL.fontes.flatMap((f) => f.hosts.map((h) => ({ f: f.id, re: new RegExp(`href="https?://(?:[\\w-]+\\.)*${escRe(h)}[^"]*(?:\\.(?:csv|xlsx?|zip|json)|/api/)[^"]*"`, 'i') })));
const TERMOS = new RegExp(`\\b(?:${EXCL.termos_contexto.map(escRe).join('|')})\\b`);
const marcaExclusao = (frase) => EXCL.marcas_exclusao.some((m) => frase.toLowerCase().includes(m.toLowerCase()));
/** Frases do texto visível (sem marcação), para o contexto das menções. */
const frases = (txt) => txt.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').split(/(?<=[.;!?])\s+|\n{2,}/);

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// E-mails técnicos que não identificam pessoas (ex.: exemplos de esquema) podem ser listados aqui.
const EMAILS_TOLERADOS = new Set([institucional].filter(Boolean));
// Arquivos do próprio Pagefind (pacote público): trazem os e-mails dos tradutores nos créditos. A regra de e-mail não
// se aplica a eles; o índice (pf_fragment etc.), que contém o texto do sítio, continua verificado.
const VENDOR_EMAIL = /^pagefind\/pagefind[-\w]*\.(?:js|css)$/;

const TEXTO = new Set(['.html', '.xml', '.txt', '.json', '.csv', '.js', '.mjs', '.css', '.svg', '.webmanifest', '.md']);
const PROIBIDOS = new Set(['.map', '.env', '.tex', '.docx', '.doc', '.sty', '.bib', '.xlsx', '.key', '.pem']);

const achados = [];
const add = (arquivo, regra, trecho) => achados.push({ arquivo, regra, trecho: String(trecho).slice(0, 120) });

function lerFragmentoPagefind(buf) {
  try { return gunzipSync(buf).toString('utf8'); } catch { return ''; }
}

function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    const rel = relative(DIST, caminho);
    if (statSync(caminho).isDirectory()) { varrer(caminho); continue; }
    const ext = extname(nome).toLowerCase();
    if (PROIBIDOS.has(ext) || nome.startsWith('.env')) { add(rel, 'arquivo-proibido', nome); continue; }
    if (ext === '.pdf' && !rel.startsWith('documentos/')) { add(rel, 'pdf-fora-de-documentos', nome); continue; }
    let txt = '';
    if (TEXTO.has(ext) || nome.startsWith('_')) txt = readFileSync(caminho, 'utf8');
    else if (ext === '.pf_fragment' || ext === '.pf_meta' || ext === '.pf_index') txt = lerFragmentoPagefind(readFileSync(caminho));
    else continue;
    for (const { id, re } of REGRAS) for (const m of txt.matchAll(re)) add(rel, id, m[0]);
    // Dados de fontes excluídas (por dado, não por nome).
    const ehDado = /^dados\//.test(rel.replace(/\\/g, '/')) || ['.csv'].includes(ext);
    if (ehDado) for (const { f, re } of DADO_EXCL) { const m = txt.match(re); if (m) add(rel, 'fonte-excluida-dado', `${f}: ${m[0]}`); }
    for (const { f, re } of SGS_EXCL) { const m = txt.match(re); if (m) add(rel, 'fonte-excluida-serie', `${f}: ${m[0]}`); }
    for (const { f, re } of LINK_EXCL) { const m = txt.match(re); if (m) add(rel, 'fonte-excluida-link', `${f}: ${m[0]}`); }
    if (TERMOS.test(txt)) for (const fr of frases(txt)) if (TERMOS.test(fr) && !marcaExclusao(fr)) add(rel, 'mencao-sem-exclusao', fr.trim().replace(/\s+/g, ' '));
    for (const m of VENDOR_EMAIL.test(rel) ? [] : txt.matchAll(EMAIL)) {
      const e = m[0].toLowerCase();
      if (EMAILS_TOLERADOS.has(e)) continue;
      if (/\.(png|jpe?g|svg|webp|gif|css|js)$/.test(e)) continue; // nomes de arquivo como logo@2x.png
      add(rel, 'email', m[0]);
    }
    if (lancado && txt.includes('[PLACEHOLDER]') && /contato@\[PLACEHOLDER\]/.test(txt)) add(rel, 'email-placeholder-apos-lancamento', 'contato@[PLACEHOLDER]');
    if (nomes.length) {
      const plano = semAcento(txt);
      for (const { n, re } of nomes) if (re.test(plano)) add(rel, 'nome-proibido', n.replace(/\S/g, (c, i) => (i === 0 ? c : '*')));
    }
  }
}

varrer(DIST);
if (!nomes.length) console.warn('qa:seguranca: aviso — nenhuma lista de nomes proibidos (docs/seguranca/nomes-proibidos.txt ou CEE_NOMES_PROIBIDOS); verificação de nomes não executada.');
if (achados.length) {
  console.error(`qa:seguranca: ${achados.length} achado(s) em dist/:`);
  for (const a of achados.slice(0, 200)) console.error(`  [${a.regra}] ${a.arquivo}: ${a.trecho}`);
  process.exit(1);
}
console.log(`qa:seguranca: dist/ limpo (${lancado ? 'lançado' : 'versão preliminar'}; ${nomes.length} nome(s) na lista proibida).`);
