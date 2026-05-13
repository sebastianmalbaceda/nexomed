// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error('[Global Error]', error);

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
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

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Datos inválidos: verifica los tipos y valores enviados' });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Default server error
  res.status(500).json({ error: 'Error interno del servidor' });
}
