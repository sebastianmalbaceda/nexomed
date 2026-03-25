// src/routes/notifications.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);

export default router;
