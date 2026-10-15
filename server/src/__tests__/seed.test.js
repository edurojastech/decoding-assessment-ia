import { beforeAll, describe, expect, it } from 'vitest';
import {
  syncDatabase, Company, User, Participant, AssessmentResponse, Turma, TurmaParticipant,
} from '../models/index.js';
import { seed, seedIfEmpty } from '../seed/seed.js';
import { scoreAssessment } from '../scoring/score.js';
import { LEVELS } from '../constants.js';

beforeAll(async () => {
  await syncDatabase();
});

async function counts() {
  return {
    users: await User.count(),
    companies: await Company.count(),
    participants: await Participant.count(),
    turmas: await Turma.count(),
  };
}

describe('seed (RF-19, C6)', () => {
  it('popula banco vazio no start e não repete', async () => {
    expect(await seedIfEmpty()).toBe(true);
    expect(await seedIfEmpty()).toBe(false);
  });

  it('cria 1 admin, ao menos 2 empresas (4 na demo) com 15 a 25 participantes e 1 turma', async () => {
    const c = await counts();
    expect(c.users).toBe(1);
    expect(c.companies).toBeGreaterThanOrEqual(2);
    expect(c.turmas).toBe(1);
    for (const company of await Company.findAll()) {
      const n = await Participant.count({ where: { companyId: company.id } });
      expect(n).toBeGreaterThanOrEqual(15);
      expect(n).toBeLessThanOrEqual(25);
    }
  });

  it('é idempotente', async () => {
    const before = await counts();
    await seed();
    await seed();
    expect(await counts()).toEqual(before);
  });

  it('gera um link pessoal único para cada participante', async () => {
    const tokens = (await Participant.findAll({ attributes: ['token'] })).map((p) => p.token);
    expect(new Set(tokens).size).toBe(tokens.length);
  });
});

describe('seed etapa 2 · respostas (RF-19, C6)', () => {
  it('cada empresa tem respostas nos 4 níveis e cobertura abaixo de 100%', async () => {
    for (const company of await Company.findAll()) {
      const participants = await Participant.findAll({
        where: { companyId: company.id },
        include: [{ model: AssessmentResponse, as: 'response' }],
      });
      const levels = new Set(participants.filter((p) => p.response).map((p) => p.response.overallLevel));
      expect([...levels].sort()).toEqual([...LEVELS].sort());

      const statuses = new Set(participants.map((p) => p.status));
      expect(statuses).toEqual(new Set(['pendente', 'em_andamento', 'concluido']));
    }
  });

  it('as respostas gravadas são exatamente o que o motor calcula (regra 1)', async () => {
    for (const r of await AssessmentResponse.findAll()) {
      const choices = Object.fromEntries(Object.entries(r.answers).map(([id, a]) => [id, a.option]));
      const expected = scoreAssessment(choices);
      expect(r.overallScore).toBe(expected.overallScore);
      expect(r.overallLevel).toBe(expected.overallLevel);
      expect(r.dimensionScores).toEqual(expected.dimensions);
      // Além das travas do motor, o envio registra as versões do instrumento e da devolutiva (guia Front 1).
      expect(r.flags).toEqual({ ...expected.flags, versions: expect.any(Object) });
    }
  });

  it('inclui ao menos um caso de "autopercepção acima da prática"', async () => {
    const flagged = (await AssessmentResponse.findAll()).filter((r) => r.flags.inconsistency);
    expect(flagged.length).toBeGreaterThan(0);
  });

  it('só quem concluiu tem resposta, e com consentimento registrado', async () => {
    for (const p of await Participant.findAll({ include: [{ model: AssessmentResponse, as: 'response' }] })) {
      expect(Boolean(p.response)).toBe(p.status === 'concluido');
      if (p.status !== 'pendente') expect(p.consentAt).toBeTruthy();
    }
  });

  it('popula a turma exemplo com o grupo de origem', async () => {
    const turma = await Turma.findOne({
      include: [{ model: Participant, as: 'participants', include: [{ model: AssessmentResponse, as: 'response' }] }],
    });
    expect(turma.participants.length).toBeGreaterThan(0);
    for (const p of turma.participants) expect(p.response.overallLevel).toBe(turma.sourceLevel);
  });

  it('é idempotente também nas respostas e na turma', async () => {
    const before = [await AssessmentResponse.count(), await TurmaParticipant.count()];
    await seed();
    expect([await AssessmentResponse.count(), await TurmaParticipant.count()]).toEqual(before);
  });
});
