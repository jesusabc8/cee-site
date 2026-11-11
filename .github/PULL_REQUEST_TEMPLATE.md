## O que este PR faz

<!-- Uma ou duas frases. Ligue a issue: "Fecha #N". -->

## Tipo

- [ ] Publicação nova (série: ______ ) · programa e pergunta: ______
- [ ] Errata (publicação: ______ )
- [ ] Dados / Observatório
- [ ] Página institucional
- [ ] Código, design ou infraestrutura

## Integridade (todos os PRs)

- [ ] Nenhum número, nome, citação ou métrica inventado; texto provisório marcado com `[PLACEHOLDER]` e listado em `docs/PLACEHOLDERS.md`.
- [ ] Nenhum nome ou foto de pessoa sem `consentimento: true`.
- [ ] Nenhum recurso de terceiros (fontes, scripts, imagens, analytics) e nenhum cookie.
- [ ] Sem nome, escudo ou cores da Universidade como marca (Estatuto, art. 62).
- [ ] Nada interno ou pessoal em `dist/` (`npm run qa:seguranca`); nenhum segredo versionado.

## Publicação: fluxo editorial (Regimento, art. 46; Manual, Parte II)

- [ ] Proposta registrada junto ao Coordenador de Programa (issue: ______ )
- [ ] `identificador` no formato `CEE-NT 2027/03 v1.0`; programa e pergunta do Manual preenchidos
- [ ] Verificação numérica por pessoa distinta dos autores: @______ (relatório de conferência no repositório)
- [ ] Revisão editorial; parecer docente e parecer externo, quando exigidos pela série
- [ ] Lista de verificação do Anexo H completa; decisão do Comitê Editorial registrada: @______
- [ ] Fontes com código e data de extração; dados (CSV) linkados; `codigo_url` ou "disponível mediante solicitação"
- [ ] `declaracao_ia` e conflitos preenchidos

## Errata

- [ ] Data de identificação e do aviso registradas (aviso em até sete dias corridos)
- [ ] Descrição, efeito sobre as conclusões e correção; versão incrementada

## Dados

- [ ] Série verificada contra metadados oficiais e registrada em `scripts/data/series.ts` (`verificacao`)
- [ ] `npm run data` executado; `data/CATALOGO.md` regenerado; testes de dados aprovados
