import { Router } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { config } from '../config.js';
import { LEVELS, PARTICIPANT_STATUS } from '../constants.js';
import { sequelize, Company, Participant, AssessmentResponse, TurmaParticipant } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { CsvImportError, toCsv, validateImport } from '../services/csvImport.js';

export const companiesRouter = Router();
companiesRouter.use(requireAdmin);

const NOT_FOUND = 'Empresa não encontrada.';
const NAME_MAX = 160;

// Origem dos links pessoais: PUBLIC_URL ou o endereço que o admin está acessando.
const linkBase = (req) => config.publicUrl || `${req.protocol}://${req.get('host')}`;
const participantLink = (base, token) => `${base}/r/${token}`;

function summarize(company) {
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
}

// Devolve o nome limpo ou { error }. Nomes repetidos (sem diferenciar maiúsculas) confundem a operação.
async function validateName(raw, exceptId) {
  const name = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  if (!name) return { error: 'Informe o nome da empresa.' };
  if (name.length > NAME_MAX) return { error: `Use no máximo ${NAME_MAX} caracteres.` };
  const others = await Company.findAll({ attributes: ['id', 'name'] });
  const taken = others.some((c) => c.id !== exceptId && c.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'));
  if (taken) return { error: 'Já existe uma empresa com esse nome.', status: 409 };
  return { name };
}

companiesRouter.param('id', async (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(404).json({ error: NOT_FOUND });
  try {
    const company = await Company.findByPk(Number(id));
    if (!company) return res.status(404).json({ error: NOT_FOUND });
    req.company = company;
    next();
  } catch (err) {
    next(err);
  }
});

// RF-17 (base): lista as empresas com convidados, respondentes e cobertura.
companiesRouter.get('/', async (req, res) => {
  const companies = await Company.findAll({
    order: [['name', 'ASC']],
    include: [{ model: Participant, as: 'participants', attributes: ['status'] }],
  });
  res.json(companies.map(summarize));
});

// RF-02: cadastra a empresa.
companiesRouter.post('/', async (req, res) => {
  const { name, error, status } = await validateName(req.body?.name);
  if (error) return res.status(status ?? 400).json({ error });
  const company = await Company.create({ name });
  res.status(201).json({ ...summarize({ ...company.get(), participants: [] }), areas: [] });
});

// Detalhe com cobertura, contagem por status e áreas presentes (opções do filtro, RF-07).
companiesRouter.get('/:id', async (req, res) => {
  const participants = await Participant.findAll({
    where: { companyId: req.company.id },
    attributes: ['status', 'area'],
  });
  const statusCounts = Object.fromEntries(PARTICIPANT_STATUS.map((s) => [s, 0]));
  for (const p of participants) statusCounts[p.status] += 1;
  const areas = [...new Set(participants.map((p) => p.area))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  res.json({ ...summarize({ ...req.company.get(), participants }), statusCounts, areas });
});

// Renomear (completa o CRUD de RF-02).
companiesRouter.patch('/:id', async (req, res) => {
  const { name, error, status } = await validateName(req.body?.name, req.company.id);
  if (error) return res.status(status ?? 400).json({ error });
  await req.company.update({ name });
  res.json({ id: req.company.id, name: req.company.name });
});

// RF-18: exclui a empresa com participantes, respostas e turmas.
companiesRouter.delete('/:id', async (req, res) => {
  await sequelize.transaction(async (transaction) => {
    const participants = await Participant.findAll({
      where: { companyId: req.company.id }, attributes: ['id'], transaction,
    });
    await TurmaParticipant.destroy({ where: { participantId: participants.map((p) => p.id) }, transaction });
    await req.company.destroy({ transaction });
  });
  res.status(204).end();
});

// RF-03 + RF-04 + RF-05: importa as linhas válidas (cada uma recebe token e link) e devolve
// os erros por linha. O upload de arquivo é lido no navegador e chega aqui como texto.
companiesRouter.post('/:id/participants/import', async (req, res) => {
  const csv = req.body?.csv;
  if (typeof csv !== 'string' || !csv.trim()) {
    return res.status(400).json({ error: 'Cole o conteúdo ou envie um arquivo CSV.' });
  }

  const existing = await Participant.findAll({ where: { companyId: req.company.id }, attributes: ['email'] });
  let result;
  try {
    result = validateImport(csv, new Set(existing.map((p) => p.email)));
  } catch (err) {
    if (err instanceof CsvImportError) return res.status(400).json({ error: err.message });
    throw err;
  }

  try {
    await sequelize.transaction((transaction) => Participant.bulkCreate(
      result.rows.map(({ name, email, area }) => ({ companyId: req.company.id, name, email, area })),
      { validate: true, transaction },
    ));
  } catch (err) {
    // Outra importação para a mesma empresa gravou um destes e-mails no meio do caminho.
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Alguns e-mails acabaram de ser cadastrados. Confira a lista e importe de novo.' });
    }
    throw err;
  }

  res.status(201).json({ imported: result.rows.length, errors: result.errors });
});

// Filtros de RF-07 (área, nível, status). Devolve { where, include } ou { error }.
function participantQuery(company, query) {
  const { area, level, status } = query;
  if (status && !PARTICIPANT_STATUS.includes(status)) return { error: 'Status inválido.' };
  if (level && !LEVELS.includes(level)) return { error: 'Nível inválido.' };
  const where = { companyId: company.id };
  if (status) where.status = status;
  if (area) where.area = area;
  return {
    where,
    include: [{
      model: AssessmentResponse,
      as: 'response',
      attributes: ['overallLevel', 'overallScore', 'flags', 'submittedAt'],
      required: Boolean(level),
      where: level ? { overallLevel: level } : undefined,
    }],
    order: [['name', 'ASC'], ['id', 'ASC']],
  };
}

// RF-07: lista com status, nível e link pessoal.
companiesRouter.get('/:id/participants', async (req, res) => {
  const { error, ...query } = participantQuery(req.company, req.query);
  if (error) return res.status(400).json({ error });
  const base = linkBase(req);
  const participants = await Participant.findAll(query);
  res.json(participants.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    area: p.area,
    status: p.status,
    level: p.response?.overallLevel ?? null,
    score: p.response?.overallScore ?? null,
    incomplete: Boolean(p.response?.flags?.incomplete),
    submittedAt: p.response?.submittedAt ?? null,
    link: participantLink(base, p.token),
  })));
});

const slug = (text) => text
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'empresa';

// RF-06: CSV com nome, e-mail e link (respeita os mesmos filtros da lista).
companiesRouter.get('/:id/participants/export', async (req, res) => {
  const { error, ...query } = participantQuery(req.company, req.query);
  if (error) return res.status(400).json({ error });
  const base = linkBase(req);
  const participants = await Participant.findAll({ ...query, attributes: ['id', 'name', 'email', 'token'] });
  const csv = toCsv([['nome', 'email', 'link'], ...participants.map((p) => [p.name, p.email, participantLink(base, p.token)])]);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="links-${slug(req.company.name)}.csv"`,
  });
  res.send(csv);
});

