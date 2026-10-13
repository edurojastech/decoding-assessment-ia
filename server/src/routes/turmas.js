import { Router } from 'express';
import { Op } from 'sequelize';
import { LEVELS } from '../constants.js';
import { sequelize, Participant, Turma, TurmaParticipant } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { loadTurmaBoard } from '../services/companyData.js';
import { offerForLevel } from '../scoring/recommend.js';

// RF-16: turmas manuais e revisáveis (seção 7). As mutações devolvem o quadro atualizado
// ({ turmas, unassigned }), o mesmo de GET /api/companies/:id/turmas.
export const turmasRouter = Router();
turmasRouter.use(requireAdmin);

const NAME_MAX = 120;
const OFFER_MAX = 200;

class TurmaError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');

// Valida os campos editáveis. `partial` = PATCH (só o que veio no corpo).
export async function turmaFields(body, { companyId, exceptId, partial = false }) {
  const fields = {};
  if (!partial || body.name !== undefined) {
    const name = clean(body.name);
    if (!name) throw new TurmaError('Informe o nome da turma.');
    if (name.length > NAME_MAX) throw new TurmaError(`Use no máximo ${NAME_MAX} caracteres.`);
    const others = await Turma.findAll({ where: { companyId }, attributes: ['id', 'name'] });
    const taken = others.some((t) => t.id !== exceptId && t.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'));
    if (taken) throw new TurmaError('Já existe uma turma com esse nome nesta empresa.', 409);
    fields.name = name;
  }
  if (body.sourceLevel !== undefined) {
    if (body.sourceLevel !== null && body.sourceLevel !== '' && !LEVELS.includes(body.sourceLevel)) {
      throw new TurmaError('Nível de origem inválido.');
    }
    fields.sourceLevel = body.sourceLevel || null;
  }
  if (body.offer !== undefined) {
    const offer = body.offer === null ? '' : clean(body.offer);
    if (offer.length > OFFER_MAX) throw new TurmaError(`Use no máximo ${OFFER_MAX} caracteres na oferta.`);
    fields.offer = offer || null;
  }
  // Na criação, sem oferta informada, vale o mapeamento da seção 7 pelo nível de origem.
  if (!partial && body.offer === undefined) fields.offer = offerForLevel(fields.sourceLevel);
  return fields;
}

// IDs de participantes da empresa; recusa quem não for dela.
export async function companyParticipantIds(raw, companyId, transaction) {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.some((id) => !Number.isInteger(id))) {
    throw new TurmaError('Lista de participantes inválida.');
  }
  const ids = [...new Set(raw)];
  if (!ids.length) return [];
  const found = await Participant.count({ where: { id: { [Op.in]: ids }, companyId }, transaction });
  if (found !== ids.length) throw new TurmaError('Há participantes que não são desta empresa.');
  return ids;
}

// Coloca as pessoas na turma; quem estava em outra turma é movido (no máx. 1 turma por pessoa).
export async function assignToTurma(turmaId, participantIds, transaction) {
  if (!participantIds.length) return;
  await TurmaParticipant.destroy({ where: { participantId: { [Op.in]: participantIds } }, transaction });
  await TurmaParticipant.bulkCreate(participantIds.map((participantId) => ({ turmaId, participantId })), { transaction });
}

export function sendTurmaError(err, res) {
  if (err instanceof TurmaError) {
    res.status(err.status).json({ error: err.message });
    return true;
  }
  return false;
}

turmasRouter.param('id', async (req, res, next, id) => {
  try {
    const turma = /^\d+$/.test(id) ? await Turma.findByPk(Number(id)) : null;
    if (!turma) return res.status(404).json({ error: 'Turma não encontrada.' });
    req.turma = turma;
    next();
  } catch (err) {
    next(err);
  }
});

// Renomear, trocar o nível de origem ou a oferta.
turmasRouter.patch('/:id', async (req, res) => {
  try {
    const fields = await turmaFields(req.body ?? {}, { companyId: req.turma.companyId, exceptId: req.turma.id, partial: true });
    await req.turma.update(fields);
  } catch (err) {
    if (sendTurmaError(err, res)) return;
    throw err;
  }
  res.json(await loadTurmaBoard(req.turma.companyId));
});

// Exclui a turma; as pessoas voltam para "sem turma" (nada é apagado delas).
turmasRouter.delete('/:id', async (req, res) => {
  const { companyId } = req.turma;
  await sequelize.transaction(async (transaction) => {
    await TurmaParticipant.destroy({ where: { turmaId: req.turma.id }, transaction });
    await req.turma.destroy({ transaction });
  });
  res.json(await loadTurmaBoard(companyId));
});

// Adiciona pessoas à turma (vindas de "sem turma" ou de outra turma).
turmasRouter.post('/:id/participants', async (req, res) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const ids = await companyParticipantIds(req.body?.participantIds, req.turma.companyId, transaction);
      if (!ids.length) throw new TurmaError('Selecione ao menos uma pessoa.');
      await assignToTurma(req.turma.id, ids, transaction);
    });
  } catch (err) {
    if (sendTurmaError(err, res)) return;
    throw err;
  }
  res.json(await loadTurmaBoard(req.turma.companyId));
});

// Move uma pessoa desta turma para outra da mesma empresa, ou para "sem turma" (toTurmaId null).
turmasRouter.patch('/:id/move', async (req, res) => {
  const { participantId, toTurmaId = null } = req.body ?? {};
  if (!Number.isInteger(participantId)) return res.status(400).json({ error: 'Informe a pessoa a mover.' });
  if (toTurmaId !== null && !Number.isInteger(toTurmaId)) return res.status(400).json({ error: 'Turma de destino inválida.' });

  const link = await TurmaParticipant.findOne({ where: { turmaId: req.turma.id, participantId } });
  if (!link) return res.status(409).json({ error: 'Essa pessoa não está nesta turma. Atualize a página.' });

  if (toTurmaId === null) {
    await link.destroy();
  } else if (toTurmaId !== req.turma.id) {
    const target = await Turma.findByPk(toTurmaId);
    if (!target || target.companyId !== req.turma.companyId) {
      return res.status(400).json({ error: 'A turma de destino não é desta empresa.' });
    }
    await link.update({ turmaId: target.id });
  }
  res.json(await loadTurmaBoard(req.turma.companyId));
});
