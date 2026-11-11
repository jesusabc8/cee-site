# Varredura de segredos e de dados pessoais no histórico (Etapa 10) — 2026-11-10

Ferramenta: gitleaks 8.30.1 (binário oficial, SHA-256 `551f6fc8…70eb` conferido), regras padrão + `.gitleaks.toml`.

| Varredura | Comando | Resultado |
|---|---|---|
| Histórico completo (todos os ramos, 32 commits) | `gitleaks git --redact --log-opts="--all" .` | **Nenhum vazamento** |
| Árvore de trabalho | `gitleaks dir --redact .` | **Nenhum vazamento** |
| `dist/` | `npm run qa:seguranca` | Limpo |

## E-mail pessoal nos metadados dos commits

O e-mail pessoal do responsável **não aparece no conteúdo** de nenhum arquivo, em nenhuma versão do histórico
(`git grep` em todas as revisões: 0 ocorrências). Aparece **apenas nos metadados** (campo *author*) de **1 commit**:

| Commit | Data | Descrição | Ramos |
|---|---|---|---|
| `1fd0e22` | 2026-10-27 | Merge PR #1: reorganiza o Observatório | `main` e todos os ramos posteriores |

Os demais commits usam endereços *noreply* (GitHub, bot de dados e assistente).

## Decisão pendente (do responsável)

O histórico **não foi reescrito**. Opções:

1. **Não reescrever.** Com o repositório privado, os metadados ficam visíveis só a quem tiver acesso. Forks e clones
   públicos feitos enquanto o repositório era público podem conter o commit.
2. **Reescrever antes de tornar o repositório privado** (com o GitHub Pages ainda ativo): `git filter-repo --mailmap`
   mapeando o e-mail pessoal para o *noreply* do GitHub, seguido de **um único push forçado** de todos os ramos.
   Consequências: todos os SHAs mudam a partir de `1fd0e22`; PRs e clones antigos deixam de corresponder; quem tiver
   clone precisa clonar de novo. Requer autorização expressa.

Para evitar novos casos: GitHub → Settings → Emails → "Keep my email addresses private" e "Block command line pushes
that expose my email".
