// src/lib/errorHandler.ts
import { Response } from 'express';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown, res: Response) {
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
      case 'P2021':
        return res.status(500).json({ error: 'Error de base de datos: tabla no encontrada' });
      case 'P2022':
        return res.status(500).json({ error: 'Error de base de datos: columna no encontrada' });
      default:
        return res.status(500).json({ error: 'Error de base de datos' });
    }
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
}
