import { describe, expect, it } from 'vitest';
import { DIMENSIONS, NOT_SURE, PROFILE_QUESTIONS, QUESTIONS, WEIGHTS } from '../questions.js';
import { InvalidAnswersError, levelFor, scoreAssessment } from '../score.js';
import { OFFERS, recommend } from '../recommend.js';

// Casos obrigatórios T1–T8 de specs/04-pontuacao.md + regras RN-01 a RN-12.

const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

// Chave da primeira opção da questão que vale `points`.
function optionWith(questionId, points) {
  const option = byId[questionId].options.find((o) => o.points === points);
  if (!option) throw new Error(`${questionId} não tem opção de ${points} pontos`);
  return option.key;
}

// Monta respostas escolhendo, para cada questão, a opção com os pontos dados por `pointsFor`.
function answersBy(pointsFor) {
  const answers = {};
  for (const q of QUESTIONS) {
    const points = pointsFor(q);
    if (points !== undefined) answers[q.id] = optionWith(q.id, points);
  }
  return answers;
}

const ids = (dimension) => QUESTIONS.filter((q) => q.dimension === dimension).map((q) => q.id);

describe('questionário (RN-01, RN-02, RN-12)', () => {
  it('tem 24 questões pontuadas: 4, 5, 5, 5 e 5 por dimensão', () => {
    expect(QUESTIONS).toHaveLength(24);
    expect(DIMENSIONS.map((d) => ids(d.id).length)).toEqual([4, 5, 5, 5, 5]);
  });

  it('usa os pesos 1 (autopercepção), 1,5 (conhecimento) e 2 (prática)', () => {
    expect(WEIGHTS).toEqual({ A: 1, C: 1.5, P: 2 });
    for (const q of QUESTIONS) expect(q.weight).toBe(WEIGHTS[q.type]);
  });

  it('só as questões de conhecimento aceitam "não sei"', () => {
    for (const q of QUESTIONS) expect(q.allowsNotSure).toBe(q.type === 'C');
  });

  it('cada questão tem opção de 0 e de 4 pontos', () => {
    for (const q of QUESTIONS) {
      const points = q.options.map((o) => o.points);
      expect(Math.min(...points)).toBe(0);
      expect(Math.max(...points)).toBe(4);
    }
  });

  it('perguntas de perfil (P0a–P0c) não fazem parte da pontuação', () => {
    expect(PROFILE_QUESTIONS.map((p) => p.id)).toEqual(['P0a', 'P0b', 'P0c']);
    expect(() => scoreAssessment({ ...answersBy(() => 4), P0c: ['ChatGPT'] }))
      .toThrow(InvalidAnswersError);
  });
});

