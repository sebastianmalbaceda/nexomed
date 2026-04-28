// src/controllers/diagnosticTests.controller.ts
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createDiagnosticTestSchema, updateTestResultSchema } from '../validations/diagnosticTest.validation';
import { handlePrismaError } from '../lib/errorHandler';

type DiagnosticTestsQuery = {
  patientId?: string;
  type?: string;
  status?: string;
  date?: string;
};

function getDiagnosticTestDayRange(date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  return { start, end };
}

function serializeDiagnosticTest(test: {
  id: string;
  patientId: string;
  type: string;
  name: string;
  scheduledAt: Date;
  result: string | null;
  createdAt?: Date;
  requestedBy?: { name: string; role: string };
  patient?: {
    id: string;
    name: string;
    bed: { room: number; letter: string } | null;
  };
}) {
  return {
    ...test,
    requestedBy: test.requestedBy?.name,
  };
}

function buildDiagnosticTestsWhere(query: DiagnosticTestsQuery) {
  const where: Prisma.DiagnosticTestWhereInput = {};

  if (query.patientId) {
    where.patientId = query.patientId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.status === 'pending') {
    where.result = null;
  }

  if (query.status === 'completed') {
    where.result = { not: null } as never;
  }

  if (query.date) {
    const { start, end } = getDiagnosticTestDayRange(query.date);
    where.scheduledAt = { gte: start, lte: end };
  }

  return where;
}

// GET /api/tests — vista global de pruebas diagnósticas
export const getAllDiagnosticTests = async (req: AuthRequest, res: Response) => {
  const { patientId, type, status, date } = req.query as DiagnosticTestsQuery;

  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: buildDiagnosticTestsWhere({ patientId, type, status, date }),
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        requestedBy: { select: { name: true, role: true } },
        patient: {
          select: {
            id: true,
            name: true,
            bed: { select: { room: true, letter: true } },
          },
        },
      },
    });

    res.json(tests.map(serializeDiagnosticTest));
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// GET /api/tests/:patientId — pruebas diagnósticas de un paciente
export const getDiagnosticTests = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { patientId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        requestedBy: { select: { name: true, role: true } },
        patient: {
          select: {
            id: true,
            name: true,
            bed: { select: { room: true, letter: true } },
          },
        },
      }
    });
    res.json(tests.map(serializeDiagnosticTest));
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// POST /api/tests — solicitar prueba diagnóstica (solo DOCTOR)
export const createDiagnosticTest = async (req: AuthRequest, res: Response) => {
  const validation = createDiagnosticTestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { patientId, type, name, scheduledAt } = validation.data;
  try {
    const test = await prisma.diagnosticTest.create({
      data: {
        patientId,
        type,
        name,
        scheduledAt: new Date(scheduledAt),
        requestedById: req.user!.id
      }
    });
    res.status(201).json(test);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/tests/:id/result — registrar resultado
export const addTestResult = async (req: AuthRequest, res: Response) => {
  const validation = updateTestResultSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { id } = req.params as { id: string };
  const { result } = validation.data;
  try {
    const test = await prisma.diagnosticTest.update({
      where: { id },
      data: { result }
    });
    res.json(test);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
