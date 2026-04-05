// src/validations/patient.validation.ts
import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha de nacimiento inválida'),
  diagnosis: z.string().min(1, 'El diagnóstico es obligatorio'),
  allergies: z.array(z.string()).default([]),
  bedId: z.string().uuid('ID de cama inválido').optional()
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
