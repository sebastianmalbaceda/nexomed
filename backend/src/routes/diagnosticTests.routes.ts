// src/routes/diagnosticTests.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getDiagnosticTests, createDiagnosticTest, addTestResult } from '../controllers/diagnosticTests.controller';

const router = Router();

router.get('/:patientId', authenticate, getDiagnosticTests);
router.post('/', authenticate, authorize('DOCTOR'), createDiagnosticTest);
router.put('/:id/result', authenticate, authorize('DOCTOR', 'NURSE'), addTestResult);

export default router;
