import request from 'supertest';
import express from 'express';
import incidentRoutes from '../routes/incidents.routes';
import patientRoutes from '../routes/patients.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/incidents', incidentRoutes);

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

describe('Incident Endpoints', () => {
  describe('GET /api/incidents', () => {
    it('debe devolver lista de incidencias con auth', async () => {
      const res = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app).get('/api/incidents');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/incidents/:patientId', () => {
    it('debe devolver incidencias de un paciente', async () => {
      const res = await request(app)
        .get(`/api/incidents/${patientId}`)
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe devolver array vacío para paciente inexistente', async () => {
      const res = await request(app)
        .get('/api/incidents/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/incidents', () => {
    it('debe crear una incidencia correctamente', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId,
          type: 'RECHAZO_MEDICACION',
          description: 'Test de incidencia automatizado ' + Date.now(),
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.type).toBe('RECHAZO_MEDICACION');
    });

    it('debe devolver 400 si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ patientId });
      expect(res.status).toBe(400);
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ patientId, type: 'TEST', description: 'test' });
      expect(res.status).toBe(401);
    });
  });
});
