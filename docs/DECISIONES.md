# Registro de decisões (ADR curtos)

Formato: contexto → decisão → consequências. Nunca apagar; decisões revogadas recebem "Substituída por ADR-NNN".

## ADR-001 — Astro estático com CSS próprio (2026-10-20)
**Contexto.** Sítio institucional de leitura, com dados versionados, sem servidor e com meta Lighthouse ≥ 95.
**Decisão.** Astro 7 com saída 100 % estática, MDX e Content Collections (Zod). CSS próprio com tokens; sem Tailwind,
porque a tipografia editorial e as hairlines exigem controle fino e menos dependências facilitam a rotação de mantenedores.
**Consequências.** Quem mantém precisa saber CSS básico; os tokens em `src/styles/tokens.css` concentram as decisões visuais.

## ADR-002 — Repositório em conta pessoal, provisoriamente (2026-10-20)
**Contexto.** A Proposta (§6.4, §7.6) exige organização com ≥ 3 administradores. O proponente optou por começar em conta pessoal.
**Decisão.** Aceito como desvio temporário. A transferência para organização é item obrigatório do checklist de lançamento.
**Consequências.** GitHub redireciona URLs após transferência; `SITE_URL`/`BASE_PATH` do workflow devem ser revistos.

## ADR-003 — Versão preliminar não indexável (2026-10-20)
**Contexto.** A Proposta ainda não foi apresentada à coordenação do curso (§14, passos 1–3).
**Decisão.** `config.launched = false` (antes `lancado`): meta `noindex` e `robots.txt` com `Disallow: /`. A faixa "Versão preliminar" foi substituída pela faixa institucional no redesenho (ADR-012).
**Consequências.** O sítio é acessível por link, mas não aparece em buscadores até a mudança deliberada da bandeira.

## ADR-004 — Linhas como "prevista", não "ativa" (2026-10-20)
**Contexto.** §4.7 exige, para abrir uma linha, três integrantes, docente de referência e produto comprometido. Nenhuma linha cumpre hoje.
**Decisão.** Estado adicional `prevista` no esquema; A1, B1, C1 = prevista (ano 1); A2, B2, C2 = planejada (ano 2).
**Consequências.** Mudar para `ativa` exige registro aqui e cumprimento verificável dos critérios.

## ADR-005 — Proposta fora do repositório público (2026-10-20)
**Contexto.** A Proposta v3.0 é documento de trabalho não aprovado, com informações sobre conversas internas e estruturas do curso.
**Decisão.** O `.docx` não é versionado (`.gitignore`); o repositório guarda apenas `docs/fuentes/README.md`. As páginas citam as seções usadas.
**Consequências.** Após a aprovação, pode-se publicar a versão aprovada aqui e na página "Sobre".

## ADR-006 — IPCA a partir do IBGE (SIDRA), não do SGS (2026-10-20)
**Contexto.** O IPCA cheio não foi localizado com código SGS no catálogo de dados abertos do BCB, o que impediria registrar a verificação do código.
**Decisão.** Usar o produtor primário: SIDRA, tabela 1737, variáveis 63 e 2265, verificadas pelo endpoint de metadados.
**Consequências.** Uma fonte a menos para divergir; a regra "verificar antes de usar" fica cumprida com evidência registrada.

## ADR-007 — Paleta de gráficos com no máximo 3 séries (2026-10-20)
**Contexto.** A paleta inicial (marinho + Okabe-Ito) falhou no validador de paleta: o marinho fica fora da faixa de luminosidade e abaixo do croma mínimo para uma série categórica.
**Decisão.** Três séries validadas em todos os pares, nos modos claro e escuro (ΔE para daltonismo ≥ 9,2; visão normal ≥ 20,9). A terceira cor tem contraste 2,8:1 no modo claro e por isso exige rótulo direto e tabela, que todos os gráficos têm. O marinho segue como cor de interface, não de dados.
**Consequências.** Gráficos com mais de 3 séries devem ser divididos (pequenos múltiplos). O componente lança erro se receber mais de 3.

## ADR-008 — Gráficos SVG no build, em duas larguras (2026-10-20) — substituída pela ADR-010
**Contexto.** Desempenho (Lighthouse ≥ 95), funcionamento sem JavaScript e legibilidade no celular.
**Decisão.** Observable Plot renderizado no build (linkedom) para SVG estático, em duas larguras (720 e 400 px), trocadas por CSS. JavaScript só para seletor de período e tooltip. Sem eixo duplo.
**Consequências.** Mudança de dados exige novo build (o workflow de dados já dispara o deploy).

## ADR-009 — Meta Selic sem datas futuras (2026-10-20)
**Contexto.** A API do SGS devolve, para a série 432, valores de datas posteriores à consulta (até a próxima reunião do Copom).
**Decisão.** O processamento descarta datas posteriores à extração; um teste garante que nenhuma série processada tenha observação futura.
**Consequências.** O valor mensal é o vigente no último dia disponível do mês até a data de extração.

