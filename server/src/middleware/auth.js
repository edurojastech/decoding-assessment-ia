import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/index.js';

export const AUTH_COOKIE = 'decoding_admin';

export function signAdminToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProduction,
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

// RF-01: protege as rotas do Administrador da Decoding.
export async function requireAdmin(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return res.status(401).json({ error: 'Faça login para continuar.' });

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  const user = await User.findByPk(payload.sub);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Faça login para continuar.' });
  }
  req.user = user;
  next();
}
