import request from 'supertest';
import express from 'express';
import careRoutes from '../routes/careRecords.routes';
import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patients.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cares', careRoutes);

let nurseToken: string;
let patientId: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
  nurseToken = loginRes.body.token;

  const patientsRes = await request(app)
    .get('/api/patients')
    .set('Authorization', `Bearer ${nurseToken}`);
  patientId = patientsRes.body[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('CareRecord Endpoints', () => {
  describe('POST /api/cares', () => {
    it('debe crear un cuidado correctamente', async () => {
      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId,
          type: 'constante_temp',
          value: '37.5',
          unit: '°C'
        });
      expect(res.status).toBe(201);
    });

    it('debe devolver 409 por duplicado en menos de 15 min', async () => {
      const uniqueType = 'constante_fc';

      // Primer registro
      await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ patientId, type: uniqueType, value: '72' });

      // Segundo registro del mismo tipo (debe fallar)
      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ patientId, type: uniqueType, value: '75' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('15 minutos');
    });

    it('TCAE también puede crear care records', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tcae.sanchez@nexomed.es', password: 'password123' });
      const tcaeToken = loginRes.body.token;

      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${tcaeToken}`)
        .send({
          patientId,
          type: 'constante_tas',
          value: '120/80',
          unit: 'mmHg'
        });
      expect(res.status).toBe(201);
    });
  });
});
