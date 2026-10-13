# 04 · Questionário, pontuação e textos

Tipos: **A** = autopercepção (peso 1) · **C** = conhecimento (peso 1,5) · **P** = prática (peso 2).
`[ns]` = aceita "não sei" valendo 0.

## Perfil (não pontua)
- P0a Área: RH, Comercial, Operações, Administrativo, Financeiro, Marketing, Liderança, Outra
- P0b Função (texto curto)
- P0c Ferramentas (múltipla): Claude, Gemini, Microsoft Copilot, ChatGPT, NotebookLM, Outra, Nenhuma

## Familiaridade
- Q1 A · Com que frequência você usa IA no trabalho? Nunca 0 · Raramente 1 · Algumas vezes por semana 2 · Quase todo dia 3 · Várias vezes ao dia 4
- Q2 A · Quão confortável você fica ao usar IA numa tarefa nova? Nada 0 · Pouco 1 · Mais ou menos 2 · Confortável 3 · Muito confortável 4
- Q3 A · Quando surge uma tarefa nova, você se lembra de considerar a IA? Nunca 0 · Raramente 1 · Às vezes 2 · Quase sempre 3 · Sempre 4
- Q4 C [ns] · O que a IA generativa faz bem hoje? Gera e transforma texto e dados a partir de instruções e contexto 4 · Garante informações sempre corretas 0 · Substitui a decisão humana 0 · Só serve para programação 1

## Contexto
- Q5 P · Qual pedido tende a dar melhor resultado? Pedido vago ("escreva algo sobre vendas") 0 · Com objetivo, contexto, público e formato 4 · De uma linha só 1 · "Faça do seu jeito" 0
- Q6 C [ns] · O que mais melhora a resposta? Dar contexto e exemplos 4 · Escrever em maiúsculas 0 · Repetir o pedido várias vezes 1 · Usar a ferramenta mais cara 0
- Q7 A · Você informa objetivo, público, restrições e formato? Nunca 0 · Raramente 1 · Às vezes 2 · Quase sempre 3 · Sempre 4
- Q8 P · E-mail para cliente insatisfeito — o que inclui? Contexto, tom desejado e o que resolver 4 · Só "escreva um e-mail para um cliente" 1 · Cola a reclamação e manda "responde" 2 · Peço e uso sem ajustar 0
- Q9 P · Primeira resposta genérica demais. Próximo passo? Dar exemplos e restrições e pedir de novo 4 · Aceitar 1 · Desistir 0 · Repetir igual 1

## Aplicação
- Q10 A · Em quantas tarefas reais você já usou IA? Nenhuma 0 · 1 a 2 1 · Algumas 2 · Muitas 3 · É parte do meu fluxo 4
- Q11 P · Notas de reunião → resumo com decisões. Colar notas e pedir resumo estruturado com decisões e responsáveis 4 · Pedir só "resuma" 2 · Digitar tudo de novo 0 · Não usaria IA 1
- Q12 C [ns] · Analisar planilha com IA, o que mais ajuda? Descrever colunas e a pergunta de negócio 4 · Mandar "analise" 1 · Pedir um gráfico bonito 1 · Nada, IA não lê planilha 0
- Q13 P · Rascunho do relatório mensal. Dar dados e estrutura e pedir rascunho para revisar 4 · "Faça um relatório" sem dados 1 · Não usar, relatório é manual 1 · Pedir e enviar sem conferir 0
- Q14 P · Documento longo para entender rápido. Pedir resumo com os pontos da sua decisão 4 · "Resuma" sem foco 2 · Ler tudo sem apoio, sempre 2 · Ignorar o documento 0

## Revisão
- Q15 C [ns] · A IA te deu números. Antes de usar? Conferir na fonte original 4 · Confiar 0 · Publicar direto 0 · Só corrigir o português 1
- Q16 P · Resposta boa, mas falta uma parte. Apontar a lacuna e pedir complemento com critério 4 · Aceitar 1 · Recomeçar do zero sempre 2 · Desistir 0
- Q17 C [ns] · Informação da empresa na IA. Só dados autorizados, sem sensíveis/pessoais sem permissão 4 · Colar qualquer coisa 0 · Nunca usar nada da empresa 1 · Tanto faz 0
- Q18 P · A IA citou uma regra que vai usar com cliente. Confere na fonte 4 · Confia porque soou convincente 0 · Envia e corrige se reclamarem 0 · Tira a parte em dúvida sem conferir 2
- Q19 A · Com que frequência revê criticamente? Nunca 0 · Raramente 1 · Às vezes 2 · Quase sempre 3 · Sempre 4

