// src/routes/medications.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getMedications,
  createMedication,
  deactivateMedication,
  administerSchedule
} from '../controllers/medications.controller';

const router = Router();

router.get('/:patientId', authenticate, getMedications);
router.post('/', authenticate, authorize('DOCTOR'), createMedication);
router.put('/:id/deactivate', authenticate, authorize('DOCTOR'), deactivateMedication);
router.post('/schedules/:scheduleId/administer', authenticate, authorize('NURSE', 'TCAE'), administerSchedule);

export default router;
