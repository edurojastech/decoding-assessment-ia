// Banco de frases da devolutiva na tela (guia "Front 1 · Devolutiva no app"): leitura em ~2 minutos,
// síntese, cinco frases curtas, prioridades, força relativa, primeira ação e resumo metodológico.
// Só texto: quem escolhe é services/reportScreen.js. Regras editoriais do guia:
// "você declarou" para autorrelato; "na situação apresentada, você selecionou" para conhecimento e julgamento;
// força relativa não vira competência consolidada; divergência em Revisão é inconsistência a desenvolver.
// Os textos aguardam validação da Decoding.

// Versão dos textos da devolutiva (tela e PDF). Mude ao alterar regras ou frases de interpretação.
export const REPORT_VERSION = '1.0';

// Tema curto de cada pergunta, para as frases da tela.
export const SHORT_TOPIC = {
  Q1: 'frequência de uso', Q2: 'conforto em tarefas novas', Q3: 'lembrar da IA como opção', Q4: 'limites da IA',
  Q5: 'o melhor pedido', Q6: 'o que melhora a resposta', Q7: 'objetivo, público e formato nos pedidos', Q8: 'o pedido do e-mail ao cliente',
  Q9: 'ajustar uma resposta genérica', Q10: 'tarefas da função com IA', Q11: 'o resumo de reunião', Q12: 'a análise de planilha',
  Q13: 'o rascunho do relatório', Q14: 'o documento longo', Q15: 'números entregues pela IA', Q16: 'completar uma resposta',
  Q17: 'dados da empresa', Q18: 'conferir uma regra citada pela IA', Q19: 'revisão crítica', Q20: 'reformular pedidos',
  Q21: 'reaproveitar pedidos', Q22: 'ajudar colegas', Q23: 'assistentes configurados', Q24: 'a tarefa semanal',
};

// Leitura curta pela natureza da questão e pelos pontos (0–1 = low, 3–4 = high).
export const SHORT_READING = {
  A: { low: 'você declarou um hábito ainda pouco presente', high: 'você declarou um hábito já presente' },
  C: { low: 'indica um conceito a revisar', high: 'mostra um conceito bem compreendido' },
  P: { low: 'indica um ponto de desenvolvimento', high: 'mostra uma escolha favorável' },
};
export const SHORT_PARTIAL = 'As respostas ficaram em escolhas parciais, sem um sinal forte.';
export const SHORT_INSUFFICIENT = 'Poucas respostas nesta dimensão para uma leitura.';

// Dimensão como tema (frases de divergência e de força relativa).
export const DIMENSION_TOPIC = {
  familiaridade: 'o uso de IA', contexto: 'os pedidos', aplicacao: 'a aplicação na função', revisao: 'a conferência', autonomia: 'a reutilização',
};
export const DIVERGENT_SHORT = 'As respostas sobre {topic} mostram critérios ainda inconsistentes.';
export const STRENGTH_SHORT = {
  familiaridade: 'O uso de IA no dia a dia é uma força relativa do perfil.',
  contexto: 'A estrutura dos pedidos é uma força relativa do perfil.',
  aplicacao: 'O uso de IA nas entregas é uma força relativa do perfil.',
  revisao: 'A conferência dos resultados é uma força relativa do perfil.',
  autonomia: 'A reutilização de pedidos é uma força relativa do perfil.',
};
export const PRIORITY_SHORT = {
  familiaridade: 'Entender usos e limites da IA',
  contexto: 'Estruturar solicitações',
  aplicacao: 'Reconhecer aplicações na função',
  revisao: 'Fortalecer a conferência dos resultados',
  autonomia: 'Organizar o reuso de pedidos',
};

