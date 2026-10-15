import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../scoring/questions.js';
import { buildResponseFields } from '../services/assessment.js';
import { buildReportAnalysis } from '../services/reportAnalysis.js';

// Guia "Front 2 · Relatório PDF": análise do PDF (4 páginas + apêndice), sempre ancorada nas respostas.

// Exemplo do guia (Rafael): 44 geral · Familiaridade 44 · Contexto 22 · Aplicação 28 · Revisão 47 · Autonomia 77.
const RAFAEL = {
  Q1: 'c', Q2: 'd', Q3: 'd', Q4: 'c', Q5: 'a', Q6: 'c', Q7: 'c', Q8: 'b', Q9: 'b', Q10: 'c', Q11: 'c', Q12: 'b',
  Q13: 'b', Q14: 'b', Q15: 'a', Q16: 'a', Q17: 'b', Q18: 'b', Q19: 'b', Q20: 'c', Q21: 'e', Q22: 'd', Q23: 'a', Q24: 'b',
};

const analysisFor = (answers) => buildReportAnalysis({ ...buildResponseFields(answers), submittedAt: new Date() });
const best = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options.reduce((a, o) => (o.points > a.points ? o : a)).key]));

describe('análise do PDF (guia Front 2)', () => {
  const a = analysisFor(RAFAEL);
  const dim = (id) => a.dimensions.find((d) => d.id === id);

  it('reproduz as notas do exemplo e identifica a versão do instrumento', () => {
    expect(a.dimensions.map((d) => d.score)).toEqual([44, 22, 28, 47, 77]);
    expect(a.instrument).toEqual({ questionnaire: '1.0', scoring: '1.0' });
  });

  it('pág. 1 · síntese integrada e alcance do nível por dimensão', () => {
    const text = a.synthesis.paragraphs.join(' ');
    expect(text).toContain('maior pontuação em Autonomia com resultados menores em Contexto e Aplicação');
    expect(text).toContain('Em Revisão, aparecem escolhas distintas');
    expect(a.synthesis.levelScope).toBe('A classificação Avançado em Autonomia é específica da dimensão e não altera a classificação geral Básico.');
    expect(a.synthesis.note).toMatch(/Consulte a metodologia ao final deste documento/);
  });

  it('pág. 2 · evidência, interpretação e comportamento a desenvolver em cada dimensão', () => {
    for (const d of a.dimensions) {
      expect(d.evidence.length).toBeGreaterThan(0);
      expect(d.interpretation).toBeTruthy();
      expect(d.develop).toBeTruthy();
      const words = [...d.evidence.map((e) => `${e.nature} ${e.topic} ${e.label}`), d.interpretation, d.develop].join(' ').split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(30);
      expect(words).toBeLessThanOrEqual(95);
    }
    expect(dim('familiaridade').evidence[0].label).toBe('Substitui a decisão humana');
    expect(dim('contexto').interpretation).toMatch(/dificuldade para reconhecer uma solicitação bem estruturada/);
  });

  it('respostas divergentes: as duas escolhas aparecem, sem ficar só com a favorável', () => {
    const revisao = dim('revisao');
    expect(revisao.divergent).toBe(true);
    expect(revisao.evidence.map((e) => e.label)).toEqual(['Apontar a lacuna e pedir o complemento com critério', 'Confia porque soou convincente']);
    expect(a.divergence).toContain('Revisão');
  });

  it('autorrelato x conhecimento não conta como divergência', () => {
    // Familiaridade: "Confortável" (autorrelato, 3) e "Substitui a decisão humana" (conhecimento, 0).
    expect(dim('familiaridade').divergent).toBe(false);
  });

  it('nunca afirma o que as respostas não medem', () => {
    const text = JSON.stringify(a);
    expect(text).not.toMatch(/ajuda colegas|totalmente manuais|aparece pouco na sua rotina/);
    expect(dim('autonomia').interpretation).toBe('A escolha “Tenho um conjunto organizado” sustenta uma leitura de organização e reutilização de pedidos.');
  });

  it('pág. 3 · conexões com apoio nas respostas e prioridades que não são só as menores notas', () => {
    expect(a.connections.map((c) => c.key)).toEqual(['reuse', 'divergent', 'deliver']);
    expect(a.priorities.map((p) => p.title)).toEqual(['Estruturar solicitações', 'Conferir resultados', 'Aplicar e registrar']);
    // Revisão (47) entra antes de Familiaridade (44) pela divergência.
    expect(a.priorities.map((p) => p.id)).not.toContain('familiaridade');
  });

  it('pág. 4 · até três etapas com entrega e verificação, na sequência do trabalho', () => {
    expect(a.plan.steps.map((s) => [s.period, s.dimension])).toEqual([
      ['Dias 1 a 7', 'contexto'], ['Dias 8 a 14', 'aplicacao'], ['Dias 15 a 30', 'revisao'],
    ]);
    for (const step of a.plan.steps) expect(step).toMatchObject({ action: expect.any(String), delivery: expect.any(String), verify: expect.any(String) });
    expect(a.plan.offer).toMatchObject({ name: 'Escale sua produtividade com IA', goal: expect.any(String) });
    expect(a.plan.note).toMatch(/não representam ganhos de produtividade/);
    expect(JSON.stringify(a.plan)).not.toMatch(/\d+ ?%|horas economizadas|mentoria/i);
  });

  it('apêndice · metodologia do cálculo implementado, sem valores inventados', () => {
    const rules = Object.fromEntries(a.methodology.rules.map((r) => [r.item, r.definition]));
    expect(rules['Itens e tipos']).toContain('24 questões');
    expect(rules['Itens e tipos']).toContain('peso 1,5');
    expect(rules['Respostas ausentes']).toContain('60%');
    expect(rules['Respostas ausentes']).toContain('70%');
    expect(rules.Arredondamento).toMatch(/25 é Iniciante/);
    expect(a.methodology.levels.map((l) => l.range)).toEqual(['0 a 25', '26 a 50', '51 a 75', '76 a 100']);
    expect(a.methodology.evidence.find((e) => e.nature === 'Execução observada').count).toBe(0);
    expect(a.methodology.evidence.reduce((s, e) => s + e.count, 0)).toBe(24);
  });

  it('perfil no mesmo patamar não inventa "menor pontuação" nem contraste', () => {
    const top = analysisFor(best());
    expect(top.connections.map((c) => c.key)).toEqual(['even']);
    expect(JSON.stringify(top.priorities)).not.toMatch(/menor pontuação/);
    expect(top.synthesis.paragraphs[0]).toMatch(/mesmo patamar \(100 de 100\)/);
  });

  it('preenchimento incompleto: sem resultado geral e dimensões sem dados sinalizadas', () => {
    const first12 = Object.fromEntries(QUESTIONS.slice(0, 12).map((q) => [q.id, q.options[1].key]));
    const inc = analysisFor(first12);
    expect(inc.synthesis.scope).toMatch(/não foi calculado/);
    expect(inc.synthesis.levelScope).toBeNull();
    expect(inc.dimensions.find((d) => d.id === 'autonomia')).toMatchObject({ score: null, evidence: [] });
    expect(inc.priorities.every((p) => ['familiaridade', 'contexto', 'aplicacao'].includes(p.id))).toBe(true);
  });
});
