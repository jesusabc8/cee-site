# Sistema de desenho do CEE

Referência visual do sítio. A maquete [`docs/design/CEE_home_maquete.html`](design/CEE_home_maquete.html) foi o ponto de
partida; este documento descreve o que foi implementado e as regras de uso. Tokens em
[`src/styles/tokens.css`](../src/styles/tokens.css); guia interno em `/_estilo/` (noindex).

## Princípios
- **Sério e acadêmico**: tipografia sans técnica, reguinhas finas, cantos de 0–2 px, nenhum degradê decorativo fora das bandas escuras.
- **Dado real ou nada**: nenhuma cifra escrita à mão; ilustração de fundo só com série real e nota de fonte (herói, imagens OG).
- **Fundos alternados**: branco → papel → ardósia → marinho → papel → petróleo → rodapé escuro. Nunca um fundo único.

## Cores
| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#0A2259` | Marca, títulos, fundos escuros, série principal |
| `--petrol` | `#1D5FA6` | Links, foco, eyebrows, bordas ativas |
| `--azure` | `#3C8DCB` | Segunda série dos gráficos |
| `--steel` | `#4A7C96` | Ícones, barras secundárias, terceira série |
| `--slate` | `#8AA4B3` | Banda de seção (Pesquisa), séries de comparação |
| `--sky` | `#C0E0F0` | Botão principal sobre fundo escuro, destaques em fundo escuro |
| `--mist` / `--paper` | `#E8F0F8` / `#F4F7FA` | Fundos claros |
| `--line` / `--line-strong` | `#D3DEE8` / `#7D93A3` | Hairline / borda de controle (3,2:1) |
| `--ink` / `--muted` | `#0E1B2E` / `#56667A` | Texto / texto secundário (≥ 4,5:1 sobre branco e papel) |
| `--topbar` | `#1E2226` | Faixa institucional |

Sem verde, vermelho nem cores quentes. Direção (▲▼■) é neutra, sem juízo de valor.

## Tipografia
- **IBM Plex Sans** (variável): títulos, interface, números. Escala fluida `--fs-display`, `--fs-h1..h4`.
- **IBM Plex Mono** 400/500: fontes, códigos de série, datas de referência, metadados.
- **Source Serif 4**: só o corpo das publicações (`.prose--serif`), a tese e as perguntas-guia.
- Fontes autoalojadas (`@fontsource`), com pré-carregamento das duas principais. Sem CDN.

## Grade e espaçamento
Contêiner `--wrap` de 1200 px, calha `--gutter` fluida (20–32 px), seções com `--section-y` (72–110 px), seções em duas
colunas (`.split`) com ritmo mais curto e régua entre blocos. Cabeçalho fixo de 84 px; faixa institucional de 44 px.

## Componentes
| Componente | Arquivo | Notas |
|---|---|---|
| Faixa institucional | `layout/TopBar.astro` | `<aside>` rotulado; nome da Universidade só em texto (ADR-012); redes sem link até existirem |
| Cabeçalho | `layout/SiteHeader.astro` | Sticky, sublinhado animado, busca (Ctrl/Cmd+K), menu em tela cheia abaixo de 64 rem |
| Busca | `layout/SearchModal.astro` | `<dialog>`, Pagefind carregado sob demanda |
| Cabeçalho de página | `layout/PageHero.astro` | Banda marinha com grade, migas automáticas pelo caminho, slots `eyebrow`/`aside` |
| Rodapé | `layout/SiteFooter.astro` | Lockup branco, três colunas, descargo e licenças |
| Herói | `home/Hero.astro` | Linha real do IPCA 12m, desenhada uma vez; nota de fonte |
| Brasil em números | `home/BrasilEmNumeros.astro` | 10 fichas do pipeline; filtros com `aria-pressed`; estado "dados em atualização" sem valor |
| Painel | `dashboard/Panorama.astro` | Quatro blocos; subgrid alinha cabeçalho, controles, gráfico e rodapé das fichas vizinhas |
| Ficha de gráfico | `charts/ChartCard.astro` | `<figure>`; legenda focável; períodos em tablist; tooltip; fonte, CSV, nota e tabela |
| Primário estabilizador | `dashboard/DebtStabilizer.astro` | s*, comparação, matriz 5×5 em tom único, referências "a conferir", nota metodológica |
| Áreas | `home/Areas.astro` | Banda ardósia, letra translúcida, pergunta em serifa itálica, estado das linhas |
| Formatos | `home/Formatos.astro` | Banda marinha 3×2; estado honesto por tipo de publicação |
| Método | `home/Metodo.astro` | Abas verticais (↑↓ ←→ Home End); sem JS, etapas em sequência |
| Participe | `home/Participe.astro` | Banda petróleo, três fatos da Proposta §7 |
| Estado | `StatusTag.astro` | Rótulos com ano ("Prevista (ano N)", "Previsto · ano N") recebem `ano` do dado; nunca escrever o ano à mão |
| Ícones | `ui/Icon.astro` | Lucide (traço 1,6, `currentColor`); tamanho numérico em px |

