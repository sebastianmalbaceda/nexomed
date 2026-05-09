// src/validations/diagnosticTest.validation.ts
import { z } from 'zod';
import { DiagnosticTestType, DiagnosticTestStatus } from '@prisma/client';

export const createDiagnosticTestSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  type: z.nativeEnum(DiagnosticTestType),
  name: z.string().min(1, 'El nombre de la prueba es obligatorio'),
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha programada inválida')
});

export const updateTestResultSchema = z.object({
  result: z.string().min(1, 'El resultado es obligatorio')
});

export const updateDiagnosticTestSchema = z.object({
  type: z.nativeEnum(DiagnosticTestType).optional(),
  name: z.string().min(1).optional(),
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)) || !val).optional(),
  status: z.nativeEnum(DiagnosticTestStatus).optional()
});

export const updateTestStatusSchema = z.object({
  status: z.nativeEnum(DiagnosticTestStatus)
});

export type CreateDiagnosticTestInput = z.infer<typeof createDiagnosticTestSchema>;
export type UpdateTestResultInput = z.infer<typeof updateTestResultSchema>;
export type UpdateDiagnosticTestInput = z.infer<typeof updateDiagnosticTestSchema>;
