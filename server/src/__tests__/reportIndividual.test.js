import { describe, expect, it } from 'vitest';
import { DIMENSIONS, NOT_SURE, QUESTIONS } from '../scoring/questions.js';
import { OFFERS } from '../scoring/recommend.js';
import { DIMENSION_ACTIONS, SHORT_FOCUS, STAGE_PHRASES } from '../scoring/phrases.js';
import { buildResponseFields } from '../services/assessment.js';
import { buildIndividualReport, evidenceText } from '../services/reportIndividual.js';

// RF-11: devolutiva com os blocos 1 a 6 da seção 6 · RN-10 evidências · RN-11 recomendação · RN-09 consistência.

const optionWith = (q, points) => q.options.find((o) => o.points === points).key;

// Respostas com os pontos dados por `pointsFor(q)`; undefined = não respondida.
function answersBy(pointsFor) {
  const answers = {};
  for (const q of QUESTIONS) {
    const points = pointsFor(q);
    if (points !== undefined) answers[q.id] = optionWith(q, points);
  }
  return answers;
}

// Cenários só com 0 e 4 pontos (toda questão tem as duas opções). Scores resultantes:
// contexto sem Q7 = 88 · aplicação só Q11+Q12 = 41 · revisão só Q15 = 18 · autonomia só Q21+Q23 = 47.
const FOURS = {
  familiaridade: ['Q1', 'Q2', 'Q3', 'Q4'],
  contexto88: ['Q5', 'Q6', 'Q8', 'Q9'],
  aplicacao41: ['Q11', 'Q12'],
  revisao18: ['Q15'],
  revisao: ['Q15', 'Q16', 'Q17', 'Q18', 'Q19'],
  autonomia47: ['Q21', 'Q23'],
  autonomia: ['Q20', 'Q21', 'Q22', 'Q23', 'Q24'],
};
const withFours = (...groups) => {
  const ids = new Set(groups.flatMap((g) => FOURS[g]));
  return answersBy((q) => (ids.has(q.id) ? 4 : 0));
};

const reportFor = (answers) => buildIndividualReport({ ...buildResponseFields(answers), submittedAt: new Date() });

