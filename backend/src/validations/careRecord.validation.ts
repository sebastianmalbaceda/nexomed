// src/validations/careRecord.validation.ts
import { z } from 'zod';

export const createCareRecordSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  type: z.enum(['constante', 'constante_tas', 'constante_tad', 'constante_fc', 'constante_temp', 'constante_spo2', 'cura', 'higiene', 'balance', 'ingesta'], { message: 'Tipo de registro no válido' }),
  value: z.string().min(1, 'El valor es obligatorio'),
  unit: z.string().optional(),
  notes: z.string().optional()
});

export type CreateCareRecordInput = z.infer<typeof createCareRecordSchema>;
