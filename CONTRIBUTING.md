# Como contribuir

Todo o trabalho entra por **pull request** (PR) para `main`. Ninguém publica direto em `main`, nem quem coordena.
O protocolo segue a Proposta do CEE (§6): **nenhum número é publicado sem que outra pessoa reexecute o código e chegue ao mesmo resultado.**

## Fluxo

1. **Abra uma issue** com o modelo adequado (nova publicação, errata, nova linha de pesquisa). Ela registra a pergunta, o responsável e o prazo.
2. **Arquive a ficha de desenho analítico** antes de olhar qualquer resultado (unidade, período, fonte, especificação, robustez, evidência contrária, verificação ética).
3. **Trabalhe em um ramo** (`nota/…`, `dados/…`, `pagina/…`, `errata/…`) e abra o PR cedo, como rascunho.
4. **Revisão em camadas**, conforme o produto:

| Produto | Camada 1 · verificação numérica | Camada 2 · conteúdo (docente) | Camada 3 · editorial |
|---|---|---|---|
| Data Insight | ✔ | — | — |
| Nota de Conjuntura | ✔ | — | ✔ |
| Nota Técnica | ✔ | ✔ | ✔ |
| Working Paper | ✔ | ✔ + parecer externo | ✔ |
| Replicação | reexecução independente | — | — |
| Painel do Observatório | reexecução + auditoria da cadeia de dados | — | — |

5. **Quem aprova o merge** é o Comitê Editorial — nunca um autor do produto. O nível de revisão depende da pretensão do produto, **não do prazo**: se o prazo aperta, reduz-se o escopo.
6. Depois do merge, o sítio é publicado automaticamente.

## Checklist de verificação numérica (camada 1)

- [ ] Clonei o repositório do produto em máquina distinta, do zero.
- [ ] Reconstruí o ambiente registrado (versões de linguagem e pacotes).
- [ ] Todo o código executou sem intervenção manual e sem erro.
- [ ] Comparei cada tabela e figura do texto com a saída do código.
- [ ] Os dados brutos não foram editados à mão; todas as transformações estão em scripts numerados.
- [ ] Sementes fixadas, quando aplicável.
- [ ] Divergências registradas por escrito no PR e devolvidas ao autor.

## Checklist editorial (camada 3)

- [ ] Título é afirmação; tese clara na abertura e sustentada pelos dados.
- [ ] Unidades, rótulos e fontes corretos em todas as figuras e tabelas.
- [ ] Toda afirmação quantitativa indica fonte, série e data de extração.
- [ ] Metodologia descrita no corpo do texto.
- [ ] Incerteza principal declarada; Nota Técnica com "o que a evidência não permite concluir".
- [ ] Recomendações só em Nota Técnica, em seção própria.
- [ ] Autoria por função (CRediT), descargo, declaração de IA e de conflitos.
- [ ] Licença indicada; pacote de replicação disponível.
- [ ] Sem dados pessoais não autorizados; sem posicionamento partidário.
- [ ] Parecer docente arquivado, quando exigido.

## Regras que o CI faz cumprir

O build falha se faltar campo obrigatório do tipo de publicação, se uma Nota Técnica não tiver `limites`, se houver recomendações fora de Nota Técnica, se uma errata sair 7 dias ou mais depois da identificação, se um link interno estiver quebrado, se houver violação de acessibilidade (axe) ou Lighthouse abaixo de 95, ou se os testes de dados falharem.

## O que não fazer

- Inventar ou "ajustar" números, nomes, citações ou métricas. Texto provisório leva `[PLACEHOLDER]` e entra em `docs/PLACEHOLDERS.md`.
- Editar `data/raw/` à mão.
- Corrigir em silêncio. Erro publicado gera errata.
- Usar nome, escudo ou cores da PUC Minas como marca.
- Publicar nome ou foto de pessoa sem consentimento registrado.
- Inserir dados pessoais em ferramentas de IA.

## Uso de inteligência artificial

Permitido e declarado em cada produto (`uso_ia`). Código gerado por IA passa pela mesma reexecução independente; ferramentas de IA não constam como autoras.
