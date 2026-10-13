// RF-11: devolutiva individual (seção 6 do original), montada por regras a partir do resultado
// já calculado pelo motor (scoring/). Função pura: não consulta banco nem recalcula pontuação.
import { LEVELS } from '../constants.js';
import { DIMENSIONS, NOT_SURE_LABEL, QUESTIONS } from '../scoring/questions.js';
import { OFFERS, rankDimensions, recommend, strengthDimensions } from '../scoring/recommend.js';
import {
  CONSISTENCY, DEVELOPED_WEAKEST, DIMENSION_ACTIONS, DIMENSION_PHRASES, EVIDENCE_MEANING, EVIDENCE_MEANING_BY_QUESTION,
  EVIDENCE_TOPICS, GAP_EXAMPLES,
  INCOMPLETE_STAGE, NOT_SURE_MEANING, OFFER_INVITES, RELATIVE_GAP, RELATIVE_STRENGTH, SHORT_FOCUS,
  STAGE_PHRASES, fill,
} from '../scoring/phrases.js';

const DIMENSION_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));
const ACTION_COUNT = 3;

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Intermediário e Avançado usam a frase de força do banco; Iniciante e Básico, a de lacuna.
const isDevelopedLevel = (level) => LEVELS.indexOf(level) >= LEVELS.indexOf('Intermediário');

const phraseFor = (id, level) => DIMENSION_PHRASES[id][isDevelopedLevel(level) ? 'strength' : 'gap'];

/**
 * RN-10: frase com a evidência — o texto da opção escolhida, nunca só o número.
 * A leitura acompanha a resposta: 3–4 pontos → força, 0–1 → lacuna, 2 → só a citação.
 */
export function evidenceText(dimensionId, evidence) {
  if (!evidence) return null;
  const quote = `Sobre ${EVIDENCE_TOPICS[evidence.questionId]}, você`;
  if (evidence.label === NOT_SURE_LABEL) {
    return `${quote} marcou “Não sei”: ${NOT_SURE_MEANING}.`;
  }
  const meaning = EVIDENCE_MEANING_BY_QUESTION[evidence.questionId] ?? EVIDENCE_MEANING[dimensionId];
  let reading = '';
  if (evidence.points >= 3) reading = `, ${meaning.strength}`;
  else if (evidence.points <= 1) reading = `, ${meaning.gap}`;
  return `${quote} respondeu “${evidence.label}”${reading}.`;
}

function evidenceOf(dimensionId, evidence) {
  if (!evidence) return null;
  return { questionId: evidence.questionId, label: evidence.label, text: evidenceText(dimensionId, evidence) };
}

// Bloco 2: cada dimensão com score, nível, frase do nível e evidência correspondente.
function dimensionMap(dimensions) {
  return DIMENSIONS.map((d) => {
    const dim = dimensions[d.id];
    const base = { id: d.id, name: d.name, description: d.description, answered: dim.answered, total: dim.total };
    if (dim.status !== 'pontuada') {
      return {
        ...base,
        status: dim.status,
        score: null,
        level: null,
        phrase: `Poucas respostas nesta dimensão para um resultado (${dim.answered} de ${dim.total}).`,
        evidence: null,
      };
    }
    const developed = isDevelopedLevel(dim.level);
    return {
      ...base,
      status: dim.status,
      score: dim.score,
      level: dim.level,
      tone: developed ? 'forca' : 'lacuna',
      phrase: `${capitalize(phraseFor(d.id, dim.level))}.`,
      evidence: evidenceOf(d.id, developed ? dim.strength : dim.gap),
    };
  });
}

// Bloco 1: nível geral + frases ancoradas na dimensão mais forte e na mais fraca.
function stage(response, dimensions, answeredCount) {
  if (response.flags?.incomplete || !response.overallLevel) {
    return {
      status: 'preenchimento_incompleto',
      score: null,
      level: null,
      summary: [fill(INCOMPLETE_STAGE, { answered: answeredCount, total: QUESTIONS.length })],
      strongest: null,
      weakest: null,
    };
  }

  const ranked = rankDimensions({ dimensions }, -1);
  const pick = (id) => ({ id, name: DIMENSION_BY_ID[id].name, score: dimensions[id].score });
  const strongest = pick(ranked[0]);
  const weakest = pick(ranked[ranked.length - 1]);

  const summary = [STAGE_PHRASES[response.overallLevel]];
  if (strongest.score === weakest.score) {
    summary.push(`Suas dimensões pontuadas estão no mesmo patamar (${strongest.score} de 100).`);
  } else {
    summary.push(
      `Hoje, sua dimensão mais forte é ${strongest.name} (${strongest.score} de 100) `
      + `e a que mais pede atenção é ${weakest.name} (${weakest.score} de 100).`,
    );
    const weakestLevel = dimensions[weakest.id].level;
    summary.push(
      `Em ${strongest.name}, ${phraseFor(strongest.id, dimensions[strongest.id].level)}. `
      + (isDevelopedLevel(weakestLevel)
        ? `${weakest.name} ${DEVELOPED_WEAKEST}.`
        : `Já em ${weakest.name}, ${phraseFor(weakest.id, weakestLevel)}.`),
    );
  }

  return {
    status: 'calculado',
    score: response.overallScore,
    level: response.overallLevel,
    summary,
    strongest,
    weakest,
  };
}

