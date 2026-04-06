// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prismaClient';
import { loginSchema } from '../validations/auth.validation';
import { handlePrismaError } from '../lib/errorHandler';

export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { email, password } = validation.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export const getMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No hay token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
