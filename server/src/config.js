import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(here, '..');
export const PROJECT_ROOT = path.resolve(SERVER_ROOT, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), quiet: true });

const env = process.env;
const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test' || Boolean(env.VITEST);

const DEV_JWT_SECRET = 'dev-only-secret-nao-usar-em-producao';

if (isProduction && !env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}
if (!env.JWT_SECRET && !isTest) {
  console.warn('[config] JWT_SECRET não definido; usando segredo de desenvolvimento.');
}

export const config = {
  isProduction,
  isTest,
  port: Number(env.PORT) || 3000,
  host: '0.0.0.0',
  // Testes sempre em SQLite na memória, mesmo com DATABASE_URL definido.
  databaseUrl: isTest ? null : env.DATABASE_URL || null,
  sqliteStorage: isTest ? ':memory:' : path.join(SERVER_ROOT, 'data', 'dev.sqlite'),
  jwtSecret: env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: '8h',
  admin: {
    name: 'Administrador Decoding',
    email: (env.ADMIN_EMAIL || 'admin@decoding.demo').toLowerCase(),
    password: env.ADMIN_PASSWORD || 'decoding-demo',
  },
  demoMode: env.DEMO_MODE !== 'false',
  clientDist: path.join(PROJECT_ROOT, 'client', 'dist'),
};
