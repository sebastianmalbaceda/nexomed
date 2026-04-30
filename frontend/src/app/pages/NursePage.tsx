import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Loader2, User, Pill, ClipboardList,
  CheckCircle2, Activity, Bell, Clock, X, Check,
  FileText, Sunset, Moon, Sun,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { POLLING_INTERVAL_MS, NOTIFICATION_TYPE_LABELS } from '@/lib/constants';
import type { Patient, Medication, CareRecord, Notification, MedSchedule, Incident } from '@/lib/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const CARE_TYPES = [
  { value: 'cura',      label: '🩹 Cura / Herida' },
  { value: 'higiene',   label: '🧼 Higiene' },
  { value: 'balance',   label: '💧 Balance hídrico' },
  { value: 'ingesta',   label: '🍽️ Ingesta' },
  { value: 'constante', label: '📊 Constante vital' },
];

const CARE_COLORS: Record<string, string> = {
  cura:      'bg-orange-100 text-orange-700 border-orange-200',
  higiene:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  balance:   'bg-sky-100 text-sky-700 border-sky-200',
  ingesta:   'bg-amber-100 text-amber-700 border-amber-200',
  constante: 'bg-blue-100 text-blue-700 border-blue-200',
};

const NOTE_TYPES = [
  { value: 'EVOLUTIVO', label: '📋 Evolutivo', color: 'bg-blue-500' },
  { value: 'FIN_TURNO', label: '🔄 Fin de turno', color: 'bg-purple-500' },
  { value: 'TRASLADO',  label: '🚑 Traslado / Procedencia', color: 'bg-amber-500' },
  { value: 'INCIDENCIA', label: '⚠️ Incidencia', color: 'bg-red-500' },
  { value: 'FALL',      label: '🚨 Caída', color: 'bg-red-600' },
  { value: 'MED_REFUSAL', label: '💊 Rechazo medicación', color: 'bg-orange-500' },
];

