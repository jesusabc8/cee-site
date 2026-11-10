# Como contribuir

Todo o trabalho entra por **pull request** (PR) para `main`. Ninguém publica direto em `main`, nem quem coordena.
O fluxo segue o Regimento Interno (art. 46) e o Manual de Programas e Produtos (Parte II): **todo número publicado deve ser
reexecutável a partir dos dados de origem e é conferido por pessoa distinta dos autores**; nenhum autor revisa ou decide
sobre o próprio trabalho.

## Fluxo

1. **Registre a proposta** junto ao Coordenador de Programa (Anexo G do Manual): série pretendida, programa e pergunta do
   Manual, pergunta específica, fontes e período, método, cronograma e verificador proposto.
2. **Trabalhe em um ramo** (`nota/…`, `dados/…`, `pagina/…`, `errata/…`) e abra o PR cedo, como rascunho. Use o modelo da
   série em [`docs/modelos/`](docs/modelos/).
3. **Revisão mínima**, conforme o produto (Manual, Quadro 2):

| Produto | Revisão mínima |
|---|---|
| Edição de painel | Verificação numérica |
| Data Insight · Nota de Conjuntura | Numérica e editorial |
| Avaliação de Conjuntura | Factual e numérica |
| Relatório Semestral · Nota Técnica · Relatório de Projeto | Numérica, editorial e parecer docente |
| Texto para Discussão | Numérica, editorial, parecer docente e parecer externo |
| Policy Brief | Editorial e parecer docente sobre a fidelidade à origem |
| Blog CEE | Editorial; numérica quando houver dados próprios |

4. **Submissão ao Comitê Editorial** com os registros de revisão e a lista de verificação do Anexo H. Quem aprova o merge é
   o Comitê Editorial — nunca um autor do produto. Prazos de referência: Manual, Quadro 3.
5. Depois do merge, o sítio é publicado automaticamente na Cloudflare.

## Checklist de verificação numérica

- [ ] Reexecutei o código do zero, a partir dos dados de origem, em máquina distinta.
- [ ] Todo o código executou sem intervenção manual e sem erro.
- [ ] Conferi cada número, tabela e gráfico do texto com a saída do código; relatório de conferência no repositório.
- [ ] Os dados brutos não foram editados à mão; todas as transformações estão em código.
- [ ] Divergências registradas por escrito no PR e devolvidas ao autor.

## Lista de verificação antes da submissão (Anexo H, resumo)

- [ ] Série, número, versão, data, programa e pergunta identificados (`identificador`, `area`, `pergunta`).
- [ ] Extensão dentro do limite da série; conclusão principal no início.
- [ ] Gráficos e tabelas com título, unidade, nota e fonte com período.
- [ ] Fatos, interpretações e cenários distinguidos.
- [ ] Recomendações só em NT, TD, RP e PB, em seção própria.
- [ ] Referências autor-data (ABNT); autoria CRediT; agradecimentos a revisores e verificadores.
- [ ] Declaração de uso de IA (`declaracao_ia`) e de conflitos; aviso de responsabilidade e licença.
- [ ] Pareceres exigidos anexados.

## Regras que o CI faz cumprir

O build falha se faltar campo obrigatório da série; se o `identificador` não bater com tipo, ano e versão; se houver
recomendações fora de NT, TD, RP e PB; se um Texto para Discussão não tiver resumo de até 200 palavras, 3 a 5 palavras-chave
e JEL; se um Policy Brief não apontar uma NT, TD ou RP existente; se um Blog não tiver modalidade; se o aviso de errata sair
depois de sete dias corridos; se um link interno estiver quebrado; se `qa:seguranca` achar algo interno ou pessoal em `dist/`;
se `npm audit` achar vulnerabilidade alta; se o gitleaks achar segredo; se houver violação de acessibilidade (axe) ou
Lighthouse abaixo de 95; ou se os testes de dados falharem. Extensão fora da faixa do Manual gera só aviso.

## Segurança (ADR-018)

- O repositório é privado; tudo o que o sítio serve é público. Nunca versionar segredos, `.env`, minutas (`.tex`, `.docx`,
  `.pdf` de `docs/fuentes/`) nem a lista `docs/seguranca/nomes-proibidos.txt`.
- Instale dependências com `npm ci --ignore-scripts`. Novas dependências: versão exata, publicada há pelo menos duas semanas.
- Actions sempre fixadas por SHA, com a versão em comentário; Dependabot propõe as atualizações.
- **Gancho local opcional de gitleaks** (verifica o que vai ser commitado):

  ```bash
  # instale o gitleaks 8.30.1 (https://github.com/gitleaks/gitleaks/releases), confira o SHA-256 e então:
  cat > .git/hooks/pre-commit <<'HOOK'
  #!/bin/sh
  exec gitleaks git --pre-commit --staged --redact --no-banner --config .gitleaks.toml
  HOOK
  chmod +x .git/hooks/pre-commit
  ```

## O que não fazer

- Inventar ou "ajustar" números, nomes, citações ou métricas. Texto provisório leva `[PLACEHOLDER]` e entra em `docs/PLACEHOLDERS.md`.
- Editar `data/raw/` à mão.
- Corrigir em silêncio. Erro material publicado gera aviso e errata.
- Usar nome, escudo ou cores da Universidade como marca (Estatuto, art. 62).
- Publicar nome ou foto de pessoa sem consentimento registrado.
- Inserir dados pessoais em ferramentas de IA.

## Uso de inteligência artificial

Permitido e declarado em cada produto (`declaracao_ia`), com a ferramenta e a finalidade. Código gerado por IA passa pela
mesma verificação numérica; ferramentas de IA não constam como autoras.
