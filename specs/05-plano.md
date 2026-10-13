# 05 · Plano de execução

Metodologia: **spec-driven + fatias verticais + aceite por critérios (C1–C7)**.
Regra de corte: se apertar, cortar acabamento visual — nunca a Fatia A nem os testes do motor.
Cada fatia termina com: teste manual + `git commit` + (após Fase 3) `git push` → pull no Replit.

## Fase 1 · Entender ✅
- [x] Requisitos RF/RN/RNF e rastreabilidade → `01-requisitos.md`
- [x] Questionário e regras → `04-pontuacao.md`

## Fase 2 · Planejar ✅
- [x] Arquitetura e ADRs → `02-arquitetura.md`
- [x] Dados e API → `03-dados-e-api.md`

## Fase 3 · Fundação (≈1h30)
- [x] `git init`, `.gitignore`, `package.json` raiz com scripts `dev | build | start | test | seed`
- [x] `server/`: Express, `db.js` (SQLite/Postgres), models, `sync`
- [x] `client/`: Vite + React + Tailwind; copiar `assets/fonts` → `client/public/fonts` e `assets/brand` → `client/public/brand` (logos redimensionados para 600px, símbolos 256px); `theme/tokens.css` + tokens espelhados via `@theme` (Tailwind v4 não usa `tailwind.config.js`); componentes base `ui/` (Button, Card, Input, Badge, Alert, Progress); rotas vazias
- [x] Auth admin (bcrypt + JWT cookie) + tela de login com credenciais demo
- [x] Seed idempotente — etapa 1: 1 admin, 2 empresas (18 e 22 participantes com links), 1 turma vazia. **Respostas nos 4 níveis e turma populada: etapa 2, na Fatia A** (calculadas pelo motor de `scoring/`, regra 1)
- [x] **Pronto quando:** login funciona e `/admin` lista 2 empresas
- [x] Subir pro GitHub e importar no Replit — GitHub ✅ (`edurojastech/decoding-assessment-ia`, privado); Replit ✅ (app rodando, 16 testes ok, build ok). Obs.: o Agent do Replit atualizou a versão do Vitest (vulnerabilidade) — sincronizar via Git

## Fase 4 · Fatias
### Fatia A · Participante + pontuação (C2, C5) — prioridade máxima
- [x] `scoring/questions.js`, `score.js`, `recommend.js`, testes T1–T8 passando (+ fronteiras 60%/70%, trava mínima, evidências, validação)
- [x] Seed etapa 2: respostas variadas cobrindo os 4 níveis (calculadas pelo motor) e turma exemplo com participantes (RF-19, C6) — banco já semeado (Replit): rodar `npm run seed` uma vez
- [x] `GET/PATCH /api/r/:token`, `POST /submit` (12 testes em `public.test.js`)
- [x] Telas Welcome (LGPD, 9–12 min) → Identify → Questionnaire (perfil + por dimensão, progresso, voltar, pular com aviso) → conclusão (Result na Fatia B)
- [x] **Pronto quando:** responder salva scores/nível no banco e testes passam — verificado via API pelo proxy do Vite; revisão visual no navegador pendente

### Fatia B · Devolutiva + PDF (C2)
- [x] `services/reportIndividual.js` (blocos 1–6, frases + evidências, recomendação) + `GET /api/r/:token/result` (16 testes em `reportIndividual.test.js` + 3 em `public.test.js`)
- [x] Tela Result com radar, forças, lacunas, próximos passos, aviso de consistência (substitui a tela de conclusão)
- [x] Botão baixar PDF (jspdf + html2canvas) com identificação e assinatura em todas as páginas (bloco 7)
- [x] **Pronto quando:** PDF baixa e o link reabre a devolutiva — verificado no Chrome headless (desktop 1280px e celular 390px) com participantes do seed, incluindo a trava de consistência

