// src/validations/bed.validation.ts
import { z } from 'zod';

export const assignBedSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido')
});

export const relocateBedSchema = z.object({
  targetBedId: z.string().uuid('ID de cama destino inválido')
});

export type AssignBedInput = z.infer<typeof assignBedSchema>;
export type RelocateBedInput = z.infer<typeof relocateBedSchema>;
