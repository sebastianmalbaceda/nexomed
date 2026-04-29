import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Loader2, User, Pill, ClipboardList,
  CheckCircle2, Activity, Bell, Clock, Pencil, X, Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { POLLING_INTERVAL_MS, NOTIFICATION_TYPE_LABELS } from '@/lib/constants';
import type { Patient, Medication, CareRecord, Notification, MedSchedule } from '@/lib/types';

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

function shiftLabel(date: Date): string {
  const h = date.getHours();
  if (h >= 7 && h < 15) return '🌅 Mañana';
  if (h >= 15 && h < 23) return '🌆 Tarde';
  return '🌙 Noche';
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

interface ScheduleOverride { startHour: number; freqHrs: number; }

function calcDoseTimes(startTime: string, frequencyHrs: number): string[] {
  const start = new Date(startTime);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
  let t = new Date(start);
  while (t < today) t = new Date(t.getTime() + frequencyHrs * 3_600_000);
  const times: string[] = [];
  while (t <= todayEnd) {
    times.push(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
    t = new Date(t.getTime() + frequencyHrs * 3_600_000);
  }
  if (times.length === 0) {
    const h = start.getHours();
    const count = Math.max(1, Math.round(24 / frequencyHrs));
    for (let i = 0; i < count; i++) {
      const hh = h + i * frequencyHrs;
      if (hh < 24) times.push(`${String(hh).padStart(2, '0')}:00`);
    }
  }
  return times;
}

export default function NursePage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [careType, setCareType] = useState('cura');
  const [careValue, setCareValue] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, ScheduleOverride>>({});
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editStartHour, setEditStartHour] = useState(8);
  const [editFreqHrs, setEditFreqHrs] = useState(8);

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });
  const selected = patients.find((p) => p.id === selectedId) ?? null;

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
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const medNotifications = notifications.filter(
    (n) => !n.read && n.relatedPatientId === selectedId &&
      ['MED_CHANGE', 'MED_NEW', 'MED_REMOVED'].includes(n.type),
  );

  const careMutation = useMutation({
    mutationFn: (body: { patientId: string; type: string; value: string; notes?: string }) =>
      api.post<CareRecord>('/cares', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cares', selectedId] });
      setCareValue(''); setCareNotes('');
      setSuccessMsg('Cuidado registrado correctamente');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (e: Error) => { setErrorMsg(e.message); setSuccessMsg(''); },
  });

  const administerMutation = useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: string }) =>
      api.post(`/medications/schedules/${scheduleId}/administer`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications', selectedId] });
    },
  });

  function getMedTimes(med: Medication): string[] {
    const ov = scheduleOverrides[med.id];
    if (ov) {
      const times: string[] = [];
      let h = ov.startHour;
      while (h < 24) { times.push(`${String(h).padStart(2, '0')}:00`); h += ov.freqHrs; }
      return times;
    }
    return calcDoseTimes(med.startTime, med.frequencyHrs);
  }

  const administered = new Set(
    medications.flatMap(m => 
      (m.schedules || [])
        .filter(s => s.administeredAt)
        .map(s => {
          const dt = new Date(s.scheduledAt);
          return `${m.id}__${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        })
    )
  );

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const pendingMeds = medications.reduce((acc, med) => {
    if (!med.schedules) return acc;
    return acc + med.schedules.filter((s: MedSchedule) => !s.administeredAt).length;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vista Enfermero/a</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Ficha del paciente · Medicación · Registro de cuidados</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-blue-500 p-5 text-white shadow-lg shadow-blue-100">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wide mb-1">Pacientes</p>
          <p className="text-3xl font-black">{patients.length}</p>
          <User className="w-5 h-5 text-blue-200 mt-2" />
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${pendingMeds > 0 ? 'bg-red-500 shadow-red-100' : 'bg-emerald-500 shadow-emerald-100'}`}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Dosis pendientes</p>
          <p className="text-3xl font-black">{pendingMeds}</p>
          <Pill className="w-5 h-5 text-white/60 mt-2" />
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-lg ${medNotifications.length > 0 ? 'bg-amber-500 shadow-amber-100' : 'bg-slate-500 shadow-slate-100'}`}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Alertas medicación</p>
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
                const pNotifs = notifications.filter((n) => !n.read && n.relatedPatientId === p.id).length;
                const hasAllergy = p.allergies.length > 0;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => { setSelectedId(p.id); setErrorMsg(''); setSuccessMsg(''); setCareValue(''); setEditingMedId(null); }}
                      className={`w-full text-left px-4 py-3 transition-all hover:bg-slate-50 border-l-4 ${isSelected ? 'bg-blue-50 border-blue-500' : hasAllergy ? 'border-red-300' : 'border-transparent'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{p.diagnosis}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {hasAllergy && (
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

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <User className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Selecciona un paciente para ver su ficha</p>
            </div>
          ) : (
            <>
              {medNotifications.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm shadow-amber-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      {medNotifications.length === 1 ? '⚠️ El médico ha modificado la medicación' : `⚠️ ${medNotifications.length} cambios en medicación`}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {medNotifications.slice(0, 3).map((n) => (
                        <li key={n.id} className="text-xs text-amber-700 font-medium">· {NOTIFICATION_TYPE_LABELS[n.type]}: {n.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-900 px-5 py-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {new Date().getFullYear() - new Date(selected.dob).getFullYear() >= 65 ? '👴' : '🧑'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-white text-base">{selected.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selected.bed ? `Hab. ${selected.bed.room}${selected.bed.letter}` : 'Sin cama'} · Ingreso: {new Date(selected.admissionDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnóstico</p>
                    <p className="text-sm font-medium text-slate-800">"{selected.diagnosis}"</p>
                  </div>
                  {selected.allergies.length > 0 ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Alergias
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergies.map((a) => (
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

              <div className="bg-white border border-slate-200 border-t-4 border-t-orange-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center">
                    <Pill className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Medicación activa</h3>
                  <span className="ml-auto text-[10px] bg-orange-100 text-orange-700 font-black px-2 py-0.5 rounded-full">SYS-RF1</span>
                </div>

                {loadingMeds ? (
                  <div className="flex justify-center p-6"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
                ) : medications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center p-6">Sin medicación activa</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {medications.map((m) => {
                      const schedules: MedSchedule[] = m.schedules || [];
                      const allDone = schedules.length > 0 && schedules.every((s) => s.administeredAt);
                      const someDone = schedules.some((s) => s.administeredAt);
                      const isEditing = editingMedId === m.id;

                      return (
                        <div key={m.id} className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900 text-sm">{m.drugName}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${allDone ? 'bg-emerald-500' : someDone ? 'bg-amber-500' : 'bg-red-500'}`}>
                                  {allDone ? 'COMPLETADO' : someDone ? 'PARCIAL' : 'PENDIENTE'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {m.dose} · {m.route} · cada {scheduleOverrides[m.id]?.freqHrs ?? m.frequencyHrs}h
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (isEditing) { setEditingMedId(null); return; }
                                const ov = scheduleOverrides[m.id];
                                setEditStartHour(ov?.startHour ?? new Date(m.startTime).getHours());
                                setEditFreqHrs(ov?.freqHrs ?? m.frequencyHrs);
                                setEditingMedId(m.id);
                              }}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 font-bold"
                            >
                              {isEditing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              {isEditing ? 'Cancelar' : 'Horario'}
                            </button>
                          </div>

                          {isEditing && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                              <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-2">Cambiar horario — recálculo automático</p>
                              <div className="flex gap-3 mb-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-amber-700 mb-1">Hora inicio</label>
                                  <select value={editStartHour} onChange={(e) => setEditStartHour(Number(e.target.value))}
                                    className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ring-amber-400/30">
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-amber-700 mb-1">Frecuencia</label>
                                  <select value={editFreqHrs} onChange={(e) => setEditFreqHrs(Number(e.target.value))}
                                    className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ring-amber-400/30">
                                    {[2,4,6,8,12,24].map((h) => <option key={h} value={h}>Cada {h}h</option>)}
                                  </select>
                                </div>
                              </div>
                              <p className="text-xs text-amber-700 font-medium mb-2">
                                Horarios recalculados:{' '}
                                {Array.from({ length: Math.floor((24 - editStartHour) / editFreqHrs) + 1 }, (_, i) => editStartHour + i * editFreqHrs)
                                  .filter(h => h < 24)
                                  .map(h => `${String(h).padStart(2,'0')}:00`)
                                  .join(' · ')}
                              </p>
                              <button
                                onClick={() => { setScheduleOverrides((p) => ({ ...p, [m.id]: { startHour: editStartHour, freqHrs: editFreqHrs } })); setEditingMedId(null); }}
                                className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                <Check className="w-3 h-3" /> Guardar horario
                              </button>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {getMedTimes(m).map((t) => {
                              const done = administered.has(`${m.id}__${t}`);
                              const isPast = toMin(t) <= nowMin;
                              const schedule = (m.schedules || []).find(s => {
                                const dt = new Date(s.scheduledAt);
                                return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}` === t;
                              });
                              return (
                                <button
                                  key={t}
                                  onClick={() => schedule && !done && administerMutation.mutate({ scheduleId: schedule.id })}
                                  disabled={done || administerMutation.isPending}
                                  title={done ? 'Ya administrado' : isPast ? 'Administrar (vencido)' : 'Marcar como administrado'}
                                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-bold transition-all ${
                                    done
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 line-through opacity-60'
                                      : isPast
                                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {done ? <CheckCircle2 className="w-3 h-3" /> : (isPast || schedule?.administeredAt) ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Registrar cuidado</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full ml-auto">Anti-dup. 15 min</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tipo de cuidado</label>
                      <select value={careType} onChange={(e) => setCareType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-slate-300">
                        {CARE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Valor / Descripción *</label>
                      <input type="text" placeholder="ej: realizada, 72 bpm, 2000 ml..." value={careValue}
                        onChange={(e) => setCareValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-slate-300" />
                    </div>
                  </div>
                  <input type="text" placeholder="Notas adicionales (opcional)" value={careNotes}
                    onChange={(e) => setCareNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-slate-300" />
                  {successMsg && <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
                  {errorMsg && <div className="flex items-center gap-2 text-sm text-red-600 font-bold"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}
                  <button
                    onClick={() => { if (!selectedId || !careValue.trim()) return; setErrorMsg(''); careMutation.mutate({ patientId: selectedId, type: careType, value: careValue.trim(), notes: careNotes.trim() || undefined }); }}
                    disabled={!careValue.trim() || careMutation.isPending}
                    className="flex items-center gap-2 bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                    {careMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Registrar cuidado
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 border-t-4 border-t-blue-400 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900">Historial de cuidados</h3>
                </div>
                <div className="p-5">
                  {loadingCares ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                  ) : careRecords.length === 0 ? (
                    <p className="text-sm text-slate-400 font-medium">Sin registros de cuidado</p>
                  ) : (
                    <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {careRecords.map((r) => {
                        const dt = new Date(r.recordedAt);
                        return (
                          <li key={r.id} className="flex items-start justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${CARE_COLORS[r.type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {r.type.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{shiftLabel(dt)}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-0.5">{r.value}{r.unit ? ` ${r.unit}` : ''}</p>
                              {r.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{r.notes}</p>}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap font-bold">
                              {dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} {dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
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
