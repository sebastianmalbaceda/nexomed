// src/routes/notifications.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/', authenticate, getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Todas marcadas como leídas
 */
router.put('/read-all', authenticate, markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.put('/:id/read', authenticate, markAsRead);

export default router;
