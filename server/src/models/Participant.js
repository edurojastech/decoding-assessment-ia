import { randomUUID } from 'node:crypto';
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { PARTICIPANT_STATUS } from '../constants.js';

export const Participant = sequelize.define('Participant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', String(value).trim().toLowerCase());
    },
  },
  area: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true },
  },
  // ADR-05: token aleatório do link pessoal /r/:token
  token: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    defaultValue: () => randomUUID(),
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pendente',
    validate: { isIn: [PARTICIPANT_STATUS] },
  },
  consentAt: { type: DataTypes.DATE, allowNull: true },
  // P0b: função (texto curto)
  role: { type: DataTypes.STRING(120), allowNull: true },
  // P0c: ferramentas de IA com acesso (não pontua, RN-12)
  tools: { type: DataTypes.JSON, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['companyId', 'email'] }],
});
