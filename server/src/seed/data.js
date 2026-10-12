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
  },
  {
    name: 'Vértice Serviços Financeiros',
    domain: 'vertice.example.com',
    size: 22,
    areas: ['Financeiro', 'Comercial', 'Marketing', 'RH', 'Operações', 'Liderança'],
    nameOffset: 7,
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
