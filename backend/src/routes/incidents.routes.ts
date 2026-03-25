// src/routes/incidents.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getIncidents, createIncident } from '../controllers/incidents.controller';

const router = Router();

router.get('/:patientId', authenticate, getIncidents);
router.post('/', authenticate, createIncident);

export default router;
