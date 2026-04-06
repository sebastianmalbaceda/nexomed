import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('debe devolver 400 si el email es inválido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'no-es-email', password: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe devolver 400 si falta la contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    it('debe devolver 401 con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('debe devolver token con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toHaveProperty('role');
    });
  });
});