// Bloco 3: potencialidades, com a evidência de força.
function strengths(dimensions) {
  return strengthDimensions({ dimensions }).map((id) => {
    const dim = dimensions[id];
    return {
      id,
      name: DIMENSION_BY_ID[id].name,
      score: dim.score,
      level: dim.level,
      phrase: `${capitalize(isDevelopedLevel(dim.level) ? DIMENSION_PHRASES[id].strength : RELATIVE_STRENGTH)}.`,
      evidence: evidenceOf(id, dim.strength),
    };
  });
}

// Bloco 4: lacunas, com exemplo do dia a dia e a evidência de lacuna.
function gaps(dimensions, gapIds) {
  return gapIds.map((id) => {
    const dim = dimensions[id];
    return {
      id,
      name: DIMENSION_BY_ID[id].name,
      score: dim.score,
      level: dim.level,
      phrase: `${capitalize(isDevelopedLevel(dim.level) ? RELATIVE_GAP : DIMENSION_PHRASES[id].gap)}.`,
      example: GAP_EXAMPLES[id],
      evidence: evidenceOf(id, dim.gap),
    };
  });
}

// Três ações ligadas às lacunas, por prioridade: a 1ª ação de cada lacuna, depois as 2ªs, e assim por diante.
function actionsFor(gapIds) {
  const actions = [];
  for (let round = 0; round < ACTION_COUNT && actions.length < ACTION_COUNT; round += 1) {
    for (const id of gapIds) {
      const action = DIMENSION_ACTIONS[id][round];
      if (action && actions.length < ACTION_COUNT) actions.push({ dimension: id, text: action });
    }
  }
  return actions;
}

// Bloco 5: próximos passos + percurso recomendado como convite (RN-11).
function nextSteps(recommendation) {
  const { offer, reason, gaps: gapIds, focus } = recommendation;
  let invite = null;
  if (offer) {
    const gapNames = gapIds
      .filter((id) => id === 'aplicacao' || id === 'autonomia')
      .map((id) => DIMENSION_BY_ID[id].name)
      .join(' e ');
    const template = offer === OFFERS.avancado ? OFFER_INVITES.avancado : OFFER_INVITES[reason];
    invite = fill(template, { offer, gaps: gapNames });
  }
  return {
    actions: actionsFor(gapIds),
    focus: focus.map((f) => ({ dimension: f.dimension, name: DIMENSION_BY_ID[f.dimension].name, text: SHORT_FOCUS[f.dimension] })),
    recommendation: offer ? { offer, reason, invite } : null,
  };
}

// Bloco 6: observação de consistência (RN-09), só quando a trava disparou.
function consistency(response) {
  if (!response.flags?.inconsistency) return null;
  return {
    title: CONSISTENCY.title,
    text: fill(CONSISTENCY.text, { self: Math.round(response.selfAvg), practice: Math.round(response.practiceAvg) }),
    selfAvg: response.selfAvg,
    practiceAvg: response.practiceAvg,
  };
}

/**
 * Recebe os campos de AssessmentResponse (answers, dimensionScores, overallScore, overallLevel,
 * flags, selfAvg, practiceAvg, submittedAt) e devolve os blocos 1 a 6 da devolutiva.
 * O bloco 7 (PDF) é gerado no front a partir deste conteúdo (ADR-06).
 */
export function buildIndividualReport(response) {
  const dimensions = response.dimensionScores;
  const answeredCount = Object.keys(response.answers ?? {}).length;
  const recommendation = recommend({ dimensions, overallLevel: response.overallLevel });

  return {
    submittedAt: response.submittedAt ?? null,
    answeredCount,
    totalQuestions: QUESTIONS.length,
    stage: stage(response, dimensions, answeredCount),
    dimensions: dimensionMap(dimensions),
    strengths: strengths(dimensions),
    gaps: gaps(dimensions, recommendation.gaps),
    nextSteps: nextSteps(recommendation),
    consistency: consistency(response),
  };
}
