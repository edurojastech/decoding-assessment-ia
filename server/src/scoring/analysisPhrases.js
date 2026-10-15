// Banco de frases da análise do PDF (guia "Front 2 · Relatório PDF"): leitura por evidência,
// comportamento a desenvolver, prioridades, conexões entre dimensões e plano de 30 dias.
// Só texto: quem escolhe é services/reportAnalysis.js. Regra do guia: cada frase descreve a
// resposta dada, sem afirmar comportamentos que a pergunta não mede.
// Os textos aguardam validação da Decoding (conteúdo e metodologia).

// Natureza da evidência por tipo de questão (RN-02).
export const EVIDENCE_NATURE = {
  A: 'Autorrelato',
  C: 'Conhecimento',
  P: 'Situação apresentada',
};

// Leitura de cada resposta: `low` para 0–1 ponto, `high` para 3–4 pontos.
// Leitura de cada resposta: `low` para 0–1 ponto, `high` para 3–4 pontos. Começam por verbo para
// compor "A escolha “<opção>” <leitura>."
export const QUESTION_READING = {
  Q1: { low: 'indica uso de IA ainda pouco frequente', high: 'indica uso frequente de IA' },
  Q2: { low: 'indica pouco conforto diante de tarefas novas', high: 'indica conforto para usar IA em tarefas novas' },
  Q3: { low: 'indica que a IA ainda é pouco lembrada como opção', high: 'indica que a IA já é lembrada como opção' },
  Q4: { low: 'aponta uma compreensão a revisar sobre os limites da IA', high: 'mostra compreensão adequada do que a IA generativa faz bem' },
  Q5: { low: 'sugere dificuldade para reconhecer uma solicitação bem estruturada', high: 'mostra que reconhece uma solicitação bem estruturada' },
  Q6: { low: 'indica um ponto a revisar sobre o que melhora a resposta', high: 'mostra que reconhece o valor de contexto e exemplos' },
  Q7: { low: 'indica que objetivo, público, restrições e formato ainda aparecem pouco nos pedidos', high: 'indica o hábito declarado de informar objetivo, público, restrições e formato' },
  Q8: { low: 'deixa de fora contexto, tom e objetivo do pedido', high: 'inclui contexto, tom e objetivo no pedido' },
  Q9: { low: 'não ajusta o pedido quando a resposta vem genérica', high: 'ajusta o pedido com exemplos e restrições' },
  Q10: { low: 'indica poucas tarefas reais da função com uso de IA', high: 'indica uso de IA em várias tarefas reais da função' },
  Q11: { low: 'indica uma oportunidade de reconhecer usos possíveis de IA na função', high: 'mostra um uso estruturado da IA numa entrega da função' },
  Q12: { low: 'indica um ponto a revisar sobre como orientar a análise de dados', high: 'mostra que sabe orientar a análise com colunas e pergunta de negócio' },
  Q13: { low: 'não aproveita a IA para um primeiro rascunho revisável', high: 'usa a IA para um rascunho com dados e estrutura, mantendo a revisão' },
  Q14: { low: 'não usa a IA para entender o documento com foco', high: 'pede à IA um resumo com o foco da decisão' },
  Q15: { low: 'indica um critério a revisar antes de usar números da IA', high: 'reconhece a necessidade de conferir números na fonte' },
  Q16: { low: 'mostra uma resposta incompleta aceita ou abandonada sem critério', high: 'mostra o recurso de pedir complemento com critério' },
  Q17: { low: 'indica um cuidado a revisar com dados da empresa', high: 'reconhece o cuidado com dados autorizados e sensíveis' },
  Q18: { low: 'mostra confiança na informação sem conferência na fonte', high: 'mostra conferência na fonte antes de usar a informação' },
  Q19: { low: 'indica revisão crítica ainda pouco frequente', high: 'indica o hábito declarado de revisar com olhar crítico' },
  Q20: { low: 'indica dificuldade declarada para reformular pedidos', high: 'indica que consegue reformular quando a IA não entende' },
  Q21: { low: 'indica que os pedidos ainda não são organizados para reutilização', high: 'sustenta uma leitura de organização e reutilização de pedidos' },
  Q22: { low: 'indica que ajudar colegas ainda não faz parte da rotina', high: 'indica, por autorrelato, que ajuda colegas a usarem IA' },
  Q23: { low: 'indica um ponto a revisar sobre assistentes configurados', high: 'mostra que distingue um assistente configurado de um chat comum' },
  Q24: { low: 'indica que a tarefa semanal ainda não tem um modelo reutilizável', high: 'indica um modelo reutilizável para a tarefa semanal' },
};

