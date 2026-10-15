# 08 · Fluxo do participante (front-end)

> Especificação das telas que o participante vê, do link pessoal à devolutiva.
> Vale junto com `06-design-system.md` (tokens e componentes) e cita os requisitos de `01-requisitos.md`.
> **Antes de mexer em qualquer tela do participante, leia este arquivo e compare com o mockup de referência.**

## Referência visual (mockups aprovados)
Os mockups ficam em [`ref-participante/`](ref-participante/) e foram aprovados na apresentação
"Decoding Assessment — Antes e Depois" (14/10/2026). Eles mostram a **direção visual**: o texto real vem
sempre do backend e do questionário (`server/src/scoring/`), nunca do mockup.

| Tela | Mockup | Componente |
|---|---|---|
| 1 · Boas-vindas e consentimento | [`1-boas-vindas.jpg`](ref-participante/1-boas-vindas.jpg) | `pages/participant/Welcome.jsx` |
| 2 · Seu perfil | [`2-seu-perfil.jpg`](ref-participante/2-seu-perfil.jpg) | `pages/participant/Identify.jsx` |
| 3 · Perguntas | [`3-perguntas.jpg`](ref-participante/3-perguntas.jpg) | `pages/participant/Questionnaire.jsx` |
| 4 · Devolutiva, topo | [`4-devolutiva-topo.jpg`](ref-participante/4-devolutiva-topo.jpg) | `pages/participant/Result.jsx` + `components/report/ReportContent.jsx` |
| 5 · Devolutiva, plano | [`5-devolutiva-plano.jpg`](ref-participante/5-devolutiva-plano.jpg) | idem |

## Princípios
1. **Clean e respirável.** Card só onde faz sentido: blocos escuros (Mesh Escuro) no hero da devolutiva, na barra
   lateral das perguntas e no card da Trilha de IA; o card branco do perfil. O resto fica direto no fundo `surface`,
   separado por espaço e linhas finas (`border-code-blue-100`).
2. **Fluidez com controle.** Jornada em 4 passos (`components/participant/StepIndicator.jsx`): Boas-vindas → Seu perfil →
   Perguntas → Devolutiva. O indicador aparece no topo de **todas** as etapas depois das boas-vindas
   (perfil, perguntas e devolutiva), marcando as concluídas e a atual (na devolutiva, "Pronta"). Botão principal sempre visível, avanço só pelo botão (ou Enter), atalhos de teclado para marcar.
3. **Cabe na tela.** Desktop com escala proporcional (ver "Escala") e conteúdo largo até `90rem`, sem faixas vazias.
   Boas-vindas e Seu perfil cabem inteiros em HD (1366 × 768, ~650px úteis no navegador); celular sem rolagem lateral.
4. **Uma informação, um lugar.** Cada evidência (RN-10) aparece uma vez; detalhes abrem sob demanda.

## Telas

### 1 · Boas-vindas (RF-08)
- Duas colunas no desktop (`lg`), com altura da janela: hero Mesh Escuro à esquerda; privacidade à direita, **sem card**.
- Hero: logo on dark, label, título "Decodifique seu potencial em **IA.**" (IA em Pulse Lime), "Olá, {nome}.", chips
  (tempo · nº de perguntas · nº de dimensões) e linha do tempo das dimensões com número + ícone (`dimensionIcons.js`).
- Privacidade em 4 itens curtos com ícone; o texto completo do aviso (LGPD) fica em "Ler detalhes" (`<details>`).
- Consentimento (`OptionCard variant="plain"`) + botão accent "Começar o diagnóstico".

### 2 · Seu perfil (RF-09 + P0a–P0c)
- Identificação e perfil numa única etapa, dentro de um `Card` branco em duas colunas.
- Esquerda: "Seus dados" em modo leitura (caixas `code-blue-50`), com "Editar" que abre os campos; "Sua função" (P0b, texto livre).
- Direita: ferramentas de IA (P0c) em grade de cards com checkbox e ícone (`toolIcons.js`); "Nenhuma" exclui as demais.
  **Obrigatório marcar pelo menos uma** (pode marcar várias); sem nenhuma, a etapa não avança e mostra o erro abaixo da grade.
  "Sua função" continua opcional.
- Rodapé do card: "Voltar" (ghost, volta às boas-vindas) e "Começar as perguntas" (primary). Um único `PATCH /api/r/:token`.

