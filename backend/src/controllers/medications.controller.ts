// src/controllers/medications.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/medications/:patientId — medicación activa del paciente
export const getMedications = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const medications = await prisma.medication.findMany({
      where: { patientId, active: true },
      include: {
        schedules: { orderBy: { scheduledAt: 'asc' } },
        prescribedBy: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(medications);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/medications — prescribir medicación (solo DOCTOR)
export const createMedication = async (req: AuthRequest, res: Response) => {
  const { patientId, drugName, nregistro, dose, route, frequencyHrs, startTime } = req.body;
  try {
    const medication = await prisma.medication.create({
      data: {
        patientId,
        drugName,
        nregistro,
        dose,
        route,
        frequencyHrs,
        startTime: new Date(startTime),
        prescribedById: req.user!.id
      }
    });

    // Generar los primeros 3 horarios automáticamente
    const schedules = [];
    for (let i = 0; i < 3; i++) {
      schedules.push({
        medicationId: medication.id,
        scheduledAt: new Date(new Date(startTime).getTime() + i * frequencyHrs * 60 * 60 * 1000)
      });
    }
    await prisma.medSchedule.createMany({ data: schedules });

    res.status(201).json(medication);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// PUT /api/medications/:id/deactivate — suspender medicación (solo DOCTOR)
export const deactivateMedication = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const medication = await prisma.medication.update({
      where: { id },
      data: { active: false }
    });
    res.json(medication);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/medications/schedules/:scheduleId/administer — marcar dosis como administrada
export const administerSchedule = async (req: AuthRequest, res: Response) => {
  const { scheduleId } = req.params as { scheduleId: string };
  try {
    const schedule = await prisma.medSchedule.update({
      where: { id: scheduleId },
      data: {
        administeredAt: new Date(),
        administeredById: req.user!.id
      }
    });
    res.json(schedule);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};