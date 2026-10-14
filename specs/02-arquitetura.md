# 02 · Arquitetura e decisões

## Stack
| Camada | Escolha |
|--------|---------|
| Frontend | React + Vite + Tailwind CSS · react-router · radar da devolutiva em SVG próprio (Fatia B); Recharts fica para os gráficos do consolidado (Fatia D), se necessário |
| PDF | Gerado no front (view imprimível + `html2canvas` + `jspdf`) |
| Backend | Node.js 20 + Express (JavaScript ESM) |
| ORM | **Sequelize** |
| Banco | SQLite em desenvolvimento · PostgreSQL no Replit (mesmo código, troca por `DATABASE_URL`) |
| Auth admin | bcrypt + JWT em cookie httpOnly |
| Testes | Vitest (motor de pontuação + importação CSV) |
| Deploy | GitHub → Replit (Express serve o build do React numa porta só) |

## ADRs (decisões registradas)
- **ADR-01 · Sequelize em vez de Prisma/Drizzle.** O prompt sugere Prisma ou Drizzle ("use um ORM"); Sequelize atende ao requisito, é a ferramenta dominada pelo time e suporta SQLite e Postgres com o mesmo código. Custo: tipagem mais fraca → compensado com validações nos models e testes.
- **ADR-02 · SQLite local, Postgres em produção.** Desenvolvimento sem instalar banco; no Replit, `DATABASE_URL` aponta para o Postgres nativo. Usar só tipos portáveis (JSON → `DataTypes.JSON`, sem features exclusivas de um banco).
- **ADR-03 · Motor de pontuação puro (`server/src/scoring/`).** Funções sem banco nem HTTP; recebem respostas, devolvem scores, níveis, flags e evidências. 100% coberto por testes. Atende C5.
- **ADR-04 · Questionário como dado (`server/src/scoring/questions.js`).** Perguntas, opções, pontos e tipos num único arquivo; o front recebe via API. Fonte única de verdade.
- **ADR-05 · Participante por token.** UUID v4 aleatório no link `/r/:token`; sem conta.
- **ADR-06 · PDF no front.** Sem serviço externo (seção 13). `client/src/lib/pdf.js` captura uma versão A4 fora da tela (`ReportDocument`) com html2canvas, recorta por bloco (`data-pdf-block`, nunca quebrado entre páginas) e monta com jsPDF; cabeçalho de identificação e rodapé "IA First. Human Driven." em todas as páginas. Bibliotecas carregadas sob demanda. Radar em SVG próprio (sem animação nem medição assíncrona) para sair igual na tela e no PDF.
- **ADR-07 · Monorepo simples** com `client/` e `server/`; em produção, `server` serve `client/dist`.
- **ADR-08 · Grupos por maturidade derivados** do nível de cada `AssessmentResponse` (sem tabela).

## Estrutura de pastas
```
decoding-assessment-ia/
├─ CLAUDE.md / AGENTS.md
├─ specs/                     # esta especificação
├─ package.json               # scripts raiz: dev, build, start, test, seed
├─ client/                    # React + Vite + Tailwind
│  └─ src/
│     ├─ pages/participant/   # Welcome, Identify (Seu perfil), Questionnaire, Result — ver 08-fluxo-participante.md
│     ├─ components/participant/ # StepIndicator, dimensionIcons, toolIcons
│     ├─ components/report/   # ReportContent, ReportDocument (PDF), RadarChart, ScoreGauge, LevelScale
│     ├─ pages/admin/         # Login, Overview, Company, Import, Participants, Diagnosis, Groups, Turmas
│     ├─ components/          # RadarChart, LevelBars, CoverageBadge, Heatmap, Pill...
│     ├─ lib/api.js
│     └─ theme/               # tokens de cor Decoding
└─ server/
   └─ src/
      ├─ index.js             # app Express, PORT, 0.0.0.0, serve client/dist
      ├─ db.js                # Sequelize (SQLite | Postgres)
      ├─ models/              # Company, User, Participant, AssessmentResponse, Turma, TurmaParticipant
      ├─ routes/              # auth, companies, participants, public (r/:token), turmas, admin
      ├─ middleware/auth.js
      ├─ services/            # csvImport, reportIndividual, reportCompany, companyData
      ├─ scoring/             # questions.js, score.js, recommend.js, aggregate.js, phrases.js  (+ __tests__)
      └─ seed/seed.js
```

## Requisitos do Replit (deixar prontos desde a Fase 3)
- `app.listen(process.env.PORT || 3000, '0.0.0.0')`
- `DATABASE_URL` → Postgres; sem ela → `server/data/dev.sqlite`
- `npm run build` (client) e `npm start` (server) no `package.json` raiz
- Segredos em env: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `sequelize.sync()` + seed idempotente no primeiro start (se não houver admin)
- `engines.node: ">=20"`
