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
2. **Fluidez.** Jornada em 4 passos (`components/participant/StepIndicator.jsx`): Boas-vindas → Seu perfil →
   Perguntas → Devolutiva. Botão principal sempre visível, avanço automático nas perguntas, atalhos de teclado.
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
- Rodapé do card: "Voltar" (ghost, volta às boas-vindas) e "Começar as perguntas" (primary). Um único `PATCH /api/r/:token`.

### 3 · Perguntas (RF-10)
- **Regra do original: uma dimensão por vez.** A barra lateral marca a dimensão em curso; dentro dela aparece
  **uma pergunta por tela**. Perguntas de outra dimensão nunca aparecem juntas.
- Layout próprio (sem cabeçalho global): barra lateral escura de altura total com logo, dimensões (número, ícone,
  respondidas/total, clicáveis) e anel "X de 24 perguntas" com tempo restante estimado (25 s por pergunta).
- Área principal: rótulo "Dimensão N de 5 · Nome · Pergunta X de 24", barra de progresso, pergunta grande e alternativas
  em linhas limpas (`ui/ChoiceRow.jsx`) com atalho numérico.
- Escolher uma alternativa avança sozinho para a próxima pergunta; teclas 1–N respondem; "Anterior" / "Próxima".
- Nenhuma pergunta é obrigatória (RN-07/RN-08). Ao enviar com perguntas em branco, aviso com "Revisar" e "Enviar assim mesmo".
- Rascunho no `sessionStorage` (ParticipantFlow); ao reabrir, começa na primeira pergunta sem resposta.
- Celular: sem barra lateral; topo com logo e "X de 24".

### 4 e 5 · Devolutiva (RF-11, RF-12)
- Cabeçalho: logo | "Devolutiva individual" e, à direita, "Copiar link" (ghost) e "Baixar PDF" (accent).
- Hero Mesh Escuro: nome, empresa · área · data, medidor da nota (`ScoreGauge`), nível e régua de níveis (`LevelScale`), resumo.
- Mapa: radar à esquerda; à direita, pontuações da maior para a menor (barra, nota, nível) com "Ver por quê" (frase + evidência).
- Faixa "Ponto forte" / "Maior lacuna" (frase de potencialidade para o forte e de lacuna para a lacuna).
- Potencialidades e lacunas lado a lado, só tipografia, com "Ver exemplo" (exemplo + evidência que ainda não apareceu).
- Próximos passos numerados e card da Trilha de IA com o percurso, o convite e o foco curto (dimensões ≤ 40) como itens.
- Bloco 7 (PDF) numa faixa discreta no fim. Sem numeração visível nos blocos.

## Escala (desktop)
- `html.participant-scale` (index.css), ligada em `ParticipantFlow`:
  `font-size: clamp(12px, min(100vw / 90, 100vh / 52), 16px)` a partir de `lg` (1024px).
  FullHD fica em 16px; HD fica em ~12,6px. Tudo em `rem` escala junto.
- **Regra:** em telas do participante, use medidas do Tailwind (rem). Evite `px` fixo em larguras e alturas;
  quando precisar de valor arbitrário, use rem (ex.: `w-[22rem]`, `max-w-[25rem]`).

## PDF (RF-12, ADR-06)
- A versão A4 (`ReportDocument`) usa o mesmo `ReportContent` com `expanded`: os "Ver por quê" / "Ver exemplo" saem abertos.
- Blocos escuros levam `data-pdf-dark` (saem em Code Blue sólido) e cada unidade que não pode quebrar leva `data-pdf-block`.
- `lib/pdf.js` converte para rgba qualquer cor em oklab/oklch antes do html2canvas. Se um componente novo quebrar o PDF
  ("Não foi possível gerar o PDF"), comece por aí.

## Desvios conscientes do mockup
| Mockup | No app | Por quê |
|---|---|---|
| Logos oficiais das ferramentas | Ícones Tabler (marca quando existe) | Logos de terceiros não estão nos assets; trocar em `toolIcons.js` quando houver arquivos oficiais |
| "Sua função" como lista | Campo de texto | P0b é texto curto (`04-pontuacao.md`) |
| Botão "Conhecer a trilha" | Sem botão | Não há página da trilha para linkar (regra 3: a UI não promete o que não faz) |
| "Seu plano para os próximos 30 dias" | "O que fazer a partir de agora" | O prazo de 30 dias não existe no backend |
| Bullets inventados no card da trilha | Foco curto real da pessoa | O texto vem do backend |
| "perfil" em lima no título | Lime 900 (`text-lime-900`) | Mais contraste que o Pulse Lime sobre fundo claro |

## Checklist para novos ajustes de front
- [ ] Leu este arquivo e o mockup da tela; a mudança cita o requisito (RF/RN).
- [ ] Só tokens e componentes do DS (`06-design-system.md`); sem hex solto.
- [ ] Testou em 1920 × 950, 1366 × 650 (HD) e 390 × 760 (celular), sem rolagem lateral.
- [ ] Na devolutiva: gerou o PDF e conferiu as páginas.
- [ ] `npm test` verde e `npm run build` sem erro.
- [ ] Se a mudança altera uma decisão daqui, atualize este arquivo e, se preciso, o mockup em `ref-participante/`.
