// src/controllers/incidents.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createIncidentSchema } from '../validations/incident.validation';
import { handlePrismaError } from '../lib/errorHandler';

// GET /api/incidents/:patientId — incidencias de un paciente
export const getIncidents = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params as { patientId: string };
  try {
    const incidents = await prisma.incident.findMany({
      where: { patientId },
      orderBy: { reportedAt: 'desc' },
      include: {
        reportedBy: { select: { name: true, role: true } }
      }
    });
    res.json(incidents);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

// POST /api/incidents — registrar incidencia
export const createIncident = async (req: AuthRequest, res: Response) => {
  const validation = createIncidentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { patientId, type, description } = validation.data;
  try {
    const incident = await prisma.incident.create({
      data: {
        patientId,
        type,
        description,
        reportedById: req.user!.id
      }
    });
    res.status(201).json(incident);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
