/**
 * Gera data/CATALOGO.md a partir de scripts/data/series.ts e do vintage mais recente
 * (mesma fonte da página /observatorio/catalogo/). Não edite CATALOGO.md à mão.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { SERIES } from './series.ts';

const vint = JSON.parse(await readFile('data/processed/conjuntura/vintage.json', 'utf8'));
const linhas = [
  '# Catálogo de dados e fontes',
  '',
  '> Gerado por `npm run data:catalogo` a partir de `scripts/data/series.ts`. Não edite à mão.',
  '> Toda série publicada foi verificada contra a fonte oficial; séries não verificadas ficam em `docs/PENDIENTES.md`.',
  '',
  '| Série | Código | Unidade | Frequência | Verificada em | Última extração | Cobertura |',
  '|---|---|---|---|---|---|---|',
  ...SERIES.map((s) => {
    const v = vint[s.id];
    return `| ${s.nome} | ${s.codigo} | ${s.unidade} | ${s.frequencia} | ${s.verificacao.data} | ${v ? v.extraido_em.slice(0, 10) + (v.desatualizado ? ' ⚠ falhou' : '') : '—'} | ${v ? `${v.primeiro} → ${v.ultimo}` : '—'} |`;
  }),
  '',
  ...SERIES.flatMap((s) => [
    `## ${s.id} — ${s.nome}`,
    '',
    `- **Instituição:** ${s.instituicao}`,
    `- **Código:** ${s.codigo}`,
    `- **Consulta pública:** ${s.url_publica}`,
    `- **Termos de uso:** ${s.licenca_fonte}`,
    `- **Verificação (${s.verificacao.data}):** ${s.verificacao.metodo}`,
    `- **Nome oficial retornado pela fonte:** ${s.verificacao.nome_oficial}`,
    ...(s.verificacao.observacoes ? [`- **Observações:** ${s.verificacao.observacoes}`] : []),
    `- **Requisições da extração:**`,
    ...s.requisicoes(new Date()).slice(0, 3).map((r) => `  - \`${r.url}\``),
    ...(s.requisicoes(new Date()).length > 3 ? [`  - … (${s.requisicoes(new Date()).length} requisições, uma por ano)`] : []),
    '',
  ]),
];
await writeFile('data/CATALOGO.md', linhas.join('\n'));
console.log('✓ data/CATALOGO.md');
