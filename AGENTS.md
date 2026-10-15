# CLAUDE.md — Decoding · Assessment de Maturidade em IA

App fullstack de diagnóstico de maturidade em IA (porta de entrada da Trilha de IA da Decoding).
**A especificação está em `specs/`. Leia o arquivo relevante antes de implementar e cite o ID (RF-xx, RN-xx, Cx).**

- `specs/00-prompt-original.md` prompt original da Decoding (fonte da verdade; o PDF está ao lado). Em caso de conflito, o original vence — e avise.
- `specs/01-requisitos.md` requisitos e critérios de aceite
- `specs/02-arquitetura.md` stack, ADRs, estrutura de pastas
- `specs/03-dados-e-api.md` models e endpoints
- `specs/04-pontuacao.md` perguntas, algoritmo, testes, frases
- `specs/05-plano.md` fases e fatias (marque os checkboxes ao concluir)
- `specs/07-layout-dashboard.md` layout do admin no padrão Decoding Campus (sidebar, KPIs, hero)
- `specs/06-design-system.md` design system Decoding (tokens, tipografia, componentes, tom de voz)
- `specs/08-fluxo-participante.md` telas do participante (boas-vindas → perfil → perguntas → devolutiva), mockups aprovados em `specs/ref-participante/`, escala e regras do PDF

## Stack
React + Vite + Tailwind (client/) · Node 20 + Express, JavaScript ESM (server/) · Sequelize · SQLite local / Postgres via `DATABASE_URL` · Vitest.

## Comandos
- `npm run dev` — client + server
- `npm test` — testes (motor de pontuação obrigatório)
- `npm run seed` — dados demo
- `npm run build` && `npm start` — produção

## Regras invioláveis
1. Pontuação só em `server/src/scoring/`, funções puras, determinísticas, com testes. Nunca calcular no front.
2. Nenhuma IA externa, nenhum envio de e-mail, nenhuma cobrança.
3. A UI nunca afirma ter enviado e-mail ou feito algo que não fez.
4. Toda a interface em pt-BR, tom de desenvolvimento, sem prometer ganho percentual.
5. Resultados da empresa sempre como "visão dos respondentes" + cobertura.
6. Servidor: `process.env.PORT`, host `0.0.0.0`; segredos só em env.
7. Só tipos Sequelize portáveis entre SQLite e Postgres.
8. Trabalhe por fatia (specs/05-plano.md). Ao fim de cada uma: testes verdes e commit.

## Design (obrigatório)
Todo o front segue o design system oficial: https://design-system-decoding.vercel.app/ — resumo em `specs/06-design-system.md` (prevalece sobre a seção 10 do prompt).
- Use só os tokens de `client/src/theme/tokens.css` (espelhados no Tailwind). Nunca hex solto nos componentes.
- Componentes em `client/src/components/ui/` com a API do DS (Button, Card, Input, Badge, Alert, Tag, Progress, Avatar).
- Fontes Aileron/Just Sans locais (`assets/fonts`, @font-face no 06-design-system.md), Inter só como fallback; logos em `assets/brand`; labels em uppercase + letter-spacing 0.2em; grid de 8px.
- 60% Insight · 40% Lime; texto Code Blue no claro, branco no escuro; cores semânticas só para estado.
- Rodapé: "IA First. Human Driven." + espaço para logo Decoding.

## Front do participante (obrigatório)
- Siga `specs/08-fluxo-participante.md` e o mockup da tela em `specs/ref-participante/`; desvios só registrados na tabela "Desvios conscientes".
- Questionário: uma dimensão por vez (original) e, dentro dela, uma pergunta por tela.
- Medidas em rem (escala `html.participant-scale`); conferir em 1920×950, 1366×650 e 390×760.
- Mudou a devolutiva? Gere o PDF e confira. O PDF segue o guia "Front 2": 4 páginas + apêndice, conteúdo em `report.analysis` (services/reportAnalysis.js) e desenho vetorial em `lib/pdf.js` (ver specs/08, seção PDF).
