// src/controllers/beds.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { assignBedSchema } from '../validations/bed.validation';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/beds — mapa de camas con paciente asignado
export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      include: { patient: true },
      orderBy: [{ room: 'asc' }, { letter: 'asc' }]
    });
    res.json(beds);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/beds/:id/assign — asignar paciente a cama
export const assignBed = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const validation = assignBedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { patientId } = validation.data;

  try {
    const bed = await prisma.bed.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!bed) {
      return res.status(404).json({ error: 'Cama no encontrada' });
    }

    if (bed.patient) {
      return res.status(409).json({ error: 'La cama ya está ocupada' });
    }

    const updatedBed = await prisma.bed.update({
      where: { id },
      data: {
        patient: {
          connect: { id: patientId }
        }
      },
      include: { patient: true }
    });

    res.json(updatedBed);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/beds/:id/release — liberar cama (dar de alta)
export const releaseBed = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  try {
    const bed = await prisma.bed.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!bed) {
      return res.status(404).json({ error: 'Cama no encontrada' });
    }

    if (!bed.patient) {
      return res.status(400).json({ error: 'La cama ya está libre' });
    }

    await prisma.patient.update({
      where: { id: bed.patient.id },
      data: { bedId: null }
    });

    const updatedBed = await prisma.bed.findUnique({
      where: { id },
      include: { patient: true }
    });

    res.json(updatedBed);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