const NOTE_COLOR: Record<string, string> = {
  EVOLUTIVO:   'bg-blue-100 text-blue-700 border-blue-200',
  FIN_TURNO:   'bg-purple-100 text-purple-700 border-purple-200',
  TRASLADO:    'bg-amber-100 text-amber-700 border-amber-200',
  INCIDENCIA:  'bg-red-100 text-red-700 border-red-200',
  FALL:        'bg-red-100 text-red-700 border-red-200',
  MED_REFUSAL: 'bg-orange-100 text-orange-700 border-orange-200',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shiftLabel(date: Date): string {
  const h = date.getHours();
  if (h >= 7 && h < 15) return '🌅 Mañana';
  if (h >= 15 && h < 23) return '🌆 Tarde';
  return '🌙 Noche';
}

function getCurrentShift(): 'morning' | 'afternoon' | 'night' {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return 'morning';
  if (h >= 15 && h < 23) return 'afternoon';
  return 'night';
}

// ─── Medication Cronogram ─────────────────────────────────────────────────────

interface ShiftBlock {
  key: 'morning' | 'afternoon' | 'night';
  label: string;
  icon: React.ReactNode;
  hours: number[];
  bg: string;
  headerBg: string;
}

const SHIFTS: ShiftBlock[] = [
  {
    key: 'morning',
    label: 'Mañana',
    icon: <Sun className="w-3.5 h-3.5" />,
    hours: [7, 8, 9, 10, 11, 12, 13, 14],
    bg: 'bg-sky-50',
    headerBg: 'bg-sky-100 text-sky-800',
  },
  {
    key: 'afternoon',
    label: 'Tarde',
    icon: <Sunset className="w-3.5 h-3.5" />,
    hours: [15, 16, 17, 18, 19, 20, 21, 22],
    bg: 'bg-orange-50',
    headerBg: 'bg-orange-100 text-orange-800',
  },
  {
    key: 'night',
    label: 'Noche',
    icon: <Moon className="w-3.5 h-3.5" />,
    hours: [23, 0, 1, 2, 3, 4, 5, 6],
    bg: 'bg-indigo-50',
    headerBg: 'bg-indigo-100 text-indigo-800',
  },
];

function MedCronogram({
  medications,
  onAdminister,
  isPending,
}: {
  medications: Medication[];
  onAdminister: (scheduleId: string) => void;
  isPending: boolean;
}) {
  const now = new Date();
  const nowHour = now.getHours();
  const currentShift = getCurrentShift();

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  if (medications.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">Sin medicación activa</p>;
  }

  return (
    <div className="space-y-3">
      {SHIFTS.map((shift) => {
        // Collect all schedules in this shift
        const shiftSchedules: Array<{
          med: Medication;
          schedule: MedSchedule;
          hour: number;
        }> = [];

        for (const med of medications) {
          for (const sched of med.schedules ?? []) {
            const dt = new Date(sched.scheduledAt);
            if (dt < todayStart || dt > todayEnd) continue;
            const h = dt.getHours();
            if (shift.hours.includes(h)) {
              shiftSchedules.push({ med, schedule: sched, hour: h });
            }
          }
        }

        const isCurrentShift = shift.key === currentShift;

        return (
          <div key={shift.key} className={`rounded-2xl border overflow-hidden ${isCurrentShift ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2 px-4 py-2.5 ${shift.headerBg} ${isCurrentShift ? 'ring-2 ring-inset ring-blue-300' : ''}`}>
              {shift.icon}
              <span className="text-xs font-black uppercase tracking-widest">{shift.label}</span>
              {isCurrentShift && (
                <span className="ml-auto text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">TURNO ACTUAL</span>
              )}
              <span className={`${isCurrentShift ? '' : 'ml-auto'} text-[10px] font-bold opacity-60`}>
                {shift.hours[0].toString().padStart(2, '0')}h — {(shift.hours[shift.hours.length - 1] + 1).toString().padStart(2, '0')}h
              </span>
            </div>

            {shiftSchedules.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3 bg-white">Sin dosis en este turno</p>
            ) : (
              <div className="bg-white p-3">
                <div className="space-y-2">
                  {medications.map((med) => {
                    const medShiftSchedules = shiftSchedules.filter(s => s.med.id === med.id);
                    if (medShiftSchedules.length === 0) return null;

                    return (
                      <div key={med.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{med.drugName}</p>
                          <p className="text-[10px] text-slate-400">{med.dose} · {med.route}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {medShiftSchedules
                            .sort((a, b) => a.hour - b.hour)
                            .map(({ schedule, hour }) => {
                              const dt = new Date(schedule.scheduledAt);
                              const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                              const administered = !!schedule.administeredAt;
                              const isPastHour = hour < nowHour || (hour === nowHour);
                              const isOverdue = isPastHour && !administered;

                              return (
                                <button
                                  key={schedule.id}
                                  onClick={() => !administered && onAdminister(schedule.id)}
                                  disabled={administered || isPending}
                                  title={administered ? `Administrado${schedule.administeredAt ? ' a las ' + new Date(schedule.administeredAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}` : isOverdue ? 'Pendiente (vencido) — click para administrar' : 'Próxima dosis — click para administrar'}
                                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                    administered
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 cursor-default'
                                      : isOverdue
                                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 animate-pulse'
                                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {administered
                                    ? <CheckCircle2 className="w-3 h-3" />
                                    : isOverdue
                                    ? <AlertCircle className="w-3 h-3" />
                                    : <Clock className="w-3 h-3" />}
                                  {timeStr}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NursePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Care form
  const [careType, setCareType] = useState('cura');
  const [careValue, setCareValue] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [careSuccess, setCareSuccess] = useState('');
  const [careError, setCareError] = useState('');

  // Note / evolutivo form
  const [noteType, setNoteType] = useState('EVOLUTIVO');
  const [noteText, setNoteText] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteError, setNoteError] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const selected = patients.find(p => p.id === selectedId) ?? null;

  const { data: medications = [], isLoading: loadingMeds } = useQuery({
    queryKey: ['medications', selectedId],
    queryFn: () => api.get<Medication[]>(`/medications/${selectedId}`),
    enabled: !!selectedId,
  });

  const { data: careRecords = [], isLoading: loadingCares } = useQuery({
    queryKey: ['cares', selectedId],
    queryFn: () => api.get<CareRecord[]>(`/cares/${selectedId}`),
    enabled: !!selectedId,
  });

  const { data: incidents = [], isLoading: loadingNotes } = useQuery({
    queryKey: ['incidents', selectedId],
    queryFn: () => api.get<Incident[]>(`/incidents/${selectedId}`),
    enabled: !!selectedId,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    refetchInterval: POLLING_INTERVAL_MS,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const careMutation = useMutation({
    mutationFn: (body: { patientId: string; type: string; value: string; notes?: string }) =>
      api.post<CareRecord>('/cares', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cares', selectedId] });
      setCareValue(''); setCareNotes('');
      setCareSuccess('Cuidado registrado');
      setCareError('');
      setTimeout(() => setCareSuccess(''), 3000);
    },
    onError: (e: Error) => { setCareError(e.message); setCareSuccess(''); },
  });

  const administerMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      api.post(`/medications/schedules/${scheduleId}/administer`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', selectedId] }),
  });

  const noteMutation = useMutation({
    mutationFn: (body: { patientId: string; type: string; description: string }) =>
      api.post<Incident>('/incidents', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents', selectedId] });
      setNoteText('');
      setShowNoteForm(false);
      setNoteSuccess('Nota registrada');
      setNoteError('');
      setTimeout(() => setNoteSuccess(''), 3000);
    },
    onError: (e: Error) => { setNoteError(e.message); setNoteSuccess(''); },
  });

  // ─── Derived state ─────────────────────────────────────────────────────────

  const medNotifications = notifications.filter(
    n => !n.read && n.relatedPatientId === selectedId &&
      ['MED_CHANGE', 'MED_NEW', 'MED_REMOVED'].includes(n.type)
  );

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const pendingMeds = medications.reduce((acc, med) => {
    const todaySchedules = (med.schedules ?? []).filter(s => {
      const t = new Date(s.scheduledAt);
      return t >= todayStart && t <= todayEnd;
    });
    return acc + todaySchedules.filter(s => !s.administeredAt).length;
  }, 0);

  const myPatients = patients.filter(p => p.assignedNurseId === user?.id);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vista Enfermero/a</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Medicación · Cuidados · Evolutivos y notas de turno
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-blue-500 p-5 text-white shadow-lg shadow-blue-100">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wide mb-1">Pacientes planta</p>
          <p className="text-3xl font-black">{patients.length}</p>
          <User className="w-5 h-5 text-blue-200 mt-2" />
        </div>
        <div className="rounded-2xl bg-emerald-500 p-5 text-white shadow-lg shadow-emerald-100">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wide mb-1">Mis pacientes</p>
          <p className="text-3xl font-black">{myPatients.length}</p>
          <User className="w-5 h-5 text-emerald-200 mt-2" />
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${pendingMeds > 0 ? 'bg-orange-500 shadow-orange-100' : 'bg-slate-500 shadow-slate-100'}`}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Dosis pendientes</p>
          <p className="text-3xl font-black">{pendingMeds}</p>
          <Pill className="w-5 h-5 text-white/60 mt-2" />
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${medNotifications.length > 0 ? 'bg-amber-500 shadow-amber-100' : 'bg-slate-500 shadow-slate-100'}`}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Alertas médico</p>
          <p className="text-3xl font-black">{medNotifications.length}</p>
          <Bell className="w-5 h-5 text-white/60 mt-2" />
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
          No se pudieron cargar los pacientes. Verifica que el backend esté activo.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient list */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
            <p className="text-xs font-black text-white uppercase tracking-widest">Pacientes</p>
            <span className="text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">{patients.length}</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {patients.map((p) => {
                const isSelected = selectedId === p.id;
                const pNotifs = notifications.filter(n => !n.read && n.relatedPatientId === p.id).length;
                const isAssigned = p.assignedNurseId === user?.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => { setSelectedId(p.id); setCareError(''); setCareSuccess(''); setCareValue(''); setNoteText(''); setShowNoteForm(false); }}
                      className={`w-full text-left px-4 py-3 transition-all hover:bg-slate-50 border-l-4 ${isSelected ? 'bg-blue-50 border-blue-500' : isAssigned ? 'border-emerald-400' : p.allergies.length > 0 ? 'border-red-300' : 'border-transparent'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-bold text-slate-900 truncate">{p.name} {p.surnames}</p>
                            {isAssigned && <span className="text-[9px] bg-emerald-500 text-white font-black px-1 rounded shrink-0">MÍO</span>}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{p.diagnosis}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {p.allergies.length > 0 && (
                            <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded">🚫 {p.allergies.length}</span>
                          )}
                          {pNotifs > 0 && (
                            <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded">🔔 {pNotifs}</span>
                          )}
                        </div>
                      </div>
                      {p.bed && <p className="text-[10px] text-slate-400 font-bold mt-1">Hab. {p.bed.room}{p.bed.letter}</p>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <User className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Selecciona un paciente para ver su ficha</p>
            </div>
          ) : (
            <>
              {/* Med alerts */}
              {medNotifications.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
                  <Bell className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      ⚠️ {medNotifications.length === 1 ? 'El médico ha modificado la medicación' : `${medNotifications.length} cambios en medicación`}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {medNotifications.slice(0, 3).map(n => (
                        <li key={n.id} className="text-xs text-amber-700">· {NOTIFICATION_TYPE_LABELS[n.type]}: {n.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Patient header */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-900 px-5 py-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {new Date().getFullYear() - new Date(selected.dob).getFullYear() >= 65 ? '👴' : '🧑'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-white text-base">{selected.name} {selected.surnames}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selected.bed ? `Hab. ${selected.bed.room}${selected.bed.letter}` : 'Sin cama'} · Ingreso: {new Date(selected.admissionDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {selected.assignedNurseId === user?.id && (
                    <span className="ml-auto text-[10px] bg-emerald-500 text-white font-black px-2 py-1 rounded-xl shrink-0">Mi paciente</span>
                  )}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnóstico</p>
                    <p className="text-sm font-medium text-slate-800">"{selected.diagnosis}"</p>
                  </div>
                  {selected.allergies.length > 0 ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Alergias conocidas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergies.map(a => (
                          <span key={a} className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <p className="text-xs font-bold text-emerald-700">Sin alergias conocidas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Medication Cronogram ─────────────────────────────────── */}
              <div className="bg-white border border-slate-200 border-t-4 border-t-orange-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center">
                    <Pill className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Cronograma de medicación</h3>
                  {pendingMeds > 0 && (
                    <span className="ml-auto text-[10px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full">
                      {pendingMeds} pendiente{pendingMeds !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {loadingMeds ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
                  ) : (
                    <MedCronogram
                      medications={medications}
                      onAdminister={(sid) => administerMutation.mutate(sid)}
                      isPending={administerMutation.isPending}
                    />
                  )}
                </div>

                {/* Med legend */}
                {medications.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medicación activa</p>
                      <div className="space-y-1.5">
                        {medications.map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-800">{m.drugName}</span>
                            <span className="text-slate-400">—</span>
                            <span className="text-slate-500">{m.dose} · {m.route} · cada {m.frequencyHrs}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Evolutivos y Notas ──────────────────────────────────── */}
              <div className="bg-white border border-slate-200 border-t-4 border-t-purple-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-purple-500 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Evolutivos y Notas de Turno</h3>
                  <button
                    onClick={() => setShowNoteForm(v => !v)}
                    className={`ml-auto flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${showNoteForm ? 'bg-slate-200 text-slate-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                  >
                    {showNoteForm ? <X className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {showNoteForm ? 'Cancelar' : 'Añadir nota'}
                  </button>
                </div>

                {showNoteForm && (
                  <div className="p-5 border-b border-slate-100 bg-purple-50/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tipo de nota</label>
                        <select value={noteType} onChange={e => setNoteType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-purple-300">
                          {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Descripción *</label>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        rows={3}
                        placeholder={
                          noteType === 'EVOLUTIVO' ? 'Estado del paciente al final del turno...' :
                          noteType === 'FIN_TURNO' ? 'Resumen del turno, observaciones relevantes...' :
                          noteType === 'TRASLADO' ? 'Procedencia del traslado, estado de llegada...' :
                          'Descripción de la incidencia...'
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-purple-300 resize-none"
                      />
                    </div>
                    {noteSuccess && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{noteSuccess}</p>}
                    {noteError && <p className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{noteError}</p>}
                    <button
                      onClick={() => {
                        if (!selectedId || !noteText.trim()) return;
                        noteMutation.mutate({ patientId: selectedId, type: noteType, description: noteText.trim() });
                      }}
                      disabled={!noteText.trim() || noteMutation.isPending}
                      className="flex items-center gap-2 bg-purple-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {noteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Guardar nota
                    </button>
                  </div>
                )}

                <div className="p-5">
                  {loadingNotes ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
                  ) : incidents.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Sin evolutivos ni notas registrados</p>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {incidents.map(inc => {
                        const dt = new Date(inc.reportedAt);
                        const noteInfo = NOTE_TYPES.find(t => t.value === inc.type);
                        return (
                          <li key={inc.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${NOTE_COLOR[inc.type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {noteInfo?.label ?? inc.type}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-bold">
                                {dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} {dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1 leading-relaxed">{inc.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Por: {inc.reportedBy}</p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* ─── Register care ────────────────────────────────────────── */}
              <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Registrar cuidado</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tipo de cuidado</label>
                      <select value={careType} onChange={e => setCareType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-slate-300">
                        {CARE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Valor / Descripción *</label>
                      <input type="text" placeholder="ej: realizada, 72 bpm, 2000 ml..." value={careValue}
                        onChange={e => setCareValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-slate-300" />
                    </div>
                  </div>
                  <input type="text" placeholder="Notas adicionales (opcional)" value={careNotes}
                    onChange={e => setCareNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-slate-300" />
                  {careSuccess && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{careSuccess}</p>}
                  {careError && <p className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{careError}</p>}
                  <button
                    onClick={() => {
                      if (!selectedId || !careValue.trim()) return;
                      setCareError('');
                      careMutation.mutate({ patientId: selectedId, type: careType, value: careValue.trim(), notes: careNotes.trim() || undefined });
                    }}
                    disabled={!careValue.trim() || careMutation.isPending}
                    className="flex items-center gap-2 bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {careMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Registrar cuidado
                  </button>
                </div>
              </div>

              {/* ─── Care history ─────────────────────────────────────────── */}
              <div className="bg-white border border-slate-200 border-t-4 border-t-blue-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Historial de cuidados</h3>
                  <span className="ml-auto text-[10px] text-slate-400 font-bold">{careRecords.length} registros</span>
                </div>
                <div className="p-5">
                  {loadingCares ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                  ) : careRecords.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Sin registros de cuidado</p>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {careRecords.map(r => {
                        const dt = new Date(r.recordedAt);
                        return (
                          <li key={r.id} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${CARE_COLORS[r.type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {r.type.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{shiftLabel(dt)}</span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium mt-1">{r.value}{r.unit ? ` ${r.unit}` : ''}</p>
                              {r.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{r.notes}</p>}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap font-bold text-right">
                              {dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}<br />
                              {dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
