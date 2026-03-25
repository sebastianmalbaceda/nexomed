'use client';

import { useState } from 'react';
import { BedDouble, User, AlertCircle, Clock, Heart, Droplet, Activity, ChevronRight } from 'lucide-react';

interface BedInfo {
  id: string;
  room: string;
  bed: 'A' | 'B';
  status: 'occupied' | 'empty' | 'maintenance' | 'cleaning';
  patient?: {
    name: string;
    age: number;
    gender: 'M' | 'F';
    diagnosis: string;
    admissionDate: string;
    doctor: string;
    nurse: string;
    alerts: string[];
    vitals?: {
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSat?: number;
    };
  };
}

interface BedMapProps {
  currentRole: string;
}

export function BedMap({ currentRole }: BedMapProps) {
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);

  const [beds] = useState<BedInfo[]>([
    {
      id: '101-A',
      room: '101',
      bed: 'A',
      status: 'occupied',
      patient: {
        name: 'María González Ruiz',
        age: 65,
        gender: 'F',
        diagnosis: 'Post-operatorio de prótesis de cadera',
        admissionDate: '15/03/2026',
        doctor: 'Dr. Carlos Rodríguez',
        nurse: 'Enf. María García',
        alerts: ['Control de dolor', 'Movilización pendiente'],
        vitals: {
          heartRate: 78,
          bloodPressure: '120/80',
          temperature: 36.8,
          oxygenSat: 97,
        },
      },
    },
    {
      id: '101-B',
      room: '101',
      bed: 'B',
      status: 'occupied',
      patient: {
        name: 'Juan Pérez Martín',
        age: 72,
        gender: 'M',
        diagnosis: 'Neumonía adquirida en comunidad',
        admissionDate: '14/03/2026',
        doctor: 'Dr. Juan Pérez',
        nurse: 'Enf. María García',
        alerts: ['Oxígeno suplementario', 'Fisioterapia respiratoria'],
        vitals: {
          heartRate: 92,
          bloodPressure: '135/85',
          temperature: 38.2,
          oxygenSat: 92,
        },
      },
    },
    {
      id: '102-A',
      room: '102',
      bed: 'A',
      status: 'empty',
    },
    {
      id: '102-B',
      room: '102',
      bed: 'B',
      status: 'occupied',
      patient: {
        name: 'Ana Martínez López',
        age: 58,
        gender: 'F',
        diagnosis: 'Insuficiencia cardíaca congestiva',
        admissionDate: '16/03/2026',
        doctor: 'Dr. Carlos Rodríguez',
        nurse: 'Enf. Laura Sánchez',
        alerts: ['Balance hídrico estricto', 'Control de diuresis'],
        vitals: {
          heartRate: 88,
          bloodPressure: '145/95',
          temperature: 36.5,
          oxygenSat: 94,
        },
      },
    },
    {
      id: '103-A',
      room: '103',
      bed: 'A',
      status: 'occupied',
      patient: {
        name: 'Carlos Sánchez Vila',
        age: 45,
        gender: 'M',
        diagnosis: 'Diabetes descompensada',
        admissionDate: '17/03/2026',
        doctor: 'Dr. Juan Pérez',
        nurse: 'Enf. Ana Martínez',
        alerts: ['Control glucémico cada 4h', 'Dieta diabética'],
        vitals: {
          heartRate: 82,
          bloodPressure: '128/82',
          temperature: 36.9,
          oxygenSat: 98,
        },
      },
    },
    {
      id: '103-B',
      room: '103',
      bed: 'B',
      status: 'cleaning',
    },
    {
      id: '104-A',
      room: '104',
      bed: 'A',
      status: 'occupied',
      patient: {
        name: 'Laura García Torres',
        age: 38,
        gender: 'F',
        diagnosis: 'Colecistitis aguda',
        admissionDate: '16/03/2026',
        doctor: 'Dra. Ana Martínez',
        nurse: 'Enf. María García',
        alerts: ['Pre-quirúrgico', 'Ayuno absoluto'],
        vitals: {
          heartRate: 95,
          bloodPressure: '130/80',
          temperature: 37.5,
          oxygenSat: 99,
        },
      },
    },
    {
      id: '104-B',
      room: '104',
      bed: 'B',
      status: 'empty',
    },
    {
      id: '105-A',
      room: '105',
      bed: 'A',
      status: 'occupied',
      patient: {
        name: 'Pedro Morales Cruz',
        age: 68,
        gender: 'M',
        diagnosis: 'EPOC agudizado',
        admissionDate: '15/03/2026',
        doctor: 'Dr. Carlos Rodríguez',
        nurse: 'Enf. Laura Sánchez',
        alerts: ['Oxígeno a 2L/min', 'Nebulizaciones'],
        vitals: {
          heartRate: 96,
          bloodPressure: '140/90',
          temperature: 37.1,
          oxygenSat: 89,
        },
      },
    },
    {
      id: '105-B',
      room: '105',
      bed: 'B',
      status: 'occupied',
      patient: {
        name: 'Rosa Fernández Díaz',
        age: 55,
        gender: 'F',
        diagnosis: 'Fractura de fémur',
        admissionDate: '14/03/2026',
        doctor: 'Dr. Juan Pérez',
        nurse: 'Enf. Ana Martínez',
        alerts: ['TVP prophylaxis', 'Rehabilitación'],
        vitals: {
          heartRate: 74,
          bloodPressure: '125/78',
          temperature: 36.7,
          oxygenSat: 98,
        },
      },
    },
    {
      id: '106-A',
      room: '106',
      bed: 'A',
      status: 'maintenance',
    },
    {
      id: '106-B',
      room: '106',
      bed: 'B',
      status: 'occupied',
      patient: {
        name: 'Miguel Torres García',
        age: 42,
        gender: 'M',
        diagnosis: 'TCE leve - Observación',
        admissionDate: '17/03/2026',
        doctor: 'Dr. Carlos Rodríguez',
        nurse: 'Enf. María García',
        alerts: ['Escala Glasgow cada hora', 'Neurochecks'],
        vitals: {
          heartRate: 68,
          bloodPressure: '118/75',
          temperature: 36.4,
          oxygenSat: 99,
        },
      },
    },
  ]);

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'empty':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
      case 'maintenance':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      case 'cleaning':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getBedStatusBadge = (status: string) => {
    const styles = {
      occupied: 'bg-green-500 text-white',
      empty: 'bg-gray-400 text-white',
      maintenance: 'bg-orange-500 text-white',
      cleaning: 'bg-blue-500 text-white',
    };

    const labels = {
      occupied: 'Ocupada',
      empty: 'Libre',
      maintenance: 'Mantenimiento',
      cleaning: 'En limpieza',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getAlertCount = (bed: BedInfo) => {
    return bed.patient?.alerts?.length || 0;
  };

  const hasCriticalVitals = (bed: BedInfo) => {
    if (!bed.patient?.vitals) return false;
    const { vitals } = bed.patient;
    return (
      (vitals.oxygenSat && vitals.oxygenSat < 90) ||
      (vitals.temperature && vitals.temperature > 38) ||
      (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 60))
    );
  };

  const stats = {
    occupied: beds.filter(b => b.status === 'occupied').length,
    empty: beds.filter(b => b.status === 'empty').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
    total: beds.length,
  };

  // Group beds by room
  const rooms = beds.reduce((acc, bed) => {
    if (!acc[bed.room]) {
      acc[bed.room] = [];
    }
    acc[bed.room].push(bed);
    return acc;
  }, {} as Record<string, BedInfo[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Mapa de Camas</h1>
          <p className="text-muted-foreground">
            Estado en tiempo real de las habitaciones
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Camas</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.total}</h3>
            </div>
            <BedDouble className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm mb-1">Ocupadas</p>
              <h3 className="text-2xl font-bold text-green-700">{stats.occupied}</h3>
            </div>
            <BedDouble className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Libres</p>
              <h3 className="text-2xl font-bold text-gray-700">{stats.empty}</h3>
            </div>
            <BedDouble className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm mb-1">Mantenimiento</p>
              <h3 className="text-2xl font-bold text-orange-700">{stats.maintenance}</h3>
            </div>
            <BedDouble className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm mb-1">En Limpieza</p>
              <h3 className="text-2xl font-bold text-blue-700">{stats.cleaning}</h3>
            </div>
            <BedDouble className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bed Map */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Planta - Vista General</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(rooms).map(([room, roomBeds]) => (
              <div key={room} className="border border-border rounded-lg p-3 bg-muted/30">
                <div className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="p-1 bg-primary/10 rounded">Hab. {room}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {roomBeds.map((bed) => (
                    <button
                      key={bed.id}
                      onClick={() => setSelectedBed(bed)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        getBedStatusColor(bed.status)
                      } ${selectedBed?.id === bed.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">Cama {bed.bed}</span>
                        {bed.status === 'occupied' && hasCriticalVitals(bed) && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {bed.status === 'occupied' && bed.patient && (
                        <>
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-foreground truncate">{bed.patient.name.split(' ')[0]}</span>
                          </div>
                          {getAlertCount(bed) > 0 && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">{getAlertCount(bed)} alertas</span>
                            </div>
                          )}
                        </>
                      )}
                      {bed.status !== 'occupied' && (
                        <span className="text-xs text-muted-foreground capitalize">{bed.status}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bed Details */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Detalles de Cama</h2>
          
          {selectedBed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Habitación {selectedBed.room} - Cama {selectedBed.bed}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedBed.id}</p>
                </div>
                {getBedStatusBadge(selectedBed.status)}
              </div>

              {selectedBed.status === 'occupied' && selectedBed.patient && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{selectedBed.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedBed.patient.age} años • {selectedBed.patient.gender === 'M' ? 'Hombre' : 'Mujer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Diagnóstico: </span>
                      <span className="text-foreground">{selectedBed.patient.diagnosis}</span>
                    </div>
                  </div>

                  {selectedBed.patient.vitals && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Signos Vitales</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBed.patient.vitals.heartRate && (
                          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">FC</p>
                              <p className="font-semibold text-foreground">{selectedBed.patient.vitals.heartRate} bpm</p>
                            </div>
                          </div>
                        )}
                        {selectedBed.patient.vitals.bloodPressure && (
                          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">TA</p>
                              <p className="font-semibold text-foreground">{selectedBed.patient.vitals.bloodPressure}</p>
                            </div>
                          </div>
                        )}
                        {selectedBed.patient.vitals.temperature && (
                          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Temp</p>
                              <p className="font-semibold text-foreground">{selectedBed.patient.vitals.temperature}°C</p>
                            </div>
                          </div>
                        )}
                        {selectedBed.patient.vitals.oxygenSat && (
                          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Sat O2</p>
                              <p className={`font-semibold ${selectedBed.patient.vitals.oxygenSat < 90 ? 'text-red-500' : 'text-foreground'}`}>
                                {selectedBed.patient.vitals.oxygenSat}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBed.patient.alerts && selectedBed.patient.alerts.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Alertas Activas</h4>
                      <div className="space-y-2">
                        {selectedBed.patient.alerts.map((alert, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <span className="text-sm text-orange-700">{alert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Médico responsable</p>
                      <p className="font-semibold text-foreground">{selectedBed.patient.doctor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enfermero/a</p>
                      <p className="font-semibold text-foreground">{selectedBed.patient.nurse}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Fecha ingreso</p>
                      <p className="font-semibold text-foreground">{selectedBed.patient.admissionDate}</p>
                    </div>
                  </div>

                  {currentRole === 'Médico/a' && (
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      Ver Historia Clínica
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {selectedBed.status !== 'occupied' && (
                <div className="text-center py-8">
                  <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Cama disponible</p>
                  {currentRole === 'Médico/a' && (
                    <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      Asignar Paciente
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Selecciona una cama para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
