// src/controllers/medications.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateSchedulesForMedication, reschedulePendingMedication } from '../services/medication.service';
import { notifyNursesAboutMedicationChange } from '../services/notification.service';
import { createMedicationSchema, updateScheduleSchema } from '../validations/medication.validation';
import { handlePrismaError } from '../lib/errorHandler';

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
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// POST /api/medications — prescribir medicación (solo DOCTOR)
export const createMedication = async (req: AuthRequest, res: Response) => {
  const validation = createMedicationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { patientId, drugName, nregistro, dose, route, frequencyHrs, startTime } = validation.data;
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

    await generateSchedulesForMedication(
      medication.id,
      new Date(startTime),
      frequencyHrs,
      24
    );

    await notifyNursesAboutMedicationChange(
      patientId,
      'MED_NEW',
      `Nueva medicación prescrita: ${drugName} ${dose}`
    );

    res.status(201).json(medication);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/medications/:id/deactivate — suspender medicación (solo DOCTOR)
export const deactivateMedication = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!medication) {
      return res.status(404).json({ error: 'Medicación no encontrada' });
    }

    const updated = await prisma.medication.update({
      where: { id },
      data: { active: false }
    });

    await notifyNursesAboutMedicationChange(
      medication.patientId,
      'MED_REMOVED',
      `Medicación retirada: ${medication.drugName}`
    );

    res.json(updated);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/medications/:id/schedule — cambiar horario de medicación (recálculo)
export const updateMedicationSchedule = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  
  const validation = updateScheduleSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { newStartTime } = validation.data;

  try {
    const medication = await prisma.medication.findUnique({
      where: { id }
    });

    if (!medication) {
      return res.status(404).json({ error: 'Medicación no encontrada' });
    }

    await reschedulePendingMedication(
      medication.id,
      new Date(newStartTime),
      medication.frequencyHrs,
      24
    );

    await notifyNursesAboutMedicationChange(
      medication.patientId,
      'MED_CHANGE',
      `Horario de medicación cambiado: ${medication.drugName}`
    );

    res.json({ message: 'Horarios recalculados correctamente' });
  } catch (error) {
    return handlePrismaError(error, res);
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
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
