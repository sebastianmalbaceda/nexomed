// src/routes/users.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getNurses } from '../controllers/users.controller';

const router = Router();

/**
 * @swagger
 * /users/nurses:
 *   get:
 *     summary: Listar enfermeros del sistema (SYS-RF5)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de usuarios con rol NURSE
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string }
 *                   role: { type: string, example: NURSE }
 *       401:
 *         description: No autorizado
 */
router.get('/nurses', authenticate, getNurses);

export default router;
