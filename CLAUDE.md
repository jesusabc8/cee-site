# CLAUDE.md — regras para sessões futuras

Sítio do **Centro de Estudos Econômicos (CEE)**, liga acadêmica estudantil do Curso de Ciências Econômicas.

## Fonte de verdade (ADR-017)
Atos normativos em minuta, em `docs/fuentes/normas/` (fora do repositório público; ver `.gitignore`), nesta ordem de precedência:
1. **Estatuto** (`estatuto_cee.tex`): missão (art. 4º), objetivos, princípios (art. 7º), governança, programas (arts. 35–36).
2. **Regimento Interno** (`regimento_cee.tex`): carreira N1–N5 (art. 8º), painéis (art. 23), agenda (art. 44),
   produtos (art. 45), fluxo editorial (art. 46), Anexo VI.
3. **Manual de Programas e Produtos** (`manual_cee.tex`): Parte I programas e perguntas; Parte II catálogo de produtos;
   Parte III modelos A–H.

Trabalhe a partir do texto dos `.tex`. Se o sítio divergir, prevalecem os documentos. Se os documentos não disserem algo,
não invente: registre em `docs/PENDIENTES.md`. A Proposta v3.0 está superada.

## Regras de integridade (inegociáveis)
1. **Nada inventado.** Nenhuma cifra, pessoa, publicação, citação, métrica de impacto, logo ou depoimento fabricado.
   Conteúdo inexistente aparece como estado honesto ("Primeira edição prevista…") ou é omitido.
   Texto de exemplo leva `[PLACEHOLDER]` visível e é listado em `docs/PLACEHOLDERS.md`.
2. **Não é sítio oficial da PUC Minas.** Sem escudo, logotipo, cores institucionais nem o nome da Universidade
   no domínio, no `<title>` ou na marca. O uso do nome exige autorização específica (Estatuto, art. 62).
   Exceção registrada (ADR-012): `useUniversityName: true` mostra o nome completo, só em texto, na faixa superior
   (`src/site.config.ts`), pendente de autorização; se negada, voltar a `false`. Aviso de responsabilidade do Manual
   em cada publicação e no rodapé.
3. **Pessoas só com consentimento.** `equipe` exige `consentimento: true`, `data_consentimento` e `revogado: false`;
   sem isso, não renderiza. Só nome, função e instância. Não nomear docentes nem cofundadores no sítio
   ("docentes tutores"; "um docente confirmado e dois convites em andamento").
4. **Dados rastreáveis.** Todo gráfico/tabela: fonte, código da série, data de extração, unidade e link para os dados
   (`/dados/`). Código: `codigo_url` público de replicação, ou "Código disponível mediante solicitação ao CEE".
   Códigos verificados contra a API oficial e registrados em `data/CATALOGO.md`. Não verificado → `docs/PENDIENTES.md`.
   Nenhuma cifra de B1 vai ao sítio (discrepância não reconciliada: 4,24 p.p. vs 4,1 %).
5. **Privacidade (LGPD).** Sem cookies, sem analytics de terceiros, sem CDNs. Fontes autoalojadas. Sem formulários próprios.
6. **Não mencionar** GIEF, FIEMG nem FGV como meta ou aspiração (a varredura final exige ausência em `dist/`).

## Segurança (inegociável; ADR-018)
- O repositório será **privado**; tudo o que o sítio serve continua público. Nada interno em `dist/`:
  `npm run qa:seguranca` falha o build com e-mails não institucionais, telefones, CPF, padrões de chave, `.map`, `.env`,
  `.tex`, `.docx`, `.pdf` fora de `/documentos/`, nomes da lista proibida (`docs/seguranca/nomes-proibidos.txt`,
  fora do git) e links para o repositório (`github.com/jesusabc8`).
- Publicação na Cloudflare (Workers com arquivos estáticos, `wrangler.jsonc`). Cabeçalhos em `public/_headers`
  (CSP sem `'unsafe-inline'` em `script-src`; Pagefind exige `'wasm-unsafe-eval'`); redirecionamentos 301 em
  `public/_redirects`. Nenhum slug público muda sem 301.
- GitHub Actions fixadas por SHA; `permissions: contents: read` por padrão; só `data-refresh` escreve e não vê os
  segredos da Cloudflare. Dependabot semanal; `npm audit --audit-level=high` e gitleaks no CI.
- Nunca: reescrever histórico, push forçado, apagar dados, mudar configuração de conta GitHub/Cloudflare sem
  autorização expressa do responsável.

## Arquitetura de pesquisa (Manual, Parte I; ADR-017)
- Seis programas + Transversal, em `src/data/programas.yaml` (fonte única): A Macroeconomia e Política
  Macroeconômica (subprogramas A.1 Política Monetária e Estabilidade Financeira, A.2 Política Fiscal e Dívida Pública);
  B Competitividade, Produtividade e Transformação Estrutural; C Desenvolvimento e Inclusão: Trabalho, Capital Humano,
  Pobreza e Desigualdade; D Economia Aberta e Inserção Internacional; E Instituições, Estado e Economia Política;
  F Energia, Clima e Recursos Naturais; T Transversal — Métodos e Dados. Lentes: Minas Gerais e Desenvolvimento
  Regional; Brasil Comparado. A, B, C e T ativos; D, E e F `em-formacao` (rótulo derivado de `situacao`).
- O Observatório CEE — Economia Brasileira em Dados é **produto**; seus painéis (`src/data/paineis.yaml`) seguem os
  programas e cada um tem a linha de mesmo código e nome (`src/data/linhas.yaml`). A2 Política Monetária = página
  `/observatorio/conjuntura/` (Edição 1.0; slug mantido). Programas em formação não têm painel.
- O ano vem do campo `ano`; rótulos ("Previsto · ano N") e contagens são derivados, nunca escritos à mão.
- "Brasil em números" (portada) e "Panorama da economia brasileira" (`/observatorio/panorama/`) não são painéis.

## Catálogo de produtos (Manual, Parte II; `src/schemas/publicacao.ts`)
DI Data Insight · NC Nota de Conjuntura · AC Avaliação de Conjuntura · RS Relatório Semestral de Conjuntura ·
NT Nota Técnica · TD Texto para Discussão · RP Relatório de Projeto · PB Policy Brief · BL Blog CEE · Relatório Anual.
Identificador `CEE-NT 2027/03 v1.0`. Recomendações só em NT, TD, RP e PB. Validações no build (ver o esquema).

## Stack e convenções
- Astro 7 (estático), TypeScript estrito, MDX, Content Collections com Zod. CSS próprio com tokens (sem Tailwind).
- Gráficos: renderizador SVG próprio (`src/lib/viz/render.ts`); ficha `ChartCard`; tabela alternativa obrigatória (ADR-010).
- pt-BR na raiz, inglês em `/en/` com os mesmos slugs. Strings de interface em `src/i18n/`.
- Links internos sempre via `href(path, lang)` de `src/i18n/routing.ts`.
- Dados brutos em `data/raw/` são imutáveis; tudo derivado vem de script.
- Commits pequenos, em português ou inglês, mensagem no imperativo.

## Gráficos
- No máximo 3 séries (exceção documentada: PIB per capita, ADR-010), um único eixo y, paleta azul `--c1..--c5`;
  a partir da 3ª série, codificação secundária obrigatória (traço, marcador, rótulo direto).
- Título descritivo; subtítulo com número só se gerado do dado. Sempre tabela alternativa e CSV.
- Novas séries: verificar nos metadados oficiais e registrar `verificacao` em `scripts/data/series.ts`.

## Comandos
- `npm ci` · `npm run dev` · `npm run build` (inclui Pagefind) · `npm run check` · `npm run lint` · `npm test`
- `npm run data` (extração + processamento + derivados + catálogo + testes; requer rede)
- QA: `npm run qa:links`, `npm run qa:seguranca`; `scripts/qa/axe.mjs`, `lighthouse.mjs`, `teclado.mjs`, `larguras.mjs`,
  `movimento.mjs`, `interacao.mjs`, `frame.mjs` — com `npm run preview`. Cabeçalhos: `npx wrangler dev`.
- Neste ambiente de nuvem: `CHROMIUM_PATH=/opt/pw-browsers/chromium` e `CHROME_PATH=/opt/pw-browsers/chromium`;
  o `fetch` do Node precisa de `NODE_USE_ENV_PROXY=1` (já embutido em `npm run data:fetch`).

## Documentos
- `README.md` (como publicar), `CONTRIBUTING.md` (revisão em camadas), `docs/DECISIONES.md` (ADR), `docs/PENDIENTES.md`,
  `docs/PLACEHOLDERS.md`, `docs/LANCAMENTO.md`, `docs/DESIGN.md`, `docs/modelos/` (modelos A–H), `docs/qa/`.
