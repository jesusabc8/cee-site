# Registro de QA

## Redesenho (2026-10-20)

| Verificação | Ferramenta | Resultado |
|---|---|---|
| Tipos, lint, testes | `npm run check`, `npm run lint`, `npm test` | 0 erros; sem problemas; 97 testes aprovados (inclui s*: 2,43 / 3,66 / ≈ 2,2 e o sinal da NFSP) |
| Links internos | `npm run qa:links` | 3066 links em 62 páginas, 0 quebrados |
| Acessibilidade automática | `scripts/qa/axe.mjs` (WCAG 2.2 AA + boas práticas) | 61 páginas × 2 temas: **0 violações** |
| Lighthouse (mobile, `CEE_LANCADO=1`) | `scripts/qa/lighthouse.mjs` | 96–100 nas quatro categorias, 6 páginas (`lighthouse/resumo.md`) |
| Larguras | `scripts/qa/larguras.mjs` | 14 rotas × 360/768/1024/1440/1920 px: sem rolagem horizontal |
| Teclado | `scripts/qa/teclado.mjs` | 1º Tab = "Pular para o conteúdo"; foco visível em 40/40 elementos (`teclado/`) |
| Interações | `scripts/qa/interacao.mjs` | tooltip, períodos, filtros, realce de legenda e abas do método (↑↓) funcionam; 0 erros no console |
| Movimento reduzido | `scripts/qa/movimento.mjs` | 25 blocos visíveis sem animação; linha do herói sem animação |
| JavaScript da página inicial | medição do build | ≈ 5,5 KB gzip (meta: < 60 KB) |
| Paleta de gráficos | validador de paleta (dataviz) | marinho × azul passa (ΔE 34–35); trios de azuis falham no piso de visão normal → codificação secundária obrigatória (ADR-010) |
| Comparação com a maquete | `scripts/qa/frame.mjs`, `scripts/qa/maquete.mjs` | `redesenho/maquete-vs-sitio-{1440,768,390}.png` |

Limites declarados: os mesmos da rodada anterior (abaixo) — sem leitor de tela real nem aparelho físico.

## Primeira versão — Fase 6 (2026-10-20)

Evidência gerada pelos scripts de `scripts/qa/`. Repetir antes de cada lançamento e anexar a data.

| Verificação | Ferramenta | Resultado | Evidência |
|---|---|---|---|
| Tipos | `npm run check` (astro check) | 0 erros, 0 avisos | saída do CI |
| Lint | `npm run lint` (ESLint + Stylelint) | sem problemas | saída do CI |
| Dados e esquema | `npm test` (Vitest) | 27 testes aprovados | `tests/` |
| Links internos (com âncoras) | `npm run qa:links` | 1881 links em 60 páginas, 0 quebrados; também com `BASE_PATH=/cee-site` | — |
| Acessibilidade automática | axe (WCAG 2.0/2.1/2.2 A e AA + boas práticas) | 59 páginas × tema claro e escuro: **0 violações** | `axe.txt` |
| Lighthouse (mobile, padrão) | Lighthouse 12, build com `CEE_LANCADO=1` | 99–100 em Performance, Acessibilidade, Boas práticas e SEO nas 6 páginas | `lighthouse/resumo.md` |
| Teclado | `scripts/qa/teclado.mjs` | 1º Tab = "Pular para o conteúdo" → `#conteudo`; ordem lógica; foco visível em todos os 40 primeiros elementos (3 páginas) | `manual/teclado-*.txt` |
| Árvore de acessibilidade | ARIA snapshot (Playwright) | marcos, títulos e rótulos coerentes | `manual/aria-*.yml` |
| Impressão / PDF | `page.pdf` com mídia `print` | sem navegação; título, metadados, corpo, limites, fontes e referências | `manual/impressao-*.pdf` |
| Celular (390 px) | capturas + verificação de rolagem horizontal | sem rolagem horizontal da página; gráficos com versão estreita (texto ≈ 12 px) | `scripts/qa/overflow.mjs` |
| Privacidade | busca no build | nenhum recurso de terceiros, nenhum cookie, "PUC Minas" ausente de `<title>` e da marca | — |
| Dependências | `npm audit --omit=dev` | 0 vulnerabilidades nas dependências publicadas | — |

## Limites desta rodada (declarados)

- **Leitor de tela real não foi usado.** O ambiente de desenvolvimento não tem NVDA, VoiceOver nem Orca. Foi inspecionada a
  árvore de acessibilidade (o que um leitor de tela recebe), mas o prompt pede "probar al menos una vez" com leitor de tela:
  **pendente** — fazer com NVDA (Windows) ou VoiceOver (macOS/iOS) antes do lançamento e registrar aqui.
- **Lighthouse do build preliminar**: com `lancado=false` todas as páginas têm `noindex` por decisão (ADR-003), e a
  categoria SEO cai por isso. A medição de SEO usa `CEE_LANCADO=1`, que só muda `robots`.
- **`npm audit` (dependências de desenvolvimento)**: há avisos moderados/altos na cadeia do Lighthouse
  (por exemplo, `extract-zip`), que roda só no CI e não é publicada.
- **Celular real**: testado em emulação (Chromium 390×844), não em aparelho físico.
