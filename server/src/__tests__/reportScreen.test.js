import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../scoring/questions.js';
import { buildResponseFields } from '../services/assessment.js';
import { buildIndividualReport } from '../services/reportIndividual.js';
import { evidenceSentence } from '../services/reportScreen.js';

// Guia "Front 1 · Devolutiva no app": tela para ler em ~2 minutos, mesma avaliação do PDF.

const RAFAEL = {
  Q1: 'c', Q2: 'd', Q3: 'd', Q4: 'c', Q5: 'a', Q6: 'c', Q7: 'c', Q8: 'b', Q9: 'b', Q10: 'c', Q11: 'c', Q12: 'b',
  Q13: 'b', Q14: 'b', Q15: 'a', Q16: 'a', Q17: 'b', Q18: 'b', Q19: 'b', Q20: 'c', Q21: 'e', Q22: 'd', Q23: 'a', Q24: 'b',
};
const reportFor = (answers) => buildIndividualReport({ ...buildResponseFields(answers), submittedAt: new Date('2026-10-14T12:00:00-03:00') });
const words = (text) => text.split(/\s+/).filter(Boolean).length;
const best = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options.reduce((a, o) => (o.points > a.points ? o : a)).key]));

describe('devolutiva na tela (guia Front 1)', () => {
  const report = reportFor(RAFAEL);
  const { screen } = report;
  const line = (id) => screen.dimensions.find((d) => d.id === id).short;

  it('síntese de 60 a 90 palavras, ancorada no perfil', () => {
    const text = screen.synthesis.join(' ');
    expect(words(text)).toBeGreaterThanOrEqual(60);
    expect(words(text)).toBeLessThanOrEqual(90);
    expect(text).toMatch(/^Seu perfil apresenta maior pontuação em Autonomia e oportunidades de desenvolvimento em Contexto e Aplicação\./);
    expect(text).toContain('facilidade relativa para reutilizar pedidos');
    expect(text).toContain('não altera o nível geral Básico');
  });

  it('uma frase curta por dimensão, como no exemplo do guia', () => {
    expect(line('familiaridade')).toBe('A resposta sobre limites da IA indica um conceito a revisar.');
    expect(line('contexto')).toBe('Estruturar solicitações é a prioridade inicial.');
    expect(line('aplicacao')).toBe('Reconhecer aplicações na função é um ponto de desenvolvimento.');
    expect(line('revisao')).toBe('As respostas sobre a conferência mostram critérios ainda inconsistentes.');
    expect(line('autonomia')).toBe('A reutilização de pedidos é uma força relativa do perfil.');
  });

  it('prioridades: Contexto e Revisão; Autonomia como força relativa, sem "orientar colegas"', () => {
    expect(screen.focus.title).toBe('Priorize Contexto e Revisão.');
    expect(screen.focus.items).toHaveLength(2);
    expect(screen.strength).toMatchObject({ id: 'autonomia', score: 77 });
    expect(JSON.stringify(screen)).not.toMatch(/ajuda colegas|orientar colegas|totalmente manuais|ganhos? de produtividade/);
  });

  it('primeira ação com entrega verificável e percurso justificado pelo diagnóstico', () => {
    expect(screen.firstAction.text).toMatch(/resumo de reunião/);
    expect(screen.firstAction.delivery).toBe('Uma solicitação revisada e um resumo conferido.');
    expect(screen.firstAction.note).toMatch(/orientações de dados da empresa/);
    expect(screen.learning.offer.name).toBe('Escale sua produtividade com IA');
    expect(screen.learning.offer.why).toMatch(/^Indicado porque as suas prioridades envolvem estruturação de pedidos/);
  });

  it('leitura principal dentro do limite editorial (250 a 400 palavras com as notas)', () => {
    const visible = [
      ...screen.synthesis,
      ...screen.dimensions.map((d) => d.short),
      screen.focus.title, ...screen.focus.items.map((i) => i.text),
      screen.strength.text,
      screen.firstAction.text, screen.firstAction.delivery, screen.firstAction.note,
      screen.learning.offer.why, screen.learning.text,
    ].join(' ');
    expect(words(visible)).toBeGreaterThanOrEqual(150);
    expect(words(visible)).toBeLessThanOrEqual(400);
  });

  it('evidências com a redação do guia: "você declarou" e "na situação apresentada, você selecionou"', () => {
    expect(evidenceSentence({ questionId: 'Q1', type: 'A', label: 'Raramente' })).toBe('Sobre frequência de uso, você declarou “Raramente”.');
    expect(evidenceSentence({ questionId: 'Q4', type: 'C', label: 'Substitui a decisão humana' }))
      .toBe('Na situação apresentada sobre limites da IA, você selecionou “Substitui a decisão humana”.');
  });

  it('metodologia: escala, dimensões, data, versão e alcance individual; mesma base do PDF', () => {
    const m = screen.methodology;
    expect(m.scale).toMatch(/Iniciante \(0 a 25\)/);
    expect(m.dimensions).toHaveLength(5);
    expect(m.scope).toMatch(/não descreve, sozinho, a maturidade de toda a organização/);
    expect(m.versions).toMatchObject({ instrument: '1.0', report: '1.0', notice: null });
    expect(report.dimensions.map((d) => d.score)).toEqual(report.analysis.dimensions.map((d) => d.score));
  });

  it('registra as versões no envio e avisa quando a leitura atual usa outra versão', () => {
    const fields = buildResponseFields(RAFAEL);
    expect(fields.flags.versions).toEqual({ instrument: '1.0', scoring: '1.0', report: '1.0' });
    const old = buildIndividualReport({ ...fields, flags: { ...fields.flags, versions: { instrument: '0.9', scoring: '0.9', report: '0.9' } } });
    expect(old.screen.methodology.versions.notice).toMatch(/versão 0\.9 do instrumento/);
  });

  it('perfil todo Avançado: sem "ponto de desenvolvimento" inventado', () => {
    const top = reportFor(best()).screen;
    expect(top.focus).toBeNull();
    expect(top.strength).toBeNull();
    expect(JSON.stringify(top.dimensions)).not.toMatch(/ponto de desenvolvimento|prioridade inicial/);
    expect(top.synthesis.join(' ')).toMatch(/não apontam uma lacuna abaixo do nível Avançado/);
    expect(top.firstAction.text).toMatch(/fluxo reutilizável/);
  });
});
