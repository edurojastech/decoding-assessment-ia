// RN-11: recomendação pelo nível geral e pelas lacunas (seções 5 e 7 do original). Função pura.
import { DIMENSIONS } from './questions.js';
import { SHORT_FOCUS } from './phrases.js';

export const OFFERS = {
  fundamentos: 'Escale sua produtividade com IA',
  intermediario: 'Do Problema ao Plano',
  avancado: 'Construa Soluções e Produtos Digitais com IA',
};

const FOCUS_THRESHOLD = 40;

// Lacunas = as duas dimensões pontuadas mais baixas (bloco 4 da devolutiva, seção 6).
// Empate: ordem das dimensões.
export function gapDimensions(result, count = 2) {
  return DIMENSIONS
    .map((d, order) => ({ id: d.id, order, score: result.dimensions[d.id].score }))
    .filter((d) => d.score !== null)
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .slice(0, count)
    .map((d) => d.id);
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
