// Banco de frases da devolutiva (seção 6 do original; specs/04-pontuacao.md).
// Só texto: quem escolhe a frase é services/reportIndividual.js, a partir do resultado do motor.
// Literais do original: STAGE_PHRASES, DIMENSION_PHRASES e o foco de Revisão.
// Os demais textos seguem a descrição das dimensões (seção 3) e aguardam validação da Decoding.

// Frase de estágio geral por nível.
export const STAGE_PHRASES = {
  Iniciante: 'Você está começando com IA, com espaço grande para ganhar confiança e aplicar no dia a dia.',
  'Básico': 'Você já usa IA em tarefas simples, e o próximo passo é dar mais contexto e revisar com critério.',
  'Intermediário': 'Você aplica IA em entregas reais, e para avançar aprofunda a revisão e a autonomia.',
  'Avançado': 'Você integra IA ao seu fluxo, e o foco agora é construir soluções e orientar outras pessoas.',
};

// Frase por dimensão: força / lacuna.
export const DIMENSION_PHRASES = {
  familiaridade: {
    strength: 'a IA já faz parte do seu dia',
    gap: 'a IA ainda aparece pouco na sua rotina',
  },
  contexto: {
    strength: 'você estrutura bem os pedidos, com objetivo e formato',
    gap: 'seus pedidos tendem a ser genéricos, o que reduz a qualidade das respostas',
  },
  aplicacao: {
    strength: 'você já usa IA em entregas reais da sua função',
    gap: 'você ainda usa pouco a IA nas suas entregas',
  },
  revisao: {
    strength: 'você confere a informação e cuida dos dados antes de usar',
    gap: 'a revisão crítica e o cuidado com dados precisam de atenção',
  },
  autonomia: {
    strength: 'você reaproveita bons pedidos e ajuda colegas',
    gap: 'você ainda não reaproveita o que funciona nem organiza o reuso',
  },
};

// Potencialidade em dimensão ainda Iniciante/Básico, e lacuna em dimensão já Intermediário/Avançado:
// a frase do banco não descreveria a pessoa, então o texto fala da posição relativa.
export const RELATIVE_STRENGTH = 'está entre as suas dimensões mais desenvolvidas hoje e é um bom ponto de apoio para avançar';
// Bloco 1, quando a dimensão mais fraca já está em Intermediário ou Avançado.
export const DEVELOPED_WEAKEST = 'também está em bom nível, e é onde há mais espaço para avançar';
export const RELATIVE_GAP = 'comparada às outras dimensões, é onde há mais espaço para avançar';

// Tema de cada pergunta, para citar a evidência: "Sobre <tema>, você respondeu “<opção>”".
export const EVIDENCE_TOPICS = {
  Q1: 'a frequência de uso de IA no trabalho',
  Q2: 'o conforto ao usar IA numa tarefa nova',
  Q3: 'lembrar da IA quando surge uma tarefa nova',
  Q4: 'o que a IA generativa faz bem hoje',
  Q5: 'qual pedido tende a dar o melhor resultado',
  Q6: 'o que mais melhora a resposta numa tarefa de trabalho',
  Q7: 'informar objetivo, público, restrições e formato nos pedidos',
  Q8: 'o pedido de um e-mail para um cliente insatisfeito',
  Q9: 'o que fazer quando a primeira resposta vem genérica',
  Q10: 'em quantas tarefas reais da sua função você já usou IA',
  Q11: 'transformar notas de reunião em um resumo com decisões',
  Q12: 'analisar uma planilha com IA',
  Q13: 'o rascunho do relatório mensal da sua área',
  Q14: 'entender rápido um documento longo',
  Q15: 'o que fazer com números entregues pela IA',
  Q16: 'uma resposta boa, mas incompleta',
  Q17: 'usar informação da empresa na IA',
  Q18: 'uma regra citada pela IA que você vai usar com um cliente',
  Q19: 'rever com olhar crítico o que a IA entrega',
  Q20: 'reformular quando a IA não entende',
  Q21: 'reaproveitar bons pedidos em tarefas repetidas',
  Q22: 'ajudar colegas a usarem IA melhor',
  Q23: 'a diferença entre um assistente configurado e um chat comum',
  Q24: 'uma tarefa que você repete toda semana',
};

// O que a resposta citada significa: `strength` para respostas de 3–4 pontos, `gap` para 0–1.
export const EVIDENCE_MEANING = {
  familiaridade: {
    strength: 'sinal de que a IA já é uma opção natural no seu trabalho',
    gap: 'o que mostra espaço para trazer a IA para mais momentos da rotina',
  },
  contexto: {
    strength: 'o que ajuda a IA a entregar respostas mais úteis',
    gap: 'o que limita a qualidade das respostas',
  },
  aplicacao: {
    strength: 'o que mostra a IA presente em entregas concretas',
    gap: 'o que mostra espaço para usar melhor a IA nas suas entregas',
  },
  revisao: {
    strength: 'o que protege a qualidade do que você entrega',
    gap: 'o que pode deixar passar erros ou expor dados',
  },
  autonomia: {
    strength: 'o que mostra autonomia para resolver e reaproveitar o que funciona',
    gap: 'o que mostra espaço para ganhar autonomia e reaproveitar o que funciona',
  },
};

