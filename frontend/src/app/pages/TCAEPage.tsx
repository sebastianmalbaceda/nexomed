import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity, AlertCircle, CheckCircle2, Loader2, User, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient, CareRecord } from '@/lib/types';

// Tipos específicos para cada constante vital (evita conflicto anti-duplicidad)
const VITAL_FIELDS = [
  { key: 'constante_fc',   label: 'Frec. Cardíaca',    unit: 'bpm',  placeholder: 'ej: 72' },
  { key: 'constante_tas',  label: 'TA Sistólica',       unit: 'mmHg', placeholder: 'ej: 120' },
  { key: 'constante_tad',  label: 'TA Diastólica',      unit: 'mmHg', placeholder: 'ej: 80' },
  { key: 'constante_temp', label: 'Temperatura',        unit: '°C',   placeholder: 'ej: 36.5' },
  { key: 'constante_spo2', label: 'SpO₂',               unit: '%',    placeholder: 'ej: 98' },
] as const;

type VitalKey = typeof VITAL_FIELDS[number]['key'];

const VITAL_LABELS: Record<string, string> = {
  constante_fc:   'FC',
  constante_tas:  'TAS',
  constante_tad:  'TAD',
  constante_temp: 'Temp',
  constante_spo2: 'SpO₂',
};

function getShift(date: Date): { label: string; key: string } {
  const h = date.getHours();
  if (h >= 7 && h < 15)  return { label: 'Mañana 🌅',  key: 'morning' };
  if (h >= 15 && h < 23) return { label: 'Tarde 🌆',   key: 'afternoon' };
  return                         { label: 'Noche 🌙',   key: 'night' };
}

function shiftKeyForDate(d: Date): string {
  // Unique key per shift+day: e.g. "2024-03-15-morning"
  const dateStr = d.toISOString().split('T')[0];
  return `${dateStr}-${getShift(d).key}`;
}

interface VitalGroup {
  shiftKey: string;
  shiftLabel: string;
  dateLabel: string;
  records: CareRecord[];
}

function groupByShift(records: CareRecord[]): VitalGroup[] {
  const vitals = records.filter((r) => r.type.startsWith('constante_'));
  const map = new Map<string, VitalGroup>();

  for (const r of vitals) {
    const d = new Date(r.recordedAt);
    const sk = shiftKeyForDate(d);
    if (!map.has(sk)) {
      map.set(sk, {
        shiftKey: sk,
        shiftLabel: getShift(d).label,
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        records: [],
      });
    }
    map.get(sk)!.records.push(r);
  }

  return Array.from(map.values());
}

export default function TCAEPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<Partial<Record<VitalKey, string>>>({});
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const selected = patients.find((p) => p.id === selectedId) ?? null;

  const { data: careRecords = [], isLoading: loadingCares } = useQuery({
    queryKey: ['cares', selectedId],
    queryFn: () => api.get<CareRecord[]>(`/cares/${selectedId}`),
    enabled: !!selectedId,
  });

  const vitalGroups = groupByShift(careRecords);

  // Latest reading per vital type (for quick reference)
  const latestByType: Partial<Record<string, CareRecord>> = {};
  for (const r of careRecords) {
    if (r.type.startsWith('constante_') && !latestByType[r.type]) {
      latestByType[r.type] = r;
    }
  }

  const submitMutation = useMutation({
    mutationFn: async (entries: { type: VitalKey; value: string }[]) => {
      const results = [];
      for (const entry of entries) {
        const field = VITAL_FIELDS.find((f) => f.key === entry.type)!;
        try {
          const r = await api.post<CareRecord>('/cares', {
            patientId: selectedId,
            type: entry.type,
            value: entry.value,
            unit: field.unit,
            notes: notes.trim() || undefined,
          });
          results.push({ ok: true, r });
        } catch (e) {
          results.push({ ok: false, msg: (e as Error).message, type: entry.type });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['cares', selectedId] });
      const errs = results
        .filter((r) => !r.ok)
        .map((r) => `${VITAL_LABELS[r.type ?? ''] ?? r.type}: ${r.msg}`);
      if (errs.length > 0) {
        setErrors(errs);
        setSuccessMsg('');
      } else {
        setSuccessMsg('Constantes registradas correctamente');
        setErrors([]);
        setValues({});
        setNotes('');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    },
  });

  function handleSubmit() {
    if (!selectedId) return;
    const entries = VITAL_FIELDS
      .filter((f) => values[f.key]?.trim())
      .map((f) => ({ type: f.key, value: values[f.key]!.trim() }));
    if (entries.length === 0) return;
    setErrors([]);
    setSuccessMsg('');
    submitMutation.mutate(entries);
  }

  const hasValues = VITAL_FIELDS.some((f) => values[f.key]?.trim());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Constantes Vitales — TCAE</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Registro de constantes y visualización por turnos
        </p>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          No se pudieron cargar los pacientes. Verifica que el backend esté activo.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Patient list (1/3) ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pacientes ({patients.length})
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {patients.map((p) => {
                const isSelected = selectedId === p.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setSelectedId(p.id);
                        setErrors([]);
                        setSuccessMsg('');
                        setValues({});
                      }}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-accent/40 ${
                        isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{p.diagnosis}</p>
                      {p.bed && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          Hab. {p.bed.room}{p.bed.letter}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Right panel (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Activity className="w-10 h-10 opacity-30" />
              <p className="text-sm">Selecciona un paciente para registrar constantes</p>
            </div>
          ) : (
            <>
              {/* Patient header */}
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.bed ? `Hab. ${selected.bed.room}${selected.bed.letter}` : 'Sin cama'} ·{' '}
                    {selected.diagnosis}
                  </p>
                </div>
                {selected.allergies.length > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    {selected.allergies.join(', ')}
                  </span>
                )}
              </div>

              {/* ── TCAE-RF1: Registro de constantes ── */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Registro de constantes vitales
                </h3>

                {/* Últimas lecturas */}
                {Object.keys(latestByType).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {VITAL_FIELDS.map((f) => {
                      const last = latestByType[f.key];
                      if (!last) return null;
                      return (
                        <div key={f.key} className="bg-muted/40 rounded-lg px-3 py-1.5 text-center">
                          <p className="text-xs text-muted-foreground">{f.label}</p>
                          <p className="text-sm font-bold text-foreground">
                            {last.value} <span className="text-xs font-normal">{f.unit}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {VITAL_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {f.label}
                        <span className="font-normal ml-1 text-muted-foreground/60">({f.unit})</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder={f.placeholder}
                        value={values[f.key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Observaciones (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                />

                {successMsg && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-3 space-y-1">
                    {errors.map((e, i) => (
                      <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {e}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!hasValues || submitMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />}
                  Guardar constantes
                </button>
              </div>

              {/* ── TCAE-RF4: Historial por turnos ── */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Historial de constantes por turno
                  </h3>
                </div>

                {loadingCares ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : vitalGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin constantes registradas</p>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {vitalGroups.map((group) => (
                      <div key={group.shiftKey}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {group.shiftLabel}
                          </span>
                          <span className="text-xs text-muted-foreground/60">{group.dateLabel}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {VITAL_FIELDS.map((f) => {
                            const record = group.records.find((r) => r.type === f.key);
                            if (!record) return null;
                            const dt = new Date(record.recordedAt);
                            return (
                              <div
                                key={f.key}
                                className="bg-muted/30 rounded-lg px-3 py-2"
                              >
                                <p className="text-xs text-muted-foreground">{f.label}</p>
                                <p className="text-sm font-bold text-foreground">
                                  {record.value}{' '}
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {f.unit}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-0.5">
                                  {dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
