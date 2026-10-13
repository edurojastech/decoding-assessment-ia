import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { config } from '../config.js';
import { createApp } from '../app.js';
import { syncDatabase, Company } from '../models/index.js';
import { seed } from '../seed/seed.js';
import { OFFERS } from '../scoring/recommend.js';

const app = createApp();
const admin = request.agent(app);
let demo;
let other;

beforeAll(async () => {
  await syncDatabase();
  await seed();
  [demo, other] = await Company.findAll({ order: [['id', 'ASC']] });
  const login = await admin.post('/api/auth/login').send({ email: config.admin.email, password: config.admin.password });
  expect(login.status).toBe(200);
});

describe('consolidado da empresa (RF-13, RF-14) — C3', () => {
  it('exige login', async () => {
    expect((await request(app).get(`/api/companies/${demo.id}/summary`)).status).toBe(401);
    expect((await request(app).get('/api/admin/overview')).status).toBe(401);
    expect((await request(app).patch('/api/turmas/1').send({ name: 'X' })).status).toBe(401);
  });

  it('traz cobertura, distribuição, radar médio, mapa por área, forças, lacunas e próximos passos', async () => {
    const res = await admin.get(`/api/companies/${demo.id}/summary`);
    expect(res.status).toBe(200);
    const s = res.body;
    // Seed: 18 convidados, 14 concluídos, 2 em andamento, 2 pendentes.
    expect(s.coverage).toEqual({ label: 'Visão dos respondentes', invited: 18, responded: 14, inProgress: 2, pending: 2, coverage: 78 });
    expect(s.empty).toBe(false);
    expect(s.distribution.classified + s.distribution.incomplete).toBe(14);
    expect(s.distribution.levels.map((l) => l.level)).toEqual(['Iniciante', 'Básico', 'Intermediário', 'Avançado']);
    expect(s.distribution.levels.every((l) => l.count > 0)).toBe(true);
    expect(s.dimensions).toHaveLength(5);
    expect(s.dimensions.every((d) => Number.isInteger(d.average) && d.n > 0)).toBe(true);
    // Bloco 2 sempre deixa claro que é o perfil dos respondentes, com a cobertura.
    expect(s.stage.text.at(-1)).toMatch(/14 de 18 convidados \(78% de cobertura\), não uma nota da empresa/);
    expect(s.strengths.dimension.average).toBe(Math.max(...s.dimensions.map((d) => d.average)));
    expect(s.gaps.dimension.average).toBe(Math.min(...s.dimensions.map((d) => d.average)));
    expect(s.strengths.area).not.toBeNull();
    expect(s.strengths.text.join(' ')).toMatch(/de 100/);
    expect(s.gaps.text.join(' ')).toMatch(/Iniciante/);
    expect(s.areas.rows.length).toBeGreaterThan(1);
    expect(s.areas.rows.every((r) => r.dimensions.familiaridade && r.focus)).toBe(true);
    expect(s.nextSteps.groups.map((g) => g.offer)).toEqual([OFFERS.fundamentos, OFFERS.intermediario, OFFERS.avancado]);
    expect(s.nextSteps.groups.reduce((n, g) => n + g.count, 0)).toBe(s.distribution.classified);
    expect(s.nextSteps.groups[0].focus).toHaveLength(2);
    expect(s.scope.areas).toContain('Operações');
  });

  it('filtra por área e recusa área inexistente', async () => {
    const res = await admin.get(`/api/companies/${demo.id}/summary?area=${encodeURIComponent('Operações')}`);
    expect(res.status).toBe(200);
    expect(res.body.scope.area).toBe('Operações');
    expect(res.body.areas.rows.map((r) => r.area)).toEqual(['Operações']);
    expect(res.body.coverage.invited).toBeLessThan(18);
    expect((await admin.get(`/api/companies/${demo.id}/summary?area=Inexistente`)).status).toBe(400);
  });

  it('empresa sem respostas: estado vazio, sem números inventados', async () => {
    const created = await admin.post('/api/companies').send({ name: 'Empresa Vazia' });
    const res = await admin.get(`/api/companies/${created.body.id}/summary`);
    expect(res.status).toBe(200);
    expect(res.body.empty).toBe(true);
    expect(res.body.coverage).toMatchObject({ invited: 0, responded: 0, coverage: 0 });
    expect(res.body.strengths.dimension).toBeNull();
    expect(res.body.stage.text).toEqual([]);
  });
});