// Síntese.
export const STRENGTH_NOUN = {
  familiaridade: 'familiaridade relativa com o uso de IA',
  contexto: 'facilidade relativa para estruturar pedidos',
  aplicacao: 'facilidade relativa para levar a IA às entregas',
  revisao: 'cuidado relativo com a conferência dos resultados',
  autonomia: 'facilidade relativa para reutilizar pedidos',
};
export const NEED = {
  familiaridade: 'revisar o que a IA faz bem e seus limites',
  contexto: 'estruturar melhor as solicitações',
  aplicacao: 'reconhecer aplicações na sua função',
  revisao: 'fortalecer a conferência dos resultados',
  autonomia: 'organizar o reuso dos pedidos',
};
// Perfil sem prioridade abaixo de Avançado: o foco passa a ser ampliar, não corrigir.
export const ADVANCED_FOCUS = 'As respostas não apontam uma lacuna abaixo do nível Avançado. O foco agora é aplicar o repertório a entregas mais complexas e registrar evidências de execução.';
export const ADVANCED_ACTION = {
  text: 'Escolha uma entrega mais complexa da sua função e monte um fluxo reutilizável com IA, com critérios de revisão definidos antes de começar.',
  delivery: 'O fluxo documentado e um resultado revisado com esses critérios.',
};
export const NEXT_STEP = 'O próximo passo é experimentar essas práticas em uma entrega da sua função.';
export const INCOMPLETE_SYNTHESIS = 'Você respondeu {answered} de {total} perguntas. O resultado geral precisa de pelo menos 70% do questionário, '
  + 'por isso ele não aparece aqui. As dimensões com respostas suficientes estão abaixo.';

// Prioridades e força relativa.
export const FOCUS_TEXT = {
  familiaridade: 'Revise o que a IA faz bem e quais decisões continuam com você.',
  contexto: 'Prepare solicitações com objetivo, informações relevantes e formato esperado.',
  aplicacao: 'Leve a IA para uma entrega real da sua função e avalie se o resultado atende.',
  revisao: 'Confira dados e afirmações antes de utilizar a resposta.',
  autonomia: 'Organize os pedidos que funcionam e registre os ajustes feitos.',
};
export const STRENGTH_USE = {
  familiaridade: 'Use a familiaridade com a IA para testar essas práticas em tarefas do dia a dia.',
  contexto: 'Aproveite a estrutura dos seus pedidos como ponto de partida para as próximas práticas.',
  aplicacao: 'Aproveite as entregas em que você já usa IA para aplicar essas práticas.',
  revisao: 'Mantenha a conferência dos resultados como etapa de cada prática.',
  autonomia: 'Use sua prática de reutilização para registrar pedidos que funcionaram depois de revisados.',
};

// Primeira ação, pela prioridade principal.
export const FIRST_ACTION = {
  familiaridade: {
    text: 'Escolha uma tarefa simples da semana e use a IA para um primeiro rascunho, decidindo você o que entra na versão final.',
    delivery: 'O rascunho e uma nota curta sobre o que você decidiu e conferiu.',
  },
  contexto: {
    text: 'Escolha um resumo de reunião da sua rotina. Oriente a IA sobre decisões, responsáveis e prazos e compare o resultado com as anotações originais.',
    delivery: 'Uma solicitação revisada e um resumo conferido.',
  },
  aplicacao: {
    text: 'Escolha uma entrega da sua função, como um relatório ou um resumo, e peça à IA um primeiro rascunho com os dados e a estrutura esperada.',
    delivery: 'O rascunho revisado e o registro do que foi aproveitado ou ajustado.',
  },
  revisao: {
    text: 'Escolha uma resposta da IA que você usaria no trabalho e confira cada número, data e regra na fonte original antes de usar.',
    delivery: 'A resposta conferida, com o que foi corrigido ou retirado.',
  },
  autonomia: {
    text: 'Escolha um pedido que funcionou bem e adapte-o para uma tarefa parecida, comparando os dois resultados.',
    delivery: 'O pedido salvo, os dois resultados e os ajustes feitos.',
  },
};
export const DATA_NOTE = 'Para o exercício, use material compatível com as orientações de dados da empresa.';

// Aprendizagem.
export const LEARNING_TOPIC = {
  familiaridade: 'limites da IA', contexto: 'estruturação de pedidos', aplicacao: 'aplicação na função',
  revisao: 'revisão de respostas', autonomia: 'reutilização de pedidos',
};

// Resumo metodológico (área expansível).
export const METHOD_NOTES = {
  origin: 'Os resultados decorrem das suas respostas ao formulário: o que você declarou e o que selecionou nas situações apresentadas. Não há observação de entregas reais.',
  scope: 'O diagnóstico orienta o seu desenvolvimento individual e não descreve, sozinho, a maturidade de toda a organização.',
  pdf: 'O relatório completo traz as evidências, as prioridades, o plano de 30 dias e a metodologia detalhada.',
};
