import { Sequelize } from 'sequelize';
import { config } from './config.js';

// ADR-02: Postgres quando há DATABASE_URL (Replit), senão SQLite local.
function createSequelize() {
  if (config.databaseUrl) {
    const url = new URL(config.databaseUrl);
    const sslMode = url.searchParams.get('sslmode');
    const useSsl = sslMode ? sslMode !== 'disable' : config.isProduction;
    return new Sequelize(config.databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    });
  }
  return new Sequelize({
    dialect: 'sqlite',
    storage: config.sqliteStorage,
    logging: false,
  });
}

export const sequelize = createSequelize();
