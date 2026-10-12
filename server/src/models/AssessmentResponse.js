import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { LEVELS } from '../constants.js';

// Valores calculados exclusivamente por server/src/scoring/ (regra 1).
export const AssessmentResponse = sequelize.define('AssessmentResponse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  participantId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  answers: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  dimensionScores: { type: DataTypes.JSON, allowNull: true },
  overallScore: { type: DataTypes.INTEGER, allowNull: true },
  overallLevel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: { isIn: [LEVELS] },
  },
  flags: { type: DataTypes.JSON, allowNull: true },
  selfAvg: { type: DataTypes.FLOAT, allowNull: true },
  practiceAvg: { type: DataTypes.FLOAT, allowNull: true },
  submittedAt: { type: DataTypes.DATE, allowNull: true },
});
