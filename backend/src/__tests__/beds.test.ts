import request from 'supertest';
import express from 'express';
import bedRoutes from '../routes/beds.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/beds', bedRoutes);

let token: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  token = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Bed Endpoints', () => {
  describe('GET /api/beds', () => {
    it('debe devolver todas las camas ordenadas', async () => {
      const res = await request(app)
        .get('/api/beds')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('PUT /api/beds/:id/assign', () => {
    it('debe devolver 400 si falta patientId', async () => {
      const beds = await request(app)
        .get('/api/beds')
        .set('Authorization', `Bearer ${token}`);
      const freeBed = beds.body.find((b: any) => !b.patient);

      if (freeBed) {
        const res = await request(app)
          .put(`/api/beds/${freeBed.id}/assign`)
          .set('Authorization', `Bearer ${token}`)
          .send({});
        expect(res.status).toBe(400);
      }
    });
  });
});
