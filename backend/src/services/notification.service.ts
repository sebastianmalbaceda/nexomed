// src/services/notification.service.ts
import { prisma } from '../lib/prismaClient';

export async function notifyNursesAboutMedicationChange(
  patientId: string,
  type: string,
  message: string
) {
  // Find all NURSE users to notify them about the medication change
  const nurses = await prisma.user.findMany({
    where: { role: 'NURSE' }
  });

  const notifications = nurses.map(nurse => ({
    userId: nurse.id,
    type,
    message,
    relatedPatientId: patientId
  }));

  await prisma.notification.createMany({ data: notifications });
}
