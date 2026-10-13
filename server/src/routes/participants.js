import { Router } from 'express';
import { sequelize, Participant, TurmaParticipant } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { TEMPLATE_CSV } from '../services/csvImport.js';

export const participantsRouter = Router();
participantsRouter.use(requireAdmin);

// RF-18: exclui o participante, a resposta e o vínculo com turma.
participantsRouter.delete('/:id', async (req, res) => {
  const participant = /^\d+$/.test(req.params.id) ? await Participant.findByPk(Number(req.params.id)) : null;
  if (!participant) return res.status(404).json({ error: 'Participante não encontrado.' });
  await sequelize.transaction(async (transaction) => {
    await TurmaParticipant.destroy({ where: { participantId: participant.id }, transaction });
    await participant.destroy({ transaction });
  });
  res.status(204).end();
});

// RF-03: modelo de importação para baixar (seção 2.1 do original).
export function sendTemplate(req, res) {
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="modelo-participantes.csv"',
  });
  res.send(TEMPLATE_CSV);
}