export const NOT_SURE_READING = 'indica um ponto de partida para aprender';
export const PARTIAL_READING = 'As respostas ficaram em escolhas parciais, sem um sinal forte em nenhuma direção.';
export const DIVERGENT_READING = 'A escolha “{highLabel}” {high}, enquanto “{lowLabel}” {low}. '
  + 'A combinação indica critérios ainda inconsistentes nesta dimensão.';
export const INSUFFICIENT_READING = 'Poucas respostas nesta dimensão para uma análise ({answered} de {total}).';

// Comportamento a desenvolver por dimensão.
export const DEVELOP = {
  familiaridade: 'Distinguir apoio à execução e responsabilidade pela decisão, testando a IA em tarefas simples da rotina.',
  contexto: 'Informar objetivo, contexto, referências, restrições e formato em cada solicitação.',
  aplicacao: 'Testar a IA em uma entrega da função e verificar a adequação do resultado.',
  revisao: 'Validar afirmações, números e regras na fonte, mesmo quando o texto parecer convincente.',
  autonomia: 'Aperfeiçoar o repertório com exemplos revisados e registrar quando os pedidos funcionam.',
};

// Prioridades: título e o verbo usado na síntese.
export const PRIORITY = {
  familiaridade: { title: 'Entender usos e limites', verb: 'revisar o que a IA faz bem e onde a decisão continua com você' },
  contexto: { title: 'Estruturar solicitações', verb: 'qualificar as solicitações' },
  aplicacao: { title: 'Aplicar e registrar', verb: 'levar a IA a uma entrega real da função' },
  revisao: { title: 'Conferir resultados', verb: 'reforçar a validação das respostas' },
  autonomia: { title: 'Organizar o repertório', verb: 'organizar e revisar o repertório de pedidos' },
};

// Plano de 30 dias: uma etapa por prioridade.
export const PLAN_PERIODS = ['Dias 1 a 7', 'Dias 8 a 14', 'Dias 15 a 30'];
export const PLAN = {
  familiaridade: {
    action: 'Revisar o que a IA faz bem e seus limites e testá-la em uma tarefa simples da rotina.',
    delivery: 'Registro curto da tarefa: o que a IA fez, o que você decidiu e o que conferiu.',
    verify: 'Explicar quais decisões e verificações continuaram com você.',
  },
  contexto: {
    action: 'Preparar uma solicitação para uma entrega real, como o resumo de uma reunião.',
    delivery: 'Pedido com objetivo, contexto, referências, restrições e formato, conforme a necessidade.',
    verify: 'Conferir se as instruções necessárias estão explícitas e se a resposta atende ao objetivo.',
  },
  aplicacao: {
    action: 'Usar a IA no primeiro rascunho de uma entrega da função e ajustar o pedido.',
    delivery: 'Rascunho revisado e registro do que foi aproveitado, ajustado ou descartado.',
    verify: 'Verificar se o resultado é adequado à entrega e o que ainda exigiu intervenção.',
  },
  revisao: {
    action: 'Aplicar o pedido a um material apropriado e revisar a resposta antes de usar.',
    delivery: 'Resultado conferido, com afirmações, números e regras checados na fonte.',
    verify: 'Comparar cada informação com a fonte; sinalizar ausências e retirar o que não tem apoio.',
  },
  autonomia: {
    action: 'Ajustar o pedido que funcionou e testar sua reutilização em outro exemplo semelhante.',
    delivery: 'Versão final do pedido, dois resultados revisados e registro das alterações.',
    verify: 'Verificar se o pedido funciona no segundo caso e quais ajustes foram necessários.',
  },
};

export const EVOLUTION_CRITERIA = ['Clareza das instruções', 'Fidelidade à fonte', 'Completude do resultado', 'Qualidade da revisão'];
export const EVOLUTION_TEXT = 'Compare a primeira e a segunda entrega com os mesmos critérios e registre o que melhorou e o que persiste. '
  + 'Tempo e retrabalho só podem ser comparados se houver uma linha de base.';
export const CONTINUITY_TEXT = 'As práticas são realizadas pelo participante. Quando houver acompanhamento previsto, '
  + 'registre aqui quem analisará as entregas.';
