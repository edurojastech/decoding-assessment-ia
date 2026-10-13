import { describe, expect, it } from 'vitest';
import {
  areaBreakdown, areaWithMostStarters, dimensionAverages, levelDistribution, predominantLevel,
  rankAverages, strongestArea,
} from '../aggregate.js';
import { OFFER_BY_LEVEL, OFFERS, TURMA_GROUPS } from '../recommend.js';

// Registro como o motor guarda: score null = dados insuficientes (RN-07); nível null = incompleto (RN-08).
function record(area, overallLevel, overallScore, scores) {
  const ids = ['familiaridade', 'contexto', 'aplicacao', 'revisao', 'autonomia'];
  return {
    area,
    overallLevel,
    overallScore,
    dimensions: Object.fromEntries(ids.map((id, i) => [id, { score: scores[i] }])),
  };
}

const RECORDS = [
  record('RH', 'Iniciante', 20, [20, 20, 10, 30, 20]),
  record('RH', 'Iniciante', 24, [30, 20, 20, 30, 20]),
  record('RH', 'Básico', 40, [50, 40, 30, 50, 30]),
  record('Comercial', 'Intermediário', 70, [80, 70, 60, 70, 70]),
  record('Comercial', 'Avançado', 90, [90, 90, 90, 90, 90]),
  record('Comercial', 'Iniciante', 25, [30, 30, 20, 20, 25]),
  record('Comercial', null, null, [60, null, null, 40, null]),
];

describe('agregação dos respondentes (RF-13, RF-14)', () => {
  it('distribuição por nível ignora incompletos no percentual', () => {
    const d = levelDistribution(RECORDS);
    expect(d.classified).toBe(6);
    expect(d.incomplete).toBe(1);
    expect(d.levels).toEqual([
      { level: 'Iniciante', count: 3, pct: 50 },
      { level: 'Básico', count: 1, pct: 17 },
      { level: 'Intermediário', count: 1, pct: 17 },
      { level: 'Avançado', count: 1, pct: 17 },
    ]);
  });

  it('distribuição vazia não divide por zero', () => {
    const d = levelDistribution([]);
    expect(d.classified).toBe(0);
    expect(d.levels.every((l) => l.count === 0 && l.pct === 0)).toBe(true);
  });

  it('média por dimensão usa só quem teve a dimensão pontuada', () => {
    const avg = dimensionAverages(RECORDS);
    // Familiaridade: 7 pontuadas → (20+30+50+80+90+30+60)/7 = 51,4 → 51
    expect(avg.familiaridade).toEqual({ average: 51, n: 7, level: 'Intermediário' });
    // Contexto: 6 pontuadas (a do incompleto é null) → 270/6 = 45
    expect(avg.contexto).toEqual({ average: 45, n: 6, level: 'Básico' });
    expect(dimensionAverages([]).revisao).toEqual({ average: null, n: 0, level: null });
  });

  it('ordena dimensões pela média, com empate na ordem do questionário', () => {
    const avg = dimensionAverages(RECORDS);
    expect(rankAverages(avg, 1)[0]).toBe('aplicacao');
    expect(rankAverages(avg, -1)[0]).toBe('familiaridade');
  });

  it('mapa por área: média geral, níveis e foco (dimensão de menor média)', () => {
    const areas = areaBreakdown(RECORDS);
    expect(areas.map((a) => a.area)).toEqual(['Comercial', 'RH']);
    const rh = areas.find((a) => a.area === 'RH');
    expect(rh).toMatchObject({ respondents: 3, classified: 3, averageScore: 28, focus: 'aplicacao' });
    expect(rh.levels).toEqual({ Iniciante: 2, 'Básico': 1, 'Intermediário': 0, 'Avançado': 0 });
    const comercial = areas.find((a) => a.area === 'Comercial');
    expect(comercial).toMatchObject({ respondents: 4, classified: 3, averageScore: 62 });
  });

  it('potencialidade e lacuna por área', () => {
    const areas = areaBreakdown(RECORDS);
    expect(strongestArea(areas).area).toBe('Comercial');
    // RH e Comercial... RH tem 2 Iniciantes, Comercial 1.
    expect(areaWithMostStarters(areas).area).toBe('RH');
    expect(areaWithMostStarters(areaBreakdown(RECORDS.filter((r) => r.overallLevel !== 'Iniciante')))).toBeNull();
  });

  it('nível predominante; empate fica com o nível mais baixo', () => {
    expect(predominantLevel(RECORDS)).toBe('Iniciante');
    expect(predominantLevel([RECORDS[2], RECORDS[3]])).toBe('Básico');
    expect(predominantLevel([])).toBeNull();
  });
});

describe('oferta sugerida por nível (seção 7, RF-16)', () => {
  it('mapeia cada nível ao portfólio', () => {
    expect(OFFER_BY_LEVEL).toEqual({
      Iniciante: OFFERS.fundamentos,
      'Básico': OFFERS.fundamentos,
      'Intermediário': OFFERS.intermediario,
      'Avançado': OFFERS.avancado,
    });
    expect(TURMA_GROUPS.flatMap((g) => g.levels)).toEqual(['Iniciante', 'Básico', 'Intermediário', 'Avançado']);
  });
});
