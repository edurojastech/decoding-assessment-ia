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
- [ ] Subir pro GitHub e importar no Replit já agora (validar PORT, DATABASE_URL, build) — GitHub ✅ (`edurojastech/decoding-assessment-ia`, privado); import no Replit pendente

## Fase 4 · Fatias
### Fatia A · Participante + pontuação (C2, C5) — prioridade máxima
- [ ] `scoring/questions.js`, `score.js`, testes T1–T8 passando
- [ ] Seed etapa 2: respostas variadas cobrindo os 4 níveis (calculadas pelo motor) e turma exemplo com participantes (RF-19, C6)
- [ ] `GET/PATCH /api/r/:token`, `POST /submit`
- [ ] Telas Welcome (LGPD, 9–12 min) → Identify → Questionnaire (por dimensão, progresso, voltar)
- [ ] **Pronto quando:** responder salva scores/nível no banco e testes passam

### Fatia B · Devolutiva + PDF (C2)
- [ ] `services/reportIndividual.js` (7 blocos, frases + evidências, recomendação)
- [ ] Tela Result com radar, forças, lacunas, próximos passos, aviso de consistência
- [ ] Botão baixar PDF (jspdf + html2canvas) com assinatura
- [ ] **Pronto quando:** PDF baixa e o link reabre a devolutiva

### Fatia C · Admin: empresas, importação, links (C1)
- [ ] CRUD empresa; import CSV (upload/colar), erros por linha, modelo para baixar
- [ ] Lista de participantes com status/filtros; copiar link; exportar CSV
- [ ] **Pronto quando:** CSV com 1 linha inválida importa as válidas e mostra o erro

### Fatia D · Consolidado, grupos, turmas (C3, C4)
- [ ] `/summary`: cobertura, distribuição, radar médio, área × dimensão (heatmap), forças/lacunas
- [ ] Grupos por nível com listas
- [ ] Turmas: criar, renomear, oferta sugerida, mover pessoas
- [ ] Visão geral de todas as empresas
- [ ] **Pronto quando:** dá para montar Turma A/B/C da empresa demo

## Fase 5 · Validar (C1–C7)
| C | Teste | OK |
|---|-------|----|
| C1 | Importar CSV com linha inválida, exportar links | [ ] |
| C2 | Abrir link, responder, ver devolutiva, baixar PDF | [ ] |
| C3 | Consolidado com cobertura, níveis, radar, mapa por área | [ ] |
| C4 | Criar turma e mover pessoa | [ ] |
| C5 | `npm test` verde | [ ] |
| C6 | Banco zerado → start → dashboards populados | [ ] |
| C7 | Celular OK; nenhum texto diz "e-mail enviado" | [ ] |

## Fase 6 · Entregar
- [ ] Deploy no Replit, link público
- [ ] README: stack, como rodar, regras de pontuação, ADRs, credenciais demo
- [ ] Limitações e próximos passos (e-mail automático, acesso do cliente, calibrar pesos)
- [ ] Ensaio da demo: participante → admin → critérios
