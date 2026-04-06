import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Loader2, ChevronDown, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { CARE_RECORD_TYPE_LABELS } from '@/lib/constants';
import type { Patient, CareRecord } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  constante: 'bg-primary/10 text-primary',
  cura:      'bg-chart-1/20 text-red-400',
  higiene:   'bg-chart-3/20 text-green-400',
  balance:   'bg-chart-2/20 text-blue-400',
  ingesta:   'bg-chart-4/20 text-yellow-400',
};

export default function UnifiedHistoryPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['care-records', selectedPatientId],
    queryFn: () => api.get<CareRecord[]>(`/patients/${selectedPatientId}/care-records`),
    enabled: selectedPatientId !== '',
  });

  const filtered = typeFilter
    ? records.filter((r) => r.type === typeFilter)
    : records;

  const uniqueTypes = Array.from(new Set(records.map((r) => r.type)));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Historial Unificado</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Registro de cuidados y constantes por paciente
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Patient selector */}
        <div className="relative">
          <select
            value={selectedPatientId}
            onChange={(e) => { setSelectedPatientId(e.target.value); setTypeFilter(''); }}
            disabled={loadingPatients}
            className="appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 min-w-56"
          >
            <option value="">— Seleccionar paciente —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Type filter */}
        {uniqueTypes.length > 0 && (
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{CARE_RECORD_TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {!selectedPatientId ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 bg-card border border-border rounded-xl">
          <History className="w-12 h-12 opacity-30" />
          <p>Selecciona un paciente para ver su historial</p>
        </div>
      ) : loadingRecords ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 bg-card border border-border rounded-xl">
          <History className="w-12 h-12 opacity-30" />
          <p>Sin registros{typeFilter ? ' de este tipo' : ''}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((record) => (
              <li key={record.id} className="px-5 py-4 flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        TYPE_COLORS[record.type] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {CARE_RECORD_TYPE_LABELS[record.type] ?? record.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(record.recordedAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-foreground font-medium">
                    {record.value}
                    {record.unit && (
                      <span className="text-muted-foreground font-normal"> {record.unit}</span>
                    )}
                  </p>

                  {record.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                  )}

                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Registrado por: {record.recordedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
