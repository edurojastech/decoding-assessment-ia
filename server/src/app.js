import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { companiesRouter } from './routes/companies.js';
import { publicRouter } from './routes/public.js';
import { participantsRouter, sendTemplate } from './routes/participants.js';
import { turmasRouter } from './routes/turmas.js';
import { adminRouter } from './routes/admin.js';
import { requireAdmin } from './middleware/auth.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Atrás do proxy do Replit: req.protocol vem do X-Forwarded-Proto (https nos links pessoais).
  app.set('trust proxy', true);
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/participants', participantsRouter);
  app.use('/api/turmas', turmasRouter);
  app.use('/api/admin', adminRouter);
  app.get('/api/template.csv', requireAdmin, sendTemplate);
  app.use('/api/r', publicRouter);

  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

  // ADR-07: em produção o Express serve o build do React na mesma porta.
  if (fs.existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist));
    app.get('/{*splat}', (req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Ocorreu um erro inesperado. Tente novamente.' });
  });

  return app;
}
