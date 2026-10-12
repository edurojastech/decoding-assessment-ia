import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { User } from '../models/index.js';
import { AUTH_COOKIE, authCookieOptions, requireAdmin, signAdminToken } from '../middleware/auth.js';

export const authRouter = Router();

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

authRouter.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const user = await User.scope('withPassword').findOne({ where: { email } });
  const ok = user && await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

  res.cookie(AUTH_COOKIE, signAdminToken(user), authCookieOptions);
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (req, res) => {
  const { maxAge, ...clearOptions } = authCookieOptions;
  res.clearCookie(AUTH_COOKIE, clearOptions);
  res.status(204).end();
});

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// RF-19: credenciais do ambiente de demonstração exibidas na tela de login.
authRouter.get('/demo', (req, res) => {
  if (!config.demoMode) return res.json({ demo: false });
  res.json({ demo: true, email: config.admin.email, password: config.admin.password });
});
