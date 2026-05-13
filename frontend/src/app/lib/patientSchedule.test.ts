import { describe, expect, it } from 'vitest';
import {
  findMedicationsMissingFromSchedule,
  buildMedicationSchedulePayload,
  formatScheduleDetails,
  formatScheduleTitle,
  getScheduleStatusMeta,
  summarizeScheduleItems,
  type PatientScheduleItem,
} from './patientSchedule';

const baseItem: PatientScheduleItem = {
  id: 'schedule-1',
  source: 'MEDICATION',
  type: 'medication',
  timestamp: '2026-05-13T08:00:00.000Z',
  status: 'pending',
  patientId: 'patient-1',
  patientName: 'Ana Garcia',
  room: '101A',
  title: 'Paracetamol',
  details: '1g · Oral · cada 8h',
};

describe('patient schedule helpers', () => {
  it('maps known schedule statuses to patient-facing labels', () => {
    expect(getScheduleStatusMeta('pending').label).toBe('Pendiente');
    expect(getScheduleStatusMeta('delayed').label).toBe('Retrasada');
    expect(getScheduleStatusMeta('completed').label).toBe('Completada');
  });

  it('summarizes pending, delayed and completed patient tasks', () => {
    const summary = summarizeScheduleItems([
      baseItem,
      { ...baseItem, id: 'schedule-2', status: 'delayed' },
      { ...baseItem, id: 'schedule-3', status: 'completed' },
      { ...baseItem, id: 'schedule-4', status: 'completed' },
    ]);

    expect(summary).toEqual({
      total: 4,
      pending: 1,
      delayed: 1,
      completed: 2,
    });
  });

  it('formats technical care record types as clinical labels', () => {
    expect(formatScheduleTitle({ ...baseItem, source: 'CARE_RECORD', title: 'test_unico_1778635179803', details: '37.5 · °C' })).toBe('Temperatura');
    expect(formatScheduleTitle({ ...baseItem, source: 'CARE_RECORD', title: 'test_tcae_1778635181760', details: '120/80 · mmHg' })).toBe('Tensión arterial');
    expect(formatScheduleDetails({ ...baseItem, source: 'CARE_RECORD', title: 'test_unico_1778635179803', details: '37.5 · °C' })).toBe('37.5 °C');
  });

  it('detects active medications without schedule entries', () => {
    const missing = findMedicationsMissingFromSchedule(
      [
        { id: 'med-1', drugName: 'Antibiotico', active: true },
        { id: 'med-2', drugName: 'Enoxaparina 40mg', active: true },
        { id: 'med-3', drugName: 'Retirada', active: false },
      ],
      [
        {
          ...baseItem,
          source: 'MEDICATION',
          title: 'Antibiotico',
          scheduledAt: '2026-05-13T08:00:00.000Z',
        },
      ],
    );

    expect(missing).toEqual([{ id: 'med-2', drugName: 'Enoxaparina 40mg', active: true }]);
  });

  it('builds a medication schedule update payload from a datetime-local value', () => {
    expect(buildMedicationSchedulePayload('2026-05-13T09:30')).toEqual({
      newStartTime: new Date('2026-05-13T09:30').toISOString(),
    });
  });
});
