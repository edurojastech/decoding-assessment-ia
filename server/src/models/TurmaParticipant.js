import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Cada participante está em no máximo 1 turma (o participante pertence a uma única empresa).
// Índice explícito: o belongsToMany sobrescreve o `unique` declarado na coluna.
export const TurmaParticipant = sequelize.define('TurmaParticipant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  turmaId: { type: DataTypes.INTEGER, allowNull: false },
  participantId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [{ unique: true, fields: ['participantId'] }],
});
