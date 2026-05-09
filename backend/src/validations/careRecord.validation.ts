// src/validations/careRecord.validation.ts
import { z } from 'zod';

export const createCareRecordSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  type: z.string().min(1, 'El tipo de registro es obligatorio'),
  value: z.string().min(1, 'El valor es obligatorio'),
  unit: z.string().optional(),
  notes: z.string().optional()
});

export type CreateCareRecordInput = z.infer<typeof createCareRecordSchema>;
