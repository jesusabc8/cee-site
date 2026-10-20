# CEE · Centro de Estudos Econômicos — sítio e Observatório de Dados

*[English version below](#english)*

Sítio público do **Centro de Estudos Econômicos (CEE)**, iniciativa estudantil de análise econômica empírica sobre a economia brasileira, de estudantes de Ciências Econômicas da PUC Minas.

> O CEE é uma iniciativa estudantil. Suas publicações não representam a posição da PUC Minas nem de qualquer outra instituição.

O sítio é estático (Astro), sem cookies nem recursos de terceiros. Os dados do Observatório são baixados das APIs oficiais (IBGE e Banco Central), arquivados com data e hash e verificados por testes automáticos. As regras de integridade estão em [`CLAUDE.md`](CLAUDE.md) e valem para qualquer pessoa — ou ferramenta — que edite este repositório.

## Sumário

1. [Rodar no seu computador](#1-rodar-no-seu-computador)
2. [Publicar uma Nota (passo a passo)](#2-publicar-uma-nota-passo-a-passo)
3. [Registrar uma errata](#3-registrar-uma-errata)
4. [Atualizar os dados](#4-atualizar-os-dados)
5. [Adicionar um painel ou uma série](#5-adicionar-um-painel-ou-uma-série)
6. [Editar páginas institucionais](#6-editar-páginas-institucionais)
7. [Verificações de qualidade](#7-verificações-de-qualidade)
8. [Estrutura do repositório](#8-estrutura-do-repositório)

## 1. Rodar no seu computador

Requisitos: [Node.js 22](https://nodejs.org/) e Git.

```bash
git clone https://github.com/jesusabc8/cee-site.git
cd cee-site
npm ci            # instala as dependências exatamente como no package-lock.json
npm run dev       # abre em http://localhost:4321 e recarrega a cada alteração
npm run build     # gera o sítio final em dist/ (inclui o índice de busca)
npm run preview   # serve dist/ para conferir o resultado final
```

## 2. Publicar uma Nota (passo a passo)

Antes de escrever: a pergunta está registrada na agenda da linha e a **ficha de desenho analítico** foi arquivada (ver [Metodologia](src/content/paginas/pt-BR/metodologia.mdx)). O protocolo completo de revisão está em [`CONTRIBUTING.md`](CONTRIBUTING.md).

1. **Crie um ramo** (branch) a partir de `main`:
   ```bash
   git switch main && git pull
   git switch -c nota/ipca-setembro-2026
   ```
2. **Copie o modelo** do tipo de publicação para `src/content/publicacoes/`. O nome do arquivo vira a URL permanente — use minúsculas, hífens e nenhum acento:
   ```bash
   cp docs/modelos/nota-de-conjuntura.mdx src/content/publicacoes/ipca-setembro-2026.mdx
   ```
   Modelos disponíveis em [`docs/modelos/`](docs/modelos/): `nota-de-conjuntura.mdx`, `data-insight.mdx`, `nota-tecnica.mdx`.
3. **Preencha o cabeçalho** (entre as linhas `---`). Substitua todo `TODO`. Campos importantes:
   - `titulo`: uma **afirmação**, não um tema ("A inflação de serviços desacelerou", e não "Inflação de serviços").
   - `autoria`: cada pessoa com suas funções [CRediT](https://credit.niso.org/) (lista no próprio modelo). Quem fez a verificação numérica entra com `validacao`. Nomes só com autorização da pessoa.
   - `fontes`: **toda** série citada, com código, unidade e data de extração.
   - `uso_ia` e `conflitos`: obrigatórios, mesmo que a resposta seja "não houve".
4. **Escreva o corpo** abaixo do cabeçalho em Markdown. Para usar um gráfico do Observatório:
   ```mdx
   import GraficoObservatorio from '../../components/GraficoObservatorio.astro';

   <GraficoObservatorio grafico="jurosInflacao" />
   ```
   Gráficos disponíveis: `jurosInflacao`, `ipcaMensal`, `desocupacao`, `focus`. Notas de rodapé: `texto[^1]` e, no fim, `[^1]: nota.`
5. **Confira localmente**: `npm run dev` e abra `http://localhost:4321/publicacoes/ipca-setembro-2026/`. Se faltar um campo obrigatório, o terminal mostra a mensagem (por exemplo, *"Nota de Conjuntura exige `tese`"*).
6. **Abra um pull request** com `git push -u origin nota/ipca-setembro-2026` e preencha o checklist que aparece no PR. O CI roda tipos, lint, testes, links, acessibilidade e Lighthouse.
7. **Revisão**: verificação numérica independente (camada 1), revisão de conteúdo (camada 2, quando exigida) e revisão editorial (camada 3). Só o Comitê Editorial aprova o merge.
8. Ao entrar em `main`, o sítio é publicado automaticamente. A publicação aparece na lista, no RSS, na busca e na página da área.

**Nunca** apague uma publicação nem corrija um número em silêncio: use uma errata (seção 3).

## 3. Registrar uma errata

Prazo: menos de **7 dias** entre a identificação do erro e a publicação da errata (o build rejeita prazos maiores).

1. No arquivo da publicação, **não apague** o texto original errado de forma silenciosa: corrija-o e registre no cabeçalho:
   ```yaml
   versao: "1.1"
   versoes:
     - { versao: "1.0", data: 2026-10-01, nota: "Primeira publicação" }
     - { versao: "1.1", data: 2026-10-08, nota: "[EXEMPLO] Correção do valor de setembro (ver errata)" }
   erratas:
     - data: 2026-10-08
       identificado_em: 2026-10-06
       descricao: "[EXEMPLO] O texto informava X,XX% para a variação de setembro; o valor correto é Y,YY%."
       efeito: "[EXEMPLO] Nenhuma conclusão muda."
       correcao: "[EXEMPLO] Valor corrigido no segundo parágrafo e no gráfico."
       versao_corrigida: "1.1"
   ```
2. A versão anterior continua acessível no histórico do Git (e, quando houver, no DOI da versão).
3. A errata aparece na página da publicação e no registro público de erratas do sítio (`/erratas/`).

## 4. Atualizar os dados

A atualização é **automática**: o workflow [`data-refresh`](.github/workflows/data-refresh.yml) roda toda terça-feira, baixa as séries, valida e publica. Para rodar à mão:

```bash
npm run data      # baixa (data:fetch), processa (data:process), regenera data/CATALOGO.md e roda os testes
```

- O dado **bruto** vai para `data/raw/<fonte>/<serie>/<data>/` com `meta.json` (URL, hora, SHA-256). **Nunca edite `data/raw/` à mão.**
- Os CSV processados ficam em `data/processed/`, e o registro de cada extração em `vintage.json`.
- Se uma API falhar, o vintage anterior é mantido, a falha vai para `data/raw/_falhas.json` e o painel exibe um aviso. O build não quebra.
- Se os testes falharem (valor fora do intervalo plausível, duplicata, data futura, hash divergente), nada é publicado: investigue antes de forçar.

## 5. Adicionar um painel ou uma série

1. **Verifique a série na fonte oficial antes de usá-la** (nunca de memória): IBGE — `https://servicodados.ibge.gov.br/api/v3/agregados/<tabela>/metadados`; BCB — [portal de dados abertos](https://dadosabertos.bcb.gov.br) (nome, unidade, periodicidade).
2. Acrescente a série em [`scripts/data/series.ts`](scripts/data/series.ts), com o bloco `verificacao` preenchido (data, método, nome oficial retornado).
3. Escreva o processador correspondente em [`scripts/data/process.ts`](scripts/data/process.ts) e os intervalos plausíveis em [`tests/dados.test.ts`](tests/dados.test.ts).
4. Rode `npm run data` e confira `data/CATALOGO.md`.
5. Para um painel novo, registre-o em [`src/data/paineis.yaml`](src/data/paineis.yaml). Ele só pode ter `estado: publicado` com `versao`, `metodologia` e `changelog`; até lá, aparece como "em construção", sem cifras.
6. Gráficos: no máximo **3 séries**, um único eixo y, título descritivo e subtítulo gerado a partir do dado (ver [`src/lib/conjuntura.ts`](src/lib/conjuntura.ts)).
7. Série que não puder ser verificada vai para [`docs/PENDIENTES.md`](docs/PENDIENTES.md) e **não** é publicada.

## 6. Editar páginas institucionais

As páginas ficam em `src/content/paginas/pt-BR/*.mdx` (texto integral) e `src/content/paginas/en/*.mdx` (resumo). Áreas e linhas de pesquisa estão em [`src/data/areas.yaml`](src/data/areas.yaml) e [`src/data/linhas.yaml`](src/data/linhas.yaml). Integrantes estão em [`src/data/equipe.yaml`](src/data/equipe.yaml) — **só aparecem com `consentimento: true`**. Bandeiras institucionais (`launched`, `useUniversityName`, `showEvents`) e a faixa institucional estão em [`src/site.config.ts`](src/site.config.ts) e só mudam com registro em [`docs/DECISIONES.md`](docs/DECISIONES.md).

## 7. Verificações de qualidade

```bash
npm run check     # tipos (astro check)
npm run lint      # ESLint + Stylelint
npm test          # dados e regras editoriais
npm run qa:links  # links internos e âncoras, depois de npm run build
```

Acessibilidade (axe) e Lighthouse rodam no CI ([`quality.yml`](.github/workflows/quality.yml)); para rodar localmente, veja `scripts/qa/`. Registro da última rodada: [`docs/qa/README.md`](docs/qa/README.md).

## 8. Estrutura do repositório

```
.github/workflows/   build-deploy.yml · data-refresh.yml · quality.yml
src/content/         publicacoes/ (MDX) · paginas/pt-BR e en/ (MDX)
src/data/            areas, linhas, paineis, equipe, parcerias (YAML validado por esquema)
src/components/      Chart, DataTable, CiteBox, Disclaimer, ...
src/lib/             dados, gráficos, citação, RSS, OG
src/schemas/         esquemas Zod de publicações e painéis
src/styles/          tokens.css · base.css · prose.css · print.css
scripts/data/        extração, processamento e catálogo
scripts/qa/          axe, Lighthouse, links, teclado, capturas
data/                raw/ (imutável) · processed/ · CATALOGO.md
docs/                DECISIONES · PENDIENTES · PLACEHOLDERS · LANCAMENTO · modelos/ · qa/
```

Licenças: código sob [MIT](LICENSE); textos e dados sob [CC BY 4.0](LICENSE-CONTENT), ressalvadas as restrições das fontes. Como citar o código: [`CITATION.cff`](CITATION.cff).

---

<a id="english"></a>

## English

Public website of the **Centro de Estudos Econômicos (CEE)**, a student-run initiative for empirical economic analysis of the Brazilian economy, by Economics students at PUC Minas. *CEE is a student initiative; its publications do not represent the position of PUC Minas or any other institution.*

The site is static (Astro), with no cookies and no third-party resources. Observatory data are downloaded from official APIs (IBGE and the Central Bank of Brazil), archived with date and hash, and checked by automated tests. Integrity rules are in [`CLAUDE.md`](CLAUDE.md).

- **Run locally:** Node.js 22, then `npm ci`, `npm run dev` (http://localhost:4321), `npm run build`, `npm run preview`.
- **Publish a note:** create a branch; copy a template from [`docs/modelos/`](docs/modelos/) to `src/content/publicacoes/<slug>.mdx` (the file name is the permanent URL); fill in every `TODO` in the front matter — an assertive title, CRediT roles, every source series with code, unit and extraction date, AI-use and conflict declarations; write the body in Markdown (insert an Observatory chart with `<GraficoObservatorio grafico="jurosInflacao" />`); check it with `npm run dev`; open a pull request and complete its checklist. The build fails with a clear message if a required field is missing.
- **Errata:** never correct silently. Bump `versao`, add an entry to `versoes` and to `erratas` (published less than 7 days after the error is identified — the build enforces this). Errata appear on the publication and in the public register at `/erratas/`.
- **Data updates:** automatic every Tuesday ([`data-refresh`](.github/workflows/data-refresh.yml)); manually, `npm run data`. Never edit `data/raw/` by hand. If an API fails, the previous vintage is kept and the dashboard shows a warning.
- **New series or dashboard:** verify the code against the official metadata first, add it to [`scripts/data/series.ts`](scripts/data/series.ts) with its `verificacao` block, write the processor and the plausible ranges in the tests, and run `npm run data`. At most three series per chart, one y-axis.
- **Quality:** `npm run check`, `npm run lint`, `npm test`, `npm run qa:links`; axe and Lighthouse run in CI.

Licences: code under [MIT](LICENSE); text and data under [CC BY 4.0](LICENSE-CONTENT).
