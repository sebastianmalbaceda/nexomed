// src/services/careRecord.service.ts
import { prisma } from '../lib/prismaClient';

const ANTI_DUPLICATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function checkDuplicateCareRecord(patientId: string, type: string) {
  const fifteenMinutesAgo = new Date(Date.now() - ANTI_DUPLICATE_WINDOW_MS);

  const existingRecord = await prisma.careRecord.findFirst({
    where: {
      patientId,
      type,
      recordedAt: {
        gte: fifteenMinutesAgo
      }
    },
    orderBy: {
      recordedAt: 'desc'
    }
  });

  return existingRecord;
}

export async function createCareRecordWithAntiDuplicate(
  patientId: string,
  type: string,
  value: string,
  unit: string | null,
  notes: string | null,
  recordedById: string
) {
  // Check for duplicate records within the last 15 minutes
  const existingRecord = await checkDuplicateCareRecord(patientId, type);

  if (existingRecord) {
    return {
      duplicate: true,
      existingRecord,
      message: `Ya existe un registro de tipo "${type}" para este paciente en los últimos 15 minutos`
    };
  }

  // Create new care record
  const careRecord = await prisma.careRecord.create({
    data: {
      patientId,
      type,
      value,
      unit,
      notes,
      recordedById
    }
  });

  return {
    duplicate: false,
    careRecord
  };
}