### 3 · Perguntas (RF-10)
- **Regra do original: uma dimensão por vez.** A barra lateral marca a dimensão em curso; dentro dela aparece
  **uma pergunta por tela**. Perguntas de outra dimensão nunca aparecem juntas.
- Layout próprio (sem cabeçalho global): barra lateral escura de altura total com logo, dimensões (número, ícone,
  respondidas/total, clicáveis) e anel "X de 24 perguntas" com tempo restante estimado (25 s por pergunta).
- Área principal: rótulo "Dimensão N de 5 · Nome · Pergunta X de 24", barra de progresso, pergunta grande e alternativas
  em linhas limpas (`ui/ChoiceRow.jsx`) com atalho numérico.
- Marcar uma alternativa **não avança sozinho**: só habilita "Próxima", e a pessoa pode trocar a resposta antes de seguir.
  A navegação é sempre pelo botão "Próxima" (ou Enter); teclas 1–N marcam a alternativa; "Anterior" volta.
- **Toda pergunta precisa de resposta para avançar** ("Não sei" conta como resposta): "Próxima" fica desabilitado até
  marcar, e a barra lateral só deixa ir até a primeira pergunta ainda sem resposta. O envio só acontece com as 24 respondidas.
  O backend continua tratando respostas parciais (RN-07/RN-08) por segurança, mas a tela não deixa enviar em branco.
- Rascunho no `sessionStorage` (ParticipantFlow); ao reabrir, começa na primeira pergunta sem resposta.
- Celular: sem barra lateral; topo com logo e "X de 24".

### 4 e 5 · Devolutiva (RF-11, RF-12 + guia "Front 1 · Devolutiva no app")
Leitura de ~2 minutos (250 a 400 palavras além de rótulos e notas). Cada bloco acrescenta uma informação;
evidências extensas, análise por pergunta e plano completo ficam no PDF. Texto pronto em `report.screen`
(`server/src/services/reportScreen.js`, frases em `server/src/scoring/screenPhrases.js`, testes em `__tests__/reportScreen.test.js`).
1. Identificação: nome no título; empresa · área · função · data no hero.
2. Seu resultado (hero Mesh Escuro): medidor (`ScoreGauge`), nível, régua (`LevelScale`) e síntese de 60 a 90 palavras.
3. Cinco dimensões: barras na ordem do instrumento, com nota, nível (texto) e uma frase curta; "Ver resposta" abre a
   evidência ("você declarou" / "na situação apresentada, você selecionou"). Radar ao lado como leitura secundária.
4. Prioridades: "Seu foco agora" com até duas prioridades e a "Força relativa" (maior nota fora do foco, nunca
   competência consolidada). Dimensão já Avançado não vira "ponto de desenvolvimento".
5. Primeira ação com entrega esperada e nota sobre dados da empresa; card da Trilha de IA com a justificativa
   (as prioridades) e a aprendizagem sugerida.
6. Relatório completo: faixa com "Baixar relatório completo" (cabeçalho: "Baixar relatório").
7. "Como interpretar seus resultados": área expansível com escala, arredondamento, base do cálculo, dimensões,
   data, versões e alcance individual do diagnóstico.
- Versões: o envio grava `flags.versions` (instrumento, pontuação, textos). Se a leitura atual usar outra versão,
  a área de metodologia avisa. Tela e PDF usam o mesmo registro e a mesma base de cálculo.
- Celular: nas linhas das dimensões, nome e nota na primeira linha e a barra embaixo (sem rolagem lateral em 390 px).

## Escala (desktop)
- `html.participant-scale` (index.css), ligada em `ParticipantFlow`:
  `font-size: clamp(12px, min(100vw / 90, 100vh / 52), 16px)` a partir de `lg` (1024px).
  FullHD fica em 16px; HD fica em ~12,6px. Tudo em `rem` escala junto.
- **Regra:** em telas do participante, use medidas do Tailwind (rem). Evite `px` fixo em larguras e alturas;
  quando precisar de valor arbitrário, use rem (ex.: `w-[22rem]`, `max-w-[25rem]`).

