// src/validations/incident.validation.ts
import { z } from 'zod';

export const createIncidentSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  type: z.string().min(1, 'El tipo de incidencia es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria')
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
