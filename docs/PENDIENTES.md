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
- ~~**TODO — slug de A2.**~~ Resolvido pelo ADR-026 (edição 2.0, OPM): `/observatorio/politica-monetaria/` com 301 a partir de
  `/observatorio/conjuntura/` (e `/en/`). Os dados derivados de `data/processed/conjuntura/` ficam no mesmo caminho.
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

## Observatório de Política Monetária — edição 2.0 (ADR-022 a ADR-026)

### Séries não incluídas ou a verificar (camada 1)
- **Swaps DI × pré (SGS):** não incluídos. As taxas referenciais são calculadas pela B3 (BM&F) e a licença de
  redistribuição não foi conferida. Pelo ADR-024, ficam fora até verificação; códigos ainda não conferidos.
- **Crédito (saldo e concessões, "credito_a4"):** a definir com o painel A4. O OPM usa só as taxas (20714, 20715, 20740,
  20783, 25351).
- **Fatores condicionantes da base, haveres de não residentes e compulsórios por tipo:** o SGS publica os fatores em
  saldo diário (1789–1795, alguns descontinuados). Séries mensais de fluxo e recolhimentos por modalidade ainda não
  enumeradas; necessárias para I.21 (camada 2).
- **Firmus (A2.4):** pesquisa do BCB com empresas; endpoint aberto não localizado.
- **FRED — conferência visual da nota de copyright:** as páginas de série do FRED não respondem a clientes
  automatizados deste ambiente. Títulos conferidos no arquivo oficial (fredgraph.xlsx) e licença conferida no órgão de
  origem (Federal Reserve Board e EIA: domínio público). Falta confirmar, na página de cada série (DFEDTARU, DGS10,
  DFII5, DTWEXBGS, DCOILBRENTEU), que não há aviso de copyright de terceiros. **VIXCLS** fica fora (Cboe; ADR-024).
- **Decreto nº 12.079/2024 — texto integral:** o sítio do Planalto redireciona clientes automatizados. A regra dos seis
  meses consecutivos foi conferida em duas fontes oficiais do BCB (página "Meta para a inflação" e RPM set./2026, p. 3,
  que cita o decreto). A legenda do I.10 cita essas fontes; conferir o artigo do decreto antes da publicação.
- **Focus Top 5:** só o ranking de curto prazo (tipoCalculo C). Os de médio e longo prazo triplicariam o volume sem uso
  nos indicadores.
- **Calendário do Copom:** acrescentar em `CALENDARIOS_COPOM` (`scripts/data/series-opm.ts`) o número do comunicado do
  ano seguinte, publicado até junho. Sem ele, I.1 marca `trajetoria_completa = 0` a partir de ~dezembro.
- **Atas antigas sem texto:** a API de conteúdo devolve `textoAta` nulo para atas antigas (só PDF). Para o índice de tom
  (I.14, camada 3), extrair o texto do PDF oficial com hash.

### Convenções e limites declarados
- **Tempo real (ADR-025):** as safras começam em 18/11/2026. Revisões anteriores do SGS e do PIB não podem ser
  reconstruídas com o arquivo atual.
- **I.7, horizonte t+3:** usa a meta afinal fixada para o ano, não a conhecida na data da coleta (antes de 2017 o CMN
  fixava a meta com dois anos de antecedência).
- **I.1:** compõe a meta Selic esperada (a Focus projeta a meta). A Selic efetiva fica cerca de 0,10 p.p. abaixo. O BCB
  usa médias trimestrais e quatro trimestres à frente (RPM set./2026, p. 80), convenção diferente.
- **Média dos núcleos:** a convenção adotada (média mensal arredondada a duas casas, composta em 12 meses) foi inferida
  porque é a única que reproduz os dois valores publicados (RPM set./2026, p. 35). A nota 31 do RPM não descreve o cálculo.
- **I.4, faixa com três métodos na camada 1:** os quartis são pontos médios entre três estimativas. A faixa é indicativa
  e ganha métodos nas camadas 2 e 3.

### Camada 2 (ADR-027)
- **I.12, curto prazo (Araujo e Vicente, 2017):** o método corrige a defasagem de indexação da NTN-B e a sazonalidade
  da inflação. Não foi implementado sem o texto do trabalho no repositório; enquanto isso, só se publicam 2, 3 e 5 anos.
- **I.21, alíquota efetiva dos compulsórios:** faltam séries mensais verificadas de recolhimentos e bases por
  modalidade. O conjunto aberto "Recolhimentos Compulsórios – Quadro Resumo" (BCB, ODbL) traz só as alíquotas legais.
- **Títulos com cupom (NTN-F, NTN-B):** estão no CSV, mas fora do ajuste das curvas. Ajustá-los exigiria precificar os
  fluxos (preço, não taxa).
- **Taxa do Tesouro Direto:** a taxa de compra inclui o spread do programa. Uma curva de mercado secundário (ANBIMA)
  está excluída por licença (ADR-024).

### Camada 3 (ADR-028) — experimental
- **I.14:** dupla codificação humana de `docs/td/i14/amostra_codificacao.csv` por dois integrantes. Depois, rodar
  `python -m opm.tom` e decidir a publicação com o Comitê Editorial.
- **A2.7 / I.4 (e):** o modelo não passa no critério de identificação (ADR-028). Próximos passos na minuta do TD:
  estimação por sistema, homogeneidade dinâmica, hiato por componentes não observados e tratamento de 2020–2021.
- **I.16:** corrigir o viés do VAR e/ou ancorar as expectativas na Focus. O prêmio negativo atual reflete viés de
  amostra curta.
- **HLW (NY Fed):** termos de uso não conferidos (a página respondeu com redirecionamento a "404"). Não usado.
- **TD:** autoria, verificação numérica independente, revisão e conferência das referências da especificação
  (BCB 2023a/b, 2024a; Fasolo et al., 2023; Araujo e Vicente, 2017) antes da versão 1.0.
