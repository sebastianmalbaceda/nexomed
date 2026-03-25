// src/controllers/incidents.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prismaClient';
import { AuthRequest } from '../middlewares/auth.middleware';

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
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/incidents — registrar incidencia
export const createIncident = async (req: AuthRequest, res: Response) => {
  const { patientId, type, description } = req.body;
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
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};