// Perguntas de conhecimento cuja resposta não descreve o comportamento da dimensão: leitura própria.
const KNOWLEDGE_MEANING = {
  strength: 'o que mostra uma boa base de conhecimento sobre o tema',
  gap: 'um ponto de conhecimento que vale aprofundar',
};
export const EVIDENCE_MEANING_BY_QUESTION = { Q4: KNOWLEDGE_MEANING, Q23: KNOWLEDGE_MEANING };

// RN-06: "não sei" é oportunidade de aprendizagem, sem tom de erro.
export const NOT_SURE_MEANING = 'um bom ponto de partida para aprender';

// Bloco 4: exemplo do dia a dia de cada lacuna.
export const GAP_EXAMPLES = {
  familiaridade: 'No dia a dia: uma tarefa que poderia começar com um rascunho da IA, como uma ata ou uma resposta padrão, acaba feita do zero.',
  contexto: 'No dia a dia: um pedido como "escreva um e-mail para o cliente", sem contexto nem tom, volta genérico e pede várias rodadas de ajuste.',
  aplicacao: 'No dia a dia: relatórios, resumos e análises da sua função seguem totalmente manuais, mesmo quando a IA poderia preparar um primeiro rascunho.',
  revisao: 'No dia a dia: um número ou uma regra citada pela IA chega ao cliente sem conferência na fonte, ou um dado sensível vai para a ferramenta sem autorização.',
  autonomia: 'No dia a dia: a mesma tarefa semanal é pedida do zero toda vez, e quando a IA não entende, a tentativa para por ali.',
};

// Bloco 5: ações por dimensão, em ordem de prioridade (as três da devolutiva saem das lacunas).
export const DIMENSION_ACTIONS = {
  familiaridade: [
    'Escolha uma tarefa recorrente desta semana (uma ata, um e-mail, um resumo) e comece por um rascunho feito com IA.',
    'Antes de começar uma tarefa nova, pergunte-se se a IA pode te dar um primeiro rascunho ou uma lista de ideias.',
    'Reserve alguns minutos por dia, durante duas semanas, para testar a IA em uma tarefa real da sua rotina.',
  ],
  contexto: [
    'Nos próximos pedidos, inclua quatro itens: objetivo, contexto, público e formato da resposta.',
    'Quando a resposta vier genérica, dê um exemplo do que você espera e uma restrição clara antes de pedir de novo.',
    'Monte um modelo de pedido para o tipo de tarefa que você mais faz e ajuste a cada uso.',
  ],
  aplicacao: [
    'Escolha uma entrega real da sua função (relatório, resumo de reunião, análise) e faça o primeiro rascunho com IA.',
    'Ao pedir um resumo, diga o foco: as decisões, os responsáveis ou os pontos que importam para a sua decisão.',
    'Ao analisar uma planilha, descreva as colunas e a pergunta de negócio antes de pedir a análise.',
  ],
  revisao: [
    'Antes de usar números, datas ou regras vindos da IA, confira na fonte original.',
    'Confirme quais dados da empresa você pode usar na IA e não inclua dados pessoais ou sensíveis sem autorização.',
    'Quando a resposta vier incompleta, aponte o que falta e peça o complemento com um critério claro.',
  ],
  autonomia: [
    'Salve os pedidos que funcionaram bem e reaproveite-os nas tarefas que se repetem.',
    'Quando a IA não entender, reformule: divida o pedido em partes, dê um exemplo ou mude o formato pedido.',
    'Compartilhe com um colega um pedido que funcionou para você e o que ajustou até chegar nele.',
  ],
};

// RN-11: foco curto para dimensão ≤ 40.
// Revisão é o exemplo literal do original; as demais seguem a descrição da dimensão
// (seção 3) e aguardam validação da Decoding.
export const SHORT_FOCUS = {
  familiaridade: 'trazer a IA para tarefas simples da rotina, com frequência',
  contexto: 'informar objetivo, contexto, público e formato em cada pedido',
  aplicacao: 'aplicar a IA em uma entrega real da sua função',
  revisao: 'priorizar conferência de informação e cuidado com dados',
  autonomia: 'salvar e reaproveitar bons pedidos em tarefas repetidas',
};

// Bloco 5: convite para o percurso (seção 5), por motivo da recomendação. `{offer}` e `{gaps}` são trocados.
export const OFFER_INVITES = {
  nivel: 'Para o seu estágio, o convite da Trilha de IA da Decoding é o percurso “{offer}”.',
  lacuna_aplicacao_autonomia: 'Como as suas lacunas incluem {gaps}, o convite da Trilha de IA da Decoding é o percurso “{offer}”.',
  avancado: 'Se você tem interesse em construir soluções com IA, o convite da Trilha de IA da Decoding é o percurso “{offer}”.',
};

// Bloco 6: observação de consistência (RN-09), em tom de desenvolvimento.
export const CONSISTENCY = {
  title: 'Autopercepção acima da prática',
  text: 'Nas perguntas sobre como você se percebe, a média ficou em {self} de 100; nas situações práticas, em {practice} de 100. '
    + 'Essa diferença é comum e mostra onde está o próximo passo: levar para a prática o que você já sente que domina. '
    + 'Por isso, o estágio geral ficou um degrau abaixo do que a média das dimensões indicaria.',
};

// Bloco 1 quando o geral não é calculado (RN-08).
export const INCOMPLETE_STAGE = 'Você respondeu {answered} de {total} perguntas. O estágio geral precisa de pelo menos 70% do questionário, '
  + 'por isso ele não aparece aqui. O mapa abaixo mostra as dimensões com respostas suficientes.';

// Substitui `{chave}` pelos valores dados.
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
}
