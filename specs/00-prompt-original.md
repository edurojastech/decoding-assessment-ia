Prompt para o Replit · Assessment de Maturidade
em IA da Decoding
Cole o conteúdo abaixo (a partir de "INÍCIO DO PROMPT") no Replit Agent. Ele é
autossuficiente: já traz perguntas, fórmulas, regras, textos e comportamentos. Construa
front-end e back-end.




INÍCIO DO PROMPT
Construa uma aplicação web fullstack chamada Decoding · Assessment de Maturidade em
IA. É a porta de entrada gratuita para a Trilha de IA da Decoding. A lógica central é:
maturidade individual, visão da organização e turmas por nível. Entregue valor ao
participante antes de qualquer oferta.

Escreva toda a interface em português do Brasil. Enquadre o produto como diagnóstico de
desenvolvimento para orientar a aprendizagem, que não substitui uma avaliação formal. Os
pesos e faixas abaixo são critérios iniciais de pilotagem, sem alegar validação científica.


1. Stack e arquitetura
   -​   Frontend: React + Vite + Tailwind CSS.
   -​   Backend: Node + Express (TypeScript de preferência).
   -​   Banco de dados: Postgres do Replit se disponível, senão SQLite. Use um ORM (Prisma
        ou Drizzle).
   -​   Autenticação: senha com hash (bcrypt) e sessão ou JWT para o Administrador da
        Decoding. O participante acessa pelo link pessoal com token, sem criar conta.
   -​   Tudo persistido no banco, com API REST. O cálculo de pontuação acontece no
        backend, de forma determinística pelas regras deste prompt. Não chame nenhum
        modelo de IA externo.
   -​   Responsivo (celular e desktop). Acessível, com bom contraste.

Não implemente cobrança, não dispare e-mails de verdade e não integre modelos de IA. Para
convidar pessoas, o sistema gera um link pessoal por participante, para copiar ou
exportar. A interface não deve afirmar que enviou e-mails nem que executou ações que não
executou.
2. Operação e perfis
A operação é conduzida pela Decoding. O cliente apenas informa quem vai participar. O
Administrador da Decoding cadastra a empresa, importa a lista de participantes num formato
específico, gera os links pessoais e distribui. Cada pessoa responde pelo seu link e recebe o
resultado individual em PDF. As respostas são consolidadas em um diagnóstico da empresa.

Administrador da Decoding (com login) é o operador:

   1.​ Faz login.
   2.​ Cadastra a empresa.
   3.​ Importa a lista de participantes no formato da seção 2.1, vinculando todos à empresa.
   4.​ Gera um link pessoal por participante e distribui (ver seção 2.2).
   5.​ Acompanha o preenchimento (status e cobertura).
   6.​ Consulta resultados individuais e o diagnóstico consolidado, com filtros.
   7.​ Vê os participantes agrupados por nível de maturidade e usa esses grupos para orientar
       turmas, de forma revisável e manual.
   8.​ Na visão geral, acompanha todas as empresas em nível micro e macro.

Participante (sem conta, via link pessoal):

   1.​ Abre o seu link pessoal, vê a tela de boas-vindas e o aviso de privacidade, aceita o
       consentimento (LGPD).
   2.​ Confere a identificação já preenchida (nome, e-mail e área, vindos da importação) e
       corrige se necessário.
   3.​ Responde ao questionário (progressivo, uma dimensão por vez, com barra de progresso
       e opção de voltar).
   4.​ Ao concluir, vê a devolutiva individual e baixa o resultado em PDF: resumo, resultado
       por dimensão (radar), pontos fortes, prioridades, recomendações práticas e um convite
       para a trilha.
   5.​ Pode reabrir a devolutiva e baixar o PDF de novo pelo mesmo link.

Nesta fase não existe login de empresa. O diagnóstico consolidado é usado pela Decoding
para apresentar ao cliente. Um acesso de leitura para o cliente pode ser adicionado depois.

2.1. Formato de importação de participantes
O Administrador solicita ao cliente a lista completa neste formato e importa por upload de CSV
ou colando numa área de texto. Ofereça um modelo para baixar.

   -​   Colunas obrigatórias, nesta ordem: nome, email, area.
   -​   Uma pessoa por linha. Cabeçalho na primeira linha.
   -​   Exemplo:
            -​ nome,email,area
            -​ Ana Souza,ana.souza@empresa.com,RH
            -​ Carlos Lima,carlos.lima@empresa.com,Comercial
   -​   Validação: e-mail válido e único na empresa, nome e área preenchidos. Mostre os erros
        por linha e importe só as linhas válidas, deixando as inválidas para correção.
   -​   Cada participante importado recebe um token e um link pessoal de preenchimento.

2.2. Envio dos links
O sistema gera os links pessoais e uma lista exportável (copiar ou baixar CSV com nome,
e-mail e link). Nesta fase o envio por e-mail não é automático: o Administrador copia ou exporta
os links para enviar. A interface não afirma ter enviado e-mails. O disparo automático fica para
uma fase futura.


3. Metodologia do assessment
Cinco dimensões individuais:

   1.​ Familiaridade: frequência e naturalidade de uso de IA no trabalho.
   2.​ Contexto: capacidade de dar objetivo, contexto, referências, restrições e formato ao
       pedido.
   3.​ Aplicação: uso de IA em tarefas e entregas reais da função.
   4.​ Revisão: avaliar criticamente as respostas, conferir informação e cuidar de dados.
   5.​ Autonomia: resolver sozinho, adaptar, reutilizar e orientar outros.

Quatro níveis (por dimensão e geral):

   -​   Iniciante (0 a 25): usa pouco ou nada, depende de ajuda, não estrutura pedidos.
   -​   Básico (26 a 50): usa em tarefas simples, pedidos genéricos, pouca revisão crítica.
   -​   Intermediário (51 a 75): aplica em entregas reais, dá contexto, revisa e começa a
        reutilizar.
   -​   Avançado (76 a 100): integra ao fluxo, estrutura bem, revisa com critério, cria recursos
        reutilizáveis e orienta colegas.

Tipos de pergunta e pesos (dentro de cada dimensão):

   -​   Autopercepção (frequência e confiança): peso 1.
   -​   Conhecimento e julgamento (reconhecer a boa prática): peso 1,5.
   -​   Situação prática (o que faria num caso real): peso 2.

A prática e o conhecimento pesam mais que a autopercepção de propósito, para reduzir
respostas otimistas. Não atribua maturidade por posse de ferramenta ou assinatura paga.
Tratamento de incompletos e "não sei":

   -​   "Não sei" ou "não uso" vale a menor pontuação da questão, mas é tratado como
        oportunidade de aprendizagem, sem acusar erro.
   -​   Uma dimensão só é pontuada se ao menos 60% das suas questões forem respondidas,
        senão marque a dimensão como "dados insuficientes".
   -​   O resultado geral só é calculado com ao menos 70% do questionário respondido.
        Abaixo disso, mostre "preenchimento incompleto".

Trava de consistência (autopercepção acima da prática):

   -​   Calcule a média das questões de autopercepção e a média das de prática
        (normalizadas 0 a 100).
   -​   Se a autopercepção ficar no quartil alto (≥ 75) e a prática no quartil baixo (≤ 40), rebaixe
        o nível geral em um degrau e exiba a marca "autopercepção acima da prática" na
        devolutiva, com tom de desenvolvimento.


4. Questionário individual (completo, com pontuação)
Cada opção vale os pontos indicados. Guarde a resposta e o peso do tipo. Normalize cada
dimensão para 0 a 100 assim: score_dim = (soma(pontos*peso) / soma(4*peso)) *
100, considerando só as questões respondidas da dimensão. O score geral é a média simples
das cinco dimensões pontuadas.

Perguntas de perfil (não pontuam, só informam):

   -​   P0a: Área (lista: RH, Comercial, Operações, Administrativo, Financeiro, Marketing,
        Liderança, Outra).
   -​   P0b: Função (texto curto).
   -​   P0c: Quais ferramentas de IA você tem acesso? (múltipla escolha: Claude, Gemini,
        Microsoft Copilot, ChatGPT, NotebookLM, Outra, Nenhuma). Isto não pontua.