export const PLAN_NOTE = 'Prazos sugeridos para um ciclo inicial, a combinar com o participante. '
  + 'As entregas são evidências de aprendizagem; não representam ganhos de produtividade medidos.';

// Objetivo de aprendizagem por percurso (aguarda validação da Decoding).
export const OFFER_GOALS = {
  'Escale sua produtividade com IA': 'limites da tecnologia, estruturação de pedidos, aplicação na função e revisão dos resultados',
  'Do Problema ao Plano': 'transformar problemas da função em planos de uso de IA, com aplicação em entregas e revisão',
  'Construa Soluções e Produtos Digitais com IA': 'construir soluções com IA, com critérios de revisão e reutilização',
};

// Página 1.
export const RESULT_NOTE = 'Resultados calculados a partir das respostas ao formulário. A interpretação orienta o desenvolvimento '
  + 'individual. Consulte a metodologia ao final deste documento.';
export const LEVEL_SCOPE = 'A classificação {levels} é específica da dimensão e não altera a classificação geral {overall}.';

// Página 3: conexões entre dimensões.
export const CONNECTIONS = {
  reuse: {
    title: 'Reutilização com qualidade',
    text: 'Autonomia em {autonomia} e Contexto em {contexto} sugerem uma combinação a verificar na prática: há base para reutilizar pedidos, '
      + 'mas a estrutura das solicitações ainda pede atenção. Vale revisar a qualidade do repertório antes de ampliar a reutilização.',
  },
  divergent: {
    title: 'Critérios de {dimension} ainda inconsistentes',
    text: '{dimension} soma {score} e reúne escolhas opostas: “{high}” e “{low}”. A leitura reconhece o recurso já presente '
      + 'e indica aplicar o mesmo critério nas demais situações.',
  },
  deliver: {
    title: 'Aplicação ligada a uma entrega',
    text: 'Contexto ({contexto}) e Aplicação ({aplicacao}) podem ser trabalhados no mesmo exercício: produzir uma entrega da função '
      + 'com instruções claras, comparar com a fonte e ajustar o pedido, registrando o resultado.',
  },
  selfPractice: {
    title: 'Autopercepção acima da prática',
    text: 'Nas perguntas de autorrelato a média ficou em {self}; nas situações apresentadas, em {practice}. '
      + 'Uma entrega real ajuda a verificar se o que é percebido se transfere para a prática.',
  },
  transfer: {
    title: 'Familiaridade ainda pouco ligada às entregas',
    text: 'Familiaridade ({familiaridade}) aparece acima de Aplicação ({aplicacao}). O uso declarado ainda não se reflete na mesma '
      + 'medida nas situações de entrega; a prática com uma entrega da função ajuda a verificar essa transferência.',
  },
  review: {
    title: 'Uso nas entregas pede mais conferência',
    text: 'Aplicação ({aplicacao}) está acima de Revisão ({revisao}). Quanto mais a IA entra nas entregas, mais importa conferir '
      + 'afirmações, números e dados antes de usar.',
  },
  even: {
    title: 'Perfil no mesmo patamar',
    text: 'As dimensões pontuadas estão no mesmo patamar ({score}). A leitura conjunta não aponta um contraste entre elas; '
      + 'o próximo passo é aplicar o repertório a entregas mais complexas e registrar evidências de execução.',
  },
  fallback: {
    title: 'Apoio em {strong} para desenvolver {weak}',
    text: '{strong} ({strongScore}) é a dimensão mais desenvolvida hoje e pode apoiar o trabalho em {weak} ({weakScore}), '
      + 'que concentra o maior espaço de avanço.',
  },
};

export const DIVERGENCE_NOTE = 'Em {dimensions}, há respostas que apontam em direções diferentes. A divergência fica registrada '
  + 'e a verificação entra no plano, sem escolher apenas a evidência mais favorável.';

// Apêndice.
export const LIMITS_TEXT = [
  'A avaliação orienta o desenvolvimento individual. Não comprova produtividade nem maturidade organizacional.',
  'A nota resume a dimensão: uma resposta favorável não elimina outra desfavorável, e uma dimensão entre as maiores do perfil '
    + 'não se torna automaticamente uma competência consolidada.',
  'As faixas descrevem intervalos internos do instrumento, não referências validadas empiricamente.',
];