## Autonomia
- Q20 A · Quando a IA não entende, consegue reformular? Quase nunca 0 · Raramente 1 · Às vezes 2 · Quase sempre 3 · Sempre 4
- Q21 P · Reaproveita bons pedidos/modelos? Nunca 0 · Já pensei nisso 1 · Às vezes 2 · Com frequência 3 · Tenho um conjunto organizado 4
- Q22 A · Ajuda colegas a usar IA? Nunca 0 · Raramente 1 · Às vezes 2 · Com frequência 3 · É um papel que assumo 4
- Q23 C [ns] · Assistente/agente configurado difere do chat porque: Guarda instruções e executa fluxo definido 4 · É só um nome diferente 1 · É sempre autônomo e sem supervisão 0 · Não existe 0
- Q24 P · Tarefa semanal repetida. Criei modelo/instrução para reutilizar 4 · Uso IA, mas refaço do zero 2 · Já pensei em organizar, mas não fiz 1 · Faço tudo manual 0

> Na tela, embaralhar a ordem das opções de C e P é opcional (não exigido).

## Algoritmo
```
para cada dimensão:
  respondidas = questões com resposta (inclui "não sei" = 0)
  se respondidas/total < 0.60 → status "dados_insuficientes", sem score
  senão score = Σ(pontos*peso) / Σ(4*peso) * 100   (só respondidas)
        nível pela faixa; força = questão de maior pontos; lacuna = menor
geral:
  se respondidas_total/24 < 0.70 → "preenchimento_incompleto"
  senão score = média das dimensões pontuadas; nível pela faixa
  selfAvg = média normalizada (pontos/4*100) das A respondidas
  practiceAvg = idem das P
  se selfAvg >= 75 e practiceAvg <= 40 → nível desce 1 degrau (mín. Iniciante), flag inconsistency
faixas: <=25 Iniciante · <=50 Básico · <=75 Intermediário · >75 Avançado
```
Arredondar score para inteiro **depois** de classificar? Decisão: classificar com o valor arredondado (Math.round) para o que a tela mostra bater com o nível.

Decisões de implementação (Fatia A, conferidas contra o `_00-prompt-original.pdf`):
- **Resposta guardada** = chave da opção (`a`, `b`… ou `nao_sei`), não os pontos — o original pede "guarde a resposta e o peso do tipo" e "guarde o texto da opção escolhida"; duas opções podem valer o mesmo ponto (ex.: Q4). O motor devolve `{option, label, points, type, weight}` por questão.
- **Geral** = média dos scores de dimensão já arredondados (os exibidos), arredondada.
- **Empate na evidência**: maior peso (P > C > A, como a lógica de pesos da seção 3) e depois a ordem do questionário.
- **Lacuna em Aplicação ou Autonomia** (RN-11) = estar entre as duas dimensões mais baixas (definição de "lacunas" do bloco 4 da devolutiva). Intermediário sem essa lacuna → "Do Problema ao Plano" pelo mapeamento da seção 7.
- **Avançado "com interesse"**: o questionário não mede interesse; recomenda pelo nível e a devolutiva faz o convite.
- **Foco curto**: só o de Revisão é literal do original; os outros 4 (`scoring/phrases.js`) aguardam validação da Decoding.
- As questões não são obrigatórias: o participante pode pular, e as regras de 60%/70% tratam o incompleto.

