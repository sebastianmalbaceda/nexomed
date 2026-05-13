// src/controllers/beds.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { assignBedSchema, relocateBedSchema } from '../validations/bed.validation';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/beds — mapa de camas con paciente asignado
export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            surnames: true,
            status: true,
            diagnosis: true,
            assignedNurseId: true,
          },
        },
      },
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

// PUT /api/beds/:id/relocate — mover paciente de cama a otra cama
export const relocateBed = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const validation = relocateBedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { targetBedId } = validation.data;

  if (id === targetBedId) {
    return res.status(400).json({ error: 'La cama origen y destino son la misma' });
  }

  try {
    const sourceBed = await prisma.bed.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!sourceBed) {
      return res.status(404).json({ error: 'Cama origen no encontrada' });
    }

    if (!sourceBed.patient) {
      return res.status(400).json({ error: 'La cama origen no tiene paciente' });
    }

    const targetBed = await prisma.bed.findUnique({
      where: { id: targetBedId },
      include: { patient: true }
    });

    if (!targetBed) {
      return res.status(404).json({ error: 'Cama destino no encontrada' });
    }

    if (targetBed.patient) {
      return res.status(409).json({ error: 'La cama destino ya está ocupada' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id: sourceBed.patient!.id },
        data: { bedId: targetBedId }
      });
    });

    const updatedTargetBed = await prisma.bed.findUnique({
      where: { id: targetBedId },
      include: { patient: true }
    });

    res.json(updatedTargetBed);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
