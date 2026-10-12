import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { sequelize, syncDatabase, Company, User, Participant, Turma } from '../models/index.js';
import { DEMO_COMPANIES, DEMO_TURMA, buildParticipants } from './data.js';

// RF-19 (etapa 1): admin, 2 empresas, participantes com links e 1 turma.
// As respostas pontuadas entram na Fatia A, geradas pelo motor de server/src/scoring/.
// Idempotente: cada registro é procurado antes de ser criado.
export async function seed() {
  return sequelize.transaction(async (transaction) => {
    const [admin] = await User.findOrCreate({
      where: { email: config.admin.email },
      defaults: {
        name: config.admin.name,
        passwordHash: await bcrypt.hash(config.admin.password, 10),
        role: 'admin',
      },
      transaction,
    });

    const companies = [];
    for (const demo of DEMO_COMPANIES) {
      const [company] = await Company.findOrCreate({
        where: { name: demo.name },
        transaction,
      });
      for (const person of buildParticipants(demo)) {
        await Participant.findOrCreate({
          where: { companyId: company.id, email: person.email },
          defaults: { name: person.name, area: person.area },
          transaction,
        });
      }
      companies.push(company);
    }

    await Turma.findOrCreate({
      where: { companyId: companies[0].id, name: DEMO_TURMA.name },
      defaults: { sourceLevel: DEMO_TURMA.sourceLevel, offer: DEMO_TURMA.offer },
      transaction,
    });

    return { adminId: admin.id, companyIds: companies.map((c) => c.id) };
  });
}

// Executado no start do servidor: popula só um banco novo (sem administrador).
export async function seedIfEmpty() {
  if (await User.count() > 0) return false;
  await seed();
  return true;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  try {
    await syncDatabase();
    await seed();
    console.log('[seed] Dados de demonstração prontos.');
  } catch (err) {
    console.error('[seed] Falhou:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}
