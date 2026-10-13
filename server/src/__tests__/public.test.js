import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { syncDatabase, Company, Participant, AssessmentResponse } from '../models/index.js';
import { QUESTIONS } from '../scoring/questions.js';

const app = createApp();
let company;

beforeAll(async () => {
  await syncDatabase();
  company = await Company.create({ name: 'Empresa Link' });
});

let counter = 0;
async function newParticipant(extra = {}) {
  counter += 1;
  return Participant.create({
    companyId: company.id, name: `Pessoa ${counter}`, email: `pessoa${counter}@empresa.com`, area: 'RH', ...extra,
  });
}

// Melhor opção (4 pontos) em todas as questões.
const bestAnswers = () => Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q.options.find((o) => o.points === 4).key]),
);

describe('GET /api/r/:token (RF-08, RF-09, RF-10)', () => {
  it('devolve identificação prefillada e questionário sem pontos', async () => {
    const p = await newParticipant();
    const res = await request(app).get(`/api/r/${p.token}`);
    expect(res.status).toBe(200);
    expect(res.body.participant).toMatchObject({
      name: p.name, email: p.email, area: 'RH', status: 'pendente', consented: false, companyName: 'Empresa Link',
    });
    expect(res.body.questionnaire.estimatedTime).toBe('9 a 12 minutos');
    expect(res.body.questionnaire.dimensions).toHaveLength(5);
    // Pontos e pesos ficam só no backend (regra 1).
    expect(JSON.stringify(res.body)).not.toMatch(/"points"|"weight"/);
    expect(res.body.participant).not.toHaveProperty('token');
  });

  it('responde 404 para token inexistente ou malformado', async () => {
    expect((await request(app).get('/api/r/00000000-0000-4000-8000-000000000000')).status).toBe(404);
    expect((await request(app).get('/api/r/nao-e-um-token')).status).toBe(404);
  });
});

