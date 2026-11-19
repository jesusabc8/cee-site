#!/usr/bin/env node
/**
 * Recupera do histórico do git uma safra bruta que não está mais no árvore (poda do ADR-031).
 * Uso: node scripts/data/safra.mjs <fonte>/<id> <AAAA-MM-DD> [destino]
 *   ex.: node scripts/data/safra.mjs bcb-olinda/focus_anuais 2026-11-18 /tmp/safra
 * Procura o último commit que contém data/raw/<fonte>/<id>/<data>/, extrai os arquivos e confere o SHA-256 de cada um
 * contra o meta.json da própria safra.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [serie, data, destino = join('/tmp', 'safra', serie.replace('/', '_'), data ?? '')] = process.argv.slice(2);
if (!serie || !/^\d{4}-\d{2}-\d{2}$/.test(data ?? '')) { console.error('Uso: node scripts/data/safra.mjs <fonte>/<id> <AAAA-MM-DD> [destino]'); process.exit(2); }
const caminho = `data/raw/${serie}/${data}`;
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 1 << 30 });
const commit = git('log', '-1', '--format=%H', '--', `${caminho}/meta.json`).toString().trim();
if (!commit) { console.error(`Safra ${caminho} não encontrada no histórico.`); process.exit(1); }
const meta = JSON.parse(git('show', `${commit}:${caminho}/meta.json`).toString());
mkdirSync(destino, { recursive: true });
writeFileSync(join(destino, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
for (const a of meta.arquivos) {
  const corpo = git('show', `${commit}:${caminho}/${a.arquivo}`);
  const h = createHash('sha256').update(corpo).digest('hex');
  if (h !== a.sha256) { console.error(`✗ ${a.arquivo}: SHA-256 não confere`); process.exit(1); }
  mkdirSync(join(destino, a.arquivo, '..'), { recursive: true });
  writeFileSync(join(destino, a.arquivo), corpo);
}
console.log(`✓ ${caminho} (commit ${commit.slice(0, 10)}): ${meta.arquivos.length} arquivo(s) em ${destino}, SHA-256 conferido.`);
