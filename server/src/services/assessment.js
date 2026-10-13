import { scoreAssessment } from '../scoring/score.js';

// Campos de AssessmentResponse a partir das respostas `{ Q1: 'd', ... }`.
// Todo cálculo vem do motor de scoring/ (regra 1); aqui só se mapeia para o model.
export function buildResponseFields(answers) {
  const result = scoreAssessment(answers);
  return {
    answers: result.answers,
    dimensionScores: result.dimensions,
    overallScore: result.overallScore,
    overallLevel: result.overallLevel,
    flags: result.flags,
    selfAvg: result.selfAvg,
    practiceAvg: result.practiceAvg,
  };
}
