import type { CareRecord } from './types';

export type BasicCareType = 'higiene' | 'ingesta' | 'balance';

export interface BasicCarePayload {
  patientId: string;
  type: BasicCareType;
  value: string;
  unit?: string;
  notes?: string;
}

const BASIC_CARE_LABELS: Record<BasicCareType, string> = {
  higiene: 'Higiene',
  ingesta: 'Ingesta',
  balance: 'Balance',
};

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildHygieneCareRecord(patientId: string, status: string, notes: string): BasicCarePayload {
  return {
    patientId,
    type: 'higiene',
    value: status,
    notes: cleanOptional(notes),
  };
}

export function buildIntakeCareRecord(patientId: string, meal: string, percent: string): BasicCarePayload {
  const normalizedPercent = percent.trim();

  return {
    patientId,
    type: 'ingesta',
    value: `${meal}: ${normalizedPercent}%`,
    unit: '%',
    notes: meal,
  };
}

export function buildBalanceCareRecord(
  patientId: string,
  intakeMl: string,
  outputMl: string,
  notes: string,
): BasicCarePayload {
  const intake = intakeMl.trim() || '0';
  const output = outputMl.trim() || '0';

  return {
    patientId,
    type: 'balance',
    value: `Entrada ${intake} ml / Salida ${output} ml`,
    unit: 'ml',
    notes: cleanOptional(notes),
  };
}

export function isBasicCareRecord(record: Pick<CareRecord, 'type'>): record is CareRecord & { type: BasicCareType } {
  return record.type === 'higiene' || record.type === 'ingesta' || record.type === 'balance';
}

export function formatBasicCareRecord(record: Pick<CareRecord, 'type' | 'value'>) {
  const type = isBasicCareRecord(record) ? record.type : null;

  return {
    label: type ? BASIC_CARE_LABELS[type] : record.type,
    detail: record.value,
  };
}
