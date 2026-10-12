import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { USER_ROLES } from '../constants.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', String(value).trim().toLowerCase());
    },
  },
  passwordHash: { type: DataTypes.STRING(100), allowNull: false },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'admin',
    validate: { isIn: [USER_ROLES] },
  },
}, {
  defaultScope: { attributes: { exclude: ['passwordHash'] } },
  scopes: { withPassword: {} },
});
