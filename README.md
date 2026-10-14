<p align="center">
  <img src="assets/brand/logos/logo-on-light.png" alt="Decoding" width="260">
</p>

<h1 align="center">Assessment de Maturidade em IA</h1>

<p align="center">
  Diagnóstico gratuito da <b>Trilha de IA da Decoding</b>: mede o nível de cada pessoa no uso de IA,<br>
  consolida a visão do time e organiza turmas por maturidade.<br><br>
  <b>IA First. Human Driven.</b>
</p>

<p align="center">
  <a href="https://decoding-assessment-ia--edurojasdevelop.replit.app">App publicado</a> ·
  <a href="specs/">Especificação (SDD)</a> ·
  <a href="specs/05-plano.md">Plano de execução</a>
</p>

---

## Sumário

- [O que o app faz](#o-que-o-app-faz)
- [Acesso de demonstração](#acesso-de-demonstração)
- [Metodologia: Spec-Driven Development](#metodologia-spec-driven-development)
- [Stack e arquitetura](#stack-e-arquitetura)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Regras de pontuação](#regras-de-pontuação)
- [Deploy no Replit](#deploy-no-replit)
- [Decisões técnicas (ADRs)](#decisões-técnicas-adrs)
- [Critérios de aceite](#critérios-de-aceite)
- [Limitações e próximos passos](#limitações-e-próximos-passos)

---

## O que o app faz

| Quem                                           | O que faz                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Participante** (sem conta, via link pessoal) | Em 4 passos: lê o aviso de privacidade (LGPD) e dá consentimento, completa o perfil (identificação, função e ferramentas de IA), responde 24 perguntas em 5 dimensões (uma por tela, com atalhos de teclado e progresso) e recebe a **devolutiva individual** com nota, radar, forças, lacunas, próximos passos e curso recomendado. Baixa em **PDF**, copia o link e pode reabrir pelo mesmo endereço. |
| **Administrador da Decoding** (com login)      | Cadastra empresas, **importa participantes por CSV** (com erros por linha), gera e exporta os links, acompanha **concluídos / em andamento / pendentes**, vê o **diagnóstico consolidado** (cobertura, distribuição por nível, radar médio, mapa dimensão × área), os **grupos por maturidade** e monta **turmas** manualmente. |

O painel do admin segue o padrão visual do **Decoding Campus**: menu lateral, seletor de empresa, visão geral com KPIs e lista "Pede atenção".

> Escopo: este app é o **Diagnóstico**. As trilhas (_Escale sua produtividade com IA_, _Do Problema ao Plano_, _Construa Soluções e Produtos Digitais com IA_) aparecem como recomendação de percurso e como oferta associada às turmas.

## Acesso de demonstração

|        |                                                                  |
| ------ | ---------------------------------------------------------------- |
| URL    | https://decoding-assessment-ia--edurojasdevelop.replit.app/admin |
| E-mail | `admin@decoding.demo`                                            |
| Senha  | `decoding-demo`                                                  |

O banco de demonstração traz **2 empresas fictícias** (18 e 22 participantes), respostas cobrindo os 4 níveis e uma turma de exemplo. As credenciais aparecem na tela de login enquanto `DEMO_MODE=true`.

## Metodologia: Spec-Driven Development

O projeto foi construído com **SDD (desenvolvimento guiado por especificação)**: primeiro a especificação, depois a construção em partes, por fim a validação contra critérios objetivos.

1. **Especificar:** o pedido virou documentos versionados em [`specs/`](specs/), com requisitos numerados (RF, RN, RNF).
2. **Planejar:** arquitetura, decisões registradas, modelo de dados e rotas, antes do código.
3. **Dividir:** uma fundação e quatro fatias verticais (cada uma atravessa tela, API e banco).
4. **Construir:** uma fatia por vez, com testes; cada commit cita os requisitos que atende.
5. **Verificar:** testes automatizados e os 7 critérios de aceite do pedido.

**Por que SDD:** a especificação é a fonte da verdade. A IA usada no desenvolvimento segue regras escritas em vez de improvisar, cada parte cresce sem quebrar as outras e um módulo novo começa por uma spec nova, seguindo o mesmo caminho. Isso torna o projeto rastreável, fácil de manter e escalável.

| Documento                                                | Responde                                                 |
| -------------------------------------------------------- | -------------------------------------------------------- |
| [`00-prompt-original.md`](specs/00-prompt-original.md)   | O que o cliente pediu (fonte da verdade; PDF ao lado)    |
| [`01-requisitos.md`](specs/01-requisitos.md)             | O que o sistema faz e quando está pronto                 |
| [`02-arquitetura.md`](specs/02-arquitetura.md)           | Stack, estrutura de pastas e decisões (ADRs)             |
| [`03-dados-e-api.md`](specs/03-dados-e-api.md)           | Modelos e endpoints                                      |
| [`04-pontuacao.md`](specs/04-pontuacao.md)               | Perguntas, pesos, algoritmo, casos de teste e textos     |
| [`05-plano.md`](specs/05-plano.md)                       | Fases, fatias e checklists                               |
| [`06-design-system.md`](specs/06-design-system.md)       | Tokens, tipografia, componentes e tom de voz da Decoding |
| [`07-layout-dashboard.md`](specs/07-layout-dashboard.md) | Shell do admin no padrão Decoding Campus                 |
| [`08-fluxo-participante.md`](specs/08-fluxo-participante.md) | Telas do participante, mockups aprovados e checklist de ajustes |
| [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md)      | Regras para os agentes de IA (Claude Code / Codex)       |

## Stack e arquitetura

| Camada       | Tecnologia                                                                         |
| ------------ | ---------------------------------------------------------------------------------- |
| Frontend     | React 19, Vite, Tailwind CSS v4 (tokens via `@theme`), React Router, ícones Tabler |
| PDF          | jsPDF + html2canvas, gerado no navegador                                           |
| Backend      | Node.js 20, Express 5 (JavaScript ESM)                                             |
| ORM          | Sequelize 6                                                                        |
| Banco        | SQLite em desenvolvimento · PostgreSQL em produção (via `DATABASE_URL`)            |
| Autenticação | bcrypt + JWT em cookie httpOnly (admin) · token UUID no link (participante)        |
| Testes       | Vitest + Supertest                                                                 |
| Deploy       | GitHub → Replit (Express serve o build do React numa porta só)                     |

```
decoding-assessment-ia/
├─ specs/                 especificação (SDD)
├─ assets/                fontes e logos oficiais da Decoding
├─ client/                React + Vite + Tailwind
│  └─ src/
│     ├─ pages/participant/   boas-vindas, seu perfil, perguntas, devolutiva
│     ├─ components/participant/  indicador de etapas, ícones de dimensão e ferramentas
│     ├─ components/report/   devolutiva (tela e PDF), radar, medidor da nota
│     ├─ pages/admin/         login, visão geral, participantes, importar, diagnóstico, grupos, turmas
│     ├─ components/layout/   sidebar, topbar, seletor de empresa
│     ├─ components/ui/       componentes do design system
│     └─ theme/               tokens de cor e tipografia
└─ server/
   └─ src/
      ├─ scoring/         motor de pontuação puro (questions, score, recommend, aggregate)
      ├─ services/        importação CSV, devolutiva, consolidado da empresa
      ├─ routes/          auth, companies, participants, public (/r/:token), turmas, admin
      ├─ models/          Company, User, Participant, AssessmentResponse, Turma, TurmaParticipant
      └─ seed/            dados de demonstração (idempotente)
```

**Princípio central:** toda a pontuação acontece no backend, em funções puras de `server/src/scoring/`, sem banco, sem HTTP e **sem nenhum modelo de IA externo**.

## Como rodar localmente

Requisitos: **Node.js 20.19+** e npm.

```bash
git clone https://github.com/edurojastech/decoding-assessment-ia.git
cd decoding-assessment-ia
cp .env.example .env        # ajuste JWT_SECRET
npm install
npm run dev                 # API (Express) + front (Vite) juntos
```

- No primeiro início, o banco SQLite (`server/data/dev.sqlite`) é criado e populado com os dados de demonstração.
- Admin: abra `/admin/login` e use as credenciais de demonstração.
- Em `npm run dev`, o front fica em **http://localhost:5000** (Vite, recarrega a cada alteração) e a API em 3000. A porta 3000 serve o build de `client/dist`: depois de mexer no front, rode `npm run build` para vê-lo ali.
- Participante de teste: no admin, abra uma empresa → Participantes → copie o link de alguém **pendente**. Para recriar o banco do zero, apague `server/data/dev.sqlite` e rode `npm run seed`.

| Script          | O que faz                                     |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Servidor e front em modo desenvolvimento      |
| `npm test`      | Testes do servidor                            |
| `npm run seed`  | Recria os dados de demonstração (não duplica) |
| `npm run build` | Build de produção do front                    |
| `npm start`     | Express servindo a API e o front compilado    |

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Em produção, configure como **Secrets**, nunca em arquivos versionados.

| Variável                         | Uso                                                        |
| -------------------------------- | ---------------------------------------------------------- |
| `PORT`                           | Porta do servidor (o Replit define)                        |
| `DATABASE_URL`                   | PostgreSQL. Sem ela, usa SQLite local                      |
| `JWT_SECRET`                     | **Obrigatório em produção**; assina o login do admin       |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin criado pelo seed (só quando o banco está vazio)      |
| `PUBLIC_URL`                     | Endereço público usado nos links pessoais                  |
| `DEMO_MODE`                      | Mostra as credenciais na tela de login (`true` por padrão) |

## Testes

```bash
npm test
```

**117 testes** em 10 arquivos, cobrindo:

- **Motor de pontuação:** casos T1–T8 da spec (tudo 4, tudo 0, preenchimento incompleto, dados insuficientes, trava de consistência, "não sei", fronteiras de nível, recomendação), além de evidências e validação.
- **API do participante, importação CSV, empresas, turmas, autenticação, modelos e seed.**
- **Consolidado:** agregação por nível, dimensão e área, e montagem das turmas A/B/C.

## Regras de pontuação

Resumo de [`specs/04-pontuacao.md`](specs/04-pontuacao.md):

- **5 dimensões:** Familiaridade (4 perguntas), Contexto, Aplicação, Revisão e Autonomia (5 cada) = 24 perguntas pontuadas, cada opção de 0 a 4.
- **Pesos por tipo:** autopercepção ×1 · conhecimento ×1,5 · situação prática ×2.
- **Score da dimensão:** `soma(pontos × peso) / soma(4 × peso) × 100`, só com as respondidas. Score geral = média das dimensões pontuadas.
- **Níveis:** Iniciante 0–25 · Básico 26–50 · Intermediário 51–75 · Avançado 76–100.
- **Mínimos:** a dimensão só pontua com ≥ 60% respondido ("dados insuficientes"); o geral, com ≥ 70% ("preenchimento incompleto").
- **Trava de consistência:** autopercepção ≥ 75 e prática ≤ 40 rebaixam o nível em um degrau e mostram "autopercepção acima da prática".
- **"Não sei"** vale 0, sem tom de erro. Ferramentas de IA informadas não pontuam.

> Pesos e faixas são critérios iniciais de pilotagem, sem alegar validação científica.

## Deploy no Replit

1. **Import from GitHub** com este repositório.
2. Em **Secrets**, defina `JWT_SECRET` (e, se quiser, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PUBLIC_URL`).
3. Em **Tools → Database**, ative o **PostgreSQL**. O Replit cria a variável `DATABASE_URL`, e o app passa a usá-la sozinho.
4. A configuração de publicação está no `.replit`:
   - build: `npm install && npm run build`
   - run: `NODE_ENV=production npm start` (modo autoscale)
5. Publique. No primeiro start com banco vazio, o seed roda sozinho; para recarregar os dados de demonstração, rode `npm run seed` no Shell.

Para atualizar: `git push` → no Replit, **Git → Pull → Publicar**.

> Sem Postgres, o deploy autoscale usa SQLite em disco temporário: os dados voltam ao estado inicial a cada reinício.

## Decisões técnicas (ADRs)

| Decisão                                | Motivo                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Sequelize** em vez de Prisma/Drizzle | O pedido exige "um ORM"; Sequelize é a ferramenta dominada e suporta SQLite e Postgres com o mesmo código            |
| **JavaScript** em vez de TypeScript    | O pedido diz "de preferência"; JS acelerou a entrega, com validação nos models e testes                              |
| **SQLite local, Postgres em produção** | Desenvolver sem instalar banco; só tipos portáveis entre os dois                                                     |
| **Motor de pontuação puro**            | É a regra que o cliente confere; isolado e 100% testável                                                             |
| **Questionário como dado**             | Perguntas, pesos e opções num único arquivo, fonte única para back e front                                           |
| **PDF no front**                       | Sem dependência de serviço externo                                                                                   |
| **Design system oficial**              | Prevalece sobre a seção 10 do pedido por ser mais detalhado                                                          |
| **Escala 0–100**                       | O slide comercial mostra o radar de 0 a 5; o pedido técnico pede 0–100 e foi seguido. A exibição pode dividir por 20 |

## Critérios de aceite

| #   | Critério                                                                                   | Status            |
| --- | ------------------------------------------------------------------------------------------ | ----------------- |
| C1  | Cadastro de empresa, importação CSV com validação por linha, geração e exportação de links | ✅                |
| C2  | Participante abre o link, confirma dados, responde, vê a devolutiva e baixa o PDF          | ✅                |
| C3  | Consolidado com cobertura, distribuição por nível, radar e necessidades por área           | ✅                |
| C4  | Agrupamento por nível; turmas criadas e editadas manualmente, com pessoas movíveis         | ✅                |
| C5  | Pontuação exatamente conforme as regras, calculada no backend                              | ✅ testes         |
| C6  | Dados de demonstração populam os dashboards no primeiro acesso                             | ✅                |
| C7  | Design Decoding, responsivo, sem afirmar envio de e-mail                                   | ✅ 1920, 1366 (HD) e 390px |

## Limitações e próximos passos

**Fora do escopo desta fase (por definição do pedido):**

- Envio automático dos links por e-mail: hoje os links são copiados ou exportados, e a interface deixa isso claro.
- Cobrança e qualquer modelo de IA externo.
- Login da empresa cliente.

**Próximos passos sugeridos:**

- Disparo automático de e-mails e verificação de e-mail.
- Acesso de leitura para a empresa cliente ver o diagnóstico.
- Papéis e permissões mais finos; exportação e retenção de dados conforme LGPD.
- Calibrar pesos, faixas e perguntas com um grupo piloto.
- Integração completa como módulo do Decoding Campus.
- Atualizar dependências apontadas pelo `npm audit`, sem `--force`.

---

<p align="center">
  Desenvolvido por <a href="https://dev.eduardorojas.com.br/" target="_blank"><b>Eduardo Rojas</b></a> | Outubro de 2026
</p>
