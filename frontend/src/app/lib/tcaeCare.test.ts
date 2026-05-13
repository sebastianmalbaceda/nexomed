import { describe, expect, it } from 'vitest';
import {
  buildBalanceCareRecord,
  buildHygieneCareRecord,
  buildIntakeCareRecord,
  formatBasicCareRecord,
  isBasicCareRecord,
} from './tcaeCare';

describe('tcaeCare', () => {
  it('builds a hygiene care record with trimmed notes', () => {
    expect(buildHygieneCareRecord('patient-1', 'Realizada', '  Ducha asistida  ')).toEqual({
      patientId: 'patient-1',
      type: 'higiene',
      value: 'Realizada',
      notes: 'Ducha asistida',
    });
  });

  it('builds an intake care record with meal and percentage', () => {
    expect(buildIntakeCareRecord('patient-1', 'Comida', '75')).toEqual({
      patientId: 'patient-1',
      type: 'ingesta',
      value: 'Comida: 75%',
      unit: '%',
      notes: 'Comida',
    });
  });

  it('builds a balance record when intake or output is present', () => {
    expect(buildBalanceCareRecord('patient-1', '600', '250', '  Buen ritmo  ')).toEqual({
      patientId: 'patient-1',
      type: 'balance',
      value: 'Entrada 600 ml / Salida 250 ml',
      unit: 'ml',
      notes: 'Buen ritmo',
    });
  });

  it('identifies and formats basic care records', () => {
    const record = {
      id: 'care-1',
      patientId: 'patient-1',
      type: 'ingesta',
      value: 'Cena: 50%',
      unit: '%',
      notes: 'Cena',
      recordedBy: 'TCAE',
      recordedAt: '2026-05-13T18:30:00.000Z',
    };

    expect(isBasicCareRecord(record)).toBe(true);
    expect(formatBasicCareRecord(record)).toEqual({
      label: 'Ingesta',
      detail: 'Cena: 50%',
    });
  });
});