As perguntas usam situações reconhecíveis do dia a dia, para a pessoa se identificar. Os
cenários servem para qualquer área (RH, comercial, operações, administrativo, financeiro,
marketing, liderança). São 24 questões pontuadas, distribuídas pelas cinco dimensões, com
mais peso nas de aplicação e revisão.

Dimensão 1 · Familiaridade (4 questões)

   -​   Q1 (autopercepção) Com que frequência você usa IA no trabalho? Nunca (0) ·
        Raramente (1) · Algumas vezes por semana (2) · Quase todo dia (3) · Várias vezes ao
        dia (4).
   -​   Q2 (autopercepção) Quão confortável você fica ao usar IA numa tarefa nova? Nada (0) ·
        Pouco (1) · Mais ou menos (2) · Confortável (3) · Muito confortável (4).
   -​   Q3 (autopercepção) Quando surge uma tarefa nova no seu dia, você se lembra de
        considerar a IA como uma opção? Nunca (0) · Raramente (1) · Às vezes (2) · Quase
        sempre (3) · Sempre (4).
   -​   Q4 (conhecimento) Qual descreve melhor o que a IA generativa faz bem hoje? Gera e
        transforma texto e dados a partir de instruções e contexto (4) · Garante informações
        sempre corretas (0) · Substitui a decisão humana (0) · Só serve para programação (1).
        [permite "não sei" = 0]

Dimensão 2 · Contexto (5 questões)

   -​   Q5 (prática) Entre os pedidos abaixo, qual tende a dar o melhor resultado? Um pedido
        vago, como "escreva algo sobre vendas" (0) · Um pedido com objetivo, contexto, público
        e formato (4) · Um pedido de uma linha só (1) · "Faça do seu jeito" (0).
   -​   Q6 (conhecimento) O que mais melhora a resposta numa tarefa de trabalho? Dar
        contexto e exemplos (4) · Escrever em maiúsculas (0) · Repetir o mesmo pedido várias
        vezes (1) · Usar a ferramenta mais cara (0). [permite "não sei" = 0]
   -​   Q7 (autopercepção) Você costuma informar objetivo, público, restrições e formato nos
        seus pedidos? Nunca (0) · Raramente (1) · Às vezes (2) · Quase sempre (3) · Sempre
        (4).
   -​   Q8 (prática) Você vai pedir à IA um e-mail para um cliente insatisfeito. O que você inclui
        no pedido? O contexto do caso, o tom desejado e o que precisa ser resolvido (4) · Só
        "escreva um e-mail para um cliente" (1) · Cola a reclamação e manda "responde" (2) ·
        Peço e uso sem ajustar (0).
   -​   Q9 (prática) A primeira resposta veio genérica demais. O melhor próximo passo é: Dar
        exemplos e restrições e pedir de novo (4) · Aceitar assim mesmo (1) · Desistir (0) ·
        Repetir o mesmo pedido igual (1).

Dimensão 3 · Aplicação (5 questões)

   -​   Q10 (autopercepção) Em quantas tarefas reais da sua função você já usou IA?
        Nenhuma (0) · 1 a 2 (1) · Algumas (2) · Muitas (3) · É parte do meu fluxo (4).
   -​   Q11 (prática) Você precisa transformar notas de uma reunião em um resumo com
        decisões e próximos passos. Qual caminho usa melhor a IA? Colar as notas e pedir um
        resumo estruturado com decisões e responsáveis (4) · Pedir só "resuma" (2) · Digitar
        tudo de novo manualmente (0) · Não usaria IA (1).
   -​   Q12 (conhecimento) Para analisar uma planilha com IA, o que mais ajuda é: Descrever
        as colunas e a pergunta de negócio (4) · Mandar "analise" (1) · Pedir um gráfico bonito
        (1) · Nada, IA não lê planilha (0). [permite "não sei" = 0]
   -​   Q13 (prática) Você precisa de um primeiro rascunho do relatório mensal da sua área.
        Como a IA ajuda melhor? Dar os dados e a estrutura desejada e pedir um rascunho
        para revisar (4) · Pedir "faça um relatório" sem dados (1) · Não usar, relatório é só
        manual (1) · Pedir e enviar sem conferir (0).
   -​   Q14 (prática) Chega um documento longo que você precisa entender rápido. O melhor
        uso é: Pedir um resumo com os pontos que importam para a sua decisão (4) · Pedir
        "resuma" sem dizer o foco (2) · Ler tudo sem apoio, sempre (2) · Ignorar o documento
        (0).

