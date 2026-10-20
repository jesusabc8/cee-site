# Checklist de lançamento

O sítio está em **versão preliminar** (`config.launched = false`, isto é, build sem `CEE_LANCADO=1`: noindex e `robots.txt` com `Disallow`).
Só lançar quando todos os itens estiverem marcados, com data e responsável.

## Institucional
- [ ] Proposta apresentada à coordenação do curso (Proposta §14, passos 1–3).
- [ ] Decisão registrada sobre o uso do nome da Universidade. Se autorizado por escrito: `useUniversityName = true` e ADR em `docs/DECISIONES.md`.
- [ ] Docente de referência designado (Portão 1, mês 3).
- [ ] Carta de Princípios aprovada (substituir a minuta em `public/documentos/carta-de-principios.md` e o aviso "minuta" em Sobre).
- [ ] Controlador dos dados pessoais e prazo de guarda definidos; política de privacidade atualizada.

## Infraestrutura
- [ ] Repositório transferido para uma organização do GitHub com ≥ 3 administradores (Proposta §6.4); `repoUrl` atualizado em `src/config.ts`.
- [ ] GitHub Pages ativado (Settings → Pages → Source: GitHub Actions) e primeiro deploy verde.
- [ ] Domínio próprio, se houver: configurado em Settings → Pages; `SITE_URL`/`BASE_PATH` conferidos.
- [ ] E-mail em nome do Centro criado; `contato` atualizado em `src/config.ts`; linha removida de `docs/PLACEHOLDERS.md`.
- [ ] Integração GitHub–Zenodo ativada; primeiro release com DOI; DOI registrado no painel (`doi` em `src/data/paineis.yaml`).

## Conteúdo
- [ ] `docs/PLACEHOLDERS.md` sem pendências públicas (a publicação de demonstração pode ser apagada após a primeira publicação real).
- [ ] Ao menos uma publicação real revisada pelas camadas exigidas.
- [ ] Equipe: apenas pessoas com consentimento registrado.

## Qualidade (registrar em `docs/qa/README.md`)
- [ ] CI `quality` verde (tipos, lint, testes, links, axe, Lighthouse ≥ 95).
- [ ] Teste com leitor de tela real (NVDA ou VoiceOver) em Início, uma publicação e um painel.
- [ ] Teste em celular físico (Android e iOS).

## Virada
- [ ] `launched: true` em `src/site.config.ts` (ou build com `CEE_LANCADO=1`), com ADR em `docs/DECISIONES.md`.
- [ ] Autorização escrita para o nome da Universidade na faixa superior (ADR-012); sem ela, `useUniversityName: false`.
- [ ] Conferir as referências IFI (RAF nº 113) e Tesouro na ficha do primário estabilizador (`docs/PENDIENTES.md`).
- [ ] Conferir `robots.txt` (Allow + Sitemap), `sitemap-index.xml` e meta `robots` em produção.
