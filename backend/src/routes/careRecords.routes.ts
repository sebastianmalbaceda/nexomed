// src/routes/careRecords.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createCareRecord, getCareRecords } from '../controllers/careRecords.controller';

const router = Router();

/**
 * @swagger
 * /cares/{patientId}:
 *   get:
 *     summary: Obtener historial de cuidados de un paciente
 *     tags: [CareRecords]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Historial de cuidados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CareRecord'
 */
router.get('/:patientId', authenticate, getCareRecords);

/**
 * @swagger
 * /cares:
 *   post:
 *     summary: Registrar cuidado o constante (anti-duplicidad 15 min)
 *     tags: [CareRecords]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, type, value]
 *             properties:
 *               patientId: { type: string, format: uuid }
 *               type: { type: string }
 *               value: { type: string }
 *               unit: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Cuidado registrado
 *       400:
 *         description: Validación fallida
 *       409:
 *         description: Registro duplicado (mismo tipo en < 15 min)
 */
router.post('/', authenticate, authorize('DOCTOR', 'NURSE', 'TCAE'), createCareRecord);

export default router;