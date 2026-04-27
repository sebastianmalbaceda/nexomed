import { z } from 'zod';

const shiftSchema = z.enum(['morning', 'afternoon', 'night']);

export const getScheduleQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
  shift: shiftSchema.optional(),
  patientId: z.string().uuid('ID de paciente inválido').optional(),
});

export type GetScheduleQuery = z.infer<typeof getScheduleQuerySchema>;
export type ShiftKey = z.infer<typeof shiftSchema>;
