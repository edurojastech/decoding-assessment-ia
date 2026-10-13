// Leitura dos dados da empresa para o consolidado, os grupos e as turmas (RF-13 a RF-16).
import { Participant, AssessmentResponse, Turma } from '../models/index.js';
import { buildTurmaBoard } from './reportCompany.js';

// Participantes com resultado e turma (no máximo uma). `area` filtra (RF-07, seção 8).
export function loadParticipants(companyId, { area, transaction } = {}) {
  const where = { companyId };
  if (area) where.area = area;
  return Participant.findAll({
    where,
    attributes: ['id', 'name', 'email', 'area', 'status'],
    include: [
      {
        model: AssessmentResponse,
        as: 'response',
        attributes: ['overallLevel', 'overallScore', 'dimensionScores', 'flags'],
      },
      { model: Turma, as: 'turmas', attributes: ['id', 'name'], through: { attributes: [] } },
    ],
    order: [['name', 'ASC'], ['id', 'ASC']],
    transaction,
  });
}

export async function loadTurmaBoard(companyId, transaction) {
  const [turmas, participants] = await Promise.all([
    Turma.findAll({ where: { companyId }, transaction }),
    loadParticipants(companyId, { transaction }),
  ]);
  return buildTurmaBoard(turmas, participants);
}
