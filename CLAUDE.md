# CLAUDE.md — regras para sessões futuras

Sítio do **Centro de Estudos Econômicos (CEE)**, iniciativa estudantil. Fonte de verdade do conteúdo:
`docs/fuentes/CEE_PUCMinas_Proposta_v3.0.docx` (Proposta v3.0, documento de trabalho **não aprovado**).

## Regras de integridade (inegociáveis)
1. **Nada inventado.** Nenhuma cifra, pessoa, publicação, citação, métrica de impacto, logo ou depoimento fabricado.
   Conteúdo inexistente aparece como estado honesto ("Primeira edição prevista…") ou é omitido.
   Texto de exemplo leva `[PLACEHOLDER]` visível e é listado em `docs/PLACEHOLDERS.md`.
2. **Não é sítio oficial da PUC Minas.** Sem escudo, logotipo, cores institucionais nem o nome da Universidade
   no domínio, no `<title>` ou na marca. Menção apenas descritiva. Descargo no rodapé e em cada publicação.
   Exceção registrada (ADR-012): por pedido da coordenação, `useUniversityName: true` mostra o nome completo, só em texto,
   na faixa superior (`src/site.config.ts`), pendente de autorização escrita (Proposta §8.5); se negada, voltar a `false`.
3. **Pessoas só com consentimento.** `equipe` exige `consentimento: true`; sem isso, não renderiza.
   Não nomear a docente consultada nem articuladores (Proposta, Anexo H, ponto 3).
4. **Dados rastreáveis.** Todo gráfico/tabela: fonte, código da série, data de extração, unidade, link para dado e código.
   Códigos verificados contra a API oficial e registrados em `data/CATALOGO.md`. Não verificado → `docs/PENDIENTES.md`, não publica.
   Nenhuma cifra da Proposta vai ao sítio (p. ex. a decomposição PTF tem discrepância não reconciliada: 4,24 p.p. vs 4,1 %).
5. **Privacidade (LGPD).** Sem cookies, sem analytics de terceiros, sem CDNs. Fontes autoalojadas. Sem formulários próprios.

## Decisões de conteúdo já tomadas
- Linhas do ano 1 (A1, A2, B1, C1): estado `prevista` (não `ativa`) até cumprirem §4.7. Ano 2 (A3, B2, C2): `planejada`.
  O ano vem do campo `ano` de `linhas.yaml`/`paineis.yaml`; rótulos ("Previsto · ano N") e contagens são derivados, nunca escritos à mão.
- Observatório CEE — Economia Brasileira em Dados: três áreas (`src/data/areas.yaml`), painéis em `src/data/paineis.yaml`,
  cada um com a linha de mesmo código e mesmo nome (`src/data/linhas.yaml`). A2 Política Monetária = página
  `/observatorio/conjuntura/` (Edição 1.0; slug mantido). A1 Ciclo e Equilíbrios Macroeconômicos "previsto · ano 1" (sem
  página); B1 e C1 "em construção", sem cifras; A3 Política Fiscal, B2 e C2 "previsto · ano 2" (sem página). As lentes
  transversais são camadas dos painéis, não painéis. "Brasil em números" (portada) e "Panorama da economia brasileira"
  (resumo semanal, `/observatorio/panorama/`, em "Também no Observatório") são blocos distintos e não são painéis (ADR-016).
- `config.launched = false` (sem `CEE_LANCADO=1`) → noindex + robots Disallow.
- `config.showEvents = false` (critérios §5.4).

## Stack e convenções
- Astro 7 (estático), TypeScript estrito, MDX, Content Collections com Zod. CSS próprio com tokens (sem Tailwind).
- Gráficos: renderizador SVG próprio (`src/lib/viz/render.ts`), desenhado no build e redesenhado no navegador; ficha `ChartCard`; tabela alternativa obrigatória (ADR-010).
- pt-BR na raiz, inglês em `/en/` com os mesmos slugs. Strings de interface em `src/i18n/`.
- Links internos sempre via `href(path, lang)` de `src/i18n/routing.ts` (respeita `base` e língua).
- Dados brutos em `data/raw/` são imutáveis; tudo derivado vem de script.
- Commits pequenos, em português ou inglês, mensagem no imperativo.

## Gráficos
- No máximo 3 séries (exceção documentada: PIB per capita, ADR-010), um único eixo y (nunca eixo duplo), paleta azul `--c1..--c5`;
  a partir da 3ª série, codificação secundária obrigatória (traço, marcador, rótulo direto).
- Título descritivo; subtítulo com número só se gerado do dado (`src/lib/conjuntura.ts`, `src/lib/panorama.ts`). Sempre tabela alternativa e CSV.
- Novas séries: verificar nos metadados oficiais e registrar `verificacao` em `scripts/data/series.ts`.

## Comandos
- `npm ci` · `npm run dev` · `npm run build` (inclui Pagefind) · `npm run check` · `npm run lint` · `npm test`
- `npm run data` (extração + processamento + catálogo + testes; requer rede)
- QA: `npm run qa:links`; `scripts/qa/axe.mjs`, `lighthouse.mjs`, `teclado.mjs`, `larguras.mjs`, `movimento.mjs`, `interacao.mjs`,
  `frame.mjs` (capturas) — todos com `npm run preview`. Desenho: `docs/DESIGN.md`.
- Neste ambiente de nuvem: `CHROMIUM_PATH=/opt/pw-browsers/chromium` e `CHROME_PATH=/opt/pw-browsers/chromium` para os scripts de QA;
  o `fetch` do Node precisa de `NODE_USE_ENV_PROXY=1` (já embutido em `npm run data:fetch`).

## Documentos
- `README.md` (como publicar), `CONTRIBUTING.md` (revisão em camadas), `docs/DECISIONES.md` (ADR), `docs/PENDIENTES.md`,
  `docs/PLACEHOLDERS.md`, `docs/LANCAMENTO.md` (checklist de lançamento), `docs/qa/` (evidência de QA).
