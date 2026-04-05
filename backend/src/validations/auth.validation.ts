// src/validations/auth.validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export type LoginInput = z.infer<typeof loginSchema>;
