// Guia "Front 1 · Devolutiva no app": o que a tela mostra logo depois do formulário.
// Leitura de ~2 minutos (250 a 400 palavras): síntese, cinco frases curtas, até duas prioridades e uma força
// relativa, uma primeira ação com entrega verificável, o percurso justificado e o resumo metodológico.
// Função pura sobre o resultado do motor e a análise do PDF (mesma avaliação, mesma base de cálculo).
import { LEVELS } from '../constants.js';
import { DIMENSIONS, INSTRUMENT_VERSION, QUESTIONS, WEIGHTS } from '../scoring/questions.js';
import { SCORING_RULES } from '../scoring/score.js';
import { fill } from '../scoring/phrases.js';
import { OFFER_GOALS } from '../scoring/analysisPhrases.js';
import {
  ADVANCED_ACTION, ADVANCED_FOCUS, DATA_NOTE, DIMENSION_TOPIC, DIVERGENT_SHORT, FIRST_ACTION, FOCUS_TEXT, INCOMPLETE_SYNTHESIS, LEARNING_TOPIC,
  METHOD_NOTES, NEED, NEXT_STEP, PRIORITY_SHORT, REPORT_VERSION, SHORT_INSUFFICIENT, SHORT_PARTIAL, SHORT_READING,
  SHORT_TOPIC, STRENGTH_NOUN, STRENGTH_SHORT, STRENGTH_USE,
} from '../scoring/screenPhrases.js';

const MAX_FOCUS = 2;
const ADVANCED_FROM = 76; // nota a partir da qual a dimensão já é Avançado (RN-05): não vira "ponto de desenvolvimento"