describe('devolutiva individual (RF-11)', () => {
  it('monta os blocos na ordem da seção 6 e o mapa com as 5 dimensões', () => {
    const report = reportFor(answersBy(() => 4));
    expect(Object.keys(report)).toEqual(expect.arrayContaining(
      ['stage', 'dimensions', 'strengths', 'gaps', 'nextSteps', 'consistency'],
    ));
    expect(report.dimensions.map((d) => d.id)).toEqual(DIMENSIONS.map((d) => d.id));
    expect(report).toMatchObject({ answeredCount: 24, totalQuestions: 24 });
  });

  it('bloco 1 · estágio com a frase do nível e âncoras na dimensão mais forte e na mais fraca', () => {
    // 100, 88, 41, 0, 47 → geral 55.
    const report = reportFor(withFours('familiaridade', 'contexto88', 'aplicacao41', 'autonomia47'));
    expect(report.stage).toMatchObject({ status: 'calculado', score: 55, level: 'Intermediário' });
    expect(report.stage.summary[0]).toBe(STAGE_PHRASES['Intermediário']);
    expect(report.stage.strongest).toMatchObject({ id: 'familiaridade', score: 100 });
    expect(report.stage.weakest).toMatchObject({ id: 'revisao', score: 0 });
    expect(report.stage.summary.join(' ')).toMatch(/Familiaridade.*Revisão/);
  });

  it('bloco 1 · dimensões empatadas não viram "mais forte" e "mais fraca"', () => {
    const report = reportFor(answersBy(() => 4));
    expect(report.stage.summary).toHaveLength(2);
    expect(report.stage.summary[1]).toMatch(/mesmo patamar \(100 de 100\)/);
  });

  it('bloco 2 · cada dimensão traz nível, frase e evidência com o texto da opção (RN-10)', () => {
    const report = reportFor(answersBy((q) => (q.dimension === 'contexto' ? 1 : 4)));
    const contexto = report.dimensions.find((d) => d.id === 'contexto');
    expect(contexto).toMatchObject({ level: 'Iniciante', tone: 'lacuna' });
    expect(contexto.phrase).toBe('Seus pedidos tendem a ser genéricos, o que reduz a qualidade das respostas.');
    // Q7 (autopercepção, "Raramente") empata em 1 ponto, mas a evidência prefere o maior peso (prática).
    expect(contexto.evidence.questionId).toBe('Q5');
    expect(contexto.evidence.text).toContain('“Um pedido de uma linha só”');
    expect(contexto.evidence.text).toContain('o que limita a qualidade das respostas');

    const revisao = report.dimensions.find((d) => d.id === 'revisao');
    expect(revisao).toMatchObject({ level: 'Avançado', tone: 'forca' });
    expect(revisao.evidence.text).toContain('o que protege a qualidade do que você entrega');
  });

  it('bloco 2 · dimensão com poucas respostas aparece como dados insuficientes, sem evidência', () => {
    const report = reportFor(answersBy((q) => (['Q1', 'Q2'].includes(q.id) || q.dimension !== 'familiaridade' ? 4 : undefined)));
    const familiaridade = report.dimensions.find((d) => d.id === 'familiaridade');
    expect(familiaridade).toMatchObject({ status: 'dados_insuficientes', score: null, evidence: null });
    expect(familiaridade.phrase).toContain('2 de 4');
  });

  it('blocos 3 e 4 · duas potencialidades (as mais altas) e duas lacunas (as mais baixas)', () => {
    // 100, 88, 41, 18, 0.
    const report = reportFor(withFours('familiaridade', 'contexto88', 'aplicacao41', 'revisao18'));
    expect(report.strengths.map((s) => s.id)).toEqual(['familiaridade', 'contexto']);
    expect(report.gaps.map((g) => g.id)).toEqual(['autonomia', 'revisao']);
    expect(report.strengths[0].evidence.text).toMatch(/^Sobre .+ você respondeu “.+”/);
    expect(report.gaps[0].example).toMatch(/^No dia a dia:/);
    expect(report.gaps[0].phrase).toBe('Você ainda não reaproveita o que funciona nem organiza o reuso.');
  });

  it('bloco 4 · lacuna em dimensão já desenvolvida é descrita como posição relativa', () => {
    const report = reportFor(answersBy(() => 4));
    expect(report.gaps[0].phrase).toMatch(/^Comparada às outras dimensões/);
  });

  it('bloco 5 · três ações ligadas às lacunas e o percurso como convite (RN-11)', () => {
    // Intermediário com Aplicação entre as mais baixas (T8).
    // 100, 88, 41, 100, 47 → geral 75; Aplicação e Autonomia são as mais baixas.
    const report = reportFor(withFours('familiaridade', 'contexto88', 'aplicacao41', 'revisao', 'autonomia47'));
    expect(report.stage.level).toBe('Intermediário');
    const { actions, recommendation } = report.nextSteps;
    expect(actions).toHaveLength(3);
    const gapIds = report.gaps.map((g) => g.id);
    for (const a of actions) {
      expect(gapIds).toContain(a.dimension);
      expect(DIMENSION_ACTIONS[a.dimension]).toContain(a.text);
    }
    expect(recommendation).toMatchObject({ offer: OFFERS.intermediario, reason: 'lacuna_aplicacao_autonomia' });
    expect(recommendation.invite).toContain('Aplicação');
    expect(recommendation.invite).toContain(`“${OFFERS.intermediario}”`);
  });

  it('bloco 5 · foco curto para dimensão ≤ 40', () => {
    const report = reportFor(answersBy((q) => (q.dimension === 'revisao' && q.id !== 'Q15' ? 0 : 4)));
    expect(report.nextSteps.focus).toEqual([{ dimension: 'revisao', name: 'Revisão', text: SHORT_FOCUS.revisao }]);
  });

  it('bloco 5 · Avançado recebe o convite condicionado ao interesse', () => {
    const report = reportFor(answersBy(() => 4));
    expect(report.nextSteps.recommendation.offer).toBe(OFFERS.avancado);
    expect(report.nextSteps.recommendation.invite).toMatch(/^Se você tem interesse em construir soluções/);
  });

  it('bloco 6 · observação de consistência só quando a trava dispara (RN-09)', () => {
    const report = reportFor(answersBy((q) => ({ A: 4, C: 4, P: 0 }[q.type])));
    expect(report.consistency.title).toBe('Autopercepção acima da prática');
    expect(report.consistency.text).toContain('100 de 100');
    expect(report.consistency.text).toContain('0 de 100');
    expect(reportFor(answersBy(() => 4)).consistency).toBeNull();
  });

  it('preenchimento incompleto: sem estágio geral nem percurso (RN-08)', () => {
    const first12 = new Set(QUESTIONS.slice(0, 12).map((q) => q.id));
    const report = reportFor(answersBy((q) => (first12.has(q.id) ? 4 : undefined)));
    expect(report.stage).toMatchObject({ status: 'preenchimento_incompleto', level: null });
    expect(report.stage.summary[0]).toContain('12 de 24');
    expect(report.nextSteps.recommendation).toBeNull();
  });

  it('"não sei" vira oportunidade de aprendizagem, sem tom de erro (RN-06)', () => {
    const answers = answersBy(() => 0);
    answers.Q4 = NOT_SURE;
    const familiaridade = reportFor(answers).dimensions.find((d) => d.id === 'familiaridade');
    expect(familiaridade.evidence.questionId).toBe('Q4');
    expect(familiaridade.evidence.text).toContain('marcou “Não sei”: um bom ponto de partida para aprender');
  });

  it('nunca cita só o número nem afirma envio de e-mail (RNF-01, RNF-05)', () => {
    const text = JSON.stringify(reportFor(answersBy((q) => (Number(q.id.slice(1)) % 2) * 4)));
    expect(text).not.toMatch(/e-mail enviado|enviamos|ganho de \d|\d+ ?% a mais/i);
  });
});

describe('evidenceText (RN-10)', () => {
  it('lê a resposta pelos pontos: força, lacuna ou só a citação', () => {
    const base = { questionId: 'Q7', type: 'A' };
    expect(evidenceText('contexto', { ...base, label: 'Sempre', points: 4 })).toContain('mais úteis');
    expect(evidenceText('contexto', { ...base, label: 'Raramente', points: 1 }))
      .toBe('Sobre informar objetivo, público, restrições e formato nos pedidos, você respondeu “Raramente”, o que limita a qualidade das respostas.');
    expect(evidenceText('contexto', { ...base, label: 'Às vezes', points: 2 })).toMatch(/“Às vezes”\.$/);
  });

  it('não duplica as aspas de opções que já vêm entre aspas', () => {
    const text = evidenceText('contexto', { questionId: 'Q5', type: 'P', label: '"Faça do seu jeito"', points: 0 });
    expect(text).toContain('você respondeu “Faça do seu jeito”');
    expect(text).not.toContain('“"');
  });

  it('perguntas de conhecimento fora do comportamento da dimensão têm leitura própria', () => {
    expect(evidenceText('autonomia', { questionId: 'Q23', type: 'C', label: 'É só um nome diferente', points: 1 }))
      .toMatch(/um ponto de conhecimento que vale aprofundar\.$/);
  });
});
