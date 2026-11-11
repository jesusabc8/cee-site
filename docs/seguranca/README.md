# Segurança — arquivos locais (fora do git)

- `nomes-proibidos.txt` — **não versionado** (`.gitignore`). Um nome por linha (`#` comenta): pessoas que não podem
  aparecer no sítio (docentes, cofundadores e qualquer pessoa sem consentimento registrado em `src/data/equipe.yaml`).
  `npm run qa:seguranca` falha se algum deles aparecer em `dist/` (comparação sem acentos e sem diferenciar maiúsculas).
- No CI, a mesma lista vai no segredo `CEE_NOMES_PROIBIDOS` (um nome por linha), lido por `build-deploy` e `quality`.
  Sem lista, o script avisa e não executa essa verificação.
- O e-mail institucional aceito vem de `contato` em `src/site.config.ts` ou da variável `CEE_EMAIL_INSTITUCIONAL`.
