// src/validations/diagnosticTest.validation.ts
import { z } from 'zod';

export const createDiagnosticTestSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  type: z.string().min(1, 'El tipo de prueba es obligatorio'),
  name: z.string().min(1, 'El nombre de la prueba es obligatorio'),
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha programada inválida')
});

export const updateTestResultSchema = z.object({
  result: z.string().min(1, 'El resultado es obligatorio')
});

export type CreateDiagnosticTestInput = z.infer<typeof createDiagnosticTestSchema>;
export type UpdateTestResultInput = z.infer<typeof updateTestResultSchema>;
