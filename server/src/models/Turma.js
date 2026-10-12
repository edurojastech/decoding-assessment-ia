import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { LEVELS } from '../constants.js';

export const Turma = sequelize.define('Turma', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true },
  },
  sourceLevel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: { isIn: [LEVELS] },
  },
  offer: { type: DataTypes.TEXT, allowNull: true },
});