## Gráficos
Regras completas em ADR-010. Em resumo:
- um eixo y; grade horizontal fina; marcas 1-2-5; rótulo direto no fim;
- marinho e azul para as duas primeiras séries; da terceira em diante, traço, marcador e rótulo direto;
- projeções em faixa sombreada com rótulo; meta e banda de tolerância em degraus;
- título descritivo; subtítulo gerado do dado; unidade, fonte com código e data de extração, CSV, nota, tabela;
- tooltip por cursor ou toque; realce pela legenda (mouse e teclado).

## Logo
Opção B (matriz de dados), vetorizada em [`scripts/brand/build-logo.mjs`](../scripts/brand/build-logo.mjs), com o texto convertido em contorno.
- `cee-mark.svg` (marca + "CEE") no cabeçalho, sobre branco; `cee-mark-white.svg` sobre marinho; `cee-lockup(-white).svg` no rodapé;
  `cee-favicon.svg` só a matriz.
- Área de proteção mínima: a altura de um quadrado da matriz em todos os lados. Altura mínima: 24 px (marca) e 16 px (favicon).
- Não recolorir, não aplicar sombra, não usar sobre fotografia sem banda marinha por baixo, nem combinar com o escudo da Universidade.
- Se chegarem SVG finais, basta substituir os arquivos em `public/brand/`.

## Imagens
- Não há fotografias publicadas. Fotos de pessoas só com consentimento registrado (`equipe`, regra 3) e proporções 16:9 ou 4:3.
- Imagens Open Graph (`src/lib/og.ts`): banda marinha, marca, rótulo, título, metadados e a mesma linha real do IPCA.

## Movimento
Revelação ao rolar (`.reveal`, uma vez) e desenho da linha do herói. Com `prefers-reduced-motion: reduce`, tudo aparece sem
animação (verificado por `scripts/qa/movimento.mjs`).

## Verificação
`npm run check`, `npm run lint`, `npm test`, `npm run qa:links` e, com `npm run preview`:
- `scripts/qa/axe.mjs` (WCAG 2.2 AA);
- `lighthouse.mjs` (≥ 95, mobile);
- `larguras.mjs` (360–1920 px, sem rolagem horizontal);
- `teclado.mjs`, `interacao.mjs`, `movimento.mjs`;
- `frame.mjs` (capturas).

Evidência em [`docs/qa/`](qa/).

## Sistema "publicação" (ADR-029)

O padrão das páginas de dados e pesquisa, no nível de portais de dados de organismos internacionais. Adotado primeiro
pelo Observatório de Política Monetária. Outra seção adere com `estilo="pub"` em `Base.astro` e com os componentes de
`src/components/opm/`, que são genéricos apesar do nome da pasta.

- **Tokens** (`src/styles/publicacao.css`):
  - Escala tipográfica 12/14/16/18/22/28/36/48 (`--t-12` … `--t-48`).
  - Espaçamento em múltiplos de 8 px (`--e-1` … `--e-8`); seções separadas por no máximo 64 px (`--secao`).
  - Largura máxima de 1280 px, grade de 12 colunas.
  - Temas claro e escuro (`prefers-color-scheme`), com cores semânticas de série `--s1` … `--s4`, bandas, grade e eixo.
- **Tipografia:**
  - IBM Plex Sans na interface, nos gráficos e nos números; algarismos tabulares em tabelas e rótulos.
  - Source Serif 4 nos títulos de seção e no texto corrido (mensagens-chave, notas, metodologia).
- **Moldura** (`OpmShell`):
  - Cabeçalho institucional compacto: migas, painel, título em serif, lede, princípio, edição, data dos dados, licença.
  - Navegação por módulos, fixa ao rolar.
  - Rodapé com fontes, licenças, versão e data.
- **Faixa de indicadores-chave** (`KpiStrip`): valor, variação (▲▼■ e valor), minigráfico e data de referência
  própria de cada série.
- **Mensagens-chave** (`Mensagens`): 3 a 5 frases geradas dos dados, cada número com origem declarada.
- **Ficha de gráfico** (`Ficha`):
  - Cabeçalho: código, estado da série (V/A/R), selo "experimental" quando couber.
  - Título em forma de achado; subtítulo com unidade, frequência, período e data de referência.
  - Gráfico com rótulos diretos curtos; a legenda só mostra faixas, ou todas as séries se houver mais de quatro.
  - Rodapé: nota curta, fonte com código curto (o completo fica no catálogo) e safra, CSV, PNG e SVG, tabela
    alternativa.
- **Gráficos no estilo `pub`** (`render.ts`, opção `estilo: 'pub'`):
  - Sem moldura, unidade no topo do eixo y, grade tênue.
  - Rótulos diretos afastados pela altura real do texto, numa margem de até 30 % da largura.
  - Rótulos de referência por cima das séries, com halo.
  - Marcas das reuniões do Copom no pé do eixo x.
  - Cores por classe, que acompanham o tema.
  - Recessões do CODACE não são marcadas: as datações são publicadas por uma fundação privada sem licença aberta
    verificável, e o nome dessa fundação não pode aparecer no sítio.
- **Regras medidas** (`scripts/qa/opm-layout.mjs`, no CI): sem rolagem horizontal; nenhum elemento vazando fora de
  contêiner rolável marcado; nenhum vão vertical > 96 px; nenhum contêiner > 40 % vazio; nenhum par de rótulos
  sobreposto em gráfico. Tudo em 360, 768, 1024, 1440 e 1920 px, PT e EN.
- **Antes e depois:** `docs/qa/opm-redesenho/` (uma folha por página).
