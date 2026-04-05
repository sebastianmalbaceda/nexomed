// src/services/medication.service.ts
import { prisma } from '../lib/prismaClient';

export async function generateSchedulesForMedication(
  medicationId: string,
  startTime: Date,
  frequencyHrs: number,
  hoursToCover: number = 24
) {
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
  // Delete pending schedules (not yet administered)
  await prisma.medSchedule.deleteMany({
    where: {
      medicationId,
      administeredAt: null
    }
  });

  // Generate new schedules from the new start time
  return generateSchedulesForMedication(
    medicationId,
    newStartTime,
    frequencyHrs,
    hoursToCover
  );
}
