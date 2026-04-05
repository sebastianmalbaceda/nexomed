// src/routes/diagnosticTests.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getDiagnosticTests, createDiagnosticTest, addTestResult } from '../controllers/diagnosticTests.controller';

const router = Router();

/**
 * @swagger
 * /tests/{patientId}:
 *   get:
 *     summary: Obtener pruebas diagnósticas de un paciente
 *     tags: [DiagnosticTests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de pruebas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiagnosticTest'
 */
router.get('/:patientId', authenticate, getDiagnosticTests);

/**
 * @swagger
 * /tests:
 *   post:
 *     summary: Programar prueba diagnóstica (solo DOCTOR)
 *     tags: [DiagnosticTests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, type, name, scheduledAt]
 *             properties:
 *               patientId: { type: string, format: uuid }
 *               type: { type: string, enum: [LAB, IMAGING] }
 *               name: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Prueba programada
 *       400:
 *         description: Validación fallida
 */
router.post('/', authenticate, authorize('DOCTOR'), createDiagnosticTest);

/**
 * @swagger
 * /tests/{id}/result:
 *   put:
 *     summary: Registrar resultado de prueba
 *     tags: [DiagnosticTests]
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
 *             required: [result]
 *             properties:
 *               result: { type: string }
 *     responses:
 *       200:
 *         description: Resultado registrado
 *       400:
 *         description: Validación fallida
 *       404:
 *         description: Prueba no encontrada
 */
router.put('/:id/result', authenticate, authorize('DOCTOR', 'NURSE'), addTestResult);

export default router;
