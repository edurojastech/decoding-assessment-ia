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

## Fase 4.6 · Redesign do fluxo do participante (branch `feat/melhoria-visual-avaliacao-participante`)
- [x] Jornada em 4 passos com indicador (`components/participant/StepIndicator.jsx`): boas-vindas → seu perfil → perguntas → devolutiva
- [x] Boas-vindas (RF-08) em 2 colunas: hero Mesh Escuro + privacidade direto no fundo claro, botão de início visível sem rolar; aviso completo em "Ler detalhes"
- [x] "Seu perfil" (RF-09 + P0b/P0c): identificação em modo leitura com "Editar", função e ferramentas de IA com ícone numa só etapa
- [x] Perguntas (RF-10): segue uma dimensão por vez (original, seção 2) — a barra lateral marca a dimensão em curso e, dentro dela, aparece uma pergunta por tela, com avanço automático ao responder, atalhos 1–N e anel de progresso com tempo restante (`ui/ChoiceRow.jsx`)
- [x] Telas refeitas fiéis aos mockups aprovados (apresentação "Decoding Assessment — Antes e Depois"): perfil em card com dados em caixas, ferramentas com ícone, Voltar/Começar; devolutiva com Copiar link + Baixar PDF no cabeçalho, ponto forte / maior lacuna, "Ver por quê" e "Ver exemplo" (abertos no PDF), foco curto dentro do card da Trilha
- [x] Devolutiva (RF-11/RF-12) em largura de painel: hero com medidor e régua de níveis; blocos 2–5 sem cards, separados por espaço e linhas finas; cada evidência (RN-10) aparece uma vez; bloco 7 vira uma linha no fim; numeração dos blocos removida (pulava de 05 para 07 sem o bloco 6)
- [x] Evidência não duplica aspas de opções que já vêm entre aspas ("Faça do seu jeito") — teste em `reportIndividual.test.js`
- [x] Respostas obrigatórias na interface: cada pergunta precisa de uma resposta para avançar e P0c exige ao menos uma ferramenta (ou "Nenhuma")
- [x] Escala proporcional `html.participant-scale`: boas-vindas e perfil cabem inteiros em HD (1366 × 768)
- [x] Documentação: `08-fluxo-participante.md` (telas, desvios conscientes, checklist) e mockups em `specs/ref-participante/`
- [x] **Pronto quando:** fluxo completo e PDF verificados no Chrome headless (1920, 1366 e 390px, sem rolagem lateral) e 118 testes verdes

## Fase 5 · Validar (C1–C7)
| C | Teste | OK |
|---|-------|----|
| C1 | Importar CSV com linha inválida, exportar links | [x] |
| C2 | Abrir link, responder, ver devolutiva, baixar PDF (testado no app publicado: desktop e celular, PDF de 6 páginas) | [x] |
| C3 | Consolidado com cobertura, níveis, radar, mapa por área | [x] |
| C4 | Criar turma e mover pessoa | [x] |
| C5 | `npm test` verde (117/117) | [x] |
| C6 | Banco zerado → start → dashboards populados (seed no start do deploy) | [x] |
| C7 | Celular OK (390px, sem rolagem lateral, menu em gaveta); nenhum texto diz "e-mail enviado" | [x] |

## Fase 6 · Entregar
- [x] Deploy no Replit, link público (decoding-assessment-ia--edurojasdevelop.replit.app)
- [x] README: stack, como rodar, regras de pontuação, ADRs, credenciais demo
- [x] Limitações e próximos passos (e-mail automático, acesso do cliente, calibrar pesos) — no README
- [ ] Ensaio da demo: participante → admin → critérios
