// src/services/notification.service.ts
import { prisma } from '../lib/prismaClient';
import { notificationBus } from '../lib/notificationEvents';

export async function notifyNursesAboutMedicationChange(
  patientId: string,
  type: string,
  message: string
) {
  // Find the assigned nurse for this patient (if any)
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { assignedNurseId: true } as any
  });

  // If no nurse is assigned, notify ALL nurses as fallback
  const nurses = (patient as any)?.assignedNurseId
    ? [await prisma.user.findUnique({ where: { id: (patient as any).assignedNurseId } })]
    : await prisma.user.findMany({ where: { role: 'NURSE' } });

  const validNurses = nurses.filter((n): n is NonNullable<typeof n> => n !== null);

  if (validNurses.length === 0) {
    console.warn('[notifications] No hay enfermeros a quien notificar');
    return;
  }

  const notifications = validNurses.map(nurse => ({
    userId: nurse.id,
    type,
    message,
    relatedPatientId: patientId
  }));

  // Insertar primero, luego emitir eventos SSE
  await prisma.notification.createMany({ data: notifications });

  const createdAt = new Date().toISOString();
  for (const nurse of validNurses) {
    notificationBus.emit('notification', {
      userId: nurse.id,
      type,
      message,
      relatedPatientId: patientId,
      createdAt,
    });
  }
  console.log(`[notifications] ${type} → ${validNurses.length} enfermero(s) notificado(s)`);
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

  const notifications = nurses.map(nurse => ({
    userId: nurse.id,
    type,
    message,
    relatedPatientId: patientId
  }));

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

export async function notifyNursesAboutIncident(
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

  const notifications = nurses.map(nurse => ({
    userId: nurse.id,
    type,
    message,
    relatedPatientId: patientId
  }));

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
