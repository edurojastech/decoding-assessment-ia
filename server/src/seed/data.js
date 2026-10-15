// Dados fictícios de demonstração (RF-19). Nomes e empresas inventados.

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Paula', 'Rafael',
  'Sabrina', 'Tiago', 'Vanessa', 'Wagner', 'Yasmin', 'Lucas', 'Mariana', 'Pedro', 'Renata',
];

const LAST_NAMES = [
  'Souza', 'Lima', 'Oliveira', 'Costa', 'Pereira', 'Almeida', 'Ribeiro', 'Martins',
  'Carvalho', 'Gomes', 'Rocha', 'Barbosa', 'Teixeira', 'Moreira', 'Dias', 'Cardoso',
  'Nunes', 'Freitas', 'Mendes', 'Castro', 'Araújo', 'Pinto', 'Farias', 'Vieira', 'Moura',
];

export const DEMO_COMPANIES = [
  {
    name: 'Aurora Logística',
    domain: 'aurora.example.com',
    size: 18,
    areas: ['Operações', 'Comercial', 'RH', 'Administrativo', 'Financeiro', 'Liderança'],
    nameOffset: 0,
    // Um plano por participante, na ordem da lista: perfil de resposta ou status sem resposta.
    plans: [
      'intermediario', 'basico', 'iniciante', 'avancado', 'basico', 'intermediario',
      'otimista', 'basico', 'intermediario', 'iniciante', 'avancado', 'basico',
      'intermediario', 'iniciante', 'em_andamento', 'pendente', 'em_andamento', 'pendente',
    ],
  },
  {
    name: 'Vértice Serviços Financeiros',
    domain: 'vertice.example.com',
    size: 22,
    areas: ['Financeiro', 'Comercial', 'Marketing', 'RH', 'Operações', 'Liderança'],
    nameOffset: 7,
    plans: [
      'avancado', 'intermediario', 'basico', 'intermediario', 'avancado', 'intermediario',
      'iniciante', 'intermediario', 'basico', 'avancado', 'otimista', 'intermediario',
      'basico', 'intermediario', 'avancado', 'basico', 'intermediario', 'iniciante',
      'em_andamento', 'pendente', 'pendente', 'em_andamento',
    ],
  },
  {
    name: 'Nexo Saúde',
    domain: 'nexo.example.com',
    size: 15,
    areas: ['Atendimento', 'Enfermagem', 'Administrativo', 'Financeiro', 'Liderança'],
    nameOffset: 3,
    plans: [
      'iniciante', 'basico', 'iniciante', 'intermediario', 'basico', 'iniciante',
      'avancado', 'basico', 'otimista', 'intermediario', 'iniciante', 'basico',
      'em_andamento', 'pendente', 'pendente',
    ],
  },
  {
    name: 'Horizonte Educação',
    domain: 'horizonte.example.com',
    size: 16,
    areas: ['Pedagógico', 'Secretaria', 'Comercial', 'Tecnologia'],
    nameOffset: 11,
    plans: [
      'avancado', 'intermediario', 'avancado', 'basico', 'intermediario', 'avancado',
      'intermediario', 'iniciante', 'intermediario', 'otimista', 'basico', 'avancado',
      'intermediario', 'em_andamento', 'pendente', 'pendente',
    ],
  },
];

export const DEMO_TURMA = {
  name: 'Turma exemplo · Fundamentos',
  sourceLevel: 'Iniciante',
  offer: 'Escale sua produtividade com IA',
};

function slug(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Gera a lista de participantes de forma determinística (seed idempotente).
export function buildParticipants(company) {
  return Array.from({ length: company.size }, (_, i) => {
    const first = FIRST_NAMES[(i + company.nameOffset) % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7 + company.nameOffset) % LAST_NAMES.length];
    return {
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}@${company.domain}`,
      area: company.areas[i % company.areas.length],
    };
  });
}

// --- Etapa 2: respostas de demonstração ---------------------------------------------------
// As respostas são escolhas de opção; a pontuação é sempre calculada pelo motor (regra 1).

// Pontos-alvo (0–4) por dimensão em cada perfil. Os níveis resultantes saem do motor.
const PROFILES = {
  iniciante: { familiaridade: 0.5, contexto: 0.5, aplicacao: 0, revisao: 1, autonomia: 0 },
  basico: { familiaridade: 2, contexto: 1.5, aplicacao: 1.5, revisao: 1.5, autonomia: 1 },
  intermediario: { familiaridade: 3, contexto: 3, aplicacao: 2, revisao: 3, autonomia: 2 },
  avancado: { familiaridade: 4, contexto: 4, aplicacao: 4, revisao: 4, autonomia: 3.5 },
};

// "Autopercepção acima da prática": dispara a trava de consistência (RN-09).
const OPTIMIST_TARGET = { A: 4, C: 2, P: 0 };

const ROLES = {
  RH: 'Analista de RH', Comercial: 'Executivo de contas', Operações: 'Coordenador de operações',
  Administrativo: 'Assistente administrativo', Financeiro: 'Analista financeiro',
  Marketing: 'Analista de marketing', Liderança: 'Gerente de área',
};

const TOOL_SETS = [
  ['ChatGPT'], ['ChatGPT', 'Microsoft Copilot'], ['Gemini'], ['Claude', 'ChatGPT'],
  ['Microsoft Copilot'], ['Nenhuma'], ['Claude', 'NotebookLM'],
];

// Hash FNV-1a: variação determinística por pessoa e questão.
function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

// Opção com pontos mais próximos do alvo (empate: menos pontos, depois a primeira).
function closestOption(question, target) {
  return question.options.reduce((best, o) => {
    const d = Math.abs(o.points - target) - Math.abs(best.points - target);
    return d < 0 || (d === 0 && o.points < best.points) ? o : best;
  }).key;
}

export function buildAnswers(questions, profile, salt) {
  const answers = {};
  for (const q of questions) {
    const jitter = (hash(`${salt}:${q.id}`) % 3) - 1; // -1, 0 ou +1
    if (profile === 'otimista') {
      answers[q.id] = closestOption(q, OPTIMIST_TARGET[q.type]);
    } else if (profile === 'iniciante' && q.allowsNotSure && jitter === -1) {
      answers[q.id] = 'nao_sei';
    } else {
      answers[q.id] = closestOption(q, PROFILES[profile][q.dimension] + jitter);
    }
  }
  return answers;
}

export function isAnswerPlan(plan) {
  return plan === 'otimista' || plan in PROFILES;
}

export function buildProfile(person, index) {
  return {
    role: ROLES[person.area] ?? null,
    tools: TOOL_SETS[hash(person.email) % TOOL_SETS.length],
    // Datas fixas para o seed ser reproduzível.
    consentAt: new Date(Date.UTC(2026, 8, 1 + (index % 20), 13, 0)),
    submittedAt: new Date(Date.UTC(2026, 8, 1 + (index % 20), 13, 12)),
  };
}
