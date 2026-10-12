import { beforeAll, describe, expect, it } from 'vitest';
import { syncDatabase, Company, User, Participant, Turma } from '../models/index.js';
import { seed, seedIfEmpty } from '../seed/seed.js';

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

  it('cria 1 admin, 2 empresas com 15 a 25 participantes e 1 turma', async () => {
    const c = await counts();
    expect(c.users).toBe(1);
    expect(c.companies).toBe(2);
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