describe('motor de pontuação (C5)', () => {
  it('T1 · todas as melhores opções → todas as dimensões 100, geral 100 Avançado', () => {
    const r = scoreAssessment(answersBy(() => 4));
    for (const d of DIMENSIONS) {
      expect(r.dimensions[d.id]).toMatchObject({ status: 'pontuada', score: 100, level: 'Avançado' });
    }
    expect(r).toMatchObject({ overallStatus: 'calculado', overallScore: 100, overallLevel: 'Avançado' });
    expect(r.flags).toEqual({ inconsistency: false, incomplete: false });
  });

  it('T2 · todas as respostas valendo 0 → geral 0 Iniciante', () => {
    const r = scoreAssessment(answersBy(() => 0));
    expect(r).toMatchObject({ overallScore: 0, overallLevel: 'Iniciante' });
    expect(r.flags.inconsistency).toBe(false);
  });

  it('T3 · só 12 de 24 respondidas → preenchimento incompleto', () => {
    const first12 = new Set(QUESTIONS.slice(0, 12).map((q) => q.id));
    const r = scoreAssessment(answersBy((q) => (first12.has(q.id) ? 4 : undefined)));
    expect(r).toMatchObject({
      answeredCount: 12,
      overallStatus: 'preenchimento_incompleto',
      overallScore: null,
      overallLevel: null,
    });
    expect(r.flags.incomplete).toBe(true);
  });

  it('RN-08 · fronteira de 70%: 16 respondidas é incompleto, 17 já calcula', () => {
    const upTo = (n) => new Set(QUESTIONS.slice(0, n).map((q) => q.id));
    const with16 = upTo(16);
    const with17 = upTo(17);
    expect(scoreAssessment(answersBy((q) => (with16.has(q.id) ? 4 : undefined))).overallStatus)
      .toBe('preenchimento_incompleto');
    expect(scoreAssessment(answersBy((q) => (with17.has(q.id) ? 4 : undefined))).overallStatus)
      .toBe('calculado');
  });

  it('T4 · Familiaridade com 2 de 4 (50%) → dimensão com dados insuficientes', () => {
    const skipped = new Set(['Q1', 'Q2']);
    const r = scoreAssessment(answersBy((q) => (skipped.has(q.id) ? undefined : 4)));
    expect(r.dimensions.familiaridade).toMatchObject({
      status: 'dados_insuficientes', score: null, level: null, answered: 2, total: 4,
    });
    // O geral usa só as dimensões pontuadas (RN-04).
    expect(r).toMatchObject({ overallStatus: 'calculado', overallScore: 100 });
  });

  it('RN-07 · fronteira de 60%: 3 de 5 respondidas pontua a dimensão', () => {
    const skipped = new Set(['Q5', 'Q6']);
    const r = scoreAssessment(answersBy((q) => (skipped.has(q.id) ? undefined : 4)));
    expect(r.dimensions.contexto).toMatchObject({ status: 'pontuada', answered: 3, score: 100 });
  });

  it('T5 · autopercepção 4, prática 0, conhecimento 4 → trava rebaixa o nível e marca a flag', () => {
    const r = scoreAssessment(answersBy((q) => (q.type === 'P' ? 0 : 4)));
    expect(r.selfAvg).toBe(100);
    expect(r.practiceAvg).toBe(0);
    // Dimensões 100 · 29 · 29 · 50 · 47 → média 51 (Intermediário) → rebaixado para Básico.
    expect(r.overallScore).toBe(51);
    expect(r.overallLevel).toBe('Básico');
    expect(r.flags.inconsistency).toBe(true);
  });

  it('RN-09 · a trava não rebaixa abaixo de Iniciante', () => {
    // Autopercepção alta, o resto zerado e Q20/Q22 em branco: geral 21 (Iniciante) antes da trava.
    const r = scoreAssessment(answersBy((q) => {
      if (q.id === 'Q20' || q.id === 'Q22') return undefined;
      return q.type === 'A' ? 4 : 0;
    }));
    expect(r.overallScore).toBe(21);
    expect(r.overallLevel).toBe('Iniciante');
    expect(r.flags.inconsistency).toBe(true);
  });

  it('T6 · Q4 = "não sei" conta 0, sem erro, e guarda o texto da opção', () => {
    const answers = { ...answersBy(() => 4), Q4: NOT_SURE };
    const r = scoreAssessment(answers);
    expect(r.answers.Q4).toMatchObject({ option: NOT_SURE, label: 'Não sei', points: 0, weight: 1.5 });
    // Familiaridade: (4+4+4)*1 + 0*1,5 = 12 de 18 → 67.
    expect(r.dimensions.familiaridade).toMatchObject({ status: 'pontuada', score: 67 });
    expect(r.dimensions.familiaridade.gap).toMatchObject({ questionId: 'Q4', label: 'Não sei', points: 0 });
  });

  it('RN-06 · "não sei" só é aceito nas questões que permitem', () => {
    expect(() => scoreAssessment({ ...answersBy(() => 4), Q1: NOT_SURE })).toThrow(InvalidAnswersError);
  });

  it('T7 · fronteiras das faixas', () => {
    expect(levelFor(0)).toBe('Iniciante');
    expect(levelFor(25)).toBe('Iniciante');
    expect(levelFor(26)).toBe('Básico');
    expect(levelFor(50)).toBe('Básico');
    expect(levelFor(51)).toBe('Intermediário');
    expect(levelFor(75)).toBe('Intermediário');
    expect(levelFor(76)).toBe('Avançado');
    expect(levelFor(100)).toBe('Avançado');
  });

  it('RN-10 · força e lacuna da dimensão vêm das respostas, com o texto da opção', () => {
    const answers = { ...answersBy(() => 4), Q7: optionWith('Q7', 1) };
    const { strength, gap } = scoreAssessment(answers).dimensions.contexto;
    expect(gap).toMatchObject({ questionId: 'Q7', points: 1, label: 'Raramente' });
    // Empate em 4 pontos: vence a de maior peso (prática) e, depois, a primeira na ordem.
    expect(strength).toMatchObject({ questionId: 'Q5', points: 4 });
  });

  it('guarda a resposta e o peso do tipo de cada questão', () => {
    const r = scoreAssessment(answersBy(() => 4));
    expect(Object.keys(r.answers)).toHaveLength(24);
    expect(r.answers.Q1).toMatchObject({ option: optionWith('Q1', 4), points: 4, weight: 1 });
    expect(r.answers.Q5).toMatchObject({ points: 4, weight: 2 });
  });

  it('recusa questão desconhecida ou opção inexistente', () => {
    expect(() => scoreAssessment({ Q99: 'a' })).toThrow(InvalidAnswersError);
    expect(() => scoreAssessment({ Q1: 'z' })).toThrow(InvalidAnswersError);
  });

  it('é determinístico: mesma entrada, mesma saída, sem alterar a entrada', () => {
    const answers = answersBy((q) => (q.type === 'A' ? 3 : q.options[1].points));
    const copy = structuredClone(answers);
    expect(scoreAssessment(answers)).toEqual(scoreAssessment(copy));
    expect(answers).toEqual(copy);
  });
});

