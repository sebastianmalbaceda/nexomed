import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import diagnosticTestsRoutes from '../routes/diagnosticTests.routes';
import { prisma } from '../lib/prismaClient';

jest.mock('../lib/prismaClient', () => ({
  prisma: {
    diagnosticTest: {
      findMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/tests', diagnosticTestsRoutes);

type AsyncListMock = jest.MockedFunction<() => Promise<unknown[]>>;

const mockedPrisma = prisma as unknown as {
  diagnosticTest: {
    findMany: AsyncListMock;
  };
};

let doctorToken: string;
let nurseToken: string;

describe('Diagnostic test endpoints', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    doctorToken = jwt.sign({ id: 'user-1', role: 'DOCTOR' }, process.env.JWT_SECRET);
    nurseToken = jwt.sign({ id: 'user-2', role: 'NURSE' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    mockedPrisma.diagnosticTest.findMany.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tests', () => {
    it('debe devolver la vista global serializada', async () => {
      mockedPrisma.diagnosticTest.findMany.mockResolvedValue([
        {
          id: 'test-1',
          patientId: '11111111-1111-1111-1111-111111111111',
          type: 'LAB',
          name: 'Hemograma',
          scheduledAt: new Date('2026-04-27T09:00:00.000Z'),
          result: null,
          createdAt: new Date('2026-04-26T10:00:00.000Z'),
          requestedBy: { name: 'Dr. Garcia', role: 'DOCTOR' },
          patient: {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Juan Perez Ruiz',
            bed: { room: 101, letter: 'A' },
          },
        },
      ]);

      const res = await request(app)
        .get('/api/tests?status=pending&type=LAB&date=2026-04-27')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      const globalCalls = mockedPrisma.diagnosticTest.findMany.mock.calls as unknown[][];
      const globalCall = globalCalls[0][0] as {
        where: {
          type?: string;
          result?: null;
          scheduledAt?: { gte: Date; lte: Date };
        };
      };
      expect(globalCall.where.type).toBe('LAB');
      expect(globalCall.where.result).toBeFalsy();
      expect(globalCall.where.scheduledAt).toEqual({
        gte: new Date('2026-04-27T00:00:00.000Z'),
        lte: new Date('2026-04-27T23:59:59.999Z'),
      });
      expect(res.body).toEqual([
        expect.objectContaining({
          id: 'test-1',
          requestedBy: 'Dr. Garcia',
          patient: expect.objectContaining({ name: 'Juan Perez Ruiz' }),
        }),
      ]);
    });
  });

  describe('GET /api/tests/:patientId', () => {
    it('debe devolver pruebas de un paciente con requestedBy string', async () => {
      mockedPrisma.diagnosticTest.findMany.mockResolvedValue([
        {
          id: 'test-2',
          patientId: '22222222-2222-2222-2222-222222222222',
          type: 'IMAGING',
          name: 'Rx Torax',
          scheduledAt: new Date('2026-04-27T12:00:00.000Z'),
          result: 'Sin hallazgos agudos',
          requestedBy: { name: 'Dr. House', role: 'DOCTOR' },
          patient: {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Ana Lopez',
            bed: null,
          },
        },
      ]);

      const res = await request(app)
        .get('/api/tests/22222222-2222-2222-2222-222222222222')
        .set('Authorization', `Bearer ${nurseToken}`);

      expect(res.status).toBe(200);
      const patientCalls = mockedPrisma.diagnosticTest.findMany.mock.calls as unknown[][];
      const patientCall = patientCalls[0][0] as {
        where: { patientId: string };
      };
      expect(patientCall.where.patientId).toBe('22222222-2222-2222-2222-222222222222');
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          id: 'test-2',
          requestedBy: 'Dr. House',
        }),
      );
    });
  });
});
