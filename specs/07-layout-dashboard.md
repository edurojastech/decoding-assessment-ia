# 07 · Layout do admin no padrão Decoding Campus (dashboard)

> Referência visual: `specs/ref-decoding-campus.png` (print do painel "Visão geral" do Decoding Campus enviado pela Decoding). Abra a imagem antes de implementar.
> Objetivo: o Assessment parecer um **módulo dentro do Decoding Campus**, navegável como dashboard.
> Escopo: **só a área do admin**. O fluxo do participante (`/r/:token`) continua fora do shell (link público, tela limpa).
> Regras: usar tokens do `06-design-system.md`; não mudar API nem regras de negócio; nenhuma função nova de backend é obrigatória (usar `/summary`, `/participants`, `/admin/overview`, `/groups`).

## Shell (AdminLayout)
**Sidebar fixa à esquerda (~240px), fundo Code Blue `#0B1B56`:**
- Topo: logo Decoding (on dark) + label "CAMPUS" (uppercase, letter-spacing 0.2em, pequeno).
- Bloco "ESPAÇO DE TRABALHO": card com borda sutil mostrando a **empresa selecionada** (ícone + nome + "Assessment de IA") e chevron → dropdown para trocar de empresa (lista de `/api/companies`).
- Label "ADMINISTRADORA" e navegação com ícones Tabler (`@tabler/icons-react`, padrão do DS — ver `06-design-system.md`):
  - Visão geral (todas as empresas)
  - Participantes
  - Importar
  - Diagnóstico
  - Grupos
  - Turmas
- Item ativo: fundo `rgba(255,255,255,0.08)`, texto e ícone **Pulse Lime** `#E4FD98`, barra/realce à esquerda. Inativos: texto branco ~80%.
- Rodapé da sidebar: card do usuário (avatar com iniciais em círculo lime, nome "Administrador Decoding", e-mail) + menu "⋯" com "Sair".
- Itens que dependem de empresa ficam desabilitados (com tooltip) se nenhuma empresa estiver selecionada.

**Topbar branca (altura ~64px, borda inferior `#E0E5FA`):**
- Breadcrumb: `Decoding Campus › Assessment de IA › <página>` (último item em Code Blue bold).
- Direita: ícone de ajuda (abre modal curto explicando níveis e cobertura), avatar + nome + chevron (menu com Sair). Sem sino de notificações falso (regra de honestidade: não mostrar notificação que não existe).

**Área de conteúdo:** fundo Surface `#F8F9FE`, largura total ao lado da sidebar, padding 16px (24px a partir de `sm`).

**Responsivo:** < 1024px a sidebar vira drawer (botão hambúrguer na topbar); cards empilham em 1 coluna no celular.

## Cabeçalho de página (padrão de todas as telas)
- Eyebrow uppercase (`OUTUBRO 2026 · ASSESSMENT DE IA` ou nome da empresa), 12px, letter-spacing 0.2em, Code Blue 300.
- H1 leve (Aileron 300/400, ~32px), ex.: "Olá, Administrador" na Visão geral; nome da empresa nas demais.
- Subtítulo em Body Small.
- À direita: ações da página (ex.: "Copiar links pendentes", "Exportar CSV").

## Telas

### Visão geral da empresa (nova landing ao selecionar empresa) — rota `/admin/empresas/:id`
1. **Hero card escuro** (gradiente Mesh Escuro do DS, radius 24px): "Diagnóstico de maturidade em IA", cobertura atual (ex.: "12 de 18 responderam · 67%"), CTA lime "Ver diagnóstico →"; à direita um bloco "PRÓXIMO PASSO" com texto contextual (ex.: "6 pessoas ainda não começaram — copie os links pendentes").
2. **Linha de 4 KPI cards** (brancos, shadow-sm, radius 16px, ícone + label pequeno, número grande peso leve, legenda):
   - **Concluídos** (status `concluido`)
   - **Em andamento** (status `em_andamento`)
   - **Pendentes** (status `pendente`)
   - **Cobertura** (% + barra de progresso Insight)
   Cada card é clicável e leva à lista de Participantes já filtrada pelo status.
3. **Dois painéis lado a lado:**
   - Esquerda "DISTRIBUIÇÃO POR NÍVEL": barras dos 4 níveis (reaproveitar componente da Fatia D) + link "Ver grupos →".
   - Direita "PEDE ATENÇÃO" (badge com contagem): lista derivada dos dados reais — participantes pendentes, respostas com "dados insuficientes", pessoas com a trava "autopercepção acima da prática", participantes sem turma. Cada item leva à tela correspondente. Se vazio: estado "Tudo em dia".
4. Rodapé "IA First. Human Driven." mantido.

### Visão geral de todas as empresas — rota `/admin`
- Cabeçalho "Olá, Administrador" + KPIs macro (empresas, convidados, respondentes, cobertura geral).
- Grid de cards de empresa (já existentes), no mesmo estilo de card.

### Participantes, Importar, Diagnóstico, Grupos, Turmas
- Mesmo conteúdo atual, apenas dentro do shell e com o cabeçalho de página padrão.
- Participantes: chips de filtro por status no topo (Todos · Concluídos · Em andamento · Pendentes) com contagem; aceitar `?status=` na URL.

## Componentes novos/ajustados (`client/src/components/`)
- `layout/Sidebar.jsx`, `layout/Topbar.jsx`, `layout/WorkspaceSwitcher.jsx`, `layout/PageHeader.jsx`
- `ui/KpiCard.jsx`, `ui/HeroCard.jsx`, `ui/AttentionList.jsx`
- Empresa selecionada guardada na URL (`/admin/empresas/:id/...`); lembrar a última em `localStorage` como conveniência.

## Critério de pronto
- Navegar por todas as telas do admin só pela sidebar, sem voltar para listas.
- KPIs de concluídos / em andamento / pendentes batem com a lista de participantes.
- Visual fiel ao print (sidebar navy, item ativo lime, hero escuro, KPI cards) e responsivo (1280px e 390px).
- Testes existentes continuam verdes; nenhuma rota de API alterada.

## Tela de Participantes (redesenho, 13/10)
- Cabeçalho: eyebrow, nome da empresa e subtítulo; à direita, **Copiar todos os links** (ghost) e **Baixar CSV de links** (primary). Com filtro ativo, o primeiro vira "Copiar links filtrados".
- Aviso "Os links não são enviados automaticamente" logo abaixo (RNF-05).
- Card da lista: contagem "X de Y participantes" e botão **Filtros (n)**, que abre um painel com status (com contagens), área e nível. n = filtros ativos. O `?status=` vindo dos KPIs continua funcionando.
- Tabela: Pessoa (avatar, nome, e-mail) · Área · Status · Nível · Ações (Copiar link com ícone, Excluir em vermelho com confirmação).
- Rodapé: "Exibindo X a Y de Z participantes", páginas e seletor 8/16/32 por página (paginação no cliente; copiar e CSV usam a lista filtrada inteira).
- No celular, cada pessoa vira um bloco empilhado; sem rolagem lateral (C7).

## Largura do painel (13/10)
- O conteúdo do admin ocupa toda a largura ao lado da sidebar (sem `max-width`), com margens de 16px no celular e 24px a partir de `sm`, e 24px entre blocos. Topbar e rodapé seguem as mesmas margens.
