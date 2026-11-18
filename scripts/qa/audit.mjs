// Portão de dependências: equivalente a `npm audit --audit-level=high`, com exceções temporárias por ID (ADR-021).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { avisos, avaliar } from './audit-lib.mjs';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let bruto;
try { bruto = execFileSync(npm, ['audit', '--json'], { encoding: 'utf8', maxBuffer: 64 << 20 }); }
catch (err) { bruto = err.stdout; } // npm audit sai com código ≠ 0 quando há avisos
const audit = JSON.parse(bruto);
if (audit.error) { console.error('npm audit falhou:', audit.error.summary ?? audit.error); process.exit(1); }

const { excecoes } = JSON.parse(readFileSync(new URL('./audit-excecoes.json', import.meta.url), 'utf8'));
const lista = avisos(audit, 'high');
const ultima = {};
for (const p of new Set(lista.map((a) => a.pacote))) {
  try { ultima[p] = execFileSync(npm, ['view', p, 'version'], { encoding: 'utf8' }).trim(); } catch { /* fica indefinido → falha */ }
}
const hoje = new Date().toISOString().slice(0, 10);
const { ok, linhas } = avaliar(lista, excecoes, hoje, ultima);
for (const l of linhas) console.log(l);
const m = audit.metadata?.vulnerabilities ?? {};
console.log(`npm audit: ${m.critical ?? 0} critical, ${m.high ?? 0} high (pacotes afetados), ${m.moderate ?? 0} moderate, ${m.low ?? 0} low`);
console.log(ok ? 'qa:audit OK' : 'qa:audit FALHOU');
process.exit(ok ? 0 : 1);