Dimensão 4 · Revisão (5 questões)

   -​   Q15 (conhecimento) A IA te deu números. O que fazer antes de usar? Conferir na fonte
        original (4) · Confiar, a IA é precisa (0) · Publicar direto (0) · Só corrigir o português (1).
        [permite "não sei" = 0]
   -​   Q16 (prática) A resposta parece boa, mas falta uma parte. O melhor é: Apontar a lacuna
        e pedir o complemento com critério (4) · Aceitar como está (1) · Recomeçar do zero
        sempre (2) · Desistir (0).
   -​   Q17 (conhecimento) Sobre usar informação da empresa na IA, o cuidado certo é: Usar
        só dados autorizados e evitar dados sensíveis ou pessoais sem permissão (4) · Colar
        qualquer coisa (0) · Nunca usar nada da empresa (1) · Tanto faz (0). [permite "não sei" =
        0]
   -​   Q18 (prática) A IA citou uma informação ou regra que você vai usar com um cliente.
        Antes de enviar, você: Confere na fonte original (4) · Confia porque soou convincente
        (0) · Envia e corrige depois se reclamarem (0) · Tira a parte em dúvida sem conferir (2).
   -​   Q19 (autopercepção) Com que frequência você revê com olhar crítico o que a IA
        entrega antes de usar? Nunca (0) · Raramente (1) · Às vezes (2) · Quase sempre (3) ·
        Sempre (4).

Dimensão 5 · Autonomia (5 questões)

   -​   Q20 (autopercepção) Quando a IA não entende, você consegue reformular e chegar a
        um bom resultado? Quase nunca (0) · Raramente (1) · Às vezes (2) · Quase sempre (3)
        · Sempre (4).
   -​   Q21 (prática) Você reaproveita bons pedidos, salvando modelos ou instruções para
        tarefas repetidas? Nunca (0) · Já pensei nisso (1) · Às vezes (2) · Com frequência (3) ·
        Tenho um conjunto organizado (4).
   -​   Q22 (autopercepção) Você ajuda colegas a usarem IA melhor? Nunca (0) · Raramente
        (1) · Às vezes (2) · Com frequência (3) · É um papel que assumo (4).
   -​   Q23 (conhecimento) Um assistente ou agente configurado difere de um chat comum
        porque: Guarda instruções e executa um fluxo definido (4) · É só um nome diferente (1)
        · É sempre autônomo e sem supervisão (0) · Não existe (0). [permite "não sei" = 0]
   -​   Q24 (prática) Uma tarefa que você repete toda semana, como montar um resumo ou
        responder dúvidas comuns. O que você faz? Criei um modelo ou instrução para
        reutilizar (4) · Uso IA, mas refaço do zero toda vez (2) · Já pensei em organizar, mas
        não fiz (1) · Faço tudo manual, sem IA (0).
Tempo estimado: 9 a 12 minutos. Mostre esse tempo na abertura.


5. Regras de recomendação (conectadas ao portfólio)
Gere recomendações a partir do nível geral e das lacunas por dimensão. Entregue primeiro
valor (forças e prioridades), depois a sugestão de percurso.

   -​   Geral Iniciante ou Básico: recomende Escale sua produtividade com IA
        (fundamentos).
   -​   Geral Intermediário com lacuna em Aplicação ou Autonomia: recomende Do Problema
        ao Plano.
   -​   Geral Avançado com interesse em construir soluções: recomende Construa Soluções
        e Produtos Digitais com IA.
   -​   Lacuna específica forte (dimensão ≤ 40): adicione um foco curto. Ex.: Revisão baixa
        gera "priorizar conferência de informação e cuidado com dados".
   -​   Nunca prometa ganho percentual nem domínio completo. Trate exemplos como
        ilustrativos.


6. Conteúdo e profundidade do relatório
O relatório é o resultado devolvido à pessoa (a devolutiva) e o diagnóstico consolidado da
empresa. Ele precisa ser específico, fundamentado nas respostas e escrito em linguagem de
desenvolvimento, para que a pessoa e a empresa se reconheçam e saibam o que fazer. Como
não há modelo de IA, a análise é montada por regras determinísticas que leem as respostas
reais.

