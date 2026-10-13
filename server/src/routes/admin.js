import { Router } from 'express';
import { Company, Participant, AssessmentResponse, Turma } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { levelDistribution } from '../scoring/aggregate.js';
import { coverageOf, toRecord } from '../services/reportCompany.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

function companyNumbers(participants) {
  const records = participants.filter((p) => p.status === 'concluido' && p.response).map(toRecord);
  const { label, ...coverage } = coverageOf(participants);
  return { label, ...coverage, distribution: levelDistribution(records) };
}

// RF-17: visão geral de todas as empresas — micro (cada empresa) e macro (soma dos respondentes).
adminRouter.get('/overview', async (req, res) => {
  const companies = await Company.findAll({
    order: [['name', 'ASC']],
    include: [
      {
        model: Participant,
        as: 'participants',
        attributes: ['id', 'status', 'area'],
        include: [{ model: AssessmentResponse, as: 'response', attributes: ['overallLevel', 'overallScore'] }],
      },
      { model: Turma, as: 'turmas', attributes: ['id'] },
    ],
  });

  res.json({
    totals: { companies: companies.length, ...companyNumbers(companies.flatMap((c) => c.participants)) },
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      turmas: c.turmas.length,
      ...companyNumbers(c.participants),
    })),
  });
});
