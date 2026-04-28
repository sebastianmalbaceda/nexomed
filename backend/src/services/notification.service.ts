// src/services/notification.service.ts
import { prisma } from '../lib/prismaClient';
import { notificationBus } from '../lib/notificationEvents';

export async function notifyNursesAboutMedicationChange(
  patientId: string,
  type: string,
  message: string
) {
  // Find all NURSE users to notify them about the medication change
  const nurses = await prisma.user.findMany({
    where: { role: 'NURSE' }
  });

  if (nurses.length === 0) {
    console.warn('[notifications] No hay enfermeros a quien notificar');
    return;
  }

  const notifications = nurses.map(nurse => ({
    userId: nurse.id,
    type,
    message,
    relatedPatientId: patientId
  }));

  // Insertar primero, luego emitir eventos SSE
  await prisma.notification.createMany({ data: notifications });

  const createdAt = new Date().toISOString();
  for (const nurse of nurses) {
    notificationBus.emit('notification', {
      userId: nurse.id,
      type,
      message,
      relatedPatientId: patientId,
      createdAt,
    });
  }
  console.log(`[notifications] ${type} → ${nurses.length} enfermeros notificados`);
}

export async function notifyNursesAboutDiagnosticTest(
  patientId: string,
  type: string,
  message: string
) {
  const nurses = await prisma.user.findMany({
    where: { role: 'NURSE' }
  });

  if (nurses.length === 0) {
    console.warn('[notifications] No hay enfermeros a quien notificar');
    return;
  }

  await prisma.notification.createMany({
    data: nurses.map(nurse => ({ userId: nurse.id, type, message, relatedPatientId: patientId }))
  });

  const createdAt = new Date().toISOString();
  for (const nurse of nurses) {
    notificationBus.emit('notification', { userId: nurse.id, type, message, relatedPatientId: patientId, createdAt });
  }
  console.log(`[notifications] ${type} → ${nurses.length} enfermeros notificados`);
}
