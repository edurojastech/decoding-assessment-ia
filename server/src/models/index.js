import { sequelize } from '../db.js';
import { Company } from './Company.js';
import { User } from './User.js';
import { Participant } from './Participant.js';
import { AssessmentResponse } from './AssessmentResponse.js';
import { Turma } from './Turma.js';
import { TurmaParticipant } from './TurmaParticipant.js';

// Exclusão em cascata: apagar empresa remove participantes, respostas e turmas (RF-18).
const cascade = { onDelete: 'CASCADE', hooks: true };

Company.hasMany(Participant, { foreignKey: 'companyId', as: 'participants', ...cascade });
Participant.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Participant.hasOne(AssessmentResponse, { foreignKey: 'participantId', as: 'response', ...cascade });
AssessmentResponse.belongsTo(Participant, { foreignKey: 'participantId', as: 'participant' });

Company.hasMany(Turma, { foreignKey: 'companyId', as: 'turmas', ...cascade });
Turma.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Turma.belongsToMany(Participant, {
  through: TurmaParticipant, foreignKey: 'turmaId', otherKey: 'participantId', as: 'participants',
});
Participant.belongsToMany(Turma, {
  through: TurmaParticipant, foreignKey: 'participantId', otherKey: 'turmaId', as: 'turmas',
});

// ADR-08: grupos por maturidade são derivados de AssessmentResponse.overallLevel (sem tabela).

export async function syncDatabase() {
  await sequelize.sync();
}

export { sequelize, Company, User, Participant, AssessmentResponse, Turma, TurmaParticipant };
