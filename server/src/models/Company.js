import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
    validate: { notEmpty: true },
  },
});