Como a análise é montada (fundamentada nas respostas):

   -​   Para cada dimensão, calcule o score e o nível e identifique a evidência: a questão
        respondida com maior pontuação (força) e a com menor pontuação (lacuna) dentro da
        dimensão. Guarde o texto da opção escolhida.
   -​   O relatório cita essas evidências em linguagem simples. Exemplo: se em Contexto a
        pessoa respondeu que "raramente" informa objetivo e formato, o texto diz que ela
        indicou que raramente define objetivo e formato nos pedidos, o que limita a qualidade
        das respostas.
   -​   Combine a frase do nível da dimensão (banco abaixo) com a evidência específica.
        Nunca use só o número.
   -​   Linguagem de desenvolvimento, sem julgamento e sem prometer ganho percentual.

Relatório individual (devolutiva), nesta ordem:

   1.​ Estágio atual: o nível geral e duas ou três frases que descrevem o que esse nível
       significa no dia a dia, ancoradas na dimensão mais forte e na mais fraca da pessoa.
   2.​ Mapa por dimensão: o radar das cinco dimensões e, para cada uma, o nível e uma frase
       específica com a evidência.
   3.​ Potencialidades: as duas dimensões mais altas, com o comportamento concreto que as
       sustenta (evidência de força).
   4.​ Lacunas e o que significam: as duas dimensões mais baixas, com um exemplo do dia a
       dia e a evidência de lacuna.
   5.​ Próximos passos: três ações específicas ligadas às lacunas, não genéricas, e o
       percurso recomendado da trilha (seção 5), como convite.
   6.​ Observação de consistência: se a trava disparar, inclua "autopercepção acima da
       prática", com tom de desenvolvimento.
   7.​ Exportação em PDF, com a identificação e a assinatura da marca. O mesmo link permite
       baixar de novo depois.

Relatório da empresa (consolidado dos respondentes), nesta ordem:

   1.​ Cobertura: percentual de respondentes sobre convidados, sempre visível. Todo o
       diagnóstico aparece como "visão dos respondentes".
   2.​ Estágio atual da empresa: descrição do perfil a partir da distribuição por nível. Exemplo:
       a maior parte dos respondentes está em Básico e Intermediário, poucos em Avançado.
   3.​ Potencialidades: a dimensão mais forte do conjunto e a área com os níveis mais altos,
       com números.
   4.​ Lacunas: a dimensão mais fraca e a área com mais Iniciantes, com números e
       percentuais.
   5.​ Necessidades por área: visão de dimensão por área, em mapa de calor ou tabela,
       apontando onde focar.
   6.​ Próximos passos: composição de turmas por maturidade (seção 7) e o foco de cada
       turma por dimensão, conectando ao portfólio. Nunca apresente a média dos
       respondentes como nota definitiva da empresa. Deixe claro que é o perfil dos
       respondentes, com a cobertura.

Banco de frases por dimensão (combine com a evidência): Para cada dimensão, use a
frase conforme o nível e acrescente a evidência da resposta.

   -​   Familiaridade (frequência e conforto de uso). Força: a IA já faz parte do seu dia. Lacuna:
        a IA ainda aparece pouco na sua rotina.
   -​   Contexto (clareza do pedido). Força: você estrutura bem os pedidos, com objetivo e
        formato. Lacuna: seus pedidos tendem a ser genéricos, o que reduz a qualidade das
        respostas.
   -​   Aplicação (uso em entregas reais). Força: você já usa IA em entregas reais da sua
        função. Lacuna: você ainda usa pouco a IA nas suas entregas.
   -​   Revisão (uso crítico e cuidado com dados). Força: você confere a informação e cuida
        dos dados antes de usar. Lacuna: a revisão crítica e o cuidado com dados precisam de
        atenção.
   -​   Autonomia (resolver sozinho, reutilizar e orientar). Força: você reaproveita bons pedidos
        e ajuda colegas. Lacuna: você ainda não reaproveita o que funciona nem organiza o
        reuso.

