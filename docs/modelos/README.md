# Modelos de produtos (Manual de Programas e Produtos, Parte III)

Modelos de frontmatter e estrutura para cada série do catálogo (Manual, Parte II, Quadro 2). Copie o arquivo para
`src/content/publicacoes/<slug>.mdx`, preencha os `TODO` e rode `npm run build`: o esquema
(`src/schemas/publicacao.ts`) rejeita identificador incoerente, recomendações fora de NT/TD/RP/PB, TD sem resumo
curto, palavras-chave e JEL, PB sem origem existente e Blog sem modalidade; a extensão fora da faixa gera aviso.

| Arquivo | Série | Anexo do Manual |
|---|---|---|
| `data-insight.mdx` | CEE-DI | A |
| `nota-de-conjuntura.mdx` | CEE-NC | B |
| `avaliacao-de-conjuntura.mdx` | CEE-AC | Parte II (estrutura fixa) |
| `relatorio-semestral.mdx` | CEE-RS | Parte II |
| `nota-tecnica.mdx` | CEE-NT | C |
| `texto-para-discussao.mdx` | CEE-TD | C |
| `relatorio-de-projeto.mdx` | CEE-RP | Parte II |
| `policy-brief.mdx` | CEE-PB | D |
| `blog.mdx` | CEE-BL | D |

Os modelos internos de projeto e de fluxo — Relatório de Progresso (Anexo E), Plano e Relatório de Diálogo
(Anexo F), Registro de proposta (Anexo G) e Lista de verificação (Anexo H) — não são publicações do sítio:
ficam com o Comitê Editorial e os Coordenadores de Programa, conforme o Manual. A lista de verificação do
Anexo H é aplicada antes de cada submissão; o build automatiza só parte dela.
