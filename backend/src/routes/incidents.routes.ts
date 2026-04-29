// src/routes/incidents.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getIncidents, getIncidentsByPatient, createIncident } from '../controllers/incidents.controller';

const router = Router();

/**
 * @swagger
 * /incidents:
 *   get:
 *     summary: Obtener todas las incidencias
 *     tags: [Incidents]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 */
router.get('/', authenticate, getIncidents);

/**
 * @swagger
 * /incidents/{patientId}:
 *   get:
 *     summary: Obtener incidencias de un paciente
 *     tags: [Incidents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 */
router.get('/:patientId', authenticate, getIncidentsByPatient);

/**
 * @swagger
 * /incidents:
 *   post:
 *     summary: Registrar una incidencia
 *     tags: [Incidents]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, type, description]
 *             properties:
 *               patientId: { type: string, format: uuid }
 *               type: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Incidencia registrada
 *       400:
 *         description: Validación fallida
 */
router.post('/', authenticate, createIncident);

export default router;
