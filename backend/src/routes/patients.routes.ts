// src/routes/patients.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  dischargePatient
} from '../controllers/patients.controller';
import { getCareRecords } from '../controllers/careRecords.controller';
import { getIncidents } from '../controllers/incidents.controller';

const router = Router();

// GET /api/patients — listar todos los pacientes
router.get('/', authenticate, getPatients);

// GET /api/patients/:patientId/care-records — historial de cuidados (MED-RF1, SYS-RF2)
router.get('/:patientId/care-records', authenticate, getCareRecords);

// GET /api/patients/:patientId/incidents — incidencias del paciente (alias)
router.get('/:patientId/incidents', authenticate, getIncidents);

// GET /api/patients/:id — ficha completa del paciente
router.get('/:id', authenticate, getPatientById);

// POST /api/patients — dar de alta (crea nuevo o re-ingresa por DNI)
router.post('/', authenticate, authorize('DOCTOR', 'NURSE'), createPatient);

// PUT /api/patients/:id — modificar datos del paciente (SCRUM-31)
router.put('/:id', authenticate, authorize('DOCTOR', 'NURSE'), updatePatient);

// PUT /api/patients/:id/discharge — dar de baja (liberar cama)
router.put('/:id/discharge', authenticate, authorize('DOCTOR', 'NURSE'), dischargePatient);

export default router;