Frase de estágio geral por nível:

   -​   Iniciante: você está começando com IA, com espaço grande para ganhar confiança e
        aplicar no dia a dia.
   -​   Básico: você já usa IA em tarefas simples, e o próximo passo é dar mais contexto e
        revisar com critério.
   -​   Intermediário: você aplica IA em entregas reais, e para avançar aprofunda a revisão e a
        autonomia.
   -​   Avançado: você integra IA ao seu fluxo, e o foco agora é construir soluções e orientar
        outras pessoas.

Exemplo ilustrativo (modelo de tom, dado fictício): "Seu uso de IA está no nível
Intermediário. Você se destaca em Contexto e Aplicação: estrutura bem os pedidos e já usa IA
em entregas reais, como transformar notas de reunião em resumos com decisões. Para
avançar, o foco é Revisão e Autonomia: você indicou que raramente confere a informação
antes de usar e que ainda não reaproveita bons pedidos. Próximos passos: conferir a fonte dos
dados antes de enviar, salvar um modelo para uma tarefa semanal e começar pelo percurso Do
Problema ao Plano."


7. Agrupamento por maturidade e turmas
Nesta fase, a divisão das pessoas é feita apenas por nível de maturidade em IA. Nome,
e-mail e área servem para identificação e organização, e podem ser usados como filtro, mas
não criam outros critérios de classificação.

Grupos por maturidade (automáticos):

   -​   Grupo Iniciante.
   -​   Grupo Básico.
   -​   Grupo Intermediário.
   -​   Grupo Avançado.

Mostre quantas pessoas há em cada grupo e permita abrir a lista de cada um.

Turmas (revisáveis, não automáticas): Os grupos por maturidade orientam a formação de
turmas, mas não viram turma automaticamente. A Decoding monta as turmas a partir dos
grupos, de forma manual e revisável, podendo juntar níveis adjacentes ou mover participantes.
Mapeamento sugerido ao portfólio, quando a Decoding escolher criar a turma:
   -​   Iniciante e Básico: Escale sua produtividade com IA.
   -​   Intermediário: Do Problema ao Plano.
   -​   Avançado: Construa Soluções e Produtos Digitais com IA.

Permita criar, nomear e editar turmas, movendo pessoas entre elas. Se um grupo tiver poucas
pessoas, a Decoding decide juntar com o nível vizinho. Não aplique regras automáticas de
idioma, área ou lacuna nesta fase.


8. Telas
Participante: Boas-vindas e consentimento · Confirmação da identificação (prefillada) ·
Questionário progressivo · Devolutiva individual com download em PDF. Administrador da
Decoding: Login · Visão geral de empresas (micro e macro) · Cadastro de empresa ·
Importação de participantes (modelo, upload CSV ou colar, validação por linha) · Participantes
(lista, status, filtros por área e nível, links pessoais para copiar ou exportar) · Diagnóstico da
empresa (consolidado) · Grupos por maturidade · Turmas (criar e editar, mover pessoas)

Gráficos: radar por dimensão, barras de distribuição por nível, indicador de cobertura, barras
por área, composição das turmas. Filtros: área, nível e dimensão.

Estados: vazio (empresa sem participantes importados ou sem respostas), incompleto (mostrar
cobertura e "visão dos respondentes"), concluído.


9. Dados de demonstração (seed)
Crie no banco, ao iniciar:

   -​   1 Administrador da Decoding (login demo; mostre as credenciais na tela de login num
        aviso de ambiente de demonstração).
   -​   2 empresas fictícias, cada uma com entre 15 e 25 participantes já importados, com
        nome, e-mail e área, e respostas variadas cobrindo os quatro níveis.
   -​   Links pessoais gerados para cada participante.
   -​   Grupos por maturidade já calculados e ao menos uma turma de exemplo, para os
        dashboards aparecerem populados.