describe('grupos por maturidade (RF-15) — C4', () => {
  it('conta e lista por nível; só respondentes', async () => {
    const res = await admin.get(`/api/companies/${demo.id}/groups`);
    expect(res.status).toBe(200);
    const total = res.body.levels.reduce((n, g) => n + g.count, 0) + res.body.incomplete.length;
    expect(total).toBe(14);
    for (const g of res.body.levels) {
      expect(g.participants).toHaveLength(g.count);
      expect(g.participants.every((p) => p.level === g.level)).toBe(true);
    }
    expect(res.body.levels[0].offer).toBe(OFFERS.fundamentos);
    // A turma exemplo do seed reúne os Iniciantes.
    expect(res.body.levels[0].participants.every((p) => p.turma?.name === 'Turma exemplo · Fundamentos')).toBe(true);
  });
});

describe('turmas (RF-16) — C4', () => {
  const groupIds = async (levels) => {
    const res = await admin.get(`/api/companies/${demo.id}/groups`);
    return res.body.levels.filter((g) => levels.includes(g.level)).flatMap((g) => g.participants.map((p) => p.id));
  };

  it('monta Turma A/B/C da empresa demo a partir dos grupos e move pessoas', async () => {
    const board0 = (await admin.get(`/api/companies/${demo.id}/turmas`)).body;
    expect(board0.turmas).toHaveLength(1);
    const exemplo = board0.turmas[0];

    const [idsA, idsB, idsC] = [await groupIds(['Iniciante', 'Básico']), await groupIds(['Intermediário']), await groupIds(['Avançado'])];

    // Turma A: Iniciante + Básico (juntando níveis vizinhos), oferta sugerida pelo nível de origem.
    const a = await admin.post(`/api/companies/${demo.id}/turmas`)
      .send({ name: 'Turma A', sourceLevel: 'Básico', participantIds: idsA });
    expect(a.status).toBe(201);
    const turmaA = a.body.turmas.find((t) => t.id === a.body.turmaId);
    expect(turmaA.offer).toBe(OFFERS.fundamentos);
    expect(turmaA.composition.Iniciante).toBeGreaterThan(0);
    expect(turmaA.composition['Básico']).toBeGreaterThan(0);
    expect(turmaA.focus).toHaveLength(2);
    // Quem estava na turma exemplo foi movido (no máx. 1 turma por pessoa).
    expect(a.body.turmas.find((t) => t.id === exemplo.id).participants).toHaveLength(0);

    const b = await admin.post(`/api/companies/${demo.id}/turmas`)
      .send({ name: 'Turma B', sourceLevel: 'Intermediário', participantIds: idsB });
    const c = await admin.post(`/api/companies/${demo.id}/turmas`)
      .send({ name: 'Turma C', participantIds: idsC });
    expect(b.status).toBe(201);
    expect(c.status).toBe(201);
    const turmaC = c.body.turmas.find((t) => t.id === c.body.turmaId);
    // Sem nível de origem: sem oferta gravada, sugestão pelo nível predominante.
    expect(turmaC.offer).toBe(null);
    expect(turmaC.suggestedOffer).toBe(OFFERS.avancado);

    // Mover uma pessoa da Turma A para a Turma B.
    const person = turmaA.participants[0];
    const moved = await admin.patch(`/api/turmas/${turmaA.id}/move`).send({ participantId: person.id, toTurmaId: b.body.turmaId });
    expect(moved.status).toBe(200);
    expect(moved.body.turmas.find((t) => t.id === b.body.turmaId).participants.map((p) => p.id)).toContain(person.id);
    expect(moved.body.turmas.find((t) => t.id === turmaA.id).participants.map((p) => p.id)).not.toContain(person.id);

    // Tirar da turma e devolver para "sem turma".
    const out = await admin.patch(`/api/turmas/${b.body.turmaId}/move`).send({ participantId: person.id, toTurmaId: null });
    expect(out.body.unassigned.map((p) => p.id)).toContain(person.id);
    expect((await admin.patch(`/api/turmas/${b.body.turmaId}/move`).send({ participantId: person.id })).status).toBe(409);

    // Adicionar de volta à Turma A.
    const back = await admin.post(`/api/turmas/${turmaA.id}/participants`).send({ participantIds: [person.id] });
    expect(back.status).toBe(200);
    expect(back.body.unassigned.map((p) => p.id)).not.toContain(person.id);
  });

  it('renomeia, troca a oferta e exclui sem apagar as pessoas', async () => {
    const created = await admin.post(`/api/companies/${demo.id}/turmas`).send({ name: 'Turma provisória', sourceLevel: 'Avançado' });
    const id = created.body.turmaId;
    expect(created.body.turmas.find((t) => t.id === id).offer).toBe(OFFERS.avancado);

    const renamed = await admin.patch(`/api/turmas/${id}`).send({ name: 'Turma D', offer: OFFERS.intermediario });
    expect(renamed.status).toBe(200);
    expect(renamed.body.turmas.find((t) => t.id === id)).toMatchObject({ name: 'Turma D', offer: OFFERS.intermediario });
    expect((await admin.patch(`/api/turmas/${id}`).send({ offer: '' })).body.turmas.find((t) => t.id === id).offer).toBeNull();

    const [person] = (await admin.get(`/api/companies/${demo.id}/turmas`)).body.turmas.find((t) => t.name === 'Turma C').participants;
    await admin.post(`/api/turmas/${id}/participants`).send({ participantIds: [person.id] });
    const removed = await admin.delete(`/api/turmas/${id}`);
    expect(removed.status).toBe(200);
    expect(removed.body.turmas.map((t) => t.id)).not.toContain(id);
    expect(removed.body.unassigned.map((p) => p.id)).toContain(person.id);
    expect((await admin.delete(`/api/turmas/${id}`)).status).toBe(404);
  });

  it('valida nome, nível e pessoas de outra empresa', async () => {
    const url = `/api/companies/${demo.id}/turmas`;
    expect((await admin.post(url).send({ name: '  ' })).status).toBe(400);
    expect((await admin.post(url).send({ name: 'turma a' })).status).toBe(409);
    expect((await admin.post(url).send({ name: 'Turma X', sourceLevel: 'Expert' })).status).toBe(400);
    expect((await admin.post(url).send({ name: 'Turma X', participantIds: 'todos' })).status).toBe(400);

    const strangers = (await admin.get(`/api/companies/${other.id}/groups`)).body.levels[0].participants;
    expect((await admin.post(url).send({ name: 'Turma X', participantIds: [strangers[0].id] })).status).toBe(400);

    const board = (await admin.get(url)).body;
    const turmaA = board.turmas.find((t) => t.name === 'Turma A');
    const exemplo = board.turmas.find((t) => t.name === 'Turma exemplo · Fundamentos');
    expect((await admin.post(`/api/turmas/${turmaA.id}/participants`).send({ participantIds: [strangers[0].id] })).status).toBe(400);
    expect((await admin.post(`/api/turmas/${turmaA.id}/participants`).send({ participantIds: [] })).status).toBe(400);

    const otherTurma = await admin.post(`/api/companies/${other.id}/turmas`).send({ name: 'Turma fora' });
    const move = await admin.patch(`/api/turmas/${turmaA.id}/move`)
      .send({ participantId: turmaA.participants[0].id, toTurmaId: otherTurma.body.turmaId });
    expect(move.status).toBe(400);
    expect((await admin.patch(`/api/turmas/${exemplo.id}`).send({ name: 'Turma B' })).status).toBe(409);
    expect((await admin.patch('/api/turmas/abc').send({ name: 'Y' })).status).toBe(404);
  });
});

describe('visão geral de todas as empresas (RF-17) — C3', () => {
  it('micro por empresa e macro somando os respondentes', async () => {
    const res = await admin.get('/api/admin/overview');
    expect(res.status).toBe(200);
    const { totals, companies } = res.body;
    expect(totals.companies).toBe(companies.length);
    expect(totals.label).toBe('Visão dos respondentes');
    expect(totals.invited).toBe(companies.reduce((n, c) => n + c.invited, 0));
    expect(totals.responded).toBe(companies.reduce((n, c) => n + c.responded, 0));
    expect(totals.distribution.classified).toBe(companies.reduce((n, c) => n + c.distribution.classified, 0));
    const aurora = companies.find((c) => c.id === demo.id);
    expect(aurora).toMatchObject({ invited: 18, responded: 14, coverage: 78 });
    expect(aurora.turmas).toBeGreaterThanOrEqual(4);
  });
});
