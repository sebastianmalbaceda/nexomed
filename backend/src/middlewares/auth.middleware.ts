/*
1. authenticate — comprueba que el usuario ha hecho login (tiene JWT válido)
2. authorize — comprueba que el usuario tiene el rol correcto (ej: solo DOCTOR puede pautar medicación)

*/

// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos Request para añadirle el usuario
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// Comprueba que el token JWT es válido
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'No hay token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    req.user = decoded; // guardamos el usuario en la request
    next();             // dejamos pasar
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Comprueba que el usuario tiene el rol requerido
export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: 'No tienes permisos para esto' });
    next();
  };