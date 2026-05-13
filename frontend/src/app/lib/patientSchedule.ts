export type PatientScheduleStatus = 'pending' | 'delayed' | 'completed';
export type PatientScheduleSource = 'MEDICATION' | 'CARE_RECORD';

export interface PatientScheduleItem {
  id: string;
  source: PatientScheduleSource;
  type: string;
  timestamp: string;
  status: PatientScheduleStatus;
  patientId: string;
  patientName: string;
  room: string | null;
  title: string;
  details: string;
  scheduledAt?: string;
  administeredAt?: string | null;
  recordedAt?: string;
  completedBy?: { id?: string; name: string; role?: string } | string | null;
}

export interface PatientScheduleSummary {
  total: number;
  pending: number;
  delayed: number;
  completed: number;
}

export interface ScheduleMedication {
  id: string;
  drugName: string;
  active: boolean;
  dose?: string;
  route?: string;
  frequencyHrs?: number;
}

const CARE_TYPE_LABELS: Record<string, string> = {
  constante: 'Constante vital',
  constante_fc: 'Frecuencia cardiaca',
  constante_tas: 'Tensión arterial sistólica',
  constante_tad: 'Tensión arterial diastólica',
  constante_temp: 'Temperatura',
  constante_spo2: 'Saturación de oxígeno',
  cura: 'Cura',
  higiene: 'Higiene',
  balance: 'Balance hídrico',
  ingesta: 'Ingesta',
};

export function getScheduleStatusMeta(status: PatientScheduleStatus) {
  const meta = {
    pending: {
      label: 'Pendiente',
      badge: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    },
    delayed: {
      label: 'Retrasada',
      badge: 'bg-red-100 text-red-700',
      dot: 'bg-red-500',
    },
    completed: {
      label: 'Completada',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    },
  } satisfies Record<PatientScheduleStatus, { label: string; badge: string; dot: string }>;

  return meta[status];
}

export function formatScheduleTitle(item: PatientScheduleItem) {
  if (item.source === 'MEDICATION') {
    return item.title;
  }

  const normalizedTitle = item.title.toLowerCase();
  const details = item.details.toLowerCase();

  if (CARE_TYPE_LABELS[normalizedTitle]) {
    return CARE_TYPE_LABELS[normalizedTitle];
  }

  if (details.includes('mmhg') || /^\d{2,3}\/\d{2,3}/.test(details)) {
    return 'Tensión arterial';
  }

  if (details.includes('°c') || details.includes('ºc')) {
    return 'Temperatura';
  }

  if (details.includes('spo') || details.includes('%')) {
    return 'Saturación de oxígeno';
  }

  return 'Registro de cuidado';
}

export function formatScheduleDetails(item: PatientScheduleItem) {
  return item.details.replace(/\s*·\s*/g, ' ').trim();
}

export function findMedicationsMissingFromSchedule(
  medications: ScheduleMedication[],
  scheduleItems: PatientScheduleItem[],
) {
  const scheduledMedicationNames = new Set(
    scheduleItems
      .filter((item) => item.source === 'MEDICATION')
      .map((item) => item.title.trim().toLowerCase()),
  );

  return medications.filter((medication) =>
    medication.active && !scheduledMedicationNames.has(medication.drugName.trim().toLowerCase()),
  );
}

export function buildMedicationSchedulePayload(datetimeLocalValue: string) {
  return {
    newStartTime: new Date(datetimeLocalValue).toISOString(),
  };
}

export function summarizeScheduleItems(items: PatientScheduleItem[]): PatientScheduleSummary {
  return items.reduce<PatientScheduleSummary>(
    (summary, item) => ({
      total: summary.total + 1,
      pending: summary.pending + (item.status === 'pending' ? 1 : 0),
      delayed: summary.delayed + (item.status === 'delayed' ? 1 : 0),
      completed: summary.completed + (item.status === 'completed' ? 1 : 0),
    }),
    { total: 0, pending: 0, delayed: 0, completed: 0 },
  );
}
