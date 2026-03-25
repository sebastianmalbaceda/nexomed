// src/routes/careRecords.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createCareRecord, getCareRecords } from '../controllers/careRecords.controller';

const router = Router();

router.get('/:patientId', authenticate, getCareRecords);
router.post('/', authenticate, authorize('NURSE', 'TCAE'), createCareRecord);

export default router;