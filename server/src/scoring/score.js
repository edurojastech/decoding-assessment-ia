// ADR-03: motor de pontuação puro e determinístico — sem banco, sem HTTP (regra 1, C5).
// Regras da seção 3 e 4 do original; algoritmo em specs/04-pontuacao.md.
import { LEVELS } from '../constants.js';
import { DIMENSIONS, NOT_SURE, NOT_SURE_LABEL, QUESTIONS } from './questions.js';

const MAX_POINTS = 4;
const MIN_DIMENSION_COVERAGE = 0.6; // RN-07
const MIN_OVERALL_COVERAGE = 0.7; // RN-08
const SELF_HIGH = 75; // RN-09
const PRACTICE_LOW = 40; // RN-09

// Parâmetros do cálculo efetivamente implementado, para o apêndice de metodologia do PDF.
export const SCORING_RULES = Object.freeze({
  maxPoints: MAX_POINTS,
  minDimensionCoverage: MIN_DIMENSION_COVERAGE,
  minOverallCoverage: MIN_OVERALL_COVERAGE,
  selfHigh: SELF_HIGH,
  practiceLow: PRACTICE_LOW,
});

const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export class InvalidAnswersError extends Error {
  constructor(errors) {
    super('Respostas inválidas.');
    this.errors = errors;
  }
}

// RN-05: Iniciante 0–25 · Básico 26–50 · Intermediário 51–75 · Avançado 76–100.
export function levelFor(score) {
  if (score <= 25) return LEVELS[0];
  if (score <= 50) return LEVELS[1];
  if (score <= 75) return LEVELS[2];
  return LEVELS[3];
}

const isAnswered = (value) => value !== undefined && value !== null && value !== '';

// Lista os problemas das respostas; vazio quando tudo é válido.
export function validateAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return [{ questionId: null, reason: 'Formato de respostas inválido.' }];
  }
  const errors = [];
  for (const [questionId, value] of Object.entries(answers)) {
    const q = QUESTIONS_BY_ID.get(questionId);
    if (!q) {
      errors.push({ questionId, reason: 'Questão desconhecida.' });
    } else if (isAnswered(value)) {
      const valid = (value === NOT_SURE && q.allowsNotSure) || q.options.some((o) => o.key === value);
      if (!valid) errors.push({ questionId, reason: 'Opção inexistente para esta questão.' });
    }
  }
  return errors;
}

// Resposta resolvida: a opção escolhida, o texto, os pontos e o peso do tipo (seção 4: "guarde a resposta e o peso").
function resolveAnswer(q, value) {
  if (value === NOT_SURE) {
    return { option: NOT_SURE, label: NOT_SURE_LABEL, points: 0, type: q.type, weight: q.weight };
  }
  const o = q.options.find((opt) => opt.key === value);
  return { option: o.key, label: o.label, points: o.points, type: q.type, weight: q.weight };
}

// RN-10: evidência = questão de maior (força) ou menor (lacuna) pontuação.
// Empate: vence o maior peso (prática > conhecimento > autopercepção) e depois a ordem do questionário.
function pickEvidence(items, direction) {
  const best = items.reduce((acc, item) => {
    const diff = (item.points - acc.points) * direction;
    if (diff > 0 || (diff === 0 && item.weight > acc.weight)) return item;
    return acc;
  });
  return { questionId: best.questionId, label: best.label, points: best.points, type: best.type };
}

function scoreDimension(dimension, resolved) {
  const questions = QUESTIONS.filter((q) => q.dimension === dimension.id);
  const items = questions
    .filter((q) => resolved[q.id])
    .map((q) => ({ questionId: q.id, ...resolved[q.id] }));
  const base = { answered: items.length, total: questions.length };

  if (items.length / questions.length < MIN_DIMENSION_COVERAGE) {
    return { ...base, status: 'dados_insuficientes', score: null, level: null, strength: null, gap: null };
  }

  // RN-03: Σ(pontos × peso) / Σ(4 × peso) × 100, só das respondidas.
  const earned = items.reduce((sum, i) => sum + i.points * i.weight, 0);
  const possible = items.reduce((sum, i) => sum + MAX_POINTS * i.weight, 0);
  // Classifica com o valor arredondado, para o número exibido bater com o nível.
  const score = Math.round((earned / possible) * 100);

  return {
    ...base,
    status: 'pontuada',
    score,
    level: levelFor(score),
    strength: pickEvidence(items, 1),
    gap: pickEvidence(items, -1),
  };
}

// Média normalizada (0–100) das respondidas de um tipo; null se nenhuma.
function typeAverage(resolved, type) {
  const values = Object.values(resolved).filter((a) => a.type === type).map((a) => (a.points / MAX_POINTS) * 100);
  if (values.length === 0) return null;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
}

/**
 * Calcula a avaliação a partir das respostas `{ Q1: 'd', Q4: 'nao_sei', ... }`.
 * Questões ausentes (ou null) contam como não respondidas.
 */
export function scoreAssessment(answers = {}) {
  const errors = validateAnswers(answers);
  if (errors.length > 0) throw new InvalidAnswersError(errors);

  const resolved = {};
  for (const q of QUESTIONS) {
    if (isAnswered(answers[q.id])) resolved[q.id] = resolveAnswer(q, answers[q.id]);
  }
  const answeredCount = Object.keys(resolved).length;

  const dimensions = {};
  for (const d of DIMENSIONS) dimensions[d.id] = scoreDimension(d, resolved);

  const selfAvg = typeAverage(resolved, 'A');
  const practiceAvg = typeAverage(resolved, 'P');

  let overallStatus = 'preenchimento_incompleto';
  let overallScore = null;
  let overallLevel = null;
  let inconsistency = false;

  if (answeredCount / QUESTIONS.length >= MIN_OVERALL_COVERAGE) {
    // RN-04: média simples das dimensões pontuadas (com os valores exibidos).
    const scored = Object.values(dimensions).filter((d) => d.status === 'pontuada');
    overallStatus = 'calculado';
    overallScore = Math.round(scored.reduce((s, d) => s + d.score, 0) / scored.length);
    overallLevel = levelFor(overallScore);

    // RN-09: autopercepção ≥ 75 e prática ≤ 40 → desce 1 degrau (mínimo Iniciante).
    if (selfAvg !== null && practiceAvg !== null && selfAvg >= SELF_HIGH && practiceAvg <= PRACTICE_LOW) {
      inconsistency = true;
      overallLevel = LEVELS[Math.max(0, LEVELS.indexOf(overallLevel) - 1)];
    }
  }

  return {
    answers: resolved,
    answeredCount,
    totalQuestions: QUESTIONS.length,
    dimensions,
    overallStatus,
    overallScore,
    overallLevel,
    selfAvg,
    practiceAvg,
    flags: { inconsistency, incomplete: overallStatus === 'preenchimento_incompleto' },
  };
}
