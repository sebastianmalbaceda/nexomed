import request from 'supertest';
import express from 'express';
import patientRoutes from '../routes/patients.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

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

describe('Patient Endpoints', () => {
  describe('GET /api/patients', () => {
    it('debe devolver lista de pacientes con auth', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('debe devolver 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/patients/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