## ADR-010 — Renderizador SVG próprio e paleta azul com codificação secundária (2026-10-20)
**Contexto.** O redesenho pediu gráficos no padrão de organismos internacionais (Banco Mundial, OCDE, FMI), interativos, em paleta exclusivamente azul. O Observable Plot gerava SVG em larguras fixas e dependia de linkedom, d3 e de um segundo componente para a interação.
**Decisão.** Renderizador isomórfico próprio (`src/lib/viz/render.ts`): o mesmo código desenha o SVG no build e o redesenha no navegador na largura real do contêiner (`src/lib/viz/client.ts`). Ele tem grade horizontal fina, um único eixo y, marcas 1-2-5, rótulos diretos, faixas de projeção, tooltip com cursor, períodos em *tablist* e realce pela legenda. A ficha (`ChartCard.astro`) traz fonte com código e extração, CSV, nota e tabela. Plot, d3 e linkedom foram retirados.
Paleta de dados: marinho `#0A2259`, azul `#3C8DCB`, aço `#4A7C96`, ardósia `#8AA4B3` e celeste `#C0E0F0`. Resultados do validador:
- **Par marinho × azul, o mais usado:** ΔE 34–35 para daltonismo e visão normal, contraste ≥ 3:1. Passa.
- **Trios e quartetos de azuis:** falham no piso de visão normal (o pior é aço × azul, ΔE 8,4) e no croma do aço e da ardósia. Por isso, toda série além da segunda exige **codificação secundária**: traço (contínuo, tracejado ou pontilhado), marcadores e rótulo direto no fim da linha, além de legenda e tabela.
- **Marinho fora da faixa de luminosidade** de paletas categóricas: aceito, porque é a cor da marca e tem o maior contraste.
**Exceção ao máximo de 3 séries (ADR-007).** O PIB per capita compara Brasil e cinco países (pedido explícito), no estilo do Banco Mundial: Brasil em marinho grosso, demais finos e esmaecidos, com rótulo direto, realce ao passar o cursor e tabela.
**Consequências.** Nenhuma dependência de visualização em produção; o JavaScript da página inicial fica em ≈ 5,5 KB gzip. Qualquer nova série deve declarar `dash`/`markers` se não for a primeira ou a segunda.

## ADR-011 — Janela do Focus, deduplicação de vintages e atualização semanal (2026-10-20)
**Contexto.** O Focus anual completo pesava 3,8 MB por extração; com extração diária, o repositório cresceria cerca de 1,4 GB por ano.
**Decisão.** O Focus anual é pedido numa janela de 120 dias (≈ 0,5 MB). Uma extração idêntica à anterior (mesmo SHA-256) não é gravada, e a PWT, estática, é baixada uma única vez e conferida contra o SHA-1 oficial do Dataverse. O workflow de dados roda às segundas-feiras às 12:30 UTC, depois da divulgação do Focus, e pode ser disparado à mão.
**Consequências.** As projeções do gráfico do IPCA e da dívida se atualizam sozinhas toda semana. Um dado divulgado em outro dia útil aparece na segunda seguinte.

## ADR-012 — Nome completo da Universidade na faixa institucional (2026-10-20)
**Contexto.** A coordenação pediu o nome "Pontifícia Universidade Católica de Minas Gerais" na faixa superior. A regra 2 do `CLAUDE.md` e a Proposta §8.5 pedem que, antes de autorização escrita, nada sugira chancela institucional.
**Decisão.** Implementado como pedido, com risco registrado:
- só texto, sem escudo, logotipo nem cores da Universidade;
- o nome não aparece no domínio, no `<title>` nem na marca;
- o descargo continua no rodapé e em cada publicação.
O texto vem de `src/site.config.ts` (`institutionalLine`, `useUniversityName`).
**Consequências.** Antes do lançamento, obter a autorização escrita (`docs/LANCAMENTO.md`). Se ela for negada, basta `useUniversityName: false` para retirar o nome.

## ADR-013 — Pobreza pela SIS e abertura comercial de bens no "Brasil em números" (2026-10-20) — abertura substituída pela ADR-019
**Contexto.** A coordenação pediu trocar as fichas "Juro real ex ante" e "Focus · IPCA" por pobreza (IBGE) e grau de abertura comercial (com a API do ComexStat). Os dois indicadores retirados continuam no gráfico "Selic meta e juro real ex ante" e no gráfico do IPCA.
**Pobreza.** Os indicadores ODS do SIDRA (tabelas 5817 e 5877) dão valores diferentes dos divulgados pelo IBGE: por exemplo, 26,5 % em 2024 contra 23,1 % na SIS. Além disso, a linha usada não está documentada na API. Por isso usa-se a **Síntese de Indicadores Sociais**, Tabela 2.18 (arquivo ODS oficial no FTP do IBGE), cujo cabeçalho declara a linha:
- **pobreza** = menos de US$ 6,85 PPC 2017 por dia; **extrema pobreza** = menos de US$ 2,15;
- os valores conferem com a Agência IBGE (2024: 23,1 % e 3,5 %);
- a URL é fixa por edição (`SIS_EDICAO` em `scripts/data/series.ts`) e precisa ser atualizada a cada nova edição anual. A SIS de 2026 deve adotar as linhas do Banco Mundial em PPC 2021, o que mudará o nível da série.
**Abertura comercial.** Fórmula: (exportações + importações de **bens**, US$ FOB, soma de 12 meses, ComexStat) ÷ PIB em US$ acumulado em 12 meses (SGS 4192) × 100.
- Não é o indicador do Banco Mundial (NE.TRD.GNFS.ZS), que inclui serviços e usa contas nacionais.
- O nome do SGS 4192 foi verificado no webservice do SGS; a série não está no catálogo CKAN.
**Consequências.**
- Os chips passam a "Trabalho e renda" (desocupação e pobreza).
- A API do ComexStat limita a frequência de consultas (HTTP 429): o extrator espera 11 s entre requisições e em cada nova tentativa. Se a cota não se recuperar, mantém-se o vintage anterior.

## ADR-014 — Arquitetura do Observatório: um observatório, três áreas, seis painéis (2026-10-27) — revisada pela ADR-015
**Contexto.** A coordenação aprovou a nova arquitetura e os novos nomes do Observatório.
**Decisão.**
- Título: "Observatório CEE — Economia Brasileira em Dados" (EN "CEE Observatory — Brazilian Economy in Data").
- A página é organizada por área (A, B, C), com nome, pergunta-guia e os cartões dos painéis.
- Painéis do ano 1: A1 Conjuntura e Política Monetária (Edição 1.0); B1 Crescimento e Produtividade e C1 Pobreza, Renda e Desigualdade, ambos em construção.
- Painéis do ano 2: A2 Finanças Públicas e Dívida, B2 Tecnologia e Capacidade de Absorção e C2 Trabalho e Informalidade. Têm estado `previsto-ano2` e aparecem só como cartão, sem página, sem rota e sem imagem OG.
- Os nomes e as perguntas-guia das áreas foram atualizados em `areas.yaml`, que também alimenta Pesquisa, a portada e o rodapé.
- Os slugs (`conjuntura`, `crescimento`, `pobreza`) não mudaram, portanto não há redirecionamentos.
- O cartão "Panorama da economia brasileira" (resumo semanal) saiu do topo da grade, onde se lia como um painel a mais. Agora fica em "Também no Observatório", junto do Catálogo, sem o rótulo "Painel". Os gráficos e cálculos não mudaram.
**Consequências.** Os nomes das linhas de pesquisa (`linhas.yaml`) continuam diferentes dos nomes dos painéis com o mesmo código, por exemplo a linha A1 "Atividade, inflação e política monetária" e o painel A1 "Conjuntura e Política Monetária". A coordenação precisa decidir se unifica os nomes (ver `docs/PENDIENTES.md`).

## ADR-015 — Área A com três painéis; linhas e painéis com o mesmo nome (2026-10-27) — atribuição da Edição 1.0 revista pela ADR-016
**Contexto.** A coordenação dividiu a área A em três painéis e decidiu que linha e painel com o mesmo código têm o mesmo nome.
**Decisão.**
- Área A: A1 Ciclo e Equilíbrios Macroeconômicos (ano 1), A2 Política Monetária e A3 Política Fiscal (previstos · ano 2).
- O antigo painel A2 "Finanças Públicas e Dívida" passa a ser A3 "Política Fiscal".
- O setor externo fica dentro de A1. A antiga linha candidata "A3 setor externo e câmbio" não é publicada.
- No total são 3 áreas e 7 painéis.
- Em `linhas.yaml`, a antiga linha A1 "Atividade, inflação e política monetária" foi dividida, sem texto novo:
  - as perguntas e métodos sobre o ciclo ficam em A1;
  - os sobre inflação, expectativas e juro real passam a A2;
  - a antiga linha A2 "Política fiscal e dívida pública" passa, sem alteração de conteúdo, a A3.
- As demais linhas adotam o nome do painel: B1 Crescimento e Produtividade, B2 Tecnologia e Capacidade de Absorção, C1 Pobreza, Renda e Desigualdade, C2 Trabalho e Informalidade.
**Consequências.** A página `/observatorio/conjuntura/` (Edição 1.0, mesmo slug e conteúdo) fica provisoriamente sob A1, com o título "A1. Ciclo e Equilíbrios Macroeconômicos". O conteúdo dela é de política monetária. A coordenação decide se passa à A2 antes de publicar (`docs/PENDIENTES.md`).

## ADR-016 — Edição 1.0 passa a A2; anos derivados dos dados; Panorama mantido (2026-10-27)
**Decisão.**
- **Edição 1.0 em A2.** A edição 1.0 de `/observatorio/conjuntura/` passa ao painel **A2 Política Monetária**: três de seus quatro gráficos são de inflação, política monetária e expectativas.
  - O slug `conjuntura`, os gráficos, as séries, a metodologia e os arquivos arquivados não mudam.
  - Título, citação, metadados e imagem OG leem "A2. Política Monetária".
  - A2 e sua linha passam ao ano 1.
- **A1 sem edição.** A1 Ciclo e Equilíbrios Macroeconômicos fica "previsto · ano 1", sem página.
- **Distribuição por ano.** Ano 1: A1, A2, B1, C1. Ano 2: A3, B2, C2.
- **Anos e contagens derivados.** `paineis.yaml` e `linhas.yaml` têm o campo `ano`. `StatusTag` monta "Previsto · ano N" / "Prevista (ano N)" a partir dele. As contagens do sítio também saem dos dados: áreas e painéis na página do Observatório, linhas do ano 1 em Pesquisa.
- **Pergunta-guia da linha A1:** "Onde está a economia no ciclo e quão sustentáveis são seus equilíbrios internos e externos?". Sem métodos nem fontes sobre o setor externo até que os indicadores sejam definidos.
- **Panorama.** O nome definitivo do resumo semanal é "Panorama da economia brasileira". Fica em "Também no Observatório", com a etiqueta "Atualização semanal". Continua distinto de "Brasil em números" (portada).
**Consequências.**
- A regra "Capacidade primeiro" em Pesquisa passa a listar as quatro linhas do ano 1 (antes, três na Proposta).
- Os gráficos do Panorama poderão ser redistribuídos entre A1, A2 e A3 à medida que esses painéis forem publicados.

## ADR-017 — Substituição da Proposta v3.0 pelo Estatuto, Regimento e Manual; seis programas; Observatório como produto (2026-11-09)
**Contexto.** A coordenação substituiu a Proposta v3.0 por três atos normativos em minuta: o Estatuto do CEE, o Regimento Interno e o Manual de Programas e Produtos.
**Decisão.**
- **Fonte de verdade**, nesta ordem: Estatuto > Regimento > Manual. As fontes ficam em `docs/fuentes/normas/` e fora do git até o repositório ser privado. Divergência sítio × documentos: prevalecem os documentos. Lacuna: registrar em `PENDIENTES`, sem inventar.
- **Arquitetura** (Manual, Parte I):
  - seis programas (A–F), mais o Transversal (T), em `src/data/programas.yaml`, que substitui `areas.yaml`;
  - A, B, C e T estão ativos; D, E e F, em formação, e o rótulo deriva de `situacao`;
  - lentes: Minas Gerais e Desenvolvimento Regional; Brasil Comparado;
  - "Instituições e Capacidade do Estado" deixa de ser lente e vira o programa E.