10. Identidade visual (design system Decoding)
Cores: Code Blue #0B1B56 (âncora e textos), Insight cyan #77C6F9 (acento predominante),
Pulse Lime #E4FD98 (acento secundário e assinatura), Canvas #FFFFFF, Surface #F8F9FE,
Root #111111. Tons de apoio: #D8F0FD, #E0E5FA, #8AA0E8, #8CB800. Proporção visual:
cyan predomina sobre lime. Tipografia: use "Aileron" se disponível, com "Inter" como
alternativa. Títulos fortes, corpo legível. Componentes: cards arredondados com sombra suave,
selos e pills, radar e barras com as cores acima. Rodapé e abertura trazem a assinatura IA
First. Human Driven. Deixe um espaço de logo com a marca Decoding e uma nota para
substituir pelo SVG oficial. Tom de texto: claro, próximo e orientado à aplicação. Sem
promessas vazias, sem infantilizar.


11. Privacidade e honestidade (obrigatório)
   -​   Tela de consentimento antes de começar, com aviso de LGPD, finalidade (diagnóstico
        de desenvolvimento) e uso dos dados.
   -​   Coleta mínima: nome, e-mail e área, fornecidos pela empresa na importação. A
        empresa é responsável por informar os participantes sobre a participação.
   -​   O Administrador da Decoding pode excluir participantes e dados da empresa.
   -​   A interface não afirma ter enviado e-mails nem executado ações que não executou. Os
        links pessoais são gerados para copiar ou exportar.
   -​   Rótulos sempre claros: os resultados aparecem como visão dos respondentes, sempre
        com a cobertura.


12. Modelo de dados (base)
Entidades: Company; User (papel admin); Participant (nome, e-mail, area, empresa, token
pessoal, status de preenchimento); AssessmentResponse (respostas e scores por dimensão,
nível geral, flags, data); Turma (nome, nível de origem, oferta associada opcional,
participantes). Relacione cada participante a uma empresa e a uma área. O agrupamento por
maturidade é derivado do nível geral de cada participante e não precisa de tabela própria.


13. Endpoints (REST, base)
Auth (admin): POST /auth/login, POST /auth/logout, GET /auth/me. Empresas: POST
/companies, GET /companies, GET /companies/:id, GET
/companies/:id/summary. Importação: POST
/companies/:id/participants/import (recebe CSV ou lista, valida por linha, cria
participantes e links pessoais, retorna os erros das linhas inválidas). Participantes e links: GET
/companies/:id/participants (lista com status e link pessoal), GET
/companies/:id/participants/export (CSV com nome, e-mail e link). Preenchimento
(público, por link pessoal): GET /r/:token (identificação prefillada e questionário), POST
/r/:token/submit (calcula e salva scores), GET /r/:token/result (devolutiva para
exibir e gerar o PDF). Agrupamento e turmas: GET /companies/:id/groups (contagem e
listas por nível), POST /companies/:id/turmas, PATCH /turmas/:id/move. Admin: GET
/admin/overview.

O PDF individual é gerado no frontend a partir da devolutiva, com uma view imprimível ou uma
biblioteca de PDF. Não depende de serviço externo.
14. Critérios de aceite
   -​   O Administrador cadastra a empresa, importa a lista no formato definido (com validação
        por linha), gera links pessoais e exporta a lista de links.
   -​   O participante abre o link pessoal, confirma a identificação prefillada, responde, vê a
        devolutiva e baixa o resultado em PDF. Tudo persiste no banco.
   -​   O diagnóstico consolidado da empresa aparece com cobertura, distribuição por nível,
        radar dos respondentes e necessidades por área.
   -​   Os participantes aparecem agrupados por nível de maturidade. As turmas são criadas e
        editadas manualmente pela Decoding, com pessoas movíveis entre elas.
   -​   A pontuação segue exatamente as regras deste prompt, calculada no backend.
   -​   Dados de demonstração populam os dashboards no primeiro acesso.
   -​   Design aplica as cores e o tom da Decoding. Responsivo. A interface não afirma ter
        enviado e-mails nem executado ações que não executou.


FIM DO PROMPT


Observações para a Decoding (não cole no Replit)
   -​   Fase seguinte do backend: disparo automático dos links por e-mail, verificação de
        e-mail, papéis e permissões mais finos, exportação e retenção de dados conforme
        LGPD, e um acesso de leitura para o cliente ver o diagnóstico.
   -​   Os pesos, as faixas e as perguntas são critérios de pilotagem. Rode com um grupo
        pequeno antes de abrir, para calibrar.
