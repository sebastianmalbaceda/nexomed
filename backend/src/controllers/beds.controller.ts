// src/controllers/beds.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/beds — mapa de camas con paciente asignado
export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      include: { patient: true },
      orderBy: [{ room: 'asc' }, { letter: 'asc' }]
    });
    res.json(beds);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};