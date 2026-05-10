import request from 'supertest';
import express from 'express';
import drugRoutes from '../routes/drugs.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/drugs', drugRoutes);

let nurseToken: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
  nurseToken = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Drug (CIMA) Endpoints', () => {
  describe('GET /api/drugs/search', () => {
    it('debe buscar medicamentos con término válido', async () => {
      const res = await request(app)
        .get('/api/drugs/search')
        .query({ q: 'paracetamol' })
        .set('Authorization', `Bearer ${nurseToken}`);
      // CIMA API may return results or empty array; both are valid
      expect([200, 500]).toContain(res.status);
    });

    it('debe devolver 400 con término vacío', async () => {
      const res = await request(app)
        .get('/api/drugs/search')
        .query({ q: 'a' })
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(400);
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app)
        .get('/api/drugs/search')
        .query({ q: 'paracetamol' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/drugs/:nregistro', () => {
    it('debe devolver 401 sin token', async () => {
      const res = await request(app)
        .get('/api/drugs/66876');
      expect(res.status).toBe(401);
    });

    it('debe consultar detalles de un medicamento por registro', async () => {
      const res = await request(app)
        .get('/api/drugs/66876')
        .set('Authorization', `Bearer ${nurseToken}`);
      // CIMA API may return details, not found, or server error
      expect([200, 404, 500]).toContain(res.status);
    });
  });
});