describe('PATCH /api/r/:token (RF-08, RF-09)', () => {
  it('exige consentimento antes de qualquer alteração', async () => {
    const p = await newParticipant();
    const res = await request(app).patch(`/api/r/${p.token}`).send({ name: 'Outro Nome' });
    expect(res.status).toBe(400);
    expect((await p.reload()).name).toBe(p.name);
  });

  it('registra consentimento e passa o status para em andamento', async () => {
    const p = await newParticipant();
    const res = await request(app).patch(`/api/r/${p.token}`).send({ consent: true });
    expect(res.status).toBe(200);
    expect(res.body.participant).toMatchObject({ consented: true, status: 'em_andamento' });
    await p.reload();
    expect(p.consentAt).toBeTruthy();
  });

  it('corrige identificação e perfil (P0b, P0c)', async () => {
    const p = await newParticipant();
    const res = await request(app).patch(`/api/r/${p.token}`).send({
      consent: true, name: '  Ana Corrigida ', email: 'Ana.Nova@Empresa.com', area: 'Comercial',
      role: 'Analista', tools: ['Claude', 'ChatGPT'],
    });
    expect(res.status).toBe(200);
    expect(res.body.participant).toMatchObject({
      name: 'Ana Corrigida', email: 'ana.nova@empresa.com', area: 'Comercial', role: 'Analista', tools: ['Claude', 'ChatGPT'],
    });
  });

  it('recusa nome vazio, e-mail inválido e ferramenta fora da lista', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    const patch = (body) => request(app).patch(`/api/r/${p.token}`).send(body);
    expect((await patch({ name: '   ' })).status).toBe(400);
    expect((await patch({ email: 'sem-arroba' })).status).toBe(400);
    expect((await patch({ tools: ['Bard'] })).status).toBe(400);
    expect((await patch({ tools: ['Nenhuma', 'Claude'] })).status).toBe(400);
  });

  it('recusa e-mail já usado por outra pessoa da empresa (RF-04)', async () => {
    const other = await newParticipant();
    const p = await newParticipant({ consentAt: new Date() });
    const res = await request(app).patch(`/api/r/${p.token}`).send({ email: other.email });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/r/:token/submit (C2, C5)', () => {
  it('exige consentimento', async () => {
    const p = await newParticipant();
    const res = await request(app).post(`/api/r/${p.token}/submit`).send({ answers: bestAnswers() });
    expect(res.status).toBe(400);
    expect(await AssessmentResponse.count({ where: { participantId: p.id } })).toBe(0);
  });

  it('calcula no backend, salva scores e nível e conclui', async () => {
    const p = await newParticipant({ consentAt: new Date(), status: 'em_andamento' });
    const res = await request(app).post(`/api/r/${p.token}/submit`).send({ answers: bestAnswers() });
    expect(res.status).toBe(201);

    const saved = await AssessmentResponse.findOne({ where: { participantId: p.id } });
    expect(saved).toMatchObject({ overallScore: 100, overallLevel: 'Avançado' });
    expect(saved.dimensionScores.revisao).toMatchObject({ score: 100, status: 'pontuada' });
    expect(saved.answers.Q5).toMatchObject({ points: 4, weight: 2 });
    expect(saved.submittedAt).toBeTruthy();
    expect((await p.reload()).status).toBe('concluido');
  });

  it('aceita envio parcial e marca preenchimento incompleto (RN-08)', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    const answers = Object.fromEntries(Object.entries(bestAnswers()).slice(0, 10));
    const res = await request(app).post(`/api/r/${p.token}/submit`).send({ answers });
    expect(res.status).toBe(201);
    const saved = await AssessmentResponse.findOne({ where: { participantId: p.id } });
    expect(saved).toMatchObject({ overallScore: null, overallLevel: null });
    expect(saved.flags.incomplete).toBe(true);
  });

  it('recusa respostas inválidas sem gravar nada', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    const res = await request(app).post(`/api/r/${p.token}/submit`).send({ answers: { Q1: 'nao_sei', Q99: 'a' } });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveLength(2);
    expect(await AssessmentResponse.count({ where: { participantId: p.id } })).toBe(0);
    expect((await p.reload()).status).toBe('pendente');
  });

  it('não aceita segundo envio nem alteração depois de concluir', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    expect((await request(app).post(`/api/r/${p.token}/submit`).send({ answers: bestAnswers() })).status).toBe(201);
    expect((await request(app).post(`/api/r/${p.token}/submit`).send({ answers: {} })).status).toBe(409);
    expect((await request(app).patch(`/api/r/${p.token}`).send({ name: 'Mudou' })).status).toBe(409);
    expect((await request(app).get(`/api/r/${p.token}`)).body.participant.status).toBe('concluido');
  });
});

describe('GET /api/r/:token/result (RF-11, RF-12)', () => {
  it('só libera a devolutiva depois do envio', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    expect((await request(app).get(`/api/r/${p.token}/result`)).status).toBe(409);
  });

  it('devolve identificação e devolutiva, e o mesmo link reabre a mesma devolutiva', async () => {
    const p = await newParticipant({ consentAt: new Date() });
    await request(app).post(`/api/r/${p.token}/submit`).send({ answers: bestAnswers() });

    const first = await request(app).get(`/api/r/${p.token}/result`);
    expect(first.status).toBe(200);
    expect(first.body.participant).toMatchObject({ name: p.name, email: p.email, area: 'RH', companyName: 'Empresa Link' });
    expect(first.body.participant).not.toHaveProperty('token');
    expect(first.body.report.stage).toMatchObject({ status: 'calculado', level: 'Avançado', score: 100 });
    expect(first.body.report.dimensions).toHaveLength(5);

    const again = await request(app).get(`/api/r/${p.token}/result`);
    expect(again.body).toEqual(first.body);
  });

  it('responde 404 para token inexistente', async () => {
    expect((await request(app).get('/api/r/00000000-0000-4000-8000-000000000000/result')).status).toBe(404);
  });
});
