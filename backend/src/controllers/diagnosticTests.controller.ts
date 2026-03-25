// src/controllers/diagnosticTests.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/tests/:patientId — pruebas diagnósticas de un paciente
export const getDiagnosticTests = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { patientId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        requestedBy: { select: { name: true, role: true } }
      }
    });
    res.json(tests);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/tests — solicitar prueba diagnóstica (solo DOCTOR)
export const createDiagnosticTest = async (req: AuthRequest, res: Response) => {
  const { patientId, type, name, scheduledAt } = req.body;
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
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// PUT /api/tests/:id/result — registrar resultado
export const addTestResult = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { result } = req.body;
  try {
    const test = await prisma.diagnosticTest.update({
      where: { id },
      data: { result }
    });
    res.json(test);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};
