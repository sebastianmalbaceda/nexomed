import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, User, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Bed } from '@/lib/types';

export default function BedMapPage() {
  const { user } = useAuthStore();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const { data: beds = [], isLoading, isError } = useQuery({
    queryKey: ['beds'],
    queryFn: () => api.get<Bed[]>('/beds'),
  });

  // Group by room number
  const rooms = beds.reduce<Record<number, Bed[]>>((acc, bed) => {
    if (!acc[bed.room]) acc[bed.room] = [];
    acc[bed.room].push(bed);
    return acc;
  }, {});

  const occupied = beds.filter((b) => b.patient != null).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapa de Camas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {occupied} / {beds.length} camas ocupadas
        </p>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          No se pudieron cargar las camas. Verifica que el backend esté activo.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid (2/3) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Planta — Vista General
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(rooms).map(([room, roomBeds]) => (
                <div key={room} className="border border-border rounded-lg p-3 bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Hab. {room}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {roomBeds.map((bed) => {
                      const isOccupied = bed.patient != null;
                      const isSelected = selectedBed?.id === bed.id;
                      return (
                        <button
                          key={bed.id}
                          onClick={() => setSelectedBed(isSelected ? null : bed)}
                          className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                            isOccupied
                              ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
                              : 'bg-muted/30 border-border hover:bg-accent'
                          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        >
                          <p className="text-xs font-semibold text-foreground">
                            Cama {bed.letter}
                          </p>
                          {isOccupied && bed.patient ? (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {bed.patient.name.split(' ')[0]}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/50 mt-0.5">Libre</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary/10 border border-primary/30 inline-block" />
                Ocupada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-muted/30 border border-border inline-block" />
                Libre
              </span>
            </div>
          </div>

          {/* Detail panel (1/3) */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Detalle
            </h2>

            {!selectedBed ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <BedDouble className="w-10 h-10 opacity-40" />
                <p className="text-sm">Selecciona una cama</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    Hab. {selectedBed.room} — Cama {selectedBed.letter}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedBed.patient
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {selectedBed.patient ? 'Ocupada' : 'Libre'}
                  </span>
                </div>

                {selectedBed.patient ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {selectedBed.patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ingreso:{' '}
                          {new Date(selectedBed.patient.admissionDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Diagnóstico</p>
                      <p className="text-sm text-foreground mt-0.5">
                        {selectedBed.patient.diagnosis}
                      </p>
                    </div>

                    {selectedBed.patient.allergies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Alergias</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBed.patient.allergies.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user?.role === 'DOCTOR' && (
                      <button className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        Ver Historia Clínica
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <BedDouble className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Cama disponible</p>
                    {user?.role === 'DOCTOR' && (
                      <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        Asignar Paciente
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
