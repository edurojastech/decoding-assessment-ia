import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { config } from '../config.js';
import { createApp } from '../app.js';
import {
  syncDatabase, Company, Participant, AssessmentResponse, Turma, TurmaParticipant,
} from '../models/index.js';
import { seed } from '../seed/seed.js';

const app = createApp();
const admin = request.agent(app);

beforeAll(async () => {
  await syncDatabase();
  await seed();
  const login = await admin.post('/api/auth/login').send({ email: config.admin.email, password: config.admin.password });
  expect(login.status).toBe(200);
});

async function newCompany(name) {
  const res = await admin.post('/api/companies').send({ name });
  expect(res.status).toBe(201);
  return res.body;
}

describe('empresas (RF-02, RF-18)', () => {
  it('exige login', async () => {
    expect((await request(app).post('/api/companies').send({ name: 'X' })).status).toBe(401);
    expect((await request(app).get('/api/template.csv')).status).toBe(401);
    expect((await request(app).delete('/api/participants/1')).status).toBe(401);
  });

  it('cadastra, detalha e renomeia; recusa nome vazio ou repetido', async () => {
    const created = await newCompany('  Nova   Empresa ');
    expect(created).toMatchObject({ name: 'Nova Empresa', invited: 0, responded: 0, coverage: 0 });

    expect((await admin.post('/api/companies').send({ name: '  ' })).status).toBe(400);
    expect((await admin.post('/api/companies').send({ name: 'nova empresa' })).status).toBe(409);

    const detail = await admin.get(`/api/companies/${created.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body).toMatchObject({ name: 'Nova Empresa', statusCounts: { pendente: 0 }, areas: [] });

    const renamed = await admin.patch(`/api/companies/${created.id}`).send({ name: 'Empresa Renomeada' });
    expect(renamed.status).toBe(200);
    expect(renamed.body.name).toBe('Empresa Renomeada');
    // Manter o próprio nome não conta como repetido.
    expect((await admin.patch(`/api/companies/${created.id}`).send({ name: 'Empresa Renomeada' })).status).toBe(200);

    expect((await admin.get('/api/companies/999999')).status).toBe(404);
    expect((await admin.get('/api/companies/abc')).status).toBe(404);
  });

  it('exclui a empresa com participantes, respostas e turmas', async () => {
    const [demo] = await Company.findAll({ order: [['id', 'ASC']] });
    const participantIds = (await Participant.findAll({ where: { companyId: demo.id } })).map((p) => p.id);
    expect(await TurmaParticipant.count({ where: { participantId: participantIds } })).toBeGreaterThan(0);

    expect((await admin.delete(`/api/companies/${demo.id}`)).status).toBe(204);
    expect(await Company.findByPk(demo.id)).toBeNull();
    expect(await Participant.count({ where: { companyId: demo.id } })).toBe(0);
    expect(await AssessmentResponse.count({ where: { participantId: participantIds } })).toBe(0);
    expect(await Turma.count({ where: { companyId: demo.id } })).toBe(0);
    expect(await TurmaParticipant.count({ where: { participantId: participantIds } })).toBe(0);
  });
});

describe('importação CSV (RF-03, RF-04, RF-05) — C1', () => {
  it('modelo para baixar', async () => {
    const res = await admin.get('/api/template.csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/modelo-participantes\.csv/);
    expect(res.text).toMatch(/nome,email,area/);
  });

  it('CSV com 1 linha inválida importa as válidas e mostra o erro', async () => {
    const company = await newCompany('Empresa Importação');
    const csv = 'nome,email,area\nAna Souza,ana.souza@empresa.com,RH\nSem Email,email-invalido,Comercial\nCarlos Lima,carlos.lima@empresa.com,Comercial\n';
    const res = await admin.post(`/api/companies/${company.id}/participants/import`).send({ csv });

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(2);
    expect(res.body.errors).toEqual([{ line: 3, reason: 'E-mail inválido.', raw: 'Sem Email,email-invalido,Comercial' }]);

    const saved = await Participant.findAll({ where: { companyId: company.id }, order: [['email', 'ASC']] });
    expect(saved.map((p) => p.email)).toEqual(['ana.souza@empresa.com', 'carlos.lima@empresa.com']);
    for (const p of saved) {
      expect(p.status).toBe('pendente');
      expect(p.token).toMatch(/^[0-9a-f-]{36}$/);
    }

    // Reimportar o mesmo arquivo: e-mails já cadastrados viram erro de linha, nada duplica.
    const again = await admin.post(`/api/companies/${company.id}/participants/import`).send({ csv });
    expect(again.body.imported).toBe(0);
    expect(again.body.errors.map((e) => e.line)).toEqual([2, 3, 4]);
    expect(await Participant.count({ where: { companyId: company.id } })).toBe(2);
  });

  it('o mesmo e-mail pode existir em outra empresa', async () => {
    const company = await newCompany('Outra Importação');
    const res = await admin.post(`/api/companies/${company.id}/participants/import`)
      .send({ csv: 'nome,email,area\nAna Souza,ana.souza@empresa.com,RH' });
    expect(res.body).toEqual({ imported: 1, errors: [] });
  });

  it('recusa conteúdo vazio e cabeçalho errado sem importar nada', async () => {
    const company = await newCompany('Empresa Cabeçalho');
    const url = `/api/companies/${company.id}/participants/import`;
    expect((await admin.post(url).send({ csv: '' })).status).toBe(400);
    const wrong = await admin.post(url).send({ csv: 'name,mail,dept\nAna,a@x.com,RH' });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error).toMatch(/nome,email,area/);
    expect(await Participant.count({ where: { companyId: company.id } })).toBe(0);
  });
});

describe('participantes, links e exportação (RF-05, RF-06, RF-07, RF-18)', () => {
  let company;
  beforeAll(async () => {
    company = await newCompany('Empresa Lista');
    await admin.post(`/api/companies/${company.id}/participants/import`).send({
      csv: 'nome,email,area\nBruno,bruno@x.com,RH\n"Souza, Ana",ana@x.com,Comercial\nCaio,caio@x.com,RH',
    });
    const caio = await Participant.findOne({ where: { companyId: company.id, email: 'caio@x.com' } });
    await AssessmentResponse.create({
      participantId: caio.id, answers: {}, overallScore: 40, overallLevel: 'Básico', flags: { incomplete: false },
    });
    await caio.update({ status: 'concluido' });
  });

  it('lista com status, nível e link pessoal, em ordem alfabética', async () => {
    const res = await admin.get(`/api/companies/${company.id}/participants`).set('Host', 'assessment.example');
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.name)).toEqual(['Bruno', 'Caio', 'Souza, Ana']);
    const caio = res.body[1];
    expect(caio).toMatchObject({ area: 'RH', status: 'concluido', level: 'Básico', score: 40, incomplete: false });
    expect(caio.link).toMatch(/^http:\/\/assessment\.example\/r\/[0-9a-f-]{36}$/);
    expect(res.body[0]).toMatchObject({ status: 'pendente', level: null });
  });

  it('usa https quando o proxy informa (Replit)', async () => {
    const res = await admin.get(`/api/companies/${company.id}/participants`)
      .set('Host', 'app.replit.dev').set('X-Forwarded-Proto', 'https');
    expect(res.body[0].link).toMatch(/^https:\/\/app\.replit\.dev\/r\//);
  });

  it('filtra por área, nível e status; recusa filtro inválido', async () => {
    const list = async (qs) => (await admin.get(`/api/companies/${company.id}/participants?${qs}`)).body.map((p) => p.name);
    expect(await list('area=RH')).toEqual(['Bruno', 'Caio']);
    expect(await list('level=B%C3%A1sico')).toEqual(['Caio']);
    expect(await list('level=Avan%C3%A7ado')).toEqual([]);
    expect(await list('status=pendente')).toEqual(['Bruno', 'Souza, Ana']);
    expect(await list('status=pendente&area=RH')).toEqual(['Bruno']);
    expect((await admin.get(`/api/companies/${company.id}/participants?status=xpto`)).status).toBe(400);
    expect((await admin.get(`/api/companies/${company.id}/participants?level=Expert`)).status).toBe(400);
  });

  it('detalhe traz contagem por status e áreas para o filtro', async () => {
    const res = await admin.get(`/api/companies/${company.id}`);
    expect(res.body).toMatchObject({
      invited: 3, responded: 1, coverage: 33, statusCounts: { pendente: 2, em_andamento: 0, concluido: 1 }, areas: ['Comercial', 'RH'],
    });
  });

  it('exporta CSV com nome, e-mail e link', async () => {
    const res = await admin.get(`/api/companies/${company.id}/participants/export`).set('Host', 'assessment.example');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/filename="links-empresa-lista\.csv"/);
    const lines = res.text.replace(/^﻿/, '').trim().split('\r\n');
    expect(lines[0]).toBe('nome,email,link');
    expect(lines).toHaveLength(4);
    expect(lines[3]).toMatch(/^"Souza, Ana",ana@x\.com,http:\/\/assessment\.example\/r\/[0-9a-f-]{36}$/);

    const filtered = await admin.get(`/api/companies/${company.id}/participants/export?status=concluido`);
    expect(filtered.text.trim().split('\r\n')).toHaveLength(2);
  });

  it('exclui participante com resposta e vínculo de turma', async () => {
    const caio = await Participant.findOne({ where: { companyId: company.id, email: 'caio@x.com' } });
    const turma = await Turma.create({ companyId: company.id, name: 'Turma Lista' });
    await TurmaParticipant.create({ turmaId: turma.id, participantId: caio.id });

    expect((await admin.delete(`/api/participants/${caio.id}`)).status).toBe(204);
    expect(await Participant.findByPk(caio.id)).toBeNull();
    expect(await AssessmentResponse.count({ where: { participantId: caio.id } })).toBe(0);
    expect(await TurmaParticipant.count({ where: { participantId: caio.id } })).toBe(0);
    expect((await admin.delete(`/api/participants/${caio.id}`)).status).toBe(404);
  });
});