### Fatia C · Admin: empresas, importação, links (C1)
- [x] CRUD empresa (inclui `PATCH /api/companies/:id` para renomear); import CSV (upload/colar), erros por linha, modelo para baixar — `services/csvImport.js` (aspas, BOM, `,` `;` ou tab colado de planilha; arquivo lido no navegador, UTF-8 ou Windows-1252, e enviado como `{csv}`); linhas inválidas voltam para a área de texto para correção
- [x] Lista de participantes com status/filtros (área, nível, status); copiar link (e todos, em formato de planilha); exportar CSV `nome,email,link`; excluir participante/empresa com confirmação (RF-18). Links usam `PUBLIC_URL` ou a origem acessada pelo admin (`trust proxy` → https no Replit)
- [x] **Pronto quando:** CSV com 1 linha inválida importa as válidas e mostra o erro — 21 testes (`csvImport.test.js` + `companies.test.js`) e verificado no Chrome headless (desktop 1280px e celular 390px): cadastro → importação com linha inválida → lista → filtros → copiar → exportar → excluir

### Fatia D · Consolidado, grupos, turmas (C3, C4)
- [x] `/summary`: cobertura, distribuição, radar médio, área × dimensão (heatmap), forças/lacunas — agregação pura em `scoring/aggregate.js` (regra 1), blocos 1–6 em `services/reportCompany.js`; filtro por área (`?area=`) e ordenação do heatmap por dimensão
- [x] Grupos por nível com listas (incompletos à parte; filtro por área; "criar turma com este grupo")
- [x] Turmas: criar, renomear, oferta sugerida, mover pessoas, excluir (pessoas voltam para "sem turma"); composição por nível e foco por dimensão
- [x] Visão geral de todas as empresas (`GET /api/admin/overview`: macro + distribuição por empresa)
- [x] **Pronto quando:** dá para montar Turma A/B/C da empresa demo — 17 testes (`aggregate.test.js` + `turmas.test.js`, incluindo A/B/C e mover) e verificado no Chrome headless (desktop 1280px e celular 390px): diagnóstico, grupos → criar turma, turmas, visão geral

## Fase 4.5 · Shell de dashboard (padrão Decoding Campus) — ver `07-layout-dashboard.md`
- [x] Sidebar navy + topbar com breadcrumb + seletor de empresa (`components/layout/`; empresa na URL, última lembrada em localStorage)
- [x] Visão geral da empresa: hero, KPIs (concluídos · em andamento · pendentes · cobertura), distribuição por nível, "Pede atenção" — sem o item "autopercepção acima da prática": a flag `inconsistency` não sai em nenhum endpoint do admin e a API ficou intocada
- [x] Telas existentes dentro do shell com cabeçalho padrão; filtro por status via URL (`?status=`)
- [x] Responsivo (drawer < 1024px) e testes verdes — 117 testes; verificado no Chrome headless (1280px e 390px), sem rolagem horizontal
- [x] **Pronto quando:** todo o admin é navegável pela sidebar e os KPIs batem com a lista (mesma fonte: `statusCounts`; ex.: 2 pendentes → 2 linhas)

## Fase 5 · Validar (C1–C7)
| C | Teste | OK |
|---|-------|----|
| C1 | Importar CSV com linha inválida, exportar links | [x] |
| C2 | Abrir link, responder, ver devolutiva, baixar PDF | [ ] |
| C3 | Consolidado com cobertura, níveis, radar, mapa por área | [x] |
| C4 | Criar turma e mover pessoa | [x] |
| C5 | `npm test` verde | [ ] |
| C6 | Banco zerado → start → dashboards populados | [ ] |
| C7 | Celular OK; nenhum texto diz "e-mail enviado" | [ ] |

## Fase 6 · Entregar
- [ ] Deploy no Replit, link público
- [ ] README: stack, como rodar, regras de pontuação, ADRs, credenciais demo
- [ ] Limitações e próximos passos (e-mail automático, acesso do cliente, calibrar pesos)
- [ ] Ensaio da demo: participante → admin → critérios
