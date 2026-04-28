import { prisma } from '../lib/prismaClient';
import type { GetScheduleQuery, ShiftKey } from '../validations/schedule.validation';

type DateRange = { start: Date; end: Date };

const SHIFT_RANGES: Record<ShiftKey, { startHour: number; endHour: number }> = {
  morning: { startHour: 7, endHour: 15 },
  afternoon: { startHour: 15, endHour: 23 },
  night: { startHour: 23, endHour: 7 },
};

const CARE_TYPE_LABELS: Record<string, string> = {
  constante: 'Constante vital',
  cura: 'Cura',
  higiene: 'Higiene',
  balance: 'Balance hídrico',
  ingesta: 'Ingesta',
};

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function buildDayRange(dateInput?: string): DateRange {
  const baseDate = dateInput ? new Date(`${dateInput}T00:00:00.000Z`) : startOfUtcDay(new Date());
  const start = startOfUtcDay(baseDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);
  return { start, end };
}

function buildShiftRange(dayRange: DateRange, shift: ShiftKey): DateRange {
  const { startHour, endHour } = SHIFT_RANGES[shift];
  const start = new Date(dayRange.start);
  start.setUTCHours(startHour, 0, 0, 0);

  const end = new Date(dayRange.start);
  if (shift === 'night') {
    end.setUTCDate(end.getUTCDate() + 1);
  }
  end.setUTCHours(endHour, 0, 0, 0);
  end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);

  return { start, end };
}

function roomLabel(bed: { room: number; letter: string } | null) {
  return bed ? `${bed.room}${bed.letter}` : null;
}

function formatMedicationStatus(scheduledAt: Date, administeredAt: Date | null, now: Date) {
  if (administeredAt) {
    return 'completed';
  }

  return scheduledAt.getTime() < now.getTime() ? 'delayed' : 'pending';
}

export async function getScheduleItems(query: GetScheduleQuery) {
  const dayRange = buildDayRange(query.date);
  const range = query.shift ? buildShiftRange(dayRange, query.shift) : dayRange;
  const now = new Date();

  const medicationSchedules = await prisma.medSchedule.findMany({
    where: {
      scheduledAt: { gte: range.start, lte: range.end },
      medication: query.patientId ? { patientId: query.patientId } : undefined,
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      medication: {
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              bed: { select: { room: true, letter: true } },
            },
          },
        },
      },
      administeredBy: { select: { id: true, name: true, role: true } },
    },
  });

  const careRecords = await prisma.careRecord.findMany({
    where: {
      recordedAt: { gte: range.start, lte: range.end },
      patientId: query.patientId,
    },
    orderBy: { recordedAt: 'asc' },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          bed: { select: { room: true, letter: true } },
        },
      },
      recordedBy: { select: { id: true, name: true, role: true } },
    },
  });

  const medicationItems = medicationSchedules.map((schedule) => ({
    id: schedule.id,
    source: 'MEDICATION',
    type: 'medication',
    timestamp: schedule.scheduledAt.toISOString(),
    status: formatMedicationStatus(schedule.scheduledAt, schedule.administeredAt, now),
    patientId: schedule.medication.patient.id,
    patientName: schedule.medication.patient.name,
    room: roomLabel(schedule.medication.patient.bed),
    title: schedule.medication.drugName,
    details: `${schedule.medication.dose} · ${schedule.medication.route} · cada ${schedule.medication.frequencyHrs}h`,
    scheduledAt: schedule.scheduledAt,
    administeredAt: schedule.administeredAt,
    completedBy: schedule.administeredBy,
    metadata: {
      medicationId: schedule.medicationId,
      frequencyHrs: schedule.medication.frequencyHrs,
      route: schedule.medication.route,
      dose: schedule.medication.dose,
    },
  }));

  const careItems = careRecords.map((record) => ({
    id: record.id,
    source: 'CARE_RECORD',
    type: 'care-record',
    timestamp: record.recordedAt.toISOString(),
    status: 'completed',
    patientId: record.patient.id,
    patientName: record.patient.name,
    room: roomLabel(record.patient.bed),
    title: CARE_TYPE_LABELS[record.type] ?? record.type,
    details: [record.value, record.unit, record.notes].filter(Boolean).join(' · '),
    recordedAt: record.recordedAt,
    completedBy: record.recordedBy,
    metadata: {
      careRecordType: record.type,
      value: record.value,
      unit: record.unit,
      notes: record.notes,
    },
  }));

  return [...medicationItems, ...careItems].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
