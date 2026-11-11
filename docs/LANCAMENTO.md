# Checklist de lançamento

O sítio está em **versão preliminar** (`config.launched = false`, isto é, build sem `CEE_LANCADO=1`: noindex e `robots.txt` com `Disallow`).
Só lançar quando todos os itens estiverem marcados, com data e responsável. Fonte de verdade: Estatuto, Regimento Interno e
Manual de Programas e Produtos (ADR-017).

## Institucional
- [ ] Estatuto aprovado pela Assembleia Constitutiva e pela Coordenação do Curso e Assessoria para Assuntos Estudantis
      (Estatuto, arts. 66 e 69); Regimento Interno e Manual aprovados. Retirar "(minuta)" das páginas.
- [ ] Divergências entre as minutas reconciliadas (`docs/PENDIENTES.md`, "Divergências entre os atos normativos").
- [ ] Autorização específica para o uso do nome e da filiação à Universidade (Estatuto, art. 62). Sem ela, `useUniversityName: false` (ADR-012).
- [ ] Conselho Consultivo composto (docentes tutores com aceite registrado em ata).
- [ ] Aviso de privacidade completo antes de qualquer cadastro (Regimento, art. 60).

## Infraestrutura e segurança (ADR-018) — passos manuais do responsável, nesta ordem
1. [ ] **Gmail:** verificação em duas etapas ativada.
2. [ ] **GitHub:** 2FA ativado; e-mail privado (Settings → Emails → "Keep my email addresses private" e "Block command line pushes that expose my email").
3. [ ] **Cloudflare:** conta criada com 2FA; token de API com permissão mínima *Workers Scripts: Edit* (e *Account: Read*), restrito à conta.
       No GitHub, criar o environment `cloudflare` (Settings → Environments), restrito ao branch `main`, com os segredos
       `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`; criar a variável de repositório `SITE_URL`
       (ex.: `https://cee-site.<subdominio>.workers.dev`).
4. [ ] **Merge** do branch `atualizacao-normas-seguranca`; workflow `build-deploy` verde; testar a URL `*.workers.dev`
       (`curl -I` na portada, busca, painel, publicações e 404; ver `docs/qa/normas-2026-11/`).
5. [ ] **Histórico (opcional):** decidir sobre reescrever o histórico para retirar o e-mail pessoal dos commits
       (`docs/qa/normas-2026-11/gitleaks.md`). Se autorizado: `git filter-repo --mailmap`, um único push forçado, antes de tornar o repositório privado.
6. [ ] **Repositório:** conferir forks; tornar o repositório **privado**; criar a variável `PAGES_ATIVO=false` (o job `pages`
       do `build-deploy` para de publicar) e só então **desativar o GitHub Pages** (Settings → Pages). A URL antiga
       (`*.github.io/cee-site/`) deixa de responder.
7. [ ] **Alertas e proteção:** Dependabot alerts e security updates ativados; secret scanning e push protection;
       proteção do branch `main` (PR obrigatório, CI `quality` verde, sem push forçado).
8. [ ] **Depois:** transferir o repositório para uma organização do CEE com ≥ 3 administradores, um deles docente tutor ou
       indicado pela Universidade (Regimento, art. 61); domínio próprio com bloqueio de transferência e DNSSEC; atualizar `SITE_URL`.

- [ ] E-mail em nome do Centro criado; `contato` atualizado em `src/site.config.ts`; linha removida de `docs/PLACEHOLDERS.md`.
- [ ] DOI por depósito direto no Zenodo (a integração GitHub–Zenodo exige repositório público); DOI registrado em `doi`.

## Conteúdo
- [ ] `docs/PLACEHOLDERS.md` sem pendências públicas (a publicação de demonstração pode ser apagada após a primeira publicação real).
- [ ] Ao menos uma publicação real aprovada pelo Comitê Editorial com a revisão mínima do Manual.
- [ ] Equipe: apenas pessoas com `consentimento: true`, `data_consentimento` e `revogado: false`.

## Qualidade (registrar em `docs/qa/README.md`)
- [ ] CI `quality` verde (tipos, lint, testes, `npm audit`, gitleaks, links, `qa:seguranca`, axe, Lighthouse ≥ 95).
- [ ] Cabeçalhos em produção conferidos (`curl -I`), CSP sem violações no console.
- [ ] Teste com leitor de tela real (NVDA ou VoiceOver) em Início, uma publicação e um painel.
- [ ] Teste em celular físico (Android e iOS).

## Virada
- [ ] `launched: true` em `src/site.config.ts` (ou build com `CEE_LANCADO=1`), com ADR em `docs/DECISIONES.md`.
- [ ] Conferir as referências IFI (RAF nº 113) e Tesouro na ficha do primário estabilizador (`docs/PENDIENTES.md`).
- [ ] Conferir `robots.txt` (Allow + Sitemap), `sitemap-index.xml` e meta `robots` em produção.
