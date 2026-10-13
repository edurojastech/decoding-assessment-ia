import { Router } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { sequelize, Company, Participant, AssessmentResponse } from '../models/index.js';
import { TOOLS, publicQuestionnaire } from '../scoring/questions.js';
import { InvalidAnswersError } from '../scoring/score.js';
import { buildResponseFields } from '../services/assessment.js';

// ADR-05: rotas do participante, acessadas só pelo token do link pessoal (sem conta).
export const publicRouter = Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_FOUND = 'Link não encontrado. Confira se o endereço está completo ou fale com quem enviou o convite.';
const ALREADY_DONE = 'Suas respostas já foram registradas.';

// Carrega o participante do token em req.participant; 404 para token inválido ou inexistente.
publicRouter.param('token', async (req, res, next, token) => {
  // Formato validado antes da consulta: no Postgres, um UUID malformado gera erro de tipo.
  if (!UUID.test(token)) return res.status(404).json({ error: NOT_FOUND });
  try {
    const participant = await Participant.findOne({
      where: { token: token.toLowerCase() },
      include: [{ model: Company, as: 'company', attributes: ['name'] }],
    });
    if (!participant) return res.status(404).json({ error: NOT_FOUND });
    req.participant = participant;
    next();
  } catch (err) {
    next(err);
  }
});

const publicParticipant = (p) => ({
  name: p.name,
  email: p.email,
  area: p.area,
  role: p.role,
  tools: p.tools ?? [],
  status: p.status,
  consented: Boolean(p.consentAt),
  companyName: p.company.name,
});

// RF-08/RF-09/RF-10: identificação prefillada, status e questionário (sem pontos).
publicRouter.get('/:token', (req, res) => {
  res.json({ participant: publicParticipant(req.participant), questionnaire: publicQuestionnaire() });
});

const trimmed = (value) => (typeof value === 'string' ? value.trim() : value);

// Valida o corpo do PATCH e devolve só os campos alterados, ou { error }.
function identificationChanges(body) {
  const changes = {};
  for (const field of ['name', 'email', 'area']) {
    if (body[field] === undefined) continue;
    const value = trimmed(body[field]);
    if (typeof value !== 'string' || !value) return { error: 'Preencha nome, e-mail e área.' };
    changes[field] = value;
  }
  if (body.role !== undefined) {
    const role = trimmed(body.role);
    if (role !== null && typeof role !== 'string') return { error: 'Função inválida.' };
    changes.role = role || null;
  }
  if (body.tools !== undefined) {
    const tools = body.tools;
    if (!Array.isArray(tools) || tools.some((t) => !TOOLS.includes(t))) {
      return { error: 'Selecione ferramentas da lista.' };
    }
    if (tools.includes('Nenhuma') && tools.length > 1) {
      return { error: '"Nenhuma" não pode ser combinada com outras ferramentas.' };
    }
    changes.tools = [...new Set(tools)];
  }
  return { changes };
}

// RF-08 + RF-09: registra o consentimento (LGPD) e a correção da identificação.
publicRouter.patch('/:token', async (req, res) => {
  const participant = req.participant;
  if (participant.status === 'concluido') return res.status(409).json({ error: ALREADY_DONE });

  const body = req.body ?? {};
  const consenting = body.consent === true;
  if (!participant.consentAt && !consenting) {
    return res.status(400).json({ error: 'Para continuar, é preciso aceitar o termo de consentimento.' });
  }

  const { changes, error } = identificationChanges(body);
  if (error) return res.status(400).json({ error });

  if (consenting && !participant.consentAt) changes.consentAt = new Date();
  if (participant.status === 'pendente') changes.status = 'em_andamento';

  try {
    await participant.update(changes);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado para outra pessoa desta empresa.' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: 'Confira os dados: e-mail válido, nome e área preenchidos.' });
    }
    throw err;
  }
  res.json({ participant: publicParticipant(participant) });
});

// RF-10 → C2: calcula no backend (motor de scoring/) e salva.
publicRouter.post('/:token/submit', async (req, res) => {
  const participant = req.participant;
  if (participant.status === 'concluido') return res.status(409).json({ error: ALREADY_DONE });
  if (!participant.consentAt) {
    return res.status(400).json({ error: 'Para continuar, é preciso aceitar o termo de consentimento.' });
  }

  let fields;
  try {
    fields = buildResponseFields(req.body?.answers ?? {});
  } catch (err) {
    if (err instanceof InvalidAnswersError) {
      return res.status(400).json({ error: 'Algumas respostas não foram reconhecidas. Recarregue a página e tente de novo.', details: err.errors });
    }
    throw err;
  }

  try {
    await sequelize.transaction(async (transaction) => {
      await AssessmentResponse.create(
        { participantId: participant.id, ...fields, submittedAt: new Date() },
        { transaction },
      );
      await participant.update({ status: 'concluido' }, { transaction });
    });
  } catch (err) {
    // Dois envios simultâneos: o segundo esbarra no participantId único.
    if (err instanceof UniqueConstraintError) return res.status(409).json({ error: ALREADY_DONE });
    throw err;
  }

  res.status(201).json({ status: 'concluido' });
});