const joinNames = (names) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`);


// Regra editorial: "você declarou" (autorrelato); "na situação apresentada, você selecionou" (conhecimento/julgamento).
export function evidenceSentence(e) {
  const topic = SHORT_TOPIC[e.questionId];
  return e.type === 'A'
    ? `Sobre ${topic}, você declarou “${e.label}”.`
    : `Na situação apresentada sobre ${topic}, você selecionou “${e.label}”.`;
}

function shortFromEvidence(e) {
  if (!e || (e.points > 1 && e.points < 3)) return SHORT_PARTIAL;
  const tone = e.points <= 1 ? 'low' : 'high';
  const reading = SHORT_READING[e.type][tone];
  return e.type === 'A'
    ? `Sobre ${SHORT_TOPIC[e.questionId]}, ${reading}.`
    : `A resposta sobre ${SHORT_TOPIC[e.questionId]} ${reading}.`;
}

// Bloco 3: uma frase curta por dimensão. Ordem: divergência > prioridade > força relativa > evidência.
function dimensionLines(analysis, priorityIds, strengthId) {
  return analysis.dimensions.map((d) => {
    let short;
    if (d.score === null) short = SHORT_INSUFFICIENT;
    else if (d.divergent) short = fill(DIVERGENT_SHORT, { topic: DIMENSION_TOPIC[d.id] });
    else if (priorityIds[0] === d.id) short = `${PRIORITY_SHORT[d.id]} é a prioridade inicial.`;
    else if (priorityIds.includes(d.id)) short = `${PRIORITY_SHORT[d.id]} é um ponto de desenvolvimento.`;
    else if (d.id === strengthId) short = STRENGTH_SHORT[d.id];
    else short = shortFromEvidence(d.evidence[d.evidence.length - 1]);
    return {
      id: d.id,
      short,
      evidence: d.evidence.map((e) => evidenceSentence(e)),
    };
  });
}

// Força relativa: a maior nota fora das prioridades, acima delas (nunca "competência consolidada").
function relativeStrength(analysis, focusIds, priorityIds) {
  const scored = analysis.dimensions.filter((d) => d.score !== null);
  const candidates = scored.filter((d) => !priorityIds.includes(d.id));
  if (candidates.length === 0) return null;
  const top = candidates.reduce((a, b) => (b.score > a.score ? b : a));
  const focusScores = scored.filter((d) => focusIds.includes(d.id)).map((d) => d.score);
  if (focusScores.length > 0 && top.score <= Math.max(...focusScores)) return null;
  return { id: top.id, name: top.name, score: top.score, level: top.level, text: STRENGTH_USE[top.id] };
}

function synthesis(response, analysis, focus, strength, answeredCount) {
  if (response.flags?.incomplete || !response.overallLevel) {
    return [fill(INCOMPLETE_SYNTHESIS, { answered: answeredCount, total: QUESTIONS.length })];
  }
  const scored = analysis.dimensions.filter((d) => d.score !== null);
  const desc = [...scored].sort((a, b) => b.score - a.score);
  const top = desc[0];
  const sentences = [];
  if (top.score === desc[desc.length - 1].score) {
    sentences.push(`Suas dimensões estão no mesmo patamar (${top.score} de 100).`);
  } else {
    const lows = [...scored].sort((a, b) => a.score - b.score).filter((d) => d.score < top.score).slice(0, 2).map((d) => d.name);
    sentences.push(`Seu perfil apresenta maior pontuação em ${top.name} e oportunidades de desenvolvimento em ${joinNames(lows)}.`);
  }
  const needs = focus.map((f) => NEED[f.id]);
  const topHigh = top.evidence.some((e) => e.points >= 3);
  if (needs.length === 0) {
    sentences.push(ADVANCED_FOCUS);
  } else {
    sentences.push(strength && topHigh && strength.id === top.id
      ? `As respostas sugerem ${STRENGTH_NOUN[top.id]}, acompanhada da necessidade de ${joinNames(needs)}.`
      : `As respostas indicam a necessidade de ${joinNames(needs)}.`);
  }
  const divergent = analysis.dimensions.filter((d) => d.divergent).map((d) => d.name);
  if (divergent.length > 0) sentences.push(`Em ${joinNames(divergent)}, as respostas mostram critérios ainda inconsistentes.`);
  const overallIdx = LEVELS.indexOf(response.overallLevel);
  const above = scored.filter((d) => LEVELS.indexOf(d.level) > overallIdx);
  if (above.length > 0) {
    sentences.push(`O nível ${above.map((d) => `${d.level} em ${d.name}`).join(' e ')} vale para ${above.length > 1 ? 'essas dimensões' : 'essa dimensão'} e não altera o nível geral ${response.overallLevel}.`);
  }
  if (needs.length > 0) sentences.push(NEXT_STEP);
  return sentences;
}

function learning(focusIds, offer) {
  const topics = joinNames(focusIds.map((id) => LEARNING_TOPIC[id]));
  return {
    text: topics ? `Comece por conteúdos sobre ${topics}.` : null,
    offer: offer ? {
      name: offer,
      why: topics
        ? `Indicado porque as suas prioridades envolvem ${topics}. O percurso trabalha ${OFFER_GOALS[offer] ?? 'esses temas'}.`
        : `O percurso trabalha ${OFFER_GOALS[offer] ?? 'os temas do seu estágio'}.`,
    } : null,
  };
}

function methodology(response, submittedAt) {
  const stored = response.flags?.versions ?? null;
  const changed = stored && (stored.instrument !== INSTRUMENT_VERSION.questionnaire || stored.report !== REPORT_VERSION);
  return {
    scale: 'Cada dimensão vai de 0 a 100: Iniciante (0 a 25), Básico (26 a 50), Intermediário (51 a 75) e Avançado (76 a 100). '
      + 'As notas são arredondadas para número inteiro antes da classificação.',
    overall: `O resultado geral é a média das notas das dimensões. Em cada dimensão, situações práticas pesam ${String(WEIGHTS.P).replace('.', ',')}, `
      + `conhecimento ${String(WEIGHTS.C).replace('.', ',')} e autopercepção ${String(WEIGHTS.A).replace('.', ',')}; `
      + `uma dimensão só recebe nota com pelo menos ${Math.round(SCORING_RULES.minDimensionCoverage * 100)}% das perguntas respondidas.`,
    dimensions: DIMENSIONS.map((d) => ({ name: d.name, description: d.description })),
    origin: METHOD_NOTES.origin,
    scope: METHOD_NOTES.scope,
    pdf: METHOD_NOTES.pdf,
    versions: {
      date: submittedAt,
      instrument: stored?.instrument ?? INSTRUMENT_VERSION.questionnaire,
      report: REPORT_VERSION,
      notice: changed
        ? `Suas respostas foram registradas com a versão ${stored.instrument} do instrumento; a leitura atual usa a versão ${REPORT_VERSION} da devolutiva.`
        : null,
    },
  };
}

/** Conteúdo da tela da devolutiva (Front 1), a partir da análise já montada para o PDF. */
export function buildReportScreen(response, analysis, offer) {
  const answeredCount = Object.keys(response.answers ?? {}).length;
  // Prioridades da tela: as da análise que ainda estão abaixo de Avançado.
  const priorities = analysis.priorities.filter((p) => analysis.dimensions.find((d) => d.id === p.id).score < ADVANCED_FROM);
  const priorityIds = priorities.map((p) => p.id);
  const focus = priorities.slice(0, MAX_FOCUS).map((p) => {
    const d = analysis.dimensions.find((x) => x.id === p.id);
    return { id: p.id, name: p.name, score: d.score, level: d.level, title: PRIORITY_SHORT[p.id], text: FOCUS_TEXT[p.id] };
  });
  const focusIds = focus.map((f) => f.id);
  // Sem foco não há o que a força relativa apoie: ela só aparece junto das prioridades.
  const strength = focus.length > 0 ? relativeStrength(analysis, focusIds, priorityIds) : null;
  const first = priorities[0] ? FIRST_ACTION[priorities[0].id] : (analysis.priorities.length > 0 ? ADVANCED_ACTION : null);

  return {
    synthesis: synthesis(response, analysis, focus, strength, answeredCount),
    dimensions: dimensionLines(analysis, priorityIds, strength?.id),
    focus: focus.length > 0 ? { title: `Priorize ${joinNames(focus.map((f) => f.name))}.`, items: focus } : null,
    strength,
    firstAction: first ? { text: first.text, delivery: first.delivery, note: DATA_NOTE } : null,
    learning: learning(priorityIds, offer),
    methodology: methodology(response, response.submittedAt ?? null),
  };
}


