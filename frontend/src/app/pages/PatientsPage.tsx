import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertCircle, Loader2, Calendar, BedDouble } from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient } from '@/lib/types';

// Computed once at module load — avoids impure Date.now() calls during render
const NOW_MS = new Date().getTime();

function ageFromDob(dob: string): number {
  return Math.floor((NOW_MS - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientsPage() {
  const [search, setSearch] = useState('');

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} en planta
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nombre o diagnóstico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-72"
          />
        </div>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          No se pudieron cargar los pacientes. Verifica que el backend esté activo.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {search ? 'Sin resultados para tu búsqueda' : 'No hay pacientes en planta'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Paciente</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Edad</th>
                  <th className="text-left px-5 py-3 font-medium">Diagnóstico</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Cama</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Ingreso</th>
                  <th className="text-left px-5 py-3 font-medium">Alergias</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {ageFromDob(p.dob)} años
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-52 truncate">
                      {p.diagnosis}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {p.bed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <BedDouble className="w-3 h-3" />
                          Hab. {p.bed.room}{p.bed.letter}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.admissionDate).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.allergies.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin alergias</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
