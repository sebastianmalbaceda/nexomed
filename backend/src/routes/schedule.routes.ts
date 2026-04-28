import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getSchedule } from '../controllers/schedule.controller';

const router = Router();

/**
 * @swagger
 * /schedule:
 *   get:
 *     summary: Obtener cronograma agregado de medicaciones y cuidados por fecha o turno
 *     tags: [Schedule]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, example: 2026-04-27 }
 *         description: Fecha base en formato YYYY-MM-DD. Por defecto hoy.
 *       - in: query
 *         name: shift
 *         schema: { type: string, enum: [morning, afternoon, night] }
 *         description: Filtra por turno hospitalario.
 *       - in: query
 *         name: patientId
 *         schema: { type: string, format: uuid }
 *         description: Filtra por paciente.
 *     responses:
 *       200:
 *         description: Lista agregada de eventos clínicos del cronograma
 *       400:
 *         description: Query inválida
 */
router.get('/', authenticate, getSchedule);

export default router;
