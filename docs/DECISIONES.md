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
