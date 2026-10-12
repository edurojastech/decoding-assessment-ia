# 03 · Modelo de dados e API

## Models (Sequelize)

**Company** — id, name, createdAt

**User** — id, name, email (único), passwordHash, role (`admin`)

**Participant** — id, companyId → Company, name, email, area, token (único, UUID), status (`pendente` | `em_andamento` | `concluido`), consentAt, role (função, P0b), tools (JSON, P0c), createdAt
- Índice único (companyId, email)

**AssessmentResponse** — id, participantId → Participant (1:1), answers (JSON `{Q1: 3, Q4: 'nao_sei', ...}`), dimensionScores (JSON `{familiaridade: {score, level, status, strength, gap}, ...}`), overallScore, overallLevel, flags (JSON `{inconsistency: bool, incomplete: bool}`), selfAvg, practiceAvg, submittedAt

**Turma** — id, companyId, name, sourceLevel, offer (texto opcional)

**TurmaParticipant** — turmaId, participantId (participante em no máx. 1 turma por empresa)

Grupos por maturidade = `GROUP BY overallLevel` (sem tabela).

## Endpoints REST

### Auth (admin)
- `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`

### Empresas (admin)
- `POST /api/companies` · `GET /api/companies` · `GET /api/companies/:id`
- `DELETE /api/companies/:id`
- `GET /api/companies/:id/summary` → consolidado (cobertura, distribuição, médias por dimensão, área × dimensão, potencialidades, lacunas)

### Participantes (admin)
- `POST /api/companies/:id/participants/import` body `{csv}` ou multipart → `{imported, errors:[{line, reason, raw}]}`
- `GET /api/companies/:id/participants?area=&level=&status=`
- `GET /api/companies/:id/participants/export` → CSV `nome,email,link`
- `DELETE /api/participants/:id`
- `GET /api/template.csv`

### Participante (público, por token)
- `GET /api/r/:token` → identificação + questionário + status
- `PATCH /api/r/:token` → consentimento e correção de identificação
- `POST /api/r/:token/submit` → calcula e salva scores
- `GET /api/r/:token/result` → devolutiva montada

### Grupos e turmas (admin)
- `GET /api/companies/:id/groups` → contagem e listas por nível
- `POST /api/companies/:id/turmas` · `PATCH /api/turmas/:id` (renomear/oferta) · `DELETE /api/turmas/:id`
- `PATCH /api/turmas/:id/move` body `{participantId, toTurmaId|null}`

### Admin
- `GET /api/admin/overview` → todas as empresas: convidados, respondentes, cobertura, distribuição

## Rotas do front
- `/r/:token` → Welcome → Identify → Questionnaire → Result
- `/admin/login`, `/admin`, `/admin/empresas/:id` (abas: Participantes · Importar · Diagnóstico · Grupos · Turmas)
