import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TestTube, FlaskConical, ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient, DiagnosticTest } from '@/lib/types';

export default function DiagnosticTestsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const { data: tests = [], isLoading: loadingTests } = useQuery({
    queryKey: ['tests', selectedPatientId],
    queryFn: () => api.get<DiagnosticTest[]>(`/patients/${selectedPatientId}/tests`),
    enabled: selectedPatientId !== '',
  });

  const labTests     = tests.filter((t) => t.type === 'LAB');
  const imagingTests = tests.filter((t) => t.type === 'IMAGING');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pruebas Diagnósticas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Selecciona un paciente para ver sus pruebas
        </p>
      </div>

      {/* Patient selector */}
      <div className="relative inline-block">
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          disabled={loadingPatients}
          className="appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 min-w-64"
        >
          <option value="">— Seleccionar paciente —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {!selectedPatientId ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 bg-card border border-border rounded-xl">
          <TestTube className="w-12 h-12 opacity-30" />
          <p>Selecciona un paciente para ver sus pruebas diagnósticas</p>
        </div>
      ) : loadingTests ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 bg-card border border-border rounded-xl">
          <TestTube className="w-12 h-12 opacity-30" />
          <p>Sin pruebas registradas para este paciente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lab tests */}
          <TestSection
            title="Pruebas de Laboratorio"
            icon={FlaskConical}
            tests={labTests}
            emptyLabel="Sin pruebas de laboratorio"
          />
          {/* Imaging */}
          <TestSection
            title="Diagnóstico por Imagen"
            icon={ImageIcon}
            tests={imagingTests}
            emptyLabel="Sin pruebas de imagen"
          />
        </div>
      )}
    </div>
  );
}

function TestSection({
  title,
  icon: Icon,
  tests,
  emptyLabel,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tests: DiagnosticTest[];
  emptyLabel: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{tests.length}</span>
      </div>

      {tests.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {tests.map((t) => (
            <li key={t.id} className="px-5 py-3.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground text-sm">{t.name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    t.result
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {t.result ? 'Resultado disponible' : 'Pendiente'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Programada:{' '}
                {new Date(t.scheduledAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              {t.result && (
                <p className="text-xs bg-muted/40 rounded p-2 text-foreground mt-1">
                  <span className="text-muted-foreground">Resultado: </span>
                  {t.result}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
