// src/services/medication.service.ts
import { prisma } from '../lib/prismaClient';

export async function generateSchedulesForMedication(
  medicationId: string,
  startTime: Date,
  frequencyHrs: number,
  hoursToCover: number = 24
) {
  if (!frequencyHrs || frequencyHrs <= 0) {
    throw new Error('Frecuencia inválida: debe ser mayor que 0');
  }

  const schedules = [];
  const endTime = new Date(startTime.getTime() + hoursToCover * 60 * 60 * 1000);
  let current = new Date(startTime);

  while (current < endTime) {
    schedules.push({
      medicationId,
      scheduledAt: new Date(current)
    });
    current = new Date(current.getTime() + frequencyHrs * 60 * 60 * 1000);
  }

  if (schedules.length > 0) {
    await prisma.medSchedule.createMany({ data: schedules });
  }

  return schedules;
}

export async function reschedulePendingMedication(
  medicationId: string,
  newStartTime: Date,
  frequencyHrs: number,
  hoursToCover: number = 24
) {
  if (!frequencyHrs || frequencyHrs <= 0) {
    throw new Error('Frecuencia inválida: debe ser mayor que 0');
  }

  const schedules: { medicationId: string; scheduledAt: Date }[] = [];
  const endTime = new Date(newStartTime.getTime() + hoursToCover * 60 * 60 * 1000);
  let current = new Date(newStartTime);

  while (current < endTime) {
    schedules.push({
      medicationId,
      scheduledAt: new Date(current)
    });
    current = new Date(current.getTime() + frequencyHrs * 60 * 60 * 1000);
  }

  return prisma.$transaction(async (tx) => {
    // Solo eliminar horarios pendientes del rango que vamos a regenerar
    await tx.medSchedule.deleteMany({
      where: {
        medicationId,
        administeredAt: null,
        scheduledAt: {
          gte: newStartTime,
          lte: endTime,
        },
      }
    });

    if (schedules.length > 0) {
      await tx.medSchedule.createMany({ data: schedules });
    }

    return schedules;
  });
}
