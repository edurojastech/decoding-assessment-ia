// Agregação dos resultados dos respondentes (consolidado da empresa, grupos e turmas — RF-13 a RF-17).
// Funções puras e determinísticas: recebem os resultados já calculados pelo motor (score.js)
// e devolvem contagens e médias. Sem banco, sem HTTP (regra 1).
import { LEVELS } from '../constants.js';
import { DIMENSIONS } from './questions.js';
import { levelFor } from './score.js';
import { rankDimensions } from './recommend.js';

/**
 * Registro de um respondente: `{ area, overallLevel, overallScore, dimensions }`, onde
 * `dimensions` é o `dimensionScores` guardado (`{ familiaridade: { score, ... }, ... }`).
 * `overallLevel` null = preenchimento incompleto (RN-08).
 */

const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);
const mean = (values) => (values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null);

export const isClassified = (record) => LEVELS.includes(record.overallLevel);

// Distribuição por nível (RN-05) entre os respondentes. Incompletos ficam fora do percentual.
export function levelDistribution(records) {
  const classified = records.filter(isClassified);
  return {
    levels: LEVELS.map((level) => {
      const count = classified.filter((r) => r.overallLevel === level).length;
      return { level, count, pct: pct(count, classified.length) };
    }),
    classified: classified.length,
    incomplete: records.length - classified.length,
  };
}

// Média por dimensão (0–100, inteiro) só com quem teve a dimensão pontuada (RN-07). `n` = base da média.
export function dimensionAverages(records) {
  return Object.fromEntries(DIMENSIONS.map((d) => {
    const scores = records
      .map((r) => r.dimensions?.[d.id]?.score)
      .filter((s) => s !== null && s !== undefined);
    const average = mean(scores);
    return [d.id, { average, n: scores.length, level: average === null ? null : levelFor(average) }];
  }));
}

// Dimensões ordenadas pela média (direction 1 = mais fraca primeiro, -1 = mais forte primeiro).
export function rankAverages(averages, direction) {
  const dimensions = Object.fromEntries(Object.entries(averages).map(([id, a]) => [id, { score: a.average }]));
  return rankDimensions({ dimensions }, direction);
}

// Nível mais frequente entre os classificados. Empate: o nível mais baixo (a turma parte do básico).
export function predominantLevel(records) {
  const { levels } = levelDistribution(records);
  const top = levels.reduce((best, l) => (l.count > best.count ? l : best), { count: 0 });
  return top.count ? top.level : null;
}

// Necessidades por área (RF-14): respondentes, níveis, média geral e média por dimensão de cada área.
// `focus` = dimensão de menor média da área (onde focar). Ordem alfabética das áreas.
export function areaBreakdown(records) {
  const byArea = new Map();
  for (const r of records) {
    if (!byArea.has(r.area)) byArea.set(r.area, []);
    byArea.get(r.area).push(r);
  }
  return [...byArea.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([area, items]) => {
      const classified = items.filter(isClassified);
      const dimensions = dimensionAverages(items);
      return {
        area,
        respondents: items.length,
        classified: classified.length,
        averageScore: mean(classified.map((r) => r.overallScore)),
        levels: Object.fromEntries(LEVELS.map((level) => [level, classified.filter((r) => r.overallLevel === level).length])),
        dimensions,
        focus: rankAverages(dimensions, 1)[0] ?? null,
      };
    });
}

// Potencialidade por área: maior média geral entre os classificados.
// Empate: mais respondentes classificados, depois a ordem alfabética.
export function strongestArea(areas) {
  const candidates = areas.filter((a) => a.averageScore !== null);
  return candidates.reduce((best, a) => {
    if (!best) return a;
    const diff = a.averageScore - best.averageScore || a.classified - best.classified;
    return diff > 0 ? a : best;
  }, null);
}

// Lacuna por área: mais pessoas em Iniciante; empate pelo maior percentual, depois a ordem alfabética.
// null quando ninguém está em Iniciante.
export function areaWithMostStarters(areas) {
  const starter = LEVELS[0];
  return areas
    .filter((a) => a.levels[starter] > 0)
    .reduce((best, a) => {
      if (!best) return a;
      const diff = a.levels[starter] - best.levels[starter]
        || a.levels[starter] / a.classified - best.levels[starter] / best.classified;
      return diff > 0 ? a : best;
    }, null);
}
