// src/validations/bed.validation.ts
import { z } from 'zod';

export const assignBedSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido')
});

export type AssignBedInput = z.infer<typeof assignBedSchema>;
