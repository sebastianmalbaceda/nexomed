// src/controllers/careRecords.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// POST /api/cares — registrar cuidado o constante
export const createCareRecord = async (req: AuthRequest, res: Response) => {
  const { patientId, type, value, unit, notes } = req.body;
  try {
    const care = await prisma.careRecord.create({
      data: {
        patientId,
        type,      // ej: "tension", "temperatura", "cura", "higiene"
        value,
        unit,
        notes,
        recordedById: req.user!.id
      }
    });
    res.status(201).json(care);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// GET /api/cares/:patientId — historial de cuidados de un paciente
export const getCareRecords = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const records = await prisma.careRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      include: { recordedBy: { select: { name: true, role: true } } }
    });
    res.json(records);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};