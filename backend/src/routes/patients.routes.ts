// src/routes/patients.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getPatients,
  getPatientById,
  createPatient,
  dischargePatient
} from '../controllers/patients.controller';

const router = Router();

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Listar todos los pacientes
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 */
router.get('/', authenticate, getPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtener ficha completa de un paciente
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ficha del paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente no encontrado
 */
router.get('/:id', authenticate, getPatientById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Dar de alta un nuevo paciente
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dob, diagnosis]
 *             properties:
 *               name: { type: string }
 *               dob: { type: string, format: date-time }
 *               diagnosis: { type: string }
 *               allergies: { type: array, items: { type: string } }
 *               bedId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Paciente creado
 *       400:
 *         description: Validación fallida
 */
router.post('/', authenticate, authorize('DOCTOR', 'NURSE'), createPatient);

/**
 * @swagger
 * /patients/{id}/discharge:
 *   put:
 *     summary: Dar de baja un paciente (liberar cama)
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paciente dado de baja
 *       404:
 *         description: Paciente no encontrado
 */
router.put('/:id/discharge', authenticate, authorize('DOCTOR', 'NURSE'), dischargePatient);

export default router;