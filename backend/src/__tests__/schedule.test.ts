import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import scheduleRoutes from '../routes/schedule.routes';
import { prisma } from '../lib/prismaClient';

jest.mock('../lib/prismaClient', () => ({
  prisma: {
    medSchedule: {
      findMany: jest.fn(),
    },
    careRecord: {
      findMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/schedule', scheduleRoutes);

type AsyncListMock = jest.MockedFunction<() => Promise<unknown[]>>;

const mockedPrisma = prisma as unknown as {
  medSchedule: { findMany: AsyncListMock };
  careRecord: { findMany: AsyncListMock };
};

let token: string;

describe('Schedule endpoint', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign({ id: 'user-1', role: 'NURSE' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    mockedPrisma.medSchedule.findMany.mockReset();
    mockedPrisma.careRecord.findMany.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/schedule', () => {
    it('debe agregar medicaciones y cuidados ordenados', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);

      mockedPrisma.medSchedule.findMany.mockResolvedValue([
        {
          id: 'med-1',
          medicationId: 'medication-1',
          scheduledAt: oneHourLater,
          administeredAt: null,
          administeredBy: null,
          medication: {
            drugName: 'Paracetamol 1g',
            dose: '1g',
            route: 'IV',
            frequencyHrs: 8,
            patient: {
              id: 'patient-1',
              name: 'Juan Perez Ruiz',
              bed: { room: 101, letter: 'A' },
            },
          },
        },
      ]);

      mockedPrisma.careRecord.findMany.mockResolvedValue([
        {
          id: 'care-1',
          type: 'cura',
          value: 'Cambio de aposito',
          unit: null,
          notes: 'Sin incidencias',
          recordedAt: oneHourAgo,
          patient: {
            id: 'patient-1',
            name: 'Juan Perez Ruiz',
            bed: { room: 101, letter: 'A' },
          },
          recordedBy: { id: 'nurse-1', name: 'Maria Martinez', role: 'NURSE' },
        },
      ]);

      const res = await request(app)
        .get('/api/schedule?shift=morning')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockedPrisma.medSchedule.findMany).toHaveBeenCalled();
      expect(mockedPrisma.careRecord.findMany).toHaveBeenCalled();
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          id: 'care-1',
          source: 'CARE_RECORD',
          status: 'completed',
          room: '101A',
          title: 'Cura',
        }),
      );
      expect(res.body[1]).toEqual(
        expect.objectContaining({
          id: 'med-1',
          source: 'MEDICATION',
          status: 'pending',
          room: '101A',
          title: 'Paracetamol 1g',
        }),
      );
    });

    it('debe devolver 400 si el turno es inválido', async () => {
      const res = await request(app)
        .get('/api/schedule?shift=invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});
