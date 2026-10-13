// Diagnóstico consolidado da empresa (RF-13, RF-14; seção 6 do original, "Relatório da empresa").
// Sempre a visão dos respondentes, com a cobertura (regra 5). Nunca uma nota da empresa.
// Os números vêm de scoring/aggregate.js; aqui só se escolhe o texto e se monta a resposta.
import { LEVELS } from '../constants.js';
import { DIMENSIONS } from '../scoring/questions.js';
import {
  areaBreakdown, areaWithMostStarters, dimensionAverages, isClassified, levelDistribution,
  predominantLevel, rankAverages, strongestArea,
} from '../scoring/aggregate.js';
import { OFFERS, OFFER_BY_LEVEL, TURMA_GROUPS, offerForLevel } from '../scoring/recommend.js';

export const RESPONDENTS_VIEW = 'Visão dos respondentes';
const MAIN_SHARE = 60; // % a partir do qual um nível sozinho é "a maior parte"
const DIMENSION_NAMES = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.name]));

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const respondents = (n) => plural(n, 'respondente', 'respondentes');
const joinPt = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`);

// Participante do banco (com `response`) → registro do motor de agregação.
export function toRecord(participant) {
  const r = participant.response;
  return {
    area: participant.area,
    overallLevel: r?.overallLevel ?? null,
    overallScore: r?.overallScore ?? null,
    dimensions: r?.dimensionScores ?? null,
  };
}

export function coverageOf(participants) {
  const invited = participants.length;
  const count = (status) => participants.filter((p) => p.status === status).length;
  const responded = count('concluido');
  return {
    label: RESPONDENTS_VIEW,
    invited,
    responded,
    inProgress: count('em_andamento'),
    pending: count('pendente'),
    coverage: invited ? Math.round((responded / invited) * 100) : 0,
  };
}

// Bloco 2 · Estágio atual: perfil a partir da distribuição (ex.: "a maior parte em Básico e Intermediário").
function stageText(distribution, coverage) {
  const text = [];
  const { classified, incomplete } = distribution;
  if (classified === 0) {
    text.push('Ainda não há respondentes com estágio geral calculado.');
  } else {
    const ranked = distribution.levels
      .filter((l) => l.count > 0)
      .sort((a, b) => b.count - a.count || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
    const main = ranked[0].pct >= MAIN_SHARE || ranked.length === 1 ? ranked.slice(0, 1) : ranked.slice(0, 2);
    main.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
    const mainCount = main.reduce((s, l) => s + l.count, 0);
    const mainPct = Math.round((mainCount / classified) * 100);
    const adjacent = main.length === 1 || LEVELS.indexOf(main[1].level) - LEVELS.indexOf(main[0].level) === 1;
    const lead = adjacent ? 'A maior parte dos respondentes está em' : 'Os respondentes se dividem principalmente entre';
    text.push(`${lead} ${joinPt(main.map((l) => l.level))}: ${mainCount} de ${classified} (${mainPct}%).`);

    const others = distribution.levels.filter((l) => l.count > 0 && !main.includes(l));
    if (others.length) text.push(`Em menor número: ${joinPt(others.map((l) => `${l.level} (${l.count})`))}.`);
    const none = distribution.levels.filter((l) => l.count === 0).map((l) => l.level);
    if (none.length) text.push(`Nenhum respondente em ${joinPt(none)}.`);
  }
  if (incomplete) {
    text.push(`${plural(incomplete, 'respondente ficou', 'respondentes ficaram')} fora da distribuição por preenchimento incompleto.`);
  }
  text.push(`É o perfil de ${coverage.responded} de ${coverage.invited} convidados (${coverage.coverage}% de cobertura), não uma nota da empresa.`);
  return text;
}

const dimensionItem = (id, averages) => ({ id, name: DIMENSION_NAMES[id], ...averages[id] });

// Bloco 3 · Potencialidades: dimensão mais forte e área com os níveis mais altos, com números.
function strengthsBlock(averages, areas, multipleAreas) {
  const [topId] = rankAverages(averages, -1);
  const dimension = topId ? dimensionItem(topId, averages) : null;
  const area = multipleAreas ? strongestArea(areas) : null;
  const text = [];
  if (dimension) {
    text.push(`A dimensão mais forte do conjunto é ${dimension.name}, com média de ${dimension.average} de 100 entre ${respondents(dimension.n)}.`);
  }
  if (area) {
    const high = area.levels['Intermediário'] + area.levels['Avançado'];
    text.push(`A área com os níveis mais altos é ${area.area}: média geral de ${area.averageScore} de 100, `
      + `com ${high} de ${area.classified} em Intermediário ou Avançado.`);
  }
  return {
    dimension,
    area: area && { area: area.area, averageScore: area.averageScore, classified: area.classified },
    text,
  };
}

// Bloco 4 · Lacunas: dimensão mais fraca e área com mais Iniciantes, com números e percentuais.
function gapsBlock(averages, areas, distribution, multipleAreas) {
  const [lowId] = rankAverages(averages, 1);
  const dimension = lowId ? dimensionItem(lowId, averages) : null;
  const starters = distribution.levels[0];
  const most = multipleAreas ? areaWithMostStarters(areas) : null;
  // Empate na contagem: nenhuma área concentra os Iniciantes, e o texto lista as empatadas.
  const tied = most ? areas.filter((a) => a.levels.Iniciante === most.levels.Iniciante) : [];
  const area = tied.length === 1 ? most : null;
  const text = [];
  if (dimension) {
    text.push(`A dimensão mais fraca é ${dimension.name}, com média de ${dimension.average} de 100 entre ${respondents(dimension.n)}.`);
  }
  if (distribution.classified) {
    if (starters.count === 0) {
      text.push('Nenhum respondente está em Iniciante.');
    } else if (tied.length > 1) {
      text.push(`Nenhuma área concentra os Iniciantes: ${joinPt(tied.map((a) => a.area))} têm ${most.levels.Iniciante} cada. `
        + `No total, ${starters.count} de ${distribution.classified} estão em Iniciante (${starters.pct}%).`);
    } else if (area) {
      const share = Math.round((area.levels.Iniciante / area.classified) * 100);
      text.push(`A área com mais Iniciantes é ${area.area}: ${area.levels.Iniciante} de ${area.classified} respondentes da área (${share}%). `
        + `No total, ${starters.count} de ${distribution.classified} estão em Iniciante (${starters.pct}%).`);
    } else {
      text.push(`${starters.count} de ${distribution.classified} respondentes estão em Iniciante (${starters.pct}%).`);
    }
  }
  return {
    dimension,
    area: area && { area: area.area, starters: area.levels.Iniciante, classified: area.classified },
    text,
  };
}

// Foco de um grupo de pessoas: as duas dimensões de menor média (mesma regra das lacunas individuais).
export function groupFocus(records, count = 2) {
  const averages = dimensionAverages(records);
  return rankAverages(averages, 1).slice(0, count).map((id) => dimensionItem(id, averages));
}

// Bloco 6 · Próximos passos: composição sugerida de turmas por maturidade e o foco de cada uma (seção 7).
function nextStepsBlock(records) {
  const classified = records.filter(isClassified);
  return {
    groups: TURMA_GROUPS.map((g) => {
      const members = classified.filter((r) => g.levels.includes(r.overallLevel));
      return { ...g, count: members.length, focus: members.length ? groupFocus(members) : [] };
    }),
    note: 'As turmas são montadas pela Decoding a partir destes grupos, de forma manual e revisável. '
      + 'Se um grupo tiver poucas pessoas, a Decoding decide juntar com o nível vizinho.',
  };
}

/**
 * Recebe os participantes da empresa (com `response`, já filtrados por área se for o caso)
 * e devolve os 6 blocos do consolidado. `allAreas` alimenta o filtro da tela.
 */
export function buildCompanySummary(participants, { area = null, allAreas = [] } = {}) {
  const coverage = coverageOf(participants);
  const records = participants.filter((p) => p.status === 'concluido' && p.response).map(toRecord);
  const distribution = levelDistribution(records);
  const averages = dimensionAverages(records);
  const areas = areaBreakdown(records);
  const multipleAreas = areas.length > 1;

  return {
    scope: { area, areas: allAreas },
    coverage,
    empty: records.length === 0,
    distribution,
    stage: { text: records.length ? stageText(distribution, coverage) : [] },
    dimensions: DIMENSIONS.map((d) => dimensionItem(d.id, averages)),
    strengths: strengthsBlock(averages, areas, multipleAreas),
    gaps: gapsBlock(averages, areas, distribution, multipleAreas),
    areas: {
      dimensions: DIMENSIONS.map((d) => ({ id: d.id, name: d.name })),
      rows: areas.map(({ area: name, respondents: n, classified, averageScore, dimensions, focus }) => ({
        area: name, respondents: n, classified, averageScore, dimensions, focus,
      })),
    },
    nextSteps: nextStepsBlock(records),
  };
}

// --- Grupos por maturidade (RF-15) e turmas (RF-16) -------------------------------------

export function participantItem(p) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    area: p.area,
    level: p.response?.overallLevel ?? null,
    score: p.response?.overallScore ?? null,
    turma: p.turmas?.[0] ? { id: p.turmas[0].id, name: p.turmas[0].name } : null,
  };
}

const byName = (a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id - b.id;
// Incompletos (sem nível) por último.
const levelOrder = (level) => (LEVELS.includes(level) ? LEVELS.indexOf(level) : LEVELS.length);

// RF-15: contagem e lista por nível (seção 7). Só o nível classifica (RN-13).
export function buildGroups(participants) {
  const done = participants.filter((p) => p.status === 'concluido' && p.response);
  const items = done.map(participantItem).sort(byName);
  return {
    coverage: coverageOf(participants),
    levels: LEVELS.map((level) => {
      const list = items.filter((p) => p.level === level);
      return { level, count: list.length, offer: offerForLevel(level), participants: list };
    }),
    incomplete: items.filter((p) => !p.level),
  };
}

// Oferta sugerida: pelo nível de origem; sem ele, pelo nível predominante das pessoas da turma.
export function suggestedOffer(sourceLevel, records) {
  return offerForLevel(sourceLevel ?? predominantLevel(records));
}

// RF-16: turma com composição por nível (gráfico), foco e oferta sugerida.
export function turmaItem(turma, members) {
  const records = members.map(toRecord);
  const classified = records.filter(isClassified);
  const composition = Object.fromEntries(LEVELS.map((level) => [level, classified.filter((r) => r.overallLevel === level).length]));
  return {
    id: turma.id,
    name: turma.name,
    sourceLevel: turma.sourceLevel ?? null,
    offer: turma.offer ?? null,
    suggestedOffer: suggestedOffer(turma.sourceLevel, records),
    composition: { ...composition, incomplete: records.length - classified.length },
    focus: classified.length ? groupFocus(classified) : [],
    participants: members.map(participantItem).sort(byName),
  };
}

// Quadro de turmas: todas as turmas da empresa, os respondentes ainda sem turma e o portfólio (seção 7).
export function buildTurmaBoard(turmas, participants) {
  const membersOf = (turmaId) => participants.filter((p) => p.turmas?.[0]?.id === turmaId);
  return {
    offers: Object.values(OFFERS),
    offerByLevel: OFFER_BY_LEVEL,
    turmas: [...turmas].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id - b.id)
      .map((t) => turmaItem(t, membersOf(t.id))),
    unassigned: participants
      .filter((p) => p.status === 'concluido' && !p.turmas?.length)
      .map(participantItem)
      .sort((a, b) => levelOrder(a.level) - levelOrder(b.level) || byName(a, b)),
  };
}
