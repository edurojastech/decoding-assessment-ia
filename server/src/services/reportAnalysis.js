// Guia "Front 2 · Relatório PDF": análise individual para o PDF (4 páginas + apêndice).
// Função pura sobre o resultado já calculado pelo motor (scoring/): não consulta banco nem recalcula notas.
// Cada conclusão remete a uma resposta (ou conjunto de respostas) identificável.
import { LEVELS } from '../constants.js';
import { DIMENSIONS, INSTRUMENT_VERSION, NOT_SURE_LABEL, QUESTIONS, TYPE_LABELS, WEIGHTS } from '../scoring/questions.js';
import { SCORING_RULES } from '../scoring/score.js';
import { recommend } from '../scoring/recommend.js';
import { EVIDENCE_TOPICS, fill } from '../scoring/phrases.js';
import { REPORT_VERSION } from '../scoring/screenPhrases.js';
import {
  CONNECTIONS, CONTINUITY_TEXT, DEVELOP, DIVERGENCE_NOTE, DIVERGENT_READING, EVIDENCE_NATURE, EVOLUTION_CRITERIA,
  EVOLUTION_TEXT, INSUFFICIENT_READING, LEVEL_SCOPE, LIMITS_TEXT, NOT_SURE_READING, OFFER_GOALS, PARTIAL_READING,
  PLAN, PLAN_NOTE, PLAN_PERIODS, PRIORITY, QUESTION_READING, RESULT_NOTE,
} from '../scoring/analysisPhrases.js';

const DIMENSION_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));
const ORDER = Object.fromEntries(DIMENSIONS.map((d, i) => [d.id, i]));
const MAX_PRIORITIES = 3;
const MAX_CONNECTIONS = 3;
const DIVERGENCE_BONUS = 20; // respostas opostas na mesma dimensão
const CONTENT_BONUS = 10; // escolha de 0–1 ponto em conhecimento ou situação apresentada

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const joinNames = (names) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`);
const stripQuotes = (label) => label.replace(/^["“](.*)["”]$/, '$1');
const isLow = (a) => a.points <= 1;
const isHigh = (a) => a.points >= 3;
// Divergência: escolhas opostas entre duas situações apresentadas (questões práticas) da mesma dimensão.
// Conhecimento trata de temas distintos e autorrelato x prática é outra relação (autopercepção acima da prática).
function divergentPair(items) {
  for (const type of ['P']) {
    const same = items.filter((a) => a.type === type);
    if (same.length < 2) continue;
    const high = extreme(same, 1);
    const low = extreme(same, -1);
    if (isHigh(high) && isLow(low)) return { high, low };
  }
  return null;
}

// Respostas resolvidas da dimensão, na ordem do questionário.
function answersOf(answers, dimensionId) {
  return QUESTIONS
    .filter((q) => q.dimension === dimensionId && answers?.[q.id])
    .map((q) => ({ questionId: q.id, ...answers[q.id], weight: answers[q.id].weight ?? WEIGHTS[q.type], type: answers[q.id].type ?? q.type }));
}

// Extremos da dimensão. Empate: maior peso (prática > conhecimento > autorrelato), depois a ordem.
function extreme(items, direction) {
  return items.reduce((acc, item) => {
    const diff = (item.points - acc.points) * direction;
    return diff > 0 || (diff === 0 && item.weight > acc.weight) ? item : acc;
  });
}

function reading(answer) {
  if (answer.label === NOT_SURE_LABEL) return NOT_SURE_READING;
  const r = QUESTION_READING[answer.questionId];
  return isLow(answer) ? r.low : r.high;
}

const choice = (answer) => `A escolha “${stripQuotes(answer.label)}” ${reading(answer)}.`;

function evidenceItem(answer) {
  return {
    questionId: answer.questionId,
    type: answer.type,
    nature: EVIDENCE_NATURE[answer.type],
    topic: capitalize(EVIDENCE_TOPICS[answer.questionId]),
    label: stripQuotes(answer.label),
    points: answer.points,
  };
}

// Página 2: evidência selecionada, interpretação e comportamento a desenvolver.
function analyseDimension(d, dim, answers) {
  const base = { id: d.id, name: d.name, description: d.description, develop: DEVELOP[d.id] };
  if (dim.status !== 'pontuada') {
    return {
      ...base, status: dim.status, score: null, level: null, divergent: false, evidence: [],
      interpretation: fill(INSUFFICIENT_READING, { answered: dim.answered, total: dim.total }),
    };
  }
  const items = answersOf(answers, d.id);
  const low = extreme(items, -1);
  const high = extreme(items, 1);
  const pair = divergentPair(items);
  const divergent = Boolean(pair);

  let evidence;
  let interpretation;
  if (divergent) {
    evidence = [pair.high, pair.low];
    interpretation = fill(DIVERGENT_READING, {
      highLabel: stripQuotes(pair.high.label), high: reading(pair.high), lowLabel: stripQuotes(pair.low.label), low: reading(pair.low),
    });
  } else if (isLow(low)) {
    evidence = [low];
    interpretation = choice(low);
  } else if (isHigh(high)) {
    evidence = [high];
    interpretation = choice(high);
  } else {
    evidence = [high];
    interpretation = PARTIAL_READING;
  }

  return {
    ...base,
    status: dim.status,
    score: dim.score,
    level: dim.level,
    divergent,
    low,
    evidence: evidence.map(evidenceItem),
    interpretation,
  };
}

// Prioridades: nota + conteúdo das respostas + divergências (não só as duas menores notas).
function priorities(analysed) {
  const scored = analysed.filter((d) => d.score !== null);
  if (scored.length === 0) return [];
  const lowest = Math.min(...scored.map((d) => d.score));
  const weight = (d) => (100 - d.score)
    + (d.divergent ? DIVERGENCE_BONUS : 0)
    + (isLow(d.low) && d.low.type !== 'A' ? CONTENT_BONUS : 0);

  return [...scored]
    .sort((a, b) => weight(b) - weight(a) || a.score - b.score || ORDER[a.id] - ORDER[b.id])
    .slice(0, MAX_PRIORITIES)
    .map((d, i) => {
      const unique = scored.filter((x) => x.score === lowest).length === 1;
      const parts = [d.score === lowest && unique ? `${d.name} tem a menor pontuação do perfil (${d.score})` : `${d.name} soma ${d.score} de 100`];
      if (d.divergent) parts.push('reúne respostas divergentes nesta dimensão');
      else if (isLow(d.low)) parts.push(`a escolha “${stripQuotes(d.low.label)}” ${reading(d.low)}`);
      return {
        order: i + 1,
        id: d.id,
        name: d.name,
        title: PRIORITY[d.id].title,
        justification: `${parts.join('; ')}.`,
      };
    });
}

// Página 3: o que a combinação das dimensões acrescenta. Só relações com apoio nas respostas.
function connections(analysed, response) {
  const by = Object.fromEntries(analysed.map((d) => [d.id, d]));
  const s = (id) => by[id]?.score ?? null;
  const has = (...ids) => ids.every((id) => s(id) !== null);
  const list = [];
  const add = (key, values, dims) => list.push({
    key, dimensions: dims, title: fill(CONNECTIONS[key].title, values), text: fill(CONNECTIONS[key].text, values),
  });

  if (has('autonomia', 'contexto') && s('contexto') <= 50 && s('autonomia') - s('contexto') >= 20) {
    add('reuse', { autonomia: s('autonomia'), contexto: s('contexto') }, ['autonomia', 'contexto']);
  }
  analysed
    .filter((d) => d.divergent)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .forEach((d) => {
      const [high, low] = d.evidence;
      add('divergent', { dimension: d.name, score: d.score, high: high.label, low: low.label }, [d.id]);
    });
  if (has('contexto', 'aplicacao') && s('contexto') <= 50 && s('aplicacao') <= 50) {
    add('deliver', { contexto: s('contexto'), aplicacao: s('aplicacao') }, ['contexto', 'aplicacao']);
  }
  const self = response.selfAvg;
  const practice = response.practiceAvg;
  if (response.flags?.inconsistency || (self !== null && practice !== null && self - practice >= 25)) {
    add('selfPractice', { self: Math.round(self), practice: Math.round(practice) }, []);
  }
  if (has('familiaridade', 'aplicacao') && s('familiaridade') - s('aplicacao') >= 20) {
    add('transfer', { familiaridade: s('familiaridade'), aplicacao: s('aplicacao') }, ['familiaridade', 'aplicacao']);
  }
  if (has('aplicacao', 'revisao') && s('aplicacao') >= 51 && s('aplicacao') - s('revisao') >= 15) {
    add('review', { aplicacao: s('aplicacao'), revisao: s('revisao') }, ['aplicacao', 'revisao']);
  }

  const scored = analysed.filter((d) => d.score !== null).sort((a, b) => b.score - a.score || ORDER[a.id] - ORDER[b.id]);
  if (list.length < 2 && scored.length >= 2) {
    const strong = scored[0];
    const weak = scored[scored.length - 1];
    if (strong.score > weak.score) {
      add('fallback', { strong: strong.name, weak: weak.name, strongScore: strong.score, weakScore: weak.score }, [strong.id, weak.id]);
    } else if (list.length === 0) {
      add('even', { score: strong.score }, []);
    }
  }
  return list.slice(0, MAX_CONNECTIONS);
}

// Página 1: síntese executiva.
function synthesis(response, analysed, prioritiesList) {
  const scored = analysed.filter((d) => d.score !== null);
  const calculated = !response.flags?.incomplete && response.overallLevel;
  const paragraphs = [];

  if (scored.length >= 2) {
    const desc = [...scored].sort((a, b) => b.score - a.score || ORDER[a.id] - ORDER[b.id]);
    const top = desc[0];
    if (top.score === desc[desc.length - 1].score) {
      paragraphs.push(`As dimensões pontuadas estão no mesmo patamar (${top.score} de 100).`);
    } else {
      const low = desc.slice(1).reverse().filter((d) => d.score < top.score).slice(0, 2).map((d) => d.name);
      paragraphs.push(`O perfil combina maior pontuação em ${top.name} com resultados menores em ${joinNames(low)}.`);
    }
  }
  const divergent = analysed.filter((d) => d.divergent).map((d) => d.name);
  if (divergent.length > 0) {
    paragraphs.push(`Em ${joinNames(divergent)}, aparecem escolhas distintas entre as situações, indicando um critério ainda inconsistente.`);
  }
  const top2 = prioritiesList.slice(0, 2);
  if (top2.length > 0) {
    const tail = top2.some((p) => p.id === 'aplicacao') ? '' : ', aplicando essas práticas a uma entrega da função';
    paragraphs.push(`A prioridade recomendada é ${joinNames(top2.map((p) => PRIORITY[p.id].verb))}${tail}.`);
  }

  let levelScope = null;
  if (calculated) {
    const overallIdx = LEVELS.indexOf(response.overallLevel);
    const above = scored.filter((d) => LEVELS.indexOf(d.level) > overallIdx).map((d) => `${d.level} em ${d.name}`);
    if (above.length > 0) levelScope = fill(LEVEL_SCOPE, { levels: joinNames(above), overall: response.overallLevel });
  }

  return {
    scope: calculated
      ? `Resultado geral ${response.overallScore} de 100, nível ${response.overallLevel}. A nota resume as cinco dimensões e orienta o desenvolvimento individual.`
      : 'O resultado geral não foi calculado porque o questionário não atingiu o preenchimento mínimo. As dimensões com respostas suficientes aparecem abaixo.',
    paragraphs,
    levelScope,
    note: RESULT_NOTE,
  };
}

// Página 4: até três ações ligadas às prioridades.
function plan(prioritiesList, offer) {
  return {
    // Etapas na sequência natural do trabalho (entender → pedir → aplicar → revisar → reutilizar),
    // não na ordem de prioridade: cada etapa usa a entrega da anterior.
    steps: [...prioritiesList]
      .sort((a, b) => ORDER[a.id] - ORDER[b.id])
      .map((p, i) => ({ period: PLAN_PERIODS[i], dimension: p.id, name: p.name, ...PLAN[p.id] })),
    criteria: EVOLUTION_CRITERIA,
    evolution: EVOLUTION_TEXT,
    continuity: CONTINUITY_TEXT,
    note: PLAN_NOTE,
    offer: offer ? { name: offer, goal: OFFER_GOALS[offer] ?? null } : null,
  };
}

// Apêndice: definições e o cálculo efetivamente implementado (score.js, questions.js).
function methodology(response) {
  const pct = (v) => `${Math.round(v * 100)}%`;
  const weight = (w) => String(w).replace('.', ',');
  const typeCount = (list, type) => list.filter((q) => q.type === type).length;
  const answered = Object.entries(response.answers ?? {}).map(([id, a]) => ({ id, type: a.type ?? QUESTIONS.find((q) => q.id === id)?.type }));

  return {
    version: INSTRUMENT_VERSION,
    dimensions: DIMENSIONS.map((d) => {
      const qs = QUESTIONS.filter((q) => q.dimension === d.id);
      const types = ['A', 'C', 'P'].filter((t) => typeCount(qs, t) > 0).map((t) => `${typeCount(qs, t)} ${TYPE_LABELS[t]}`);
      return { id: d.id, name: d.name, description: d.description, items: `${qs.length} questões (${types.join(', ')})` };
    }),
    levels: [
      { level: LEVELS[0], range: '0 a 25' },
      { level: LEVELS[1], range: '26 a 50' },
      { level: LEVELS[2], range: '51 a 75' },
      { level: LEVELS[3], range: '76 a 100' },
    ],
    rules: [
      { item: 'Versão', definition: `Questionário v${INSTRUMENT_VERSION.questionnaire} · regra de pontuação v${INSTRUMENT_VERSION.scoring} · textos da devolutiva v${REPORT_VERSION}.` },
      { item: 'Itens e tipos', definition: `${QUESTIONS.length} questões, de 4 a 5 por dimensão: autopercepção (peso ${weight(WEIGHTS.A)}), conhecimento (peso ${weight(WEIGHTS.C)}) e situação prática (peso ${weight(WEIGHTS.P)}).` },
      { item: 'Correção', definition: `Cada opção vale de 0 a ${SCORING_RULES.maxPoints} pontos. “Não sei”, disponível nas questões de conhecimento, vale 0.` },
      { item: 'Nota da dimensão', definition: `Soma de (pontos × peso) dividida pela soma de (${SCORING_RULES.maxPoints} × peso) das questões respondidas, × 100.` },
      { item: 'Resultado geral', definition: 'Média simples das notas das dimensões pontuadas.' },
      { item: 'Arredondamento', definition: 'Cada nota é arredondada para inteiro antes de classificar; o geral usa as notas já arredondadas e também é arredondado. A fronteira pertence à faixa inferior (25 é Iniciante; 50 é Básico; 75 é Intermediário).' },
      { item: 'Respostas ausentes', definition: `A dimensão só recebe nota com pelo menos ${pct(SCORING_RULES.minDimensionCoverage)} das questões respondidas; o resultado geral exige ${pct(SCORING_RULES.minOverallCoverage)} do questionário.` },
      { item: 'Consistência', definition: `Se a média de autopercepção for ${SCORING_RULES.selfHigh} ou mais e a de situações práticas ${SCORING_RULES.practiceLow} ou menos, o nível geral desce um degrau.` },
      { item: 'Prioridades', definition: 'Combinam a nota, o conteúdo das respostas (escolhas de 0 a 1 ponto em conhecimento ou situação) e as respostas divergentes (duas situações da mesma dimensão, uma com 3 a 4 pontos e outra com 0 a 1).' },
    ],
    evidence: [
      { nature: 'Autorrelato', description: 'Percepção e práticas informadas pelo participante.', count: typeCount(answered, 'A') },
      { nature: 'Conhecimento e situação', description: 'Escolhas diante de afirmações e de situações apresentadas no formulário.', count: typeCount(answered, 'C') + typeCount(answered, 'P') },
      { nature: 'Execução observada', description: 'Não incluída nesta avaliação: nenhuma entrega prática foi observada.', count: 0 },
    ],
    limits: LIMITS_TEXT,
  };
}

/**
 * Recebe os campos de AssessmentResponse e devolve o conteúdo do PDF:
 * síntese (pág. 1), análise por dimensão (pág. 2), conexões e prioridades (pág. 3), plano (pág. 4) e metodologia (apêndice).
 */
export function buildReportAnalysis(response) {
  const dims = response.dimensionScores;
  const analysed = DIMENSIONS.map((d) => analyseDimension(d, dims[d.id], response.answers));
  const prioritiesList = priorities(analysed);
  const { offer } = recommend({ dimensions: dims, overallLevel: response.overallLevel });
  const divergent = analysed.filter((d) => d.divergent).map((d) => d.name);

  return {
    instrument: INSTRUMENT_VERSION,
    synthesis: synthesis(response, analysed, prioritiesList),
    dimensions: analysed.map(({ low, ...d }) => d),
    connections: connections(analysed, response),
    priorities: prioritiesList,
    divergence: divergent.length > 0 ? fill(DIVERGENCE_NOTE, { dimensions: joinNames(divergent) }) : null,
    plan: plan(prioritiesList, offer),
    methodology: methodology(response),
  };
}