- **Observatório.** É um produto; seus painéis seguem os programas (Quadro 1):
  - A1–A4, B1–B2 e C1–C3;
  - D1, D2, E1 e F1 não são criados enquanto o programa estiver em formação;
  - A2 continua sendo `/observatorio/conjuntura/` (Edição 1.0).
- **Catálogo de produtos** (Manual, Parte II):
  - DI, NC, AC, RS, NT, TD, RP, PB, BL e Relatório Anual, com identificador `CEE-XX AAAA/NN vN.N`;
  - Working Paper passa a Texto para Discussão, com 301 de `/publicacoes/tipo/working-paper/`;
  - Replicação e Edição especial saem do catálogo, porque não havia publicação real desses tipos.
- **Carta de Princípios.** Retirada, com 301 para `/sobre/`, por estar superada pelo Estatuto (art. 7º).
**Consequências.**
- O esquema de publicações aceita `area` a–f e `transversal`, `linha` A–F e o campo `pergunta` (código do Manual).
- As páginas Sobre, Governança, Participe, Metodologia, Contato e Privacidade foram reescritas a partir dos `.tex`.

## ADR-018 — Repositório privado, publicação na Cloudflare e endurecimento de segurança (2026-11-10)

**Contexto.** O repositório (com histórico, minutas e dados pessoais em metadados de commit) estava público e o sítio no
GitHub Pages, sem controle de cabeçalhos. O sítio continua público; o repositório passará a privado.

**Decisão.**
- Publicação em **Cloudflare Workers com arquivos estáticos** (`wrangler.jsonc`, `assets.directory ./dist`,
  `not_found_handling 404-page`), pelo workflow `build-deploy` com `cloudflare/wrangler-action`. As ações do GitHub Pages
  foram retiradas, mas o Pages **não** foi desativado: o responsável o desativa depois de testar a URL `*.workers.dev` e
  tornar o repositório privado (`docs/LANCAMENTO.md`).
- **Cabeçalhos** em `public/_headers` (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, X-Frame-Options) e
  **301** em `public/_redirects`. A CSP não tem `'unsafe-inline'` nem hashes: o build não gera nenhum script, estilo ou
  manipulador inline (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`; cores de legenda e barras em atributos SVG;
  cores dinâmicas do tooltip via CSSOM). O `security.csp` nativo do Astro 7 existe, mas entrega a política em `<meta>` com
  hashes; somado à política do cabeçalho, exigiria manter as duas em sincronia — por isso a opção por externalizar tudo.
  `'wasm-unsafe-eval'` fica por causa do Pagefind. Verificação: `docs/qa/normas-2026-11/` (zero violações).
- **Nada interno em `dist/`:** `npm run qa:seguranca` (e-mails, telefone, CPF, chaves, arquivos proibidos, nomes da lista
  fora do git ou do segredo `CEE_NOMES_PROIBIDOS`, link para o repositório, GIEF/FIEMG/FGV), no CI e antes do deploy.
  Links para o repositório retirados; código de replicação por `codigo_url` ou "disponível mediante solicitação ao CEE".
- **Cadeia de dependências:** Actions fixadas por SHA; `permissions: contents: read` (só `data-refresh` escreve e não lê
  os segredos da Cloudflare, que ficam no environment `cloudflare`); Dependabot semanal; `npm ci --ignore-scripts`;
  `npm audit --audit-level=high` e gitleaks (binário oficial com SHA-256 fixado, sem serviço de licença) no CI.
  Para zerar os achados altos: vitest 4.1.12, lighthouse 13.6.0 (13 dias de publicado; mantido pelo Google e só usado no
  QA), `undici` 7.30.1 por `overrides` (dependência do wrangler) e retirada do `wait-on`. A instalação do vitest 4 exigiu o
  npm 11.21.1 (o npm 10.9.4 falha com `edgesOut` no resolvedor de peers); o lockfile v3 resultante funciona com o npm 10 do CI.

**Transição (2026-11-11).** Até a Cloudflare estar configurada, o `build-deploy` mantém um job `pages` (GitHub Pages, Actions
fixadas por SHA) para que o sítio no ar continue sendo atualizado; o job `cloudflare` só roda quando a variável `SITE_URL`
existir. Com `PAGES_ATIVO=false`, o job `pages` deixa de rodar. No Pages não há CSP nem 301 por cabeçalho (`_headers` e
`_redirects` são ignorados).

**Consequências.** A Cloudflare só publica depois que o responsável criar o token, os segredos e a variável `SITE_URL`. DOI por depósito direto no
Zenodo (a integração GitHub–Zenodo exige repositório público).

## ADR-019 — Abertura comercial pela Penn World Table 11.0 (2026-11-11)

**Contexto.** A coordenação pediu que a ficha "Abertura comercial" do "Brasil em números" passe a ser calculada com a
PWT 11.0. O cálculo anterior (ADR-013) **não estava errado**, mas media outro conceito: só **bens** (ComexStat, US$ FOB) sobre
o PIB em US$, mensal em 12 meses (2023: 26,5 %). O indicador usual de abertura (por exemplo, NE.TRD.GNFS.ZS do Banco Mundial)
inclui **bens e serviços** das contas nacionais.

**O que a PWT mede.** Na Legend, `csh_x` e `csh_m` aparecem como "Share of merchandise exports/imports at current PPPs", em
proporção do `cgdpo`, com `csh_m` negativo por convenção. O guia do usuário informa, porém, que exportações e importações vêm
das contas nacionais. A conferência numérica confirma: a razão recuperada para o Brasil em 2023 (33,7 %) é igual à das Contas
Nacionais Trimestrais do IBGE (SIDRA 1846: (1.966.445 + 1.717.767) / 10.943.344 = 33,67 %). Logo, a cobertura é de bens e
serviços, e o rótulo "merchandise" não descreve a cobertura.

**Decisão.**
- **Ficha:** abertura a preços correntes recuperada da PWT por identidade:
  `(csh_x × pl_x − csh_m × pl_m) / pl_gdpo × 100`, porque `csh_x = (X/PIB) × (pl_gdpo / pl_x)`.
  - Os níveis de preço se cancelam, de modo que o resultado não depende da extrapolação de `pl_x` e `pl_m` (`i_xm`
    "Extrapolated" desde 2016).
  - Série anual de 1950 a 2023; a ficha mostra 2023 e o minigráfico, 2014–2023.
- **Versão em PPC** (`csh_x − csh_m`; 2023: 28,2 %): vai só no CSV, como coluna `abertura_ppc`. Não é o indicador
  convencional.
  - Ela avalia o comércio pelos preços relativos de exportação e importação e o PIB pela PPC do produto. Por isso, mistura
    volume de comércio com nível de preços relativo do país.
  - Para a ideia de "abertura real", ver Alcalá e Ciccone (2004), *Quarterly Journal of Economics* 119(2).
- **Série anterior:** a série de bens do ComexStat continua derivada em `abertura_bens.csv`, sem exibição. As extrações não
  foram apagadas.

**Consequências.**
- A ficha perde atualidade: o último ano é 2023, ante set/2026 na série mensal de bens. A próxima atualização depende de
  uma nova versão da PWT.
- O nível sobe de cerca de 26 % para 34 %, porque passam a entrar os serviços e a fonte passa a ser
  as contas nacionais.

## ADR-020 — Câmbio real efetivo no cartão de câmbio do "Brasil em números" (2026-11-17)

**Decisão.** O cartão de câmbio da página inicial passa a mostrar o câmbio real efetivo (SGS 11752) em vez da PTAX
nominal, por medir competitividade externa e ser comparável no tempo. A PTAX permanece no Panorama
(`grafico-cambio`). Custo aceito: defasagem de cerca de dois a três meses.

**Série.** Índice da taxa de câmbio real efetiva (IPCA), jun/1994 = 100 (BCB/SGS 11752), mensal. Alta = depreciação real.
- Nome oficial conferido em 17/11/2026 na página pública de consulta do SGS, em português.
- A série não está no catálogo CKAN do BCB.
- A versão em inglês da mesma página traz "Jun/1994=101", erro de tradução do SGS.
- Não se usam as variantes bilaterais (11753 etc.), com outros deflatores ou a efetiva nominal (20360).

**Cartão.**
- Valor: o último índice, com uma casa.
- Variação em 12 meses: 100 × (I_m / I_{m−12} − 1), omitida se faltar I_{m−12}.
- Seta e texto de leitura próprios: ▲ = depreciação real ante o mês anterior.
- Vista detalhada: índice desde 2012, com a média do período inteiro como linha tracejada rotulada com o período. A
  linha não muda com o intervalo selecionado, porque o renderizador usa referências estáticas.

**Conferência.** Valores conferidos com a API do SGS:
- jul/2011 71,76. Fica fora do pipeline, que começa em 2012; conferido só na API.
- set/2015 129,34; mai/2020 149,83; ago/2025 127,44; jul/2026 119,67; ago/2026 123,23.
- Variação em 12 meses de ago/2026: −3,3 %.

## ADR-021 — Exceção temporária no npm audit para GHSA-fc5q-39xc-vjpf (picomatch) (2026-11-18)

**Contexto.** Desde 17/11/2026 o `npm audit --audit-level=high` falha em todos os PRs por um único aviso alto:
GHSA-fc5q-39xc-vjpf (picomatch ≤ 4.0.7, ReDoS em extglobs de ramo único, CVSS 7,5). Não há versão corrigida
publicada: a última é a 4.0.7. Os 23 pacotes "high" do relatório são todos efeitos desse mesmo aviso
(astro, vite, vitest, tinyglobby, fdir, anymatch, micromatch, stylelint e outros).

**Verificação do alcance (18/11/2026).**
- `npm ls picomatch`: só entra por astro/vite, @astrojs/internal-helpers, tinyglobby, fdir, unstorage→anymatch,
  stylelint→micromatch e vitest. São ferramentas de build, de desenvolvimento e de teste.
- `npm run build` seguido de busca em `dist/` por `picomatch`, `micromatch` e `POSIX_REGEX_SOURCE`: nenhuma ocorrência.
  O sítio é estático e não tem servidor, logo o código vulnerável não chega ao que se publica.
- O ataque exige padrões glob controlados por terceiros; no build os padrões vêm do próprio repositório.

**Decisão.**
- O passo de auditoria do CI passa a ser `npm run qa:audit` (`scripts/qa/audit.mjs`), equivalente a
  `npm audit --audit-level=high`. O nível não muda: qualquer aviso high ou critical falha, salvo exceção.
- A exceção, em `scripts/qa/audit-excecoes.json`, vale só para o ID GHSA-fc5q-39xc-vjpf e o pacote picomatch.
- **Vencimento:** 18/12/2026 ou a publicação de versão de picomatch fora do intervalo afetado, o que vier primeiro.
  O script consulta `npm view picomatch version` e, se a última versão corrigir o aviso, a exceção deixa de valer e o
  CI falha até a atualização.
- Qualquer outro aviso high ou critical continua a falhar o CI. Os testes estão em `tests/audit.test.ts`.

**Consequências.** O CI volta a ficar verde sem relaxar o critério geral. Ao vencer, ou se o aviso passar a atingir
`dist/`, a exceção é retirada: atualiza-se a dependência ou abre-se novo ADR.

## ADR-022 — Observatório de Política Monetária (OPM): edição 2.0 do painel A2 (2026-11-18)

**Fonte.** Especificação `CEE_Observatorio_Politica_Monetaria.tex` v1.1 (em `docs/fuentes/normas/`, fora do git), que
prevalece sobre qualquer instrução divergente. Divergências encontradas são registradas em `docs/PENDIENTES.md`.

**Decisão.**
- O painel A2 Política Monetária passa à **edição 2.0**, com o nome de produto "Observatório de Política Monetária"
  (OPM). Continua sendo um painel do Observatório CEE, ligado à linha A2 do Programa A (subprograma A.1).
- **Oito módulos:** A2.1 Decisões e comunicação do Copom; A2.2 Juro real, neutro e regras; A2.3 Inflação, grupos e
  núcleos; A2.4 Expectativas e credibilidade; A2.5 Transmissão (juros, crédito, câmbio, ativos e atividade);
  A2.6 Ambiente externo e fiscal; A2.7 Projeções e cenários; A2.8 Moeda, reservas bancárias e agregados.
- **21 indicadores (I.1–I.21)**, com fórmula pública num único arquivo-fonte (`src/data/opm/indicadores.yaml`), de onde
  saem as fichas e as fórmulas em MathML.
- **Três camadas de construção**, em três PRs empilhados:
  1. séries verificadas, indicadores diretos (I.1–I.5 com os métodos a e b de I.4, I.7, I.8, I.10, I.18–I.20) e
     dessazonalização;
  2. curvas NSS, filtros e estimação (I.4 c, I.6, I.9, I.11–I.13, I.15, I.21);
  3. pesquisa: I.4 d e e, I.14, I.16, I.17 e o modelo semiestrutural (A2.7). Leva o selo **"experimental"** até a
     revisão do Comitê Editorial e um Texto para Discussão em minuta (`docs/td/`).
- **Princípio.** O OPM descreve e mede; **não recomenda a Selic** nem diz o que o Copom deveria decidir. Juro neutro,
  hiatos e regras de Taylor aparecem sempre como **faixas**, com método e data. O valor do BCB vai ao lado da
  distribuição do CEE, nunca dentro dela.
- **Fronteiras.** A1 produz as séries de atividade, A3 as fiscais e A4 as de crédito. O OPM usa essas séries sem
  duplicá-las: o mesmo `id` em `scripts/data/series.ts` serve a todos (por exemplo, `cambio_real`, SGS 11752, ADR-020).
- **Código.** Cálculos simples em TypeScript (`scripts/data/opm/`, testes Vitest). Econometria em Python
  (`analysis/opm/`, dependências com hash, pytest), com saída em `data/processed/opm/`.

**Consequências.** O painel deixa de ser um conjunto de quatro gráficos e vira um produto com página por módulo,
calendário do Copom e conferência com o estado de partida (Anexo B). A edição 1.0 continua no changelog, e suas
quatro séries são mantidas nos módulos A2.1, A2.3, A2.4 e A2.5.

## ADR-023 — Dessazonalização pelo CEE com X-13ARIMA-SEATS (2026-11-18)

**Revoga** a regra da metodologia do painel A2 segundo a qual "nenhum valor é ajustado sazonalmente pelo CEE"
(especificação, seção "Dessazonalização").

**Decisão.**
- **Séries ajustadas:** as mensais cuja leitura de curto prazo depende do ajuste. São o IPCA, seus grupos analíticos e
  os núcleos, e os agregados monetários.
- **Método:** X-13ARIMA-SEATS do U.S. Census Bureau, **versão 1.1 build 62**.
  - Arquivo: `x13as_ascii-v1-1-b62.tar.gz`, binário estático Linux x86-64.
  - O arquivo é baixado de `www2.census.gov` com SHA-256 fixado:
    `a91d37bb2fef46237e1eadd7d9b4f1c00a422d58f6b286c9bfe485289e8ac6f5`.
  - O Census não publica soma de verificação. O hash foi registrado na primeira descarga, em 18/11/2026, e qualquer
    mudança no arquivo interrompe o pipeline.
  - **Por que não o pacote R `seasonal`:** chama o mesmo binário (via `x13binary`) e traria um segundo ambiente (R)
    ao CI. Em Python, o `statsmodels` só gera a especificação e lê a saída, e o binário é o mesmo.
- **Especificação por série** em `data/specs/x13/<serie>.yaml`:
  - transformação;
  - modelo ARIMA, ou seleção automática registrada;
  - regressores de calendário: dias úteis e Carnaval, este como regressor de usuário;
  - *outliers*;
  - testes de sazonalidade residual (QS e espectro).
  - A especificação é reavaliada uma vez por ano.
- **Variações percentuais** (IPCA e componentes): o ajuste é feito no número-índice encadeado, e a variação é
  recalculada a partir do índice ajustado.
- **Não se reajusta** o que a fonte já publica dessazonalizado: IBC-Br (SGS 24364) e PIB (SIDRA 5932/1621).

**Publicação.**
- A série original aparece **sempre** ao lado da ajustada: seletor na página e as duas colunas no CSV.
- Nenhuma série ajustada pelo CEE é apresentada como oficial. O rótulo é "dessazonalizado pelo CEE (X-13)".
- As revisões da série ajustada a cada novo dado são esperadas. Ficam registradas por safra, em
  `data/processed/opm/safras/`, com a data da estimação.

**Validação** (especificação, seção "Dessazonalização"). O SAAR de três meses até ago/2026 deve aproximar o do BCB
(RPM set/2026, p. 35): IPCA 2,9 % e média dos núcleos 3,9 %; em maio, 7,2 % e 5,4 %. A tolerância é de 0,5 p.p.;
acima disso, a especificação é explicada antes da publicação.

**Consequências.** O texto de metodologia do A2 (`src/data/paineis.yaml`) muda. O CI passa a depender de um binário
externo de versão fixa.

## ADR-024 — Exclusão temporária de dados com restrição de redistribuição (2026-11-18)

**Decisão.** Ficam fora do sítio, do repositório e do pipeline, até licença escrita que permita uso e publicação:
- futuros de DI1 (B3);
- estrutura a termo da ANBIMA (ETTJ e IMA);
- EMBI e EMBI+ (J.P. Morgan);
- NUCI e demais sondagens da FGV;
- CDS soberano (qualquer provedor);
- índice Bovespa (B3);
- qualquer fonte de licença duvidosa até ser verificada.

Nas séries do FRED, a licença é conferida **série a série**. Série com aviso de *copyright* de terceiros (por exemplo,
VIXCLS, da Cboe, ou índices ICE BofA) não entra sem licença. O mesmo vale para as estimativas HLW do Federal Reserve de
Nova York, que só entram depois de conferidos os termos de uso.

**Consequências** (especificação, seção "Construção").
- As curvas de juros nominal e real usam os dados abertos do **Tesouro Direto** (Tesouro Transparente).
- A surpresa de política monetária (I.5) é medida pela **Focus**. A medida de mercado de Kuttner (2001), com DI de
  um mês, fica para pesquisa licenciada.
- O método (d) do juro neutro usa só o juro real americano (TIPS de cinco anos, DFII5, ou HLW). Sem medida aberta de
  risco soberano, é mostrado **sem prêmio de risco**, com essa limitação explícita, ou omitido.
- O índice de condições financeiras (I.17) só usa componentes abertos.

**Reentrada.** Cada fonte excluída só volta com licença escrita arquivada pela coordenação e um ADR novo. Ainda assim, o
produto publicado mostra apenas os resultados agregados que a licença permitir.

## ADR-025 — Dados em tempo real: safras da Focus e dos insumos (2026-11-18)

**Contexto.** Hiatos, taxas neutras e regras de política avaliados com dados revisados atribuem ao banco central uma
informação que ele não tinha (Orphanides, 2001, *AER* 91(4)).

**Decisão.**
- Toda extração continua arquivada sem alteração em `data/raw/<fonte>/<id>/<data>/`, com URL, data e hora e SHA-256.
  É a regra atual, que passa a valer também para a Focus, o Tesouro Direto, o FRED e os textos do Copom.
- O OPM monta uma **tabela de safras** (`data/processed/opm/safras/`): para cada data de edição, o valor de cada insumo
  tal como conhecido naquela data. A Focus já é uma série em tempo real (data da coleta × horizonte). PIB, IBC-Br e as
  séries revisáveis do SGS acumulam safras a partir de agora: o arquivo anterior a esta data não permite reconstruir
  as revisões passadas, e isso é declarado.
- Indicadores que dependem de estimação (filtros, hiato, neutro, regras) são calculados **com os dados de cada data**
  e guardados por safra. O gráfico mostra a última estimativa; o CSV traz a estimativa em tempo real de cada data.
- A surpresa (I.5) usa a **última coleta Focus anterior** à reunião, nunca uma posterior.

**Consequências.** O volume de `data/raw/` cresce a cada atualização (texto comprimível, da ordem de MB por mês).
Nenhuma safra é apagada (CLAUDE.md, "Dados brutos em `data/raw/` são imutáveis").

## ADR-026 — Slug `/observatorio/politica-monetaria/` com 301 a partir de `/observatorio/conjuntura/` (2026-11-18)

**Decisão.**
- O painel A2 muda de `id` (`conjuntura` → `politica-monetaria`), e com ele o slug público, em português e em inglês.
  Encerra o item correspondente de `docs/PENDIENTES.md`.
- Redirecionamentos 301 em `public/_redirects`, com e sem barra final e com `:splat` para subpáginas:
  - `/observatorio/conjuntura/` → `/observatorio/politica-monetaria/`;
  - `/en/observatorio/conjuntura/` → `/en/observatorio/politica-monetaria/`.
- Cada módulo tem página própria em `/observatorio/politica-monetaria/<modulo>/` (por exemplo, `a2-3-inflacao/`).
- **Safras acessíveis.** A página `/observatorio/politica-monetaria/safras/` lista as extrações arquivadas que
  alimentam o OPM: série, data, hash e link para o CSV em `/dados/`. O changelog do painel preserva a edição 1.0.
- O diretório de dados derivados `data/processed/conjuntura/` é mantido. Mudar o caminho dos CSV publicados em
  `/dados/` quebraria citações. Os novos CSV vão para `data/processed/opm/`.

**Consequências.** Links internos passam a usar o novo slug via `href()`. O GitHub Pages (transitório) não lê
`_redirects`; o 301 só vale na Cloudflare. Enquanto isso, uma página de transição em `/observatorio/conjuntura/`
(meta refresh e `rel=canonical`, sem JavaScript) aponta para o novo endereço.

## ADR-027 — Camada 2 do OPM: curvas, filtros e estimação (2026-11-18)

**Decisão.** A camada 2 publica I.4 (c), I.6, I.9, I.11, I.12 (longo prazo), I.13 e I.15. Seguem em construção o curto
prazo de I.12 (Araujo e Vicente, 2017) e I.21 (alíquota efetiva dos compulsórios).

**Convenções declaradas.**
- **Curvas (I.12, I.4 c):**
  - Fonte: Tesouro Direto (Tesouro Transparente, ODbL; as curvas do CEE são base derivada sob ODbL).
  - Títulos sem cupom (LTN e NTN-B Principal), taxa de compra da manhã, que inclui o spread do Tesouro Direto.
  - Prazo em dias úteis/252.
  - Modelo: Nelson-Siegel-Svensson com 7 ou mais títulos; Nelson-Siegel com menos.
  - Ajuste: grade de λ com β por MQO, sem extrapolar além do prazo máximo + 6 meses.
  - NTN-B a menos de 6 meses do vencimento ficam fora, por causa da defasagem de indexação.
  - Erro médio absoluto publicado por data (mediana de 0,6 bp).
- **I.4 (c):** NTN-B de 10 anos menos [NTN-B de 4 anos − juro real Focus médio dos anos t+1…t+4], este pela média
  geométrica de Fisher das medianas anuais da Selic e do IPCA.
- **I.15:**
  - Trimestral: HP unilateral (λ = 1.600) e Hamilton (h = 8, p = 4) sobre o PIB dessazonalizado pelo IBGE (SIDRA 1621).
  - Mensal: o mesmo sobre o IBC-Br (λ = 129.600; h = 24, p = 12).
  - Faixa: mínimo e máximo entre os métodos.
- **I.6:**
  - T3 estimada por MQO em 2012–2019 (antes da pandemia e da meta contínua).
  - θ ≈ 0,96 torna φ = b/(1 − θ) muito impreciso, o que se declara na ficha.
  - O envelope cobre os quartis de r* e o mínimo e o máximo do hiato mensal.
  - O envelope é referência descritiva, nunca prescrição.
- **I.11:** X-13 (airline, sem regressores) por subitem do SIDRA 7060.
  - Subitens em que o ajuste falha ficam fora: 20 de 377 em 18/11/2026.
  - A parcela é calculada sobre o peso coberto, que é publicado (cerca de 92 %).
- **I.13:** projeções locais mensais com três defasagens de Δℓ e Δi e erros de Newey-West. É associação condicional, não
  efeito causal; o resultado vai em tabela, porque o eixo é o horizonte, não o tempo.

**Consequências.** O pipeline Python passa a rodar `curvas → neutro → hiato → taylor → repasse → subitens` depois dos
indicadores em TypeScript (`npm run data:neutro`). O arquivo do Tesouro Direto (cerca de 15 MB, crescendo por cima) é
guardado inteiro a cada safra; o git armazena as versões por delta.

## ADR-028 — Camada 3 do OPM: indicadores experimentais e critério de publicação (2026-11-18)

**Decisão.**
- **I.16** (prêmio a termo, ACM) e **I.17** (condições financeiras, PCA) são publicados com selo "experimental" visível
  na ficha e no gráfico. Ficam assim até a revisão do Comitê Editorial e vêm acompanhados da minuta
  `docs/td/CEE-TD-2026-01-v0.1-minuta.md`.
- **I.4 (d)** (TIPS de 5 anos) é mostrado à parte e **fora da faixa**. Sem medida aberta de risco soberano (ADR-024), não
  estima o neutro brasileiro.
- **I.4 (e) e cenários do A2.7** só vão ao sítio se o modelo semiestrutural passar num critério mínimo de identificação.
  - O critério é a inclinação da IS com t ≤ −2 e o coeficiente do hiato positivo na curva de Phillips.
  - Em 18/11/2026 não passou (t = −0,47; coeficiente −0,03). O sítio mostra só os coeficientes e o motivo; os cenários
    e o neutro do modelo ficam em `docs/td/dados/`, fora de `/dados/`.
  - O critério é verificado automaticamente a cada atualização.
- **I.14** (tom) não é publicado sem dupla codificação humana com kappa de Cohen ≥ 0,6.
  - Léxico, corpus, amostra de 210 frases e cálculo do kappa estão prontos em `docs/td/i14/` e
    `analysis/opm/tom.py`.

**Justificativa.** Publicar números de um modelo cujo canal principal (juro → hiato) não é identificado induziria
leitura econômica sem base. O selo "experimental" não substitui um critério mínimo de qualidade.

## ADR-029 — Reconciliação da faixa de juro neutro, textos gerados e sistema visual de publicação (2026-11-18)

### 1. Reconciliação (6,16–7,81 % × 6,30–7,13 %)

**Causa.**
- **Mesma safra, conjuntos de métodos diferentes.** As duas faixas vêm da safra de 18/11/2026 (dado de nov./2026).
- **6,16–7,81 %:** faixa da **camada 1**, com 3 métodos: (a) Focus t+4 5,88 %, (b) HP unilateral 9,19 % e (b) Hamilton
  6,44 %. Com três estimativas, Q1 e Q3 são pontos médios.
- **6,30–7,13 %:** faixa da **camada 2**, que acrescenta (c) NTN-B longa (6,44 %). Com 4 métodos, Q1 e Q3 se estreitam.
- A mediana (6,44 %) é a mesma por coincidência: o valor de (c) quase iguala o de Hamilton.
- **Por que a página e o relatório divergiram.** Os PR #15 e #16 foram integrados em ramos intermediários
  (`observatorio-politica-monetaria` e `opm-camada-2`) e não em `main`. O sítio publicado a partir de `main` mostra a
  camada 1 (3 métodos), enquanto o relatório citava a camada 2 (4 métodos).

**Decisão.**
- O subtítulo da ficha passa a nomear os métodos usados em cada data: "(a) Focus t+4, (b) HP, (b) Hamilton, (c) NTN-B".
- A mediana da faixa vai para a tabela e para o CSV.
- Página, CSV (`indicadores/i4_faixa_neutro.csv`, colunas `q1`, `mediana`, `q3`, `metodos`) e minuta de TD citam a mesma
  saída. A minuta não cita a faixa; o ADR-027 não cita cifras.

### 2. Textos gerados

- As datas passam a ser a data de referência real de cada série, por exemplo "último dado: set/2026" ou "13 nov 2026".
  Acabam formas como "Em nov 2026" para mês incompleto.
- Os títulos passam a ter forma de achado ("Núcleos desaceleram em 3,9 % anualizados").
- Os tempos verbais vão no presente ("vai de", não "ia de").
- O teste `tests/opm-textos.test.ts` falha se um número decimal de título, subtítulo, faixa de indicadores-chave ou
  mensagem-chave não coincidir, nas casas exibidas, com o CSV publicado.
  - Para fichas, vale a tabela da ficha. Para indicadores e mensagens, vale a origem declarada (arquivo, chave, coluna,
    filtro).
  - Constantes normativas com fonte: meta de 3,0 % e intervalo de 1,5–4,5 % (Res. CMN 5.141/2024); neutro do BCB de 5,00 %
    (RPM, p. 80); hiato do BCB de 0,4 % (RPM, p. 83).