## PDF (RF-12, ADR-06 + guia "Front 2 · Relatório PDF")
O PDF não é mais uma captura da tela: é uma análise individual que pode ser lida sem o app.
- **Estrutura:** 4 páginas principais + apêndice de metodologia (1 página; se não couber, quebra entre seções).
  1. Síntese e resultados: identificação (nome, empresa, área, função, data, versão do instrumento), nota geral e nível
     (único bloco escuro), um gráfico de barras das 5 dimensões, leitura integrada e nota sobre a metodologia.
  2. Análise por dimensão: evidência selecionada (tipo da questão + resposta), interpretação e comportamento a desenvolver.
  3. Prioridades do perfil: conexões entre dimensões, sequência recomendada (ordem · prioridade · justificativa) e
     destaque de respostas divergentes, quando houver.
  4. Plano de desenvolvimento: até 3 etapas (dias 1–7, 8–14, 15–30) com ação, entrega e como verificar; registro da
     evolução; responsável pela continuidade; percurso sugerido (bloco escuro) com objetivo de aprendizagem.
  5. Apêndice: definições, escala, regras de pontuação lidas do motor (`SCORING_RULES`, `WEIGHTS`, `INSTRUMENT_VERSION`),
     natureza das evidências e limites de interpretação.
- **Conteúdo:** vem pronto do backend em `report.analysis` (`server/src/services/reportAnalysis.js`, textos em
  `server/src/scoring/analysisPhrases.js`, testes em `__tests__/reportAnalysis.test.js`). O front só diagrama.
  Cada frase descreve a resposta dada; nada de afirmar o que a pergunta não mede (ex.: "ajuda colegas" sem Q22).
- **Prioridades:** nota + conteúdo (escolha de 0–1 ponto em conhecimento/situação) + divergência (duas situações
  práticas da mesma dimensão, uma 3–4 e outra 0–1). Não são automaticamente as duas menores notas.
- **Desenho:** `client/src/lib/pdf.js` desenha em vetor com jsPDF (texto selecionável), fonte Aileron em TTF
  (`client/public/fonts/pdf/`, convertida do OTF porque o jsPDF só incorpora TrueType). Layout editorial: estrutura
  por tipografia, fios e tabelas; cards só no resultado geral, no destaque de divergência e no percurso.
  Cada página é medida antes de desenhar e usa a maior escala de fonte que cabe nela.
- Para conferir sem navegador: `buildReportPdf({ participant, report })` devolve o documento jsPDF.
- `ReportDocument.jsx` não é mais usado pelo PDF e pode ser removido.

## Desvios conscientes do mockup
| Mockup | No app | Por quê |
|---|---|---|
| Logos oficiais das ferramentas | Ícones Tabler (marca quando existe) | Logos de terceiros não estão nos assets; trocar em `toolIcons.js` quando houver arquivos oficiais |
| "Sua função" como lista | Campo de texto | P0b é texto curto (`04-pontuacao.md`) |
| Botão "Conhecer a trilha" | Sem botão | Não há página da trilha para linkar (regra 3: a UI não promete o que não faz) |
| "Seu plano para os próximos 30 dias" | "O que fazer a partir de agora" (na tela) | O plano de 30 dias está no PDF (`report.analysis.plan`); a tela mantém as ações curtas |
| Bullets inventados no card da trilha | Foco curto real da pessoa | O texto vem do backend |
| "perfil" em lima no título | Lime 900 (`text-lime-900`) | Mais contraste que o Pulse Lime sobre fundo claro |

## Checklist para novos ajustes de front
- [ ] Leu este arquivo e o mockup da tela; a mudança cita o requisito (RF/RN).
- [ ] Só tokens e componentes do DS (`06-design-system.md`); sem hex solto.
- [ ] Testou em 1920 × 950, 1366 × 650 (HD) e 390 × 760 (celular), sem rolagem lateral.
- [ ] Na devolutiva: gerou o PDF e conferiu as páginas.
- [ ] `npm test` verde e `npm run build` sem erro.
- [ ] Se a mudança altera uma decisão daqui, atualize este arquivo e, se preciso, o mockup em `ref-participante/`.

## Revisão da devolutiva (15/10, doc "Ajustes front - Assessment")
- Seções editoriais, sem card; só o hero e o "Percurso sugerido" ficam em bloco (raio 12px).
- Resultado por dimensão em linhas: dimensão e descrição | barra na escala 0–100 (marcas a cada 25) com nota e nível | interpretação. No celular, empilha nessa ordem.
- Radar removido da tela (as barras alinhadas comparam melhor). O PDF não muda (desenho vetorial em `lib/pdf.js`); gerado e conferido: 5 páginas.
- "Entrega esperada" com linha lateral em vez de caixa; "Como interpretar" com linha superior em vez de caixa.
