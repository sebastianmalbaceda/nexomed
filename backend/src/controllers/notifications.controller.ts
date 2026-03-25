// src/controllers/notifications.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/notifications — notificaciones del usuario autenticado
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        patient: { select: { name: true } }
      }
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// PUT /api/notifications/:id/read — marcar como leída
export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const notification = await prisma.notification.update({
      where: { id, userId: req.user!.id },
      data: { read: true }
    });
    res.json(notification);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// PUT /api/notifications/read-all — marcar todas como leídas
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true }
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};