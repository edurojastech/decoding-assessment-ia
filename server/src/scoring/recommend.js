// RN-11: recomendação pelo nível geral e pelas lacunas (seções 5 e 7 do original). Função pura.
import { DIMENSIONS } from './questions.js';
import { SHORT_FOCUS } from './phrases.js';

export const OFFERS = {
  fundamentos: 'Escale sua produtividade com IA',
  intermediario: 'Do Problema ao Plano',
  avancado: 'Construa Soluções e Produtos Digitais com IA',
};

const FOCUS_THRESHOLD = 40;

// Dimensões pontuadas ordenadas por score (direction 1 = crescente, -1 = decrescente).
// Empate: ordem das dimensões.
export function rankDimensions(result, direction) {
  return DIMENSIONS
    .map((d, order) => ({ id: d.id, order, score: result.dimensions[d.id].score }))
    .filter((d) => d.score !== null && d.score !== undefined)
    .sort((a, b) => (a.score - b.score) * direction || a.order - b.order)
    .map((d) => d.id);
}

// Lacunas = as duas dimensões pontuadas mais baixas (bloco 4 da devolutiva, seção 6).
export function gapDimensions(result, count = 2) {
  return rankDimensions(result, 1).slice(0, count);
}

// Potencialidades = as duas dimensões pontuadas mais altas (bloco 3), fora das lacunas.
// Com 5 dimensões pontuadas não há sobreposição; com menos, a lacuna tem prioridade.
export function strengthDimensions(result, count = 2) {
  const gaps = new Set(gapDimensions(result));
  return rankDimensions(result, -1).filter((id) => !gaps.has(id)).slice(0, count);
}

/**
 * Recebe o resultado de scoreAssessment e devolve `{ offer, reason, gaps, focus }`.
 * O percurso é apresentado como convite na devolutiva (seção 6, bloco 5).
 */
export function recommend(result) {
  const gaps = gapDimensions(result);
  const focus = DIMENSIONS
    .filter((d) => result.dimensions[d.id].score !== null && result.dimensions[d.id].score <= FOCUS_THRESHOLD)
    .map((d) => ({ dimension: d.id, text: SHORT_FOCUS[d.id] }));

  let offer = null;
  let reason = null;
  switch (result.overallLevel) {
    case 'Iniciante':
    case 'Básico':
      offer = OFFERS.fundamentos;
      reason = 'nivel';
      break;
    case 'Intermediário':
      // Seção 5: lacuna em Aplicação ou Autonomia. Sem ela, vale o mapeamento da seção 7.
      offer = OFFERS.intermediario;
      reason = gaps.some((id) => id === 'aplicacao' || id === 'autonomia') ? 'lacuna_aplicacao_autonomia' : 'nivel';
      break;
    case 'Avançado':
      // Seção 5 condiciona ao "interesse em construir soluções": o texto da devolutiva faz o convite.
      offer = OFFERS.avancado;
      reason = 'nivel';
      break;
    default:
      break;
  }

  return { offer, reason, gaps, focus };
}
