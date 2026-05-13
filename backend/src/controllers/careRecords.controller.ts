// src/controllers/careRecords.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createCareRecordWithAntiDuplicate } from '../services/careRecord.service';
import { createCareRecordSchema } from '../validations/careRecord.validation';
import { handlePrismaError } from '../lib/errorHandler';

// POST /api/cares — registrar cuidado o constante
export const createCareRecord = async (req: AuthRequest, res: Response) => {
  const validation = createCareRecordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { patientId, type, value, unit, notes } = validation.data;
  try {
    const result = await createCareRecordWithAntiDuplicate(
      patientId,
      type,
      value,
      unit ?? null,
      notes ?? null,
      req.user!.id
    );

    if (result.duplicate) {
      return res.status(409).json({
        error: result.message,
        existingRecord: result.existingRecord
      });
    }

    res.status(201).json(result.careRecord);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// GET /api/cares/:patientId — historial de cuidados de un paciente
export const getCareRecords = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const records = await prisma.careRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 500,
      include: { recordedBy: { select: { name: true, role: true } } }
    });
    res.json(records.map(r => ({ ...r, recordedBy: r.recordedBy?.name ?? '—' })));
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
