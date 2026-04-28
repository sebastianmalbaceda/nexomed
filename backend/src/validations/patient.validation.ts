// src/validations/patient.validation.ts
import { z } from 'zod';

export const createPatientSchema = z.object({
  dni: z.string().min(9, 'El DNI/NIE debe tener al menos 9 caracteres').optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha de nacimiento inválida'),
  diagnosis: z.string().min(1, 'El diagnóstico es obligatorio'),
  allergies: z.array(z.string()).default([]),
  dietRestriction: z.string().nullable().optional(),
  isolationRestriction: z.string().nullable().optional(),
  mobilityRestriction: z.string().nullable().optional(),
  bedId: z.string().uuid('ID de cama inválido').optional()
});

export const updatePatientSchema = z.object({
  dni: z.string().min(9, 'El DNI/NIE debe tener al menos 9 caracteres').optional(),
  name: z.string().min(1).optional(),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha de nacimiento inválida').optional(),
  diagnosis: z.string().min(1).optional(),
  allergies: z.array(z.string()).optional(),
  dietRestriction: z.string().nullable().optional(),
  isolationRestriction: z.string().nullable().optional(),
  mobilityRestriction: z.string().nullable().optional(),
  bedId: z.string().uuid('ID de cama inválido').nullable().optional()
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
