# Pendentes

Itens que não puderam ser verificados ou concluídos. Nada listado aqui é publicado como dado no sítio.

## Infraestrutura
- **Repositório em conta pessoal** (desvio do Estatuto, art. 63, §1º, e do Regimento, art. 61, que exigem ao menos três
  administradores, um deles docente tutor ou indicado pela Universidade). Transferir para uma organização do CEE (ADR-002).
- **DOI**: com o repositório privado, a integração GitHub–Zenodo deixa de funcionar. Os DOI virão por **depósito direto no
  Zenodo** (`CITATION.cff` e `.zenodo.json` mantidos como metadados de referência).

## Painéis do Observatório
- **Pobreza, renda e desigualdade (C1)** — trabalho individual do proponente, fora deste repositório. Falta: importar código e dados,
  verificação numérica independente, edição numerada, nota de mudanças. Até lá, nenhuma cifra no sítio.
- **Crescimento e produtividade (B1)** — idem; além disso, reconciliar a decomposição (os componentes somam 4,24 p.p. e o
  PIB do mesmo painel cresce 4,1 % a.a.). Nenhuma cifra de B1 vai ao sítio.

## Séries consideradas e não publicadas
- **IPCA via SGS (433, 13522)**: não localizadas no catálogo de dados abertos do BCB; substituídas pelo SIDRA (ADR-006).

## Painel "Panorama"
- **Referência IFI/Senado (RAF nº 113, jun/2026)** na ficha "Primário para estabilizar a dívida": texto fornecido pela
  coordenação ("superávit de 2,1 % do PIB ao ano"). A leitura automática do sítio da IFI não localizou o RAF nº 113 (o índice
  listava o RAF nº 116, set/2026). Aparece marcada como "ainda não conferida"; conferir no PDF e retirar a marca.
- **Tesouro Nacional (Relatório de Projeções Fiscais, 1º sem. 2026), Gráfico 27 e Apêndice D**: idem, marcado "a conferir".
- **Taxa de câmbio PPC e comparação de níveis**: o PIB per capita usa `rgdpna/pop` como pedido; Feenstra et al. (2015)
  recomendam `rgdpe`/`rgdpo` para comparar níveis entre países. Avaliar trocar ou acrescentar nota mais longa.

## Brasil em números
- **Abertura comercial (ADR-019)** usa a PWT 11.0 e termina em 2023. Decidir se a extração mensal do ComexStat e do SGS 4192
  (hoje só para `abertura_bens.csv`, sem exibição) continua no `data-refresh` ou é retirada. Na próxima versão da PWT, conferir de
  novo a razão contra as Contas Nacionais do IBGE.
- **SIS 2026**: quando sair, atualizar `SIS_EDICAO` em `scripts/data/series.ts`. Conferir se a Tabela 2.18 mantém o nome e se as linhas
  mudam para PPC 2021 (US$ 3,00 e US$ 8,30). Nesse caso, ajustar o rótulo e o processador e registrar a quebra de série.
- **SIDRA 5877 / 5817 (ODS 1.2.1 e 1.1.1)**: valores diferentes dos da SIS (26,5 % e 4,7 % em 2024) e linha não documentada. Não usadas (ADR-013).

## Observatório (arquitetura de 2026-10)
- **TODO — slug de A2.** Renomear `/observatorio/conjuntura/` para `/observatorio/politica-monetaria/` numa edição futura, com
  redirecionamento 301 (e `/en/`). O slug foi mantido por causa dos vintages arquivados (data e hash) e de eventuais citações externas.
- **TODO — desocupação (SIDRA 6381)** continua na página de A2. É indicador de ciclo e provavelmente migrará para A1 quando A1 for publicado.
- **A1 e setor externo:** os indicadores ainda não foram definidos. O setor externo como programa é o D (em formação); o Manual não atribui indicadores a A1.
- **Perguntas por painel:** o Manual não associa perguntas a painéis; as linhas mostram só código e nome. Se a coordenação quiser essa associação, ela precisa constar do plano anual (Regimento, art. 44).
- **Panorama da economia brasileira:** os gráficos poderão ser redistribuídos entre A1, A2 e A3 à medida que esses painéis forem publicados (ADR-016).

## Conteúdo
- **Autorização específica para o nome da Universidade** na faixa superior (ADR-012; Estatuto, art. 62).
- Endereço de e-mail do Centro (ver `docs/PLACEHOLDERS.md`).
- Aviso de privacidade completo (finalidade, base legal, prazo de conservação, responsáveis e canal), exigido antes da abertura de
  cadastros (Regimento, art. 60). A página Privacidade anuncia que será publicado antes da primeira convocatória.
- **Frase de horizonte** ("Ser referência em pesquisa econômica aplicada feita por estudantes…") em `/sobre/`: fornecida pela
  coordenação nas instruções de 2026-11; não consta dos atos normativos. Incluir no Estatuto ou no plano anual, ou retirar.
- **Anexos E a H do Manual** (Relatório de Progresso, Plano e Relatório de Diálogo, Registro de proposta, Lista de verificação):
  não são publicações; ficam com o Comitê Editorial. Só o Anexo H está resumido em `/metodologia/`.

## Divergências entre os atos normativos (minutas)
O sítio segue a ordem de precedência Estatuto > Regimento > Manual, salvo instrução expressa da coordenação. Reconciliar nas minutas:
- **Onde cabem recomendações.** Estatuto, art. 50, parágrafo único: só Notas Técnicas e projetos de Pesquisa em Destaque.
  Regimento, art. 45, §1º: NT, TD, Relatórios de Projeto de Pesquisa em Destaque e respectivos Policy Briefs. Manual, Parte II:
  NT, TD, RP e PB derivados. O sítio aplica a regra do Manual (NT, TD, RP e PB), por instrução da coordenação; o Estatuto, mais
  restritivo, precisa ser alinhado.
- **Edições especiais.** O Estatuto, art. 49, II, lista "edições especiais" entre os produtos; o Regimento e o Manual não. O tipo
  foi retirado do sítio (ADR-017). Retirar do Estatuto ou definir no Manual.
- **Prazo do Comitê Editorial.** Regimento, art. 24: decisão em até dez dias úteis por submissão. Manual, Quadro 3: prazos de
  revisão de 5 a 30 dias úteis conforme o produto. O sítio mostra o Quadro 3 como prazos de referência; esclarecer se são etapas distintas.
- **Texto do aviso.** Regimento, art. 59: "não representam necessariamente a posição da PUC Minas". Manual, Parte II: "não
  representam a posição da Pontifícia Universidade Católica de Minas Gerais". O sítio usa o texto do Manual, como pedido.
- **Relatório de Projeto.** O Regimento restringe recomendações aos RP de Pesquisa em Destaque; o esquema do sítio não distingue
  RP de Pesquisa em Destaque de RP de projetos conjuntos.
