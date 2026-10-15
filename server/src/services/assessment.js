import { scoreAssessment } from '../scoring/score.js';
import { INSTRUMENT_VERSION } from '../scoring/questions.js';
import { REPORT_VERSION } from '../scoring/screenPhrases.js';

// Campos de AssessmentResponse a partir das respostas `{ Q1: 'd', ... }`.
// Todo cálculo vem do motor de scoring/ (regra 1); aqui só se mapeia para o model.
export function buildResponseFields(answers) {
  const result = scoreAssessment(answers);
  return {
    answers: result.answers,
    dimensionScores: result.dimensions,
    overallScore: result.overallScore,
    overallLevel: result.overallLevel,
    // Versões registradas no envio: a reabertura do link mostra se a leitura atual usa outra versão.
    flags: { ...result.flags, versions: { instrument: INSTRUMENT_VERSION.questionnaire, scoring: INSTRUMENT_VERSION.scoring, report: REPORT_VERSION } },
    selfAvg: result.selfAvg,
    practiceAvg: result.practiceAvg,
  };
}
