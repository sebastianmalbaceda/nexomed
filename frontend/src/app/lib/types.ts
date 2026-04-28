// ─── Domain types matching Prisma schema exactly ───────────────────────────

export type Role = 'NURSE' | 'DOCTOR' | 'TCAE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Patient {
  id: string;
  dni: string | null;
  name: string;
  /** ISO date string */
  dob: string;
  diagnosis: string;
  allergies: string[];
  dietRestriction: string | null;
  isolationRestriction: string | null;
  mobilityRestriction: string | null;
  /** ISO date string */
  admissionDate: string;
  bedId: string | null;
  bed?: Bed;
}

export interface Bed {
  id: string;
  room: number;
  letter: string;
  floor: number;
  patient?: Patient | null;
}

export interface Medication {
  id: string;
  patientId: string;
  drugName: string;
  nregistro: string | null;
  dose: string;
  route: string;
  frequencyHrs: number;
  /** ISO date string */
  startTime: string;
  active: boolean;
  prescribedById: string;
  /** ISO date string */
  createdAt: string;
  schedules?: MedSchedule[];
}

export interface MedSchedule {
  id: string;
  medicationId: string;
  /** ISO date string */
  scheduledAt: string;
  /** ISO date string or null */
  administeredAt: string | null;
  administeredBy: string | null;
}

export type CareRecordType =
  | 'constante'
  | 'cura'
  | 'higiene'
  | 'balance'
  | 'ingesta';

export interface CareRecord {
  id: string;
  patientId: string;
  type: CareRecordType | string;
  value: string;
  unit: string | null;
  notes: string | null;
  recordedBy: string;
  /** ISO date string */
  recordedAt: string;
}

export type NotificationType = 'MED_CHANGE' | 'MED_NEW' | 'MED_REMOVED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedPatientId: string | null;
  read: boolean;
  /** ISO date string */
  createdAt: string;
}

export type IncidentType = 'MED_REFUSAL' | 'CARE_INCIDENT';

export interface Incident {
  id: string;
  patientId: string;
  type: IncidentType | string;
  description: string;
  reportedBy: string;
  /** ISO date string */
  reportedAt: string;
}

export type DiagnosticTestType = 'LAB' | 'IMAGING';

export interface DiagnosticTest {
  id: string;
  patientId: string;
  type: DiagnosticTestType;
  name: string;
  /** ISO date string */
  scheduledAt: string;
  result: string | null;
  requestedBy: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  /** ISO date string */
  recordedAt: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  temperature: number | null;
}

// ─── API response wrappers ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Pick<User, 'id' | 'name' | 'role'>;
}
