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

## Conteúdo
- **Autorização escrita para o nome da Universidade** na faixa superior (ADR-012; Proposta §8.5).
- Endereço de e-mail do Centro (ver `docs/PLACEHOLDERS.md`).
- Controlador dos dados pessoais e prazo de guarda (Proposta §9.4; Anexo H, ponto 13), citados como "a definir" em Privacidade.