describe('recomendação (RN-11)', () => {
  // Intermediário com Aplicação zerada e Autonomia moderada.
  const intermediateLowApplication = () => {
    const autonomia = { Q20: 2, Q21: 2, Q22: 2, Q23: 1, Q24: 2 };
    return answersBy((q) => {
      if (q.dimension === 'aplicacao') return 0;
      if (q.dimension === 'autonomia') return autonomia[q.id];
      return 4;
    });
  };

  it('T8 · Intermediário com Aplicação mais baixa → "Do Problema ao Plano"', () => {
    const result = scoreAssessment(intermediateLowApplication());
    expect(result.overallLevel).toBe('Intermediário');
    expect(result.dimensions.aplicacao.score).toBe(0);

    const rec = recommend(result);
    expect(rec.offer).toBe(OFFERS.intermediario);
    expect(rec.offer).toBe('Do Problema ao Plano');
    expect(rec.reason).toBe('lacuna_aplicacao_autonomia');
  });

  it('Iniciante e Básico → "Escale sua produtividade com IA"', () => {
    expect(recommend(scoreAssessment(answersBy(() => 0))).offer).toBe('Escale sua produtividade com IA');
    expect(recommend(scoreAssessment(answersBy((q) => (q.type === 'P' ? 0 : 4)))).offer)
      .toBe('Escale sua produtividade com IA');
  });

  it('Avançado → "Construa Soluções e Produtos Digitais com IA"', () => {
    expect(recommend(scoreAssessment(answersBy(() => 4))).offer)
      .toBe('Construa Soluções e Produtos Digitais com IA');
  });

  it('Intermediário sem lacuna em Aplicação/Autonomia segue o mapeamento por nível (seção 7)', () => {
    // Revisão e Contexto zeradas; Aplicação e Autonomia no máximo.
    const r = scoreAssessment(answersBy((q) => (['revisao', 'contexto'].includes(q.dimension) ? 0 : 4)));
    expect(r.overallLevel).toBe('Intermediário');
    expect(recommend(r)).toMatchObject({ offer: 'Do Problema ao Plano', reason: 'nivel' });
  });

  it('dimensão ≤ 40 gera foco curto (ex.: Revisão)', () => {
    const r = scoreAssessment(answersBy((q) => (q.dimension === 'revisao' ? 0 : 4)));
    expect(recommend(r).focus).toEqual([
      { dimension: 'revisao', text: 'priorizar conferência de informação e cuidado com dados' },
    ]);
  });

  it('sem geral calculado não recomenda percurso', () => {
    expect(recommend(scoreAssessment({ Q1: optionWith('Q1', 4) }))).toMatchObject({ offer: null });
  });
});
