// ADR-04: questionário como dado — fonte única de verdade (specs/04-pontuacao.md, seção 4 do original).
// Textos e pontos transcritos do _00-prompt-original.pdf. Pesos e pontos são critérios de pilotagem.

// RN-02: autopercepção 1 · conhecimento e julgamento 1,5 · situação prática 2.
export const WEIGHTS = { A: 1, C: 1.5, P: 2 };

export const TYPE_LABELS = {
  A: 'autopercepção',
  C: 'conhecimento',
  P: 'prática',
};

// RN-06: "não sei" vale a menor pontuação (0), sem tom de erro.
export const NOT_SURE = 'nao_sei';
export const NOT_SURE_LABEL = 'Não sei';

// RN-01: cinco dimensões, nesta ordem.
export const DIMENSIONS = [
  { id: 'familiaridade', name: 'Familiaridade', description: 'Frequência e naturalidade de uso de IA no trabalho.' },
  { id: 'contexto', name: 'Contexto', description: 'Capacidade de dar objetivo, contexto, referências, restrições e formato ao pedido.' },
  { id: 'aplicacao', name: 'Aplicação', description: 'Uso de IA em tarefas e entregas reais da função.' },
  { id: 'revisao', name: 'Revisão', description: 'Avaliar criticamente as respostas, conferir informação e cuidar de dados.' },
  { id: 'autonomia', name: 'Autonomia', description: 'Resolver sozinho, adaptar, reutilizar e orientar outros.' },
];

// Opções na ordem do original, com chaves a, b, c... (a resposta guardada é a chave, RN-10).
function options(...pairs) {
  return pairs.map(([label, points], i) => ({ key: String.fromCharCode(97 + i), label, points }));
}

function question(id, dimension, type, text, opts) {
  return Object.freeze({
    id,
    dimension,
    type,
    weight: WEIGHTS[type],
    text,
    options: Object.freeze(opts),
    allowsNotSure: type === 'C',
  });
}

