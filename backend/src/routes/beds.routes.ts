// src/routes/beds.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getBeds } from '../controllers/beds.controller';

const router = Router();

router.get('/', authenticate, getBeds);

export default router;