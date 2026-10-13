import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import {
  sequelize, syncDatabase, Company, User, Participant, AssessmentResponse, Turma, TurmaParticipant,
} from '../models/index.js';
import { QUESTIONS } from '../scoring/questions.js';
import { buildResponseFields } from '../services/assessment.js';
import {
  DEMO_COMPANIES, DEMO_TURMA, buildAnswers, buildParticipants, buildProfile, isAnswerPlan,
} from './data.js';

// Etapa 2: respostas variadas cobrindo os 4 níveis, pontuadas pelo motor (regra 1).
// Só mexe em quem ainda está pendente e sem resposta, para nunca sobrescrever uso real.
async function seedResponse(participant, plan, index, transaction) {
  if (participant.status !== 'pendente' || plan === 'pendente') return;
  const existing = await AssessmentResponse.findOne({ where: { participantId: participant.id }, transaction });
  if (existing) return;

  const profile = buildProfile(participant, index);
  if (!isAnswerPlan(plan)) {
    // em_andamento: aceitou o consentimento, ainda não enviou.
    await participant.update({ status: 'em_andamento', consentAt: profile.consentAt }, { transaction });
    return;
  }

  const answers = buildAnswers(QUESTIONS, plan, participant.email);
  await AssessmentResponse.create({
    participantId: participant.id,
    ...buildResponseFields(answers),
    submittedAt: profile.submittedAt,
  }, { transaction });
  await participant.update({
    status: 'concluido', consentAt: profile.consentAt, role: profile.role, tools: profile.tools,
  }, { transaction });
}

// Turma exemplo com os Iniciantes da primeira empresa (grupo → turma, de forma manual, seção 7).
async function seedTurmaMembers(turma, transaction) {
  if (await TurmaParticipant.count({ where: { turmaId: turma.id }, transaction }) > 0) return;
  const starters = await Participant.findAll({
    where: { companyId: turma.companyId },
    include: [{ model: AssessmentResponse, as: 'response', where: { overallLevel: turma.sourceLevel } }],
    order: [['id', 'ASC']],
    transaction,
  });
  for (const p of starters) {
    await TurmaParticipant.findOrCreate({
      where: { participantId: p.id },
      defaults: { turmaId: turma.id },
      transaction,
    });
  }
}

// RF-19: admin, 2 empresas, participantes com links, respostas nos 4 níveis e 1 turma populada.
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
      const people = buildParticipants(demo);
      for (const [index, person] of people.entries()) {
        const [participant] = await Participant.findOrCreate({
          where: { companyId: company.id, email: person.email },
          defaults: { name: person.name, area: person.area },
          transaction,
        });
        await seedResponse(participant, demo.plans[index], index, transaction);
      }
      companies.push(company);
    }

    const [turma] = await Turma.findOrCreate({
      where: { companyId: companies[0].id, name: DEMO_TURMA.name },
      defaults: { sourceLevel: DEMO_TURMA.sourceLevel, offer: DEMO_TURMA.offer },
      transaction,
    });
    await seedTurmaMembers(turma, transaction);

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