export const QUESTIONS = Object.freeze([
  // Dimensão 1 · Familiaridade
  question('Q1', 'familiaridade', 'A', 'Com que frequência você usa IA no trabalho?', options(
    ['Nunca', 0], ['Raramente', 1], ['Algumas vezes por semana', 2], ['Quase todo dia', 3], ['Várias vezes ao dia', 4],
  )),
  question('Q2', 'familiaridade', 'A', 'Quão confortável você fica ao usar IA numa tarefa nova?', options(
    ['Nada', 0], ['Pouco', 1], ['Mais ou menos', 2], ['Confortável', 3], ['Muito confortável', 4],
  )),
  question('Q3', 'familiaridade', 'A', 'Quando surge uma tarefa nova no seu dia, você se lembra de considerar a IA como uma opção?', options(
    ['Nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Quase sempre', 3], ['Sempre', 4],
  )),
  question('Q4', 'familiaridade', 'C', 'Qual descreve melhor o que a IA generativa faz bem hoje?', options(
    ['Gera e transforma texto e dados a partir de instruções e contexto', 4],
    ['Garante informações sempre corretas', 0],
    ['Substitui a decisão humana', 0],
    ['Só serve para programação', 1],
  )),

  // Dimensão 2 · Contexto
  question('Q5', 'contexto', 'P', 'Entre os pedidos abaixo, qual tende a dar o melhor resultado?', options(
    ['Um pedido vago, como "escreva algo sobre vendas"', 0],
    ['Um pedido com objetivo, contexto, público e formato', 4],
    ['Um pedido de uma linha só', 1],
    ['"Faça do seu jeito"', 0],
  )),
  question('Q6', 'contexto', 'C', 'O que mais melhora a resposta numa tarefa de trabalho?', options(
    ['Dar contexto e exemplos', 4],
    ['Escrever em maiúsculas', 0],
    ['Repetir o mesmo pedido várias vezes', 1],
    ['Usar a ferramenta mais cara', 0],
  )),
  question('Q7', 'contexto', 'A', 'Você costuma informar objetivo, público, restrições e formato nos seus pedidos?', options(
    ['Nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Quase sempre', 3], ['Sempre', 4],
  )),
  question('Q8', 'contexto', 'P', 'Você vai pedir à IA um e-mail para um cliente insatisfeito. O que você inclui no pedido?', options(
    ['O contexto do caso, o tom desejado e o que precisa ser resolvido', 4],
    ['Só "escreva um e-mail para um cliente"', 1],
    ['Cola a reclamação e manda "responde"', 2],
    ['Peço e uso sem ajustar', 0],
  )),
  question('Q9', 'contexto', 'P', 'A primeira resposta veio genérica demais. O melhor próximo passo é:', options(
    ['Dar exemplos e restrições e pedir de novo', 4],
    ['Aceitar assim mesmo', 1],
    ['Desistir', 0],
    ['Repetir o mesmo pedido igual', 1],
  )),

  // Dimensão 3 · Aplicação
  question('Q10', 'aplicacao', 'A', 'Em quantas tarefas reais da sua função você já usou IA?', options(
    ['Nenhuma', 0], ['1 a 2', 1], ['Algumas', 2], ['Muitas', 3], ['É parte do meu fluxo', 4],
  )),
  question('Q11', 'aplicacao', 'P', 'Você precisa transformar notas de uma reunião em um resumo com decisões e próximos passos. Qual caminho usa melhor a IA?', options(
    ['Colar as notas e pedir um resumo estruturado com decisões e responsáveis', 4],
    ['Pedir só "resuma"', 2],
    ['Digitar tudo de novo manualmente', 0],
    ['Não usaria IA', 1],
  )),
  question('Q12', 'aplicacao', 'C', 'Para analisar uma planilha com IA, o que mais ajuda é:', options(
    ['Descrever as colunas e a pergunta de negócio', 4],
    ['Mandar "analise"', 1],
    ['Pedir um gráfico bonito', 1],
    ['Nada, IA não lê planilha', 0],
  )),
  question('Q13', 'aplicacao', 'P', 'Você precisa de um primeiro rascunho do relatório mensal da sua área. Como a IA ajuda melhor?', options(
    ['Dar os dados e a estrutura desejada e pedir um rascunho para revisar', 4],
    ['Pedir "faça um relatório" sem dados', 1],
    ['Não usar, relatório é só manual', 1],
    ['Pedir e enviar sem conferir', 0],
  )),
  question('Q14', 'aplicacao', 'P', 'Chega um documento longo que você precisa entender rápido. O melhor uso é:', options(
    ['Pedir um resumo com os pontos que importam para a sua decisão', 4],
    ['Pedir "resuma" sem dizer o foco', 2],
    ['Ler tudo sem apoio, sempre', 2],
    ['Ignorar o documento', 0],
  )),

  // Dimensão 4 · Revisão
  question('Q15', 'revisao', 'C', 'A IA te deu números. O que fazer antes de usar?', options(
    ['Conferir na fonte original', 4],
    ['Confiar, a IA é precisa', 0],
    ['Publicar direto', 0],
    ['Só corrigir o português', 1],
  )),
  question('Q16', 'revisao', 'P', 'A resposta parece boa, mas falta uma parte. O melhor é:', options(
    ['Apontar a lacuna e pedir o complemento com critério', 4],
    ['Aceitar como está', 1],
    ['Recomeçar do zero sempre', 2],
    ['Desistir', 0],
  )),
  question('Q17', 'revisao', 'C', 'Sobre usar informação da empresa na IA, o cuidado certo é:', options(
    ['Usar só dados autorizados e evitar dados sensíveis ou pessoais sem permissão', 4],
    ['Colar qualquer coisa', 0],
    ['Nunca usar nada da empresa', 1],
    ['Tanto faz', 0],
  )),
  question('Q18', 'revisao', 'P', 'A IA citou uma informação ou regra que você vai usar com um cliente. Antes de enviar, você:', options(
    ['Confere na fonte original', 4],
    ['Confia porque soou convincente', 0],
    ['Envia e corrige depois se reclamarem', 0],
    ['Tira a parte em dúvida sem conferir', 2],
  )),
  question('Q19', 'revisao', 'A', 'Com que frequência você revê com olhar crítico o que a IA entrega antes de usar?', options(
    ['Nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Quase sempre', 3], ['Sempre', 4],
  )),

  // Dimensão 5 · Autonomia
  question('Q20', 'autonomia', 'A', 'Quando a IA não entende, você consegue reformular e chegar a um bom resultado?', options(
    ['Quase nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Quase sempre', 3], ['Sempre', 4],
  )),
  question('Q21', 'autonomia', 'P', 'Você reaproveita bons pedidos, salvando modelos ou instruções para tarefas repetidas?', options(
    ['Nunca', 0], ['Já pensei nisso', 1], ['Às vezes', 2], ['Com frequência', 3], ['Tenho um conjunto organizado', 4],
  )),
  question('Q22', 'autonomia', 'A', 'Você ajuda colegas a usarem IA melhor?', options(
    ['Nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Com frequência', 3], ['É um papel que assumo', 4],
  )),
  question('Q23', 'autonomia', 'C', 'Um assistente ou agente configurado difere de um chat comum porque:', options(
    ['Guarda instruções e executa um fluxo definido', 4],
    ['É só um nome diferente', 1],
    ['É sempre autônomo e sem supervisão', 0],
    ['Não existe', 0],
  )),
  question('Q24', 'autonomia', 'P', 'Uma tarefa que você repete toda semana, como montar um resumo ou responder dúvidas comuns. O que você faz?', options(
    ['Criei um modelo ou instrução para reutilizar', 4],
    ['Uso IA, mas refaço do zero toda vez', 2],
    ['Já pensei em organizar, mas não fiz', 1],
    ['Faço tudo manual, sem IA', 0],
  )),
]);

// Perguntas de perfil: só informam, nunca pontuam (RN-12). Ficam no Participant, não nas respostas.
export const AREAS = ['RH', 'Comercial', 'Operações', 'Administrativo', 'Financeiro', 'Marketing', 'Liderança', 'Outra'];
export const TOOLS = ['Claude', 'Gemini', 'Microsoft Copilot', 'ChatGPT', 'NotebookLM', 'Outra', 'Nenhuma'];

export const PROFILE_QUESTIONS = Object.freeze([
  { id: 'P0a', field: 'area', text: 'Área', kind: 'single', options: AREAS },
  { id: 'P0b', field: 'role', text: 'Função', kind: 'text' },
  { id: 'P0c', field: 'tools', text: 'Quais ferramentas de IA você tem acesso?', kind: 'multiple', options: TOOLS },
]);

export const ESTIMATED_TIME = '9 a 12 minutos';

// Versão enviada ao participante: sem pontos nem pesos (o cálculo é só no backend, regra 1).
export function publicQuestionnaire() {
  return {
    estimatedTime: ESTIMATED_TIME,
    notSure: { key: NOT_SURE, label: NOT_SURE_LABEL },
    profile: PROFILE_QUESTIONS,
    dimensions: DIMENSIONS.map((d) => ({
      ...d,
      questions: QUESTIONS.filter((q) => q.dimension === d.id).map((q) => ({
        id: q.id,
        text: q.text,
        allowsNotSure: q.allowsNotSure,
        options: q.options.map(({ key, label }) => ({ key, label })),
      })),
    })),
  };
}
