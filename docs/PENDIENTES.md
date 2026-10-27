# Pendentes

Itens que não puderam ser verificados ou concluídos. Nada listado aqui é publicado como dado no sítio.

## Infraestrutura
- **Repositório em conta pessoal** (desvio da Proposta §6.4, que exige organização com ≥ 3 administradores).
  Transferir para uma organização antes do lançamento. Ver `docs/DECISIONES.md` (ADR-002).
- **GitHub Pages não ativado** no repositório: em Settings → Pages → Source, escolher "GitHub Actions".
- **DOI**: a integração GitHub–Zenodo depende da transferência para a organização; `.zenodo.json` já está preparado.

## Painéis do Observatório
- **Pobreza, renda e desigualdade (C1)** — trabalho individual do proponente, fora deste repositório. Falta: importar código e dados,
  verificação numérica independente, edição numerada, nota de mudanças. Até lá, nenhuma cifra no sítio.
- **Crescimento e produtividade (B1)** — idem; além disso, reconciliar a decomposição (os componentes somam 4,24 p.p. e o
  PIB do mesmo painel cresce 4,1 % a.a.; Proposta, Anexo H, ponto 6).

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
- **SIS 2026**: quando sair, atualizar `SIS_EDICAO` em `scripts/data/series.ts`. Conferir se a Tabela 2.18 mantém o nome e se as linhas
  mudam para PPC 2021 (US$ 3,00 e US$ 8,30). Nesse caso, ajustar o rótulo e o processador e registrar a quebra de série.
- **SIDRA 5877 / 5817 (ODS 1.2.1 e 1.1.1)**: valores diferentes dos da SIS (26,5 % e 4,7 % em 2024) e linha não documentada. Não usadas (ADR-013).

## Observatório (arquitetura de 2026-10)
- **TODO — slug de A2.** Renomear `/observatorio/conjuntura/` para `/observatorio/politica-monetaria/` numa edição futura, com
  redirecionamento 301 (e `/en/`). O slug foi mantido por causa dos vintages arquivados (data e hash) e de eventuais citações externas.
- **TODO — desocupação (SIDRA 6381)** continua na página de A2. É indicador de ciclo e provavelmente migrará para A1 quando A1 for publicado.
- **TODO — fontes da linha A2.** A linha A2 não lista PNAD nem Novo Caged, mas a página mostra a desocupação (PNAD). Resolver junto com o item anterior.
- **A1 e setor externo:** os indicadores ainda não foram definidos. Por isso não há métodos nem fontes sobre o setor externo na linha A1.
- **Panorama da economia brasileira:** os gráficos poderão ser redistribuídos entre A1, A2 e A3 à medida que esses painéis forem publicados (ADR-016).

## Conteúdo
- **Autorização escrita para o nome da Universidade** na faixa superior (ADR-012; Proposta §8.5).
- Endereço de e-mail do Centro (ver `docs/PLACEHOLDERS.md`).
- Controlador dos dados pessoais e prazo de guarda (Proposta §9.4; Anexo H, ponto 13), citados como "a definir" em Privacidade.
