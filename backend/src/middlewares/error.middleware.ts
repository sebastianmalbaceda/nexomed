// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Global Error]', err);

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Conflicto: ya existe un registro con esos datos' });
      case 'P2025':
        return res.status(404).json({ error: 'Recurso no encontrado' });
      case 'P2003':
        return res.status(400).json({ error: 'Referencia inválida: el recurso relacionado no existe' });
      case 'P2014':
        return res.status(400).json({ error: 'Operación inválida: viola una restricción de la base de datos' });
      default:
        return res.status(500).json({ error: 'Error de base de datos' });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Default server error
  res.status(500).json({ error: 'Error interno del servidor' });
}
