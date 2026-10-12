import { Router } from 'express';
import { Company, Participant } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';

export const companiesRouter = Router();
companiesRouter.use(requireAdmin);

// Listagem base (RF-17 parcial). Cadastro, exclusão e consolidado entram nas Fatias C e D.
companiesRouter.get('/', async (req, res) => {
  const companies = await Company.findAll({
    order: [['name', 'ASC']],
    include: [{ model: Participant, as: 'participants', attributes: ['status'] }],
  });

  res.json(companies.map((company) => {
    const invited = company.participants.length;
    const responded = company.participants.filter((p) => p.status === 'concluido').length;
    return {
      id: company.id,
      name: company.name,
      createdAt: company.createdAt,
      invited,
      responded,
      coverage: invited ? Math.round((responded / invited) * 100) : 0,
    };
  }));
});
