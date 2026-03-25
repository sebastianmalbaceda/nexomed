// src/routes/patients.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getPatients,
  getPatientById,
  createPatient,
  dischargePatient
} from '../controllers/patients.controller';

const router = Router();

router.get('/', authenticate, getPatients);
router.get('/:id', authenticate, getPatientById);
router.post('/', authenticate, authorize('DOCTOR', 'NURSE'), createPatient);
router.put('/:id/discharge', authenticate, authorize('DOCTOR', 'NURSE'), dischargePatient);

export default router;