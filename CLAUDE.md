# CLAUDE.md — regras para sessões futuras

Sítio do **Centro de Estudos Econômicos (CEE)**, iniciativa estudantil. Fonte de verdade do conteúdo:
`docs/fuentes/CEE_PUCMinas_Proposta_v3.0.docx` (Proposta v3.0, documento de trabalho **não aprovado**).

## Regras de integridade (inegociáveis)
1. **Nada inventado.** Nenhuma cifra, pessoa, publicação, citação, métrica de impacto, logo ou depoimento fabricado.
   Conteúdo inexistente aparece como estado honesto ("Primeira edição prevista…") ou é omitido.
   Texto de exemplo leva `[PLACEHOLDER]` visível e é listado em `docs/PLACEHOLDERS.md`.
2. **Não é sítio oficial da PUC Minas.** Sem escudo, logotipo, cores institucionais nem o nome da Universidade
   no domínio, no `<title>` ou na marca. Menção apenas descritiva. Descargo no rodapé e em cada publicação.
   `config.useUniversityName` só vira `true` com autorização escrita (Proposta §8.5).
3. **Pessoas só com consentimento.** `equipe` exige `consentimento: true`; sem isso, não renderiza.
   Não nomear a docente consultada nem articuladores (Proposta, Anexo H, ponto 3).
4. **Dados rastreáveis.** Todo gráfico/tabela: fonte, código da série, data de extração, unidade, link para dado e código.
   Códigos verificados contra a API oficial e registrados em `data/CATALOGO.md`. Não verificado → `docs/PENDIENTES.md`, não publica.
   Nenhuma cifra da Proposta vai ao sítio (p. ex. a decomposição PTF tem discrepância não reconciliada: 4,24 p.p. vs 4,1 %).
5. **Privacidade (LGPD).** Sem cookies, sem analytics de terceiros, sem CDNs. Fontes autoalojadas. Sem formulários próprios.

## Decisões de conteúdo já tomadas
- Linhas A1, B1, C1: estado `prevista` (não `ativa`) até cumprirem §4.7. A2, B2, C2: `planejada`.
- Primeiro painel real: Conjuntura (A1). Pobreza (C1) e Crescimento (B1) aparecem "em institucionalização", sem cifras.
- `config.lancado = false` → noindex + robots Disallow + faixa "Versão preliminar".
- `config.showEvents = false` (critérios §5.4).

## Stack e convenções
- Astro 7 (estático), TypeScript estrito, MDX, Content Collections com Zod. CSS próprio com tokens (sem Tailwind).
- Gráficos: Observable Plot renderizado no build para SVG; tabela alternativa obrigatória.
- pt-BR na raiz, inglês em `/en/` com os mesmos slugs. Strings de interface em `src/i18n/`.
- Links internos sempre via `href(path, lang)` de `src/i18n/routing.ts` (respeita `base` e língua).
- Dados brutos em `data/raw/` são imutáveis; tudo derivado vem de script.
- Commits pequenos, em português ou inglês, mensagem no imperativo.

## Gráficos
- No máximo 3 séries, um único eixo y (nunca eixo duplo), paleta validada (`--c1..--c3`, ADR-007).
- Título descritivo; subtítulo com número só se gerado do dado (`src/lib/conjuntura.ts`). Sempre tabela alternativa e CSV.
- Novas séries: verificar nos metadados oficiais e registrar `verificacao` em `scripts/data/series.ts`.

## Comandos
- `npm ci` · `npm run dev` · `npm run build` (inclui Pagefind) · `npm run check` · `npm run lint` · `npm test`
- `npm run data` (extração + processamento + catálogo + testes; requer rede)
- QA: `npm run qa:links`; `scripts/qa/axe.mjs`, `lighthouse.mjs`, `teclado.mjs`, `overflow.mjs` (com `npm run preview`)
- Neste ambiente de nuvem: `CHROMIUM_PATH=/opt/pw-browsers/chromium` e `CHROME_PATH=/opt/pw-browsers/chromium` para os scripts de QA;
  o `fetch` do Node precisa de `NODE_USE_ENV_PROXY=1` (já embutido em `npm run data:fetch`).

## Documentos
- `README.md` (como publicar), `CONTRIBUTING.md` (revisão em camadas), `docs/DECISIONES.md` (ADR), `docs/PENDIENTES.md`,
  `docs/PLACEHOLDERS.md`, `docs/LANCAMENTO.md` (checklist de lançamento), `docs/qa/` (evidência de QA).
