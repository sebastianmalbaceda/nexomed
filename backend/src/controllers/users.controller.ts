// src/controllers/users.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/users/nurses — listar enfermeros (SYS-RF5: para selector "ver tareas de X")
export const getNurses = async (_req: AuthRequest, res: Response) => {
  try {
    const nurses = await prisma.user.findMany({
      where: { role: 'NURSE' },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json(nurses);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
