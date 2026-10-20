## O que este PR faz

<!-- Uma ou duas frases. Ligue a issue: "Fecha #N". -->

## Tipo

- [ ] Publicação nova (tipo: ______ ) · área/linha: ______
- [ ] Errata (publicação: ______ )
- [ ] Dados / Observatório
- [ ] Página institucional
- [ ] Código, design ou infraestrutura

## Integridade (todos os PRs)

- [ ] Nenhum número, nome, citação ou métrica inventado; texto provisório marcado com `[PLACEHOLDER]` e listado em `docs/PLACEHOLDERS.md`.
- [ ] Nenhum nome ou foto de pessoa sem `consentimento: true`.
- [ ] Nenhum recurso de terceiros (fontes, scripts, imagens, analytics) e nenhum cookie.
- [ ] Sem nome, escudo ou cores da PUC Minas como marca.

## Publicação: revisão em camadas

- [ ] Ficha de desenho analítico arquivada antes da análise (link: ______ )
- [ ] **Camada 1** — verificação numérica independente por: @______ (checklist do `CONTRIBUTING.md` no comentário)
- [ ] **Camada 2** — parecer docente arquivado (Nota Técnica e Working Paper)
- [ ] **Camada 3** — revisão editorial pelo Comitê Editorial: @______
- [ ] Fontes com código e data de extração; dados (CSV) e código linkados
- [ ] Declarações de IA e de conflitos preenchidas

## Errata

- [ ] Data de identificação e de publicação registradas (menos de 7 dias)
- [ ] Descrição, efeito sobre as conclusões e correção; versão incrementada

## Dados

- [ ] Série verificada contra metadados oficiais e registrada em `scripts/data/series.ts` (`verificacao`)
- [ ] `npm run data` executado; `data/CATALOGO.md` regenerado; testes de dados aprovados
