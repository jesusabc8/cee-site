#!/usr/bin/env node
/**
 * Orçamento de tamanho do repositório (ADR-031). Falha se:
 *  - algum arquivo versionado passar de 45 MB (o GitHub recusa > 100 MB e alerta > 50 MB);
 *  - data/raw/ no árvore de trabalho passar de LIMITE_RAW_MB (padrão 400 MB).
 * Mostra o tamanho por fonte, o número de safras e a projeção anual com a cadência semanal do data-refresh.
 * Uso: node scripts/qa/tamanho.mjs  (LIMITE_RAW_MB=… para outro orçamento)
 */
import { execFileSync } from 'node:child_process';
import { statSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MB = 1024 * 1024;
const LIMITE_ARQ = 45 * MB;
const LIMITE_RAW = Number(process.env.LIMITE_RAW_MB ?? 400) * MB;
const arquivos = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const grandes = arquivos.filter((f) => existsSync(f) && statSync(f).size > LIMITE_ARQ);
const tam = (d) => readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? tam(join(d, e.name)) : statSync(join(d, e.name)).size), 0);

let raw = 0, safrasExtras = 0;
const linhas = [];
for (const fonte of readdirSync('data/raw', { withFileTypes: true }).filter((e) => e.isDirectory())) {
  for (const serie of readdirSync(join('data/raw', fonte.name), { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const dir = join('data/raw', fonte.name, serie.name);
    const safras = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    const t = tam(dir);
    raw += t;
    if (safras.length) safrasExtras += t - tam(join(dir, safras.at(-1)));
    linhas.push([dir, t, safras.length]);
  }
}
const ultima = raw - safrasExtras;
console.log(`data/raw: ${(raw / MB).toFixed(1)} MB no árvore (${(ultima / MB).toFixed(1)} MB só a última safra de cada série; ${(safrasExtras / MB).toFixed(1)} MB em safras anteriores).`);
for (const [d, t, n] of linhas.sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${(t / MB).toFixed(1).padStart(6)} MB  ${n} safra(s)  ${d}`);
console.log(`Projeção sem poda, data-refresh semanal: até +${((ultima * 52) / MB / 1024).toFixed(1)} GB/ano no árvore (o histórico git cresce bem menos: deltas).`);
let falhou = false;
if (grandes.length) { falhou = true; console.error(`✗ arquivo(s) acima de 45 MB: ${grandes.join(', ')}`); }
if (raw > LIMITE_RAW) { falhou = true; console.error(`✗ data/raw acima do orçamento (${(raw / MB).toFixed(0)} > ${(LIMITE_RAW / MB).toFixed(0)} MB): ative a poda (CEE_PODA_SAFRAS=1, ADR-031) com autorização do responsável.`); }
process.exit(falhou ? 1 : 0);
