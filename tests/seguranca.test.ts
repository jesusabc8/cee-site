/** O scanner de dist/ (scripts/qa/seguranca.mjs) precisa detectar cada classe de vazamento (ADR-018). */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const rodar = (dist: string, env: Record<string, string> = {}) =>
  spawnSync(process.execPath, ['scripts/qa/seguranca.mjs'], { env: { ...process.env, DIST: dist, CEE_NOMES_PROIBIDOS: '', ...env }, encoding: 'utf8' });

describe('qa:seguranca', () => {
  it('aceita um dist limpo', () => {
    const d = mkdtempSync(join(tmpdir(), 'cee-dist-'));
    writeFileSync(join(d, 'index.html'), '<p>Contato: contato@[PLACEHOLDER]. Taxa de 2026-10-20: 15,00 %.</p>');
    mkdirSync(join(d, 'documentos'));
    writeFileSync(join(d, 'documentos', 'relatorio.pdf'), '%PDF');
    const r = rodar(d);
    expect(r.status, r.stderr).toBe(0);
  });
  it('detecta e-mail, telefone, CPF, chaves, repositório, termos e arquivos proibidos', () => {
    const d = mkdtempSync(join(tmpdir(), 'cee-dist-'));
    const pat = 'ghp_' + 'a'.repeat(36);
    writeFileSync(join(d, 'index.html'), `fulano.tal@gmail.com (31) 99999-1234 123.456.789-09 ${pat} AKIA${'A'.repeat(16)}
      -----BEGIN OPENSSH PRIVATE KEY----- api_key="abcdefghijklmnop" https://github.com/jesusabc8/cee-site FGV Ana Exemplo`);
    writeFileSync(join(d, 'app.js.map'), '{}');
    writeFileSync(join(d, 'minuta.tex'), 'x');
    writeFileSync(join(d, 'anexo.pdf'), '%PDF');
    writeFileSync(join(d, '.env'), 'X=1');
    const r = rodar(d, { CEE_NOMES_PROIBIDOS: 'Ána Exemplo' });
    expect(r.status).toBe(1);
    for (const id of ['email', 'telefone', 'cpf', 'chave-github', 'chave-aws', 'chave-privada', 'api-key', 'repositorio', 'termo-proibido', 'nome-proibido', 'arquivo-proibido', 'pdf-fora-de-documentos']) {
      expect(r.stderr).toContain(`[${id}]`);
    }
    // O nome proibido não é impresso por extenso no log.
    expect(r.stderr).not.toContain('Ana Exemplo');
  });
});
