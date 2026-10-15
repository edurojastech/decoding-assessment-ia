import { DEMO_COMPANIES } from '../seed/data.js';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { config } from '../config.js';
import { createApp } from '../app.js';
import { syncDatabase } from '../models/index.js';
import { seed } from '../seed/seed.js';

const app = createApp();
const { email, password } = config.admin;

beforeAll(async () => {
  await syncDatabase();
  await seed();
});

describe('auth admin (RF-01)', () => {
  it('recusa senha errada', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'errada' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('bloqueia /me e /companies sem sessão', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/companies')).status).toBe(401);
  });

  it('faz login com cookie httpOnly, lista as empresas e faz logout', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/login').send({ email: email.toUpperCase(), password });
    expect(login.status).toBe(200);
    expect(login.body.user).toMatchObject({ email, role: 'admin' });
    expect(login.body.user.passwordHash).toBeUndefined();
    expect(login.headers['set-cookie'][0]).toMatch(/HttpOnly/);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);

    const companies = await agent.get('/api/companies');
    expect(companies.status).toBe(200);
    expect(companies.body).toHaveLength(DEMO_COMPANIES.length);
    for (const c of companies.body) {
      expect(c.invited).toBeGreaterThanOrEqual(15);
      expect(c.invited).toBeLessThanOrEqual(25);
    }

    expect((await agent.post('/api/auth/logout')).status).toBe(204);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('expõe as credenciais demo para a tela de login', async () => {
    const res = await request(app).get('/api/auth/demo');
    expect(res.body).toEqual({ demo: true, email, password });
  });

  it('responde 404 em JSON para rota de API inexistente', async () => {
    const res = await request(app).get('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});
