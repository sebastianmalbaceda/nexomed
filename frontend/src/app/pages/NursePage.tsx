import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Loader2, User, Pill, ClipboardList,
  CheckCircle2, Activity, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient, Medication, CareRecord } from '@/lib/types';

const CARE_TYPES = [
  { value: 'cura',      label: 'Cura / Cuidado de herida' },
  { value: 'higiene',   label: 'Higiene' },
  { value: 'balance',   label: 'Balance hídrico' },
  { value: 'ingesta',   label: 'Ingesta' },
  { value: 'constante', label: 'Constante vital' },
];

function shiftLabel(date: Date): string {
  const h = date.getHours();
  if (h >= 7 && h < 15) return 'Mañana';
  if (h >= 15 && h < 23) return 'Tarde';
  return 'Noche';
}

export default function NursePage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [careType, setCareType] = useState('cura');
  const [careValue, setCareValue] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const careMutation = useMutation({
    mutationFn: (body: { patientId: string; type: string; value: string; notes?: string }) =>
      api.post<CareRecord>('/cares', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cares', selectedId] });
      setCareValue('');
      setCareNotes('');
      setSuccessMsg('Cuidado registrado correctamente');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (e: Error) => {
      setErrorMsg(e.message);
      setSuccessMsg('');
    },
  });

  function handleRegister() {
    if (!selectedId || !careValue.trim()) return;
    setErrorMsg('');
    careMutation.mutate({
      patientId: selectedId,
      type: careType,
      value: careValue.trim(),
      notes: careNotes.trim() || undefined,
    });
  }

  function selectPatient(id: string) {
    setSelectedId(id);
    setErrorMsg('');
    setSuccessMsg('');
    setCareValue('');
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vista Enfermero</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ficha del paciente · Medicación · Registro de cuidados
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
                      onClick={() => selectPatient(p.id)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-accent/40 ${
                        isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{p.diagnosis}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {p.allergies.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                              <AlertCircle className="w-3 h-3" />
                              {p.allergies.length}
                            </span>
                          )}
                          {isSelected && (
                            <ChevronRight className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                      </div>
                      {p.bed && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
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

        {/* ── Detail panel (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <User className="w-10 h-10 opacity-30" />
              <p className="text-sm">Selecciona un paciente para ver su ficha</p>
            </div>
          ) : (
            <>
              {/* ── ENF-RF1: Ficha paciente ── */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-foreground text-base">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selected.bed
                        ? `Hab. ${selected.bed.room}${selected.bed.letter}`
                        : 'Sin cama asignada'}
                      {' · '}
                      Ingreso: {new Date(selected.admissionDate).toLocaleDateString('es-ES')}
                      {' · '}
                      Nac.: {new Date(selected.dob).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Diagnóstico
                    </p>
                    <p className="text-sm text-foreground">{selected.diagnosis}</p>
                  </div>

                  {selected.allergies.length > 0 ? (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                        <p className="text-xs font-bold text-destructive uppercase tracking-wide">
                          Alergias
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergies.map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Alergias
                      </p>
                      <p className="text-sm text-muted-foreground">Sin alergias conocidas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Medicación activa ── */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Medicación activa</h3>
                </div>
                {loadingMeds ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin medicación activa</p>
                ) : (
                  <ul className="space-y-2">
                    {medications.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-3 bg-muted/30 rounded-lg px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-foreground">{m.drugName}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {m.dose} · {m.route}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          cada {m.frequencyHrs}h
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ── ENF-RF4 + ENF-RNF1: Registrar cuidado (≤2 clics) ── */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Registrar cuidado</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                    Anti-duplicidad 15 min
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Tipo de cuidado
                    </label>
                    <select
                      value={careType}
                      onChange={(e) => setCareType(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CARE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Valor / Descripción *
                    </label>
                    <input
                      type="text"
                      placeholder="ej: realizada, 72 bpm, 2000 ml..."
                      value={careValue}
                      onChange={(e) => setCareValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Notas adicionales (opcional)"
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                />

                {successMsg && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="flex items-center gap-2 text-sm text-destructive mb-3">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={!careValue.trim() || careMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {careMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />}
                  Registrar cuidado
                </button>
              </div>

              {/* ── Historial de cuidados ── */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Historial de cuidados</h3>
                </div>

                {loadingCares ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : careRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin registros de cuidado</p>
                ) : (
                  <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {careRecords.map((r) => {
                      const dt = new Date(r.recordedAt);
                      return (
                        <li
                          key={r.id}
                          className="flex items-start justify-between gap-3 bg-muted/30 rounded-lg px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground capitalize">
                                {r.type}
                              </span>
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                                {shiftLabel(dt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.value}
                              {r.unit ? ` ${r.unit}` : ''}
                            </p>
                            {r.notes && (
                              <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{r.notes}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                            {dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}{' '}
                            {dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
