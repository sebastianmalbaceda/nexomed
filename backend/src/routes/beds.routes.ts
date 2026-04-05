// src/routes/beds.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getBeds, assignBed, releaseBed } from '../controllers/beds.controller';

const router = Router();

/**
 * @swagger
 * /beds:
 *   get:
 *     summary: Obtener mapa de todas las camas
 *     tags: [Beds]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de camas con pacientes asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bed'
 */
router.get('/', authenticate, getBeds);

/**
 * @swagger
 * /beds/{id}/assign:
 *   put:
 *     summary: Asignar paciente a una cama
 *     tags: [Beds]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId]
 *             properties:
 *               patientId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cama asignada
 *       404:
 *         description: Cama no encontrada
 *       409:
 *         description: Cama ya ocupada
 */
router.put('/:id/assign', authenticate, authorize('DOCTOR', 'NURSE'), assignBed);

/**
 * @swagger
 * /beds/{id}/release:
 *   put:
 *     summary: Liberar cama (dar de alta)
 *     tags: [Beds]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cama liberada
 *       404:
 *         description: Cama no encontrada
 *       400:
 *         description: Cama ya libre
 */
router.put('/:id/release', authenticate, authorize('DOCTOR', 'NURSE'), releaseBed);

export default router;