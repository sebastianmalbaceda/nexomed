// src/controllers/patients.controller.ts
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createPatientSchema, updatePatientSchema } from '../validations/patient.validation';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/patients/search?dni=XXX — buscar paciente por DNI (sin filtro discharged)
export const searchPatientByDni = async (req: AuthRequest, res: Response) => {
  const { dni } = req.query as { dni?: string };
  if (!dni) return res.status(400).json({ error: 'DNI requerido' });
  try {
    const patient = await prisma.patient.findFirst({
      where: { dni },
      include: { bed: true }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(patient);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// GET /api/patients — lista pacientes activos (no dados de alta) con su cama
// Query params:
//   assigned=true → solo pacientes con enfermera asignada
//   nurseId=XXX → pacientes asignados a esa enfermera (para que cada enfermera vea sus pacientes)
export const getPatients = async (req: AuthRequest, res: Response) => {
  const { assigned, nurseId } = req.query as { assigned?: string; nurseId?: string };
  try {
    const where: Prisma.PatientWhereInput = { discharged: false };
    if (nurseId) {
      where.assignedNurseId = nurseId;
    } else if (assigned === 'true') {
      where.assignedNurseId = { not: null };
    }
    const patients = await prisma.patient.findMany({
      where,
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
// Si el DNI ya existe y está dado de alta → re-ingreso: actualiza datos, marca discharged=false
// Si el DNI ya existe y NO está dado de alta → error (ya hay un paciente activo con ese DNI)
// Si no existe → crea nuevo paciente
export const createPatient = async (req: AuthRequest, res: Response) => {
  const validation = createPatientSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

    const {
      dni, name, surnames, dob, diagnosis, status, allergies, bedId,
      dietRestriction, isolationRestriction, mobilityRestriction,
    } = validation.data;

  try {
    if (dni) {
      const existing = await prisma.patient.findFirst({ where: { dni } });

      if (existing) {
        if (!existing.discharged) {
          return res.status(409).json({ error: 'Ya existe un paciente activo con este DNI' });
        }
        // Re-ingreso: actualizar datos clínicos, asignar nueva cama y marcar como no dado de alta
        const patient = await prisma.patient.update({
          where: { id: existing.id },
          data: {
            ...(dni !== undefined ? { dni } : {}),
            name,
            surnames: surnames ?? existing?.surnames,
            diagnosis,
            status: status ?? existing?.status,
            ...(allergies !== undefined ? { allergies } : {}),
            bedId: bedId ?? null,
            admissionDate: new Date(),
            discharged: false,
            dischargeDate: null,
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
        dni, name, surnames: surnames ?? '', dob: new Date(dob), diagnosis, status, allergies, bedId,
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

    const { dob, allergies, ...rest } = validation.data;

  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        ...(dob ? { dob: new Date(dob) } : {}),
        ...(allergies !== undefined ? { allergies } : {}),
      },
      include: { bed: true }
    });
    res.json(patient);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// PUT /api/patients/:id/discharge — dar de alta (marca discharged=true, desvincula cama)
export const dischargePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        discharged: true,
        dischargeDate: new Date(),
        bedId: null
      }
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
      take: 500,
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
      const parsed = parseFloat(record.value);
      entry[vitalKey] = Number.isNaN(parsed) ? null : parsed;
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
