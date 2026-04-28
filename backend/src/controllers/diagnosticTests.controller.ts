// src/controllers/diagnosticTests.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createDiagnosticTestSchema, updateTestResultSchema } from '../validations/diagnosticTest.validation';
import { handlePrismaError } from '../lib/errorHandler';
import { notifyNursesAboutDiagnosticTest } from '../services/notification.service';

// GET /api/tests/:patientId — pruebas diagnósticas de un paciente
export const getDiagnosticTests = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { patientId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        requestedBy: { select: { name: true } }
      }
    });
    const formatted = tests.map(t => ({ ...t, requestedBy: t.requestedBy.name }));
    res.json(formatted);
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

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    const typeLabel = type === 'LAB' ? 'Laboratorio' : 'Diagnóstico por imagen';

    await notifyNursesAboutDiagnosticTest(
      patientId,
      'TEST_NEW',
      `Nueva prueba de ${typeLabel} programada para ${patient?.name ?? 'paciente'}: ${name}`
    );

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
