import { beforeAll, describe, expect, it } from 'vitest';
import {
  sequelize, syncDatabase, Company, Participant, AssessmentResponse, Turma, TurmaParticipant,
} from '../models/index.js';

beforeAll(async () => {
  await syncDatabase();
});

describe('models', () => {
  it('gera token UUID e status pendente para o participante (ADR-05)', async () => {
    const company = await Company.create({ name: 'Empresa Teste' });
    const p = await Participant.create({
      companyId: company.id, name: 'Ana Souza', email: 'Ana.Souza@Empresa.com', area: 'RH',
    });
    expect(p.token).toMatch(/^[0-9a-f-]{36}$/);
    expect(p.status).toBe('pendente');
    expect(p.email).toBe('ana.souza@empresa.com');
  });

  it('impede e-mail repetido na mesma empresa, mas aceita em outra (RF-04)', async () => {
    const a = await Company.create({ name: 'A' });
    const b = await Company.create({ name: 'B' });
    const base = { name: 'Carlos Lima', email: 'carlos@x.com', area: 'Comercial' };
    await Participant.create({ ...base, companyId: a.id });
    await expect(Participant.create({ ...base, companyId: a.id })).rejects.toThrow();
    await expect(Participant.create({ ...base, companyId: b.id })).resolves.toBeTruthy();
  });

  it('guarda JSON de forma portável', async () => {
    const company = await Company.create({ name: 'JSON' });
    const p = await Participant.create({
      companyId: company.id, name: 'Bia', email: 'bia@x.com', area: 'RH', tools: ['Claude', 'Gemini'],
    });
    const r = await AssessmentResponse.create({ participantId: p.id, answers: { Q1: 3, Q4: 'nao_sei' } });
    const reloaded = await AssessmentResponse.findByPk(r.id);
    expect(reloaded.answers).toEqual({ Q1: 3, Q4: 'nao_sei' });
    expect((await Participant.findByPk(p.id)).tools).toEqual(['Claude', 'Gemini']);
  });

  it('permite o participante em no máximo uma turma', async () => {
    const company = await Company.create({ name: 'Turmas' });
    const p = await Participant.create({ companyId: company.id, name: 'Duda', email: 'duda@x.com', area: 'RH' });
    const t1 = await Turma.create({ companyId: company.id, name: 'T1' });
    const t2 = await Turma.create({ companyId: company.id, name: 'T2' });
    await TurmaParticipant.create({ turmaId: t1.id, participantId: p.id });
    await expect(TurmaParticipant.create({ turmaId: t2.id, participantId: p.id })).rejects.toThrow();
  });

  it('exclui participantes e turmas junto com a empresa (RF-18)', async () => {
    const company = await Company.create({ name: 'Excluir' });
    await Participant.create({ companyId: company.id, name: 'Eva', email: 'eva@x.com', area: 'RH' });
    await Turma.create({ companyId: company.id, name: 'T' });
    await company.destroy();
    expect(await Participant.count({ where: { companyId: company.id } })).toBe(0);
    expect(await Turma.count({ where: { companyId: company.id } })).toBe(0);
  });

  it('rejeita nível fora das faixas (RN-05)', async () => {
    const company = await Company.create({ name: 'Nível' });
    await expect(Turma.create({ companyId: company.id, name: 'X', sourceLevel: 'Expert' })).rejects.toThrow();
  });

  it('usa SQLite em memória nos testes', () => {
    expect(sequelize.getDialect()).toBe('sqlite');
  });
});
