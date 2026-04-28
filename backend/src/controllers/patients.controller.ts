// src/controllers/patients.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createPatientSchema, updatePatientSchema } from '../validations/patient.validation';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/patients — lista todos los pacientes activos con su cama
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { bed: true }
    });
    res.json(patients);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// GET /api/patients/:id — ficha completa del paciente
export const getPatientById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        bed: true,
        medications: { where: { active: true }, include: { schedules: true } },
        careRecords: { orderBy: { recordedAt: 'desc' }, take: 10 }
      }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(patient);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// POST /api/patients — dar de alta un paciente
// Si el DNI ya existe → re-ingreso: actualiza diagnóstico, cama y fecha de admisión
// Si no existe → crea nuevo paciente
export const createPatient = async (req: AuthRequest, res: Response) => {
  const validation = createPatientSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const {
    dni, name, dob, diagnosis, allergies, bedId,
    dietRestriction, isolationRestriction, mobilityRestriction,
  } = validation.data;

  try {
    if (dni) {
      const existing = await prisma.patient.findFirst({ where: { dni } });

      if (existing) {
        // Re-ingreso: actualizar datos clínicos y asignar nueva cama
        const patient = await prisma.patient.update({
          where: { id: existing.id },
          data: {
            diagnosis,
            allergies,
            bedId: bedId ?? null,
            admissionDate: new Date(),
            ...(dietRestriction !== undefined ? { dietRestriction } : {}),
            ...(isolationRestriction !== undefined ? { isolationRestriction } : {}),
            ...(mobilityRestriction !== undefined ? { mobilityRestriction } : {}),
          },
          include: { bed: true }
        });
        return res.status(200).json({ reingreso: true, patient });
      }
    }

    // Alta nueva
    const patient = await prisma.patient.create({
      data: {
        dni, name, dob: new Date(dob), diagnosis, allergies, bedId,
        dietRestriction, isolationRestriction, mobilityRestriction,
      },
      include: { bed: true }
    });
    res.status(201).json({ reingreso: false, patient });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/patients/:id — modificar datos del paciente
export const updatePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const validation = updatePatientSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { dob, ...rest } = validation.data;
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        ...(dob ? { dob: new Date(dob) } : {}),
      },
      include: { bed: true }
    });
    res.json(patient);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/patients/:id/discharge — dar de baja (desvincula la cama)
export const dischargePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: { bedId: null }
    });
    res.json(patient);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// GET /api/patients/:patientId/vitals — obtener vitales del paciente
export const getPatientVitals = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const records = await prisma.careRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
    });

    const vitalTypes: Record<string, string> = {
      constante_tas: 'bloodPressureSystolic',
      constante_tad: 'bloodPressureDiastolic',
      constante_fc: 'heartRate',
      constante_temp: 'temperature',
    };

    const groupedByTime = new Map<string, Record<string, number | null>>();
    for (const record of records) {
      if (!vitalTypes[record.type]) continue;
      const key = record.recordedAt.toISOString();
      if (!groupedByTime.has(key)) {
        groupedByTime.set(key, { bloodPressureSystolic: null, bloodPressureDiastolic: null, heartRate: null, temperature: null });
      }
      const entry = groupedByTime.get(key)!;
      const vitalKey = vitalTypes[record.type];
      entry[vitalKey] = parseFloat(record.value) || null;
    }

    const vitals = Array.from(groupedByTime.entries()).map(([recordedAt, values]) => ({
      id: patientId,
      patientId,
      recordedAt,
      ...values,
    }));

    res.json(vitals);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
