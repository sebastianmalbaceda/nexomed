import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/users.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

let nurseToken: string;
let doctorToken: string;

beforeAll(async () => {
  const nurseRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
  nurseToken = nurseRes.body.token;

  const doctorRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  doctorToken = doctorRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('User Endpoints', () => {
  describe('GET /api/users/nurses', () => {
    it('debe devolver lista de enfermeros con auth', async () => {
      const res = await request(app)
        .get('/api/users/nurses')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should return at least the seeded nurses
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('debe devolver enfermeros con estructura correcta', async () => {
      const res = await request(app)
        .get('/api/users/nurses')
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        const nurse = res.body[0];
        expect(nurse).toHaveProperty('id');
        expect(nurse).toHaveProperty('name');
        expect(nurse).toHaveProperty('role');
        expect(nurse.role).toBe('NURSE');
      }
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app).get('/api/users/nurses');
      expect(res.status).toBe(401);
    });
  });
});
