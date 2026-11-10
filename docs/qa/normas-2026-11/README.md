# QA — atualização às normas e segurança (branch `atualizacao-normas-seguranca`, 2026-11-10)

| Verificação | Resultado |
|---|---|
| `npm run check` | 0 erros, 0 avisos, 0 dicas |
| `npm run lint` (ESLint + Stylelint) | sem problemas |
| `npm test` (vitest 4.1.12) | 4 arquivos, 135 testes aprovados (inclui catálogo de produtos, modelos A–H e scanner de segurança) |
| `npm run build` | completo; único aviso: coleção `equipe` vazia (esperado) |
| `npm run qa:links` | 4.338 links internos em 76 páginas; 0 quebrados |
| `npm run qa:seguranca` | `dist/` limpo (lista de nomes vazia neste ambiente: preencher `docs/seguranca/nomes-proibidos.txt` / segredo `CEE_NOMES_PROIBIDOS`) |
| `npm audit --audit-level=high` | 0 vulnerabilidades altas ou críticas (9 moderadas em ferramentas de desenvolvimento) |
| axe (WCAG 2.2 AA), `scripts/qa/axe.mjs` | 75 páginas × 2 temas; 0 violações |
| Teclado, `scripts/qa/teclado.mjs` | `/`, `/pesquisa/`, `/sobre/`, `/publicacoes/`, `/observatorio/conjuntura/`, `/busca/`: 1º Tab no "Pular para o conteúdo"; 0 elementos sem foco visível em 40 Tabs |
| Cabeçalhos (`npx wrangler dev`) | 12/12 respostas (portada, busca, painel interativo, Panorama, publicações, demo, 404; pt e en) com CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP e X-Frame-Options — [`cabecalhos-wrangler-dev.txt`](cabecalhos-wrangler-dev.txt) |
| Redirecionamentos | 10/10 com 301 para o destino certo |
| CSP no navegador (Chromium, evento `securitypolicyviolation`) | 0 violações em 13 páginas; busca (Pagefind/WebAssembly) com 5 resultados na página e no modal; tooltip dos gráficos funcionando — [`csp-violacoes.json`](csp-violacoes.json) |
| gitleaks 8.30.1 | histórico (32 commits) e árvore sem vazamentos — [`gitleaks.md`](gitleaks.md) |
| Varredura de ausência em `dist/` | "Proposta v3.0", "Macrofundamentos", "github.com/jesusabc8", "FGV", "FIEMG", "GIEF": 0 — [`varredura-ausencias.txt`](varredura-ausencias.txt) |
| Lighthouse | não rodado neste ambiente; roda no CI (`quality.yml`) |

Capturas a 1440 px (JPEG): [`antes/`](antes/) (main, antes da branch) e [`depois/`](depois/): portada, pesquisa, programa A,
publicações, sobre, participe, metodologia, contato, privacidade e observatório.
