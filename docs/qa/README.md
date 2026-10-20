# Registro de QA — Fase 6 (2026-10-20)

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
