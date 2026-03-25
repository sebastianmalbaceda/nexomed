// src/controllers/patients.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/patients — lista todos los pacientes activos con su cama
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { bed: true }
    });
    res.json(patients);
  } catch {
    res.status(500).json({ error: 'Error interno' });
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
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/patients — dar de alta un paciente
export const createPatient = async (req: AuthRequest, res: Response) => {
  const { name, dob, diagnosis, allergies, bedId } = req.body;
  try {
    const patient = await prisma.patient.create({
      data: { name, dob: new Date(dob), diagnosis, allergies, bedId }
    });
    res.status(201).json(patient);
  } catch {
    res.status(500).json({ error: 'Error interno' });
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
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};