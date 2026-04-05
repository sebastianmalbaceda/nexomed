import request from 'supertest';
import express from 'express';
import medicationRoutes from '../routes/medications.routes';
import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patients.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);

let token: string;
let patientId: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  token = loginRes.body.token;

  const patientsRes = await request(app)
    .get('/api/patients')
    .set('Authorization', `Bearer ${token}`);
  patientId = patientsRes.body[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Medication Endpoints', () => {
  describe('GET /api/medications/:patientId', () => {
    it('debe devolver medicación activa del paciente', async () => {
      const res = await request(app)
        .get(`/api/medications/${patientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/medications', () => {
    it('debe devolver 400 si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${token}`)
        .send({ patientId });
      expect(res.status).toBe(400);
    });

    it('debe devolver 403 si no es DOCTOR', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
      const nurseToken = loginRes.body.token;

      const res = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId,
          drugName: 'Test',
          dose: '10mg',
          route: 'oral',
          frequencyHrs: 8,
          startTime: new Date().toISOString()
        });
      expect(res.status).toBe(403);
    });
  });
});