## Casos de teste obrigatórios (Vitest)
| # | Entrada | Esperado |
|---|---------|----------|
| T1 | todas as melhores opções (4) | todas dim 100, geral 100 Avançado |
| T2 | todas 0 | geral 0 Iniciante |
| T3 | só 12 de 24 respondidas | `preenchimento_incompleto` |
| T4 | Familiaridade com 2 de 4 (50%) | dim `dados_insuficientes` |
| T5 | A = 4 em tudo, P = 0 em tudo, C = 4 | trava dispara, nível rebaixado, flag true |
| T6 | Q4 = "não sei" | conta 0, sem erro |
| T7 | fronteiras: score 25→Iniciante, 26→Básico, 50→Básico, 51→Intermediário, 75→Intermediário, 76→Avançado | correto |
| T8 | Intermediário com Aplicação mais baixa | recomenda "Do Problema ao Plano" |

## Banco de frases
**Por dimensão (força / lacuna)**
- Familiaridade: a IA já faz parte do seu dia / a IA ainda aparece pouco na sua rotina
- Contexto: você estrutura bem os pedidos, com objetivo e formato / seus pedidos tendem a ser genéricos, o que reduz a qualidade das respostas
- Aplicação: você já usa IA em entregas reais da sua função / você ainda usa pouco a IA nas suas entregas
- Revisão: você confere a informação e cuida dos dados antes de usar / a revisão crítica e o cuidado com dados precisam de atenção
- Autonomia: você reaproveita bons pedidos e ajuda colegas / você ainda não reaproveita o que funciona nem organiza o reuso

**Estágio geral**
- Iniciante: você está começando com IA, com espaço grande para ganhar confiança e aplicar no dia a dia.
- Básico: você já usa IA em tarefas simples, e o próximo passo é dar mais contexto e revisar com critério.
- Intermediário: você aplica IA em entregas reais, e para avançar aprofunda a revisão e a autonomia.
- Avançado: você integra IA ao seu fluxo, e o foco agora é construir soluções e orientar outras pessoas.

**Evidência**: combinar frase + texto da opção escolhida (ex.: "Você indicou que *raramente* informa objetivo e formato nos pedidos, o que limita a qualidade das respostas"). Nunca mostrar só o número; nunca prometer ganho percentual.

**Foco curto (dimensão ≤ 40)**: ex. Revisão → "priorizar conferência de informação e cuidado com dados".

## Ofertas (portfólio)
- Iniciante/Básico → **Escale sua produtividade com IA**
- Intermediário → **Do Problema ao Plano**
- Avançado → **Construa Soluções e Produtos Digitais com IA**

## Decisões da devolutiva (Fatia B) — aguardam validação da Decoding
Literais do original: frases de estágio, frases força/lacuna por dimensão, foco de Revisão. O resto do texto está em `server/src/scoring/phrases.js`.
- **Frase da dimensão "conforme o nível"**: Intermediário/Avançado → frase de força; Iniciante/Básico → frase de lacuna.
- **Evidência** (RN-10): "Sobre <tema da pergunta>, você respondeu “<opção>”" + leitura pela pontuação da resposta (3–4 → força, 0–1 → lacuna, 2 → só a citação). "Não sei" → "um bom ponto de partida para aprender" (RN-06). Q4 e Q23 (conhecimento) têm leitura própria, pois a resposta não descreve o comportamento da dimensão.
- **Potencialidades** = 2 dimensões mais altas fora das lacunas (com 5 pontuadas, sem sobreposição). Se a dimensão ainda é Iniciante/Básico, o texto fala da posição relativa ("está entre as suas dimensões mais desenvolvidas"), não da frase de força.
- **Lacunas** = as mesmas 2 dimensões da recomendação (RN-11). Se já Intermediário/Avançado, texto relativo ("comparada às outras dimensões…"). Cada lacuna traz um exemplo do dia a dia.
- **Três ações**: 1ª ação de cada lacuna, depois a 2ª da principal (banco de 3 ações por dimensão).
- **Percurso** apresentado como convite; Avançado condicionado ao interesse ("Se você tem interesse em construir soluções…").
- **Estágio**: frase do nível + mais forte/mais fraca com score; dimensões empatadas → "mesmo patamar". Incompleto (RN-08) → sem estágio nem percurso, com a contagem respondida.
- **Radar**: escala 0–100, anéis nas faixas de nível (25/50/75/100).
