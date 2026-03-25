'use client';

import { useState, useEffect } from 'react';
import { Clock, Pill, Activity, AlertCircle, CheckCircle, Circle, Stethoscope, ClipboardList, Bath, Utensils } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  patient: string;
  room: string;
  task: string;
  details: string;
  status: 'pending' | 'completed' | 'delayed' | 'in-progress';
  priority: 'normal' | 'urgent' | 'critical';
  roles: string[];
}

interface MedicalScheduleProps {
  currentRole: string;
}

export function MedicalSchedule({ currentRole }: MedicalScheduleProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allScheduleItems] = useState<ScheduleItem[]>([
    // Tareas de Médico/a
    {
      id: '1',
      time: '14:00',
      patient: 'María González Ruiz',
      room: '101-A',
      task: 'Evolución médica diaria',
      details: 'Revisión post-operatoria, control de drenajes',
      status: 'pending',
      priority: 'urgent',
      roles: ['Médico/a']
    },
    {
      id: '2',
      time: '14:30',
      patient: 'Juan Pérez Martín',
      room: '102-B',
      task: 'Revisión de analítica',
      details: 'Hemograma y bioquímica completa',
      status: 'in-progress',
      priority: 'normal',
      roles: ['Médico/a']
    },
    {
      id: '3',
      time: '15:00',
      patient: 'Ana Martínez López',
      room: '103-A',
      task: 'Interconsulta Cardiología',
      details: 'Valoración pre-quirúrgica',
      status: 'pending',
      priority: 'critical',
      roles: ['Médico/a']
    },
    {
      id: '4',
      time: '16:00',
      patient: 'Carlos Sánchez Vila',
      room: '105-B',
      task: 'Alta médica programada',
      details: 'Preparar informe de alta y prescripción',
      status: 'pending',
      priority: 'normal',
      roles: ['Médico/a']
    },

    // Tareas de Enfermero/a
    {
      id: '5',
      time: '14:00',
      patient: 'María González Ruiz',
      room: '101-A',
      task: 'Insulina Regular',
      details: '10 UI - Vía SC',
      status: 'delayed',
      priority: 'critical',
      roles: ['Enfermero/a']
    },
    {
      id: '6',
      time: '14:30',
      patient: 'Juan Pérez Martín',
      room: '102-B',
      task: 'Omeprazol',
      details: '40 mg - Vía IV',
      status: 'in-progress',
      priority: 'normal',
      roles: ['Enfermero/a']
    },
    {
      id: '7',
      time: '15:00',
      patient: 'Ana Martínez López',
      room: '103-A',
      task: 'Antibiótico (Ceftriaxona)',
      details: '1 g - Vía IV',
      status: 'pending',
      priority: 'urgent',
      roles: ['Enfermero/a']
    },
    {
      id: '8',
      time: '15:30',
      patient: 'Pedro Morales Cruz',
      room: '108-B',
      task: 'Toma de constantes vitales',
      details: 'TA, FC, Temperatura, Sat O2',
      status: 'pending',
      priority: 'normal',
      roles: ['Enfermero/a']
    },
    {
      id: '9',
      time: '16:00',
      patient: 'Laura García Torres',
      room: '107-A',
      task: 'Cura de herida quirúrgica',
      details: 'Cambio de apósito, valoración',
      status: 'pending',
      priority: 'urgent',
      roles: ['Enfermero/a']
    },
    {
      id: '10',
      time: '16:30',
      patient: 'Rosa Fernández Díaz',
      room: '110-A',
      task: 'Control de glucemia',
      details: 'Glucemia capilar preprandial',
      status: 'pending',
      priority: 'normal',
      roles: ['Enfermero/a']
    },

    // Tareas de TCAE
    {
      id: '11',
      time: '14:00',
      patient: 'María González Ruiz',
      room: '101-A',
      task: 'Aseo personal',
      details: 'Higiene completa en cama',
      status: 'completed',
      priority: 'normal',
      roles: ['TCAE']
    },
    {
      id: '12',
      time: '14:30',
      patient: 'Juan Pérez Martín',
      room: '102-B',
      task: 'Ayuda alimentación',
      details: 'Supervisión de comida (dieta blanda)',
      status: 'pending',
      priority: 'normal',
      roles: ['TCAE']
    },
    {
      id: '13',
      time: '15:00',
      patient: 'Carlos Sánchez Vila',
      room: '105-B',
      task: 'Movilización',
      details: 'Cambio postural cada 2h',
      status: 'pending',
      priority: 'urgent',
      roles: ['TCAE']
    },
    {
      id: '14',
      time: '15:30',
      patient: 'Laura García Torres',
      room: '107-A',
      task: 'Cambio de ropa de cama',
      details: 'Cambio completo de sábanas',
      status: 'pending',
      priority: 'normal',
      roles: ['TCAE']
    },
    {
      id: '15',
      time: '16:00',
      patient: 'Pedro Morales Cruz',
      room: '108-B',
      task: 'Asistencia en deambulación',
      details: 'Paseo supervisado por pasillo',
      status: 'pending',
      priority: 'normal',
      roles: ['TCAE']
    },
    {
      id: '16',
      time: '16:30',
      patient: 'Ana Martínez López',
      room: '103-A',
      task: 'Control de ingesta hídrica',
      details: 'Registro de líquidos (balance 24h)',
      status: 'in-progress',
      priority: 'normal',
      roles: ['TCAE']
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      delayed: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-gray-100 text-gray-700 border-gray-300'
    };

    const labels = {
      completed: 'Completado',
      'in-progress': 'En Progreso',
      delayed: 'Retrasado',
      pending: 'Pendiente'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      urgent: 'bg-orange-500 text-white',
      normal: 'bg-gray-400 text-white'
    };

    const labels = {
      critical: 'CRÍTICO',
      urgent: 'URGENTE',
      normal: 'NORMAL'
    };

    return (
      <span className={`px-2 py-0.5 text-xs rounded ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const isUpcoming = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduleTime = new Date(currentTime);
    scheduleTime.setHours(hours, minutes, 0);

    const diff = scheduleTime.getTime() - currentTime.getTime();
    return diff > 0 && diff <= 30 * 60 * 1000;
  };

  const getTaskIcon = (task: string) => {
    if (task.toLowerCase().includes('insulina') || task.toLowerCase().includes('antibiótico') || task.toLowerCase().includes('omeprazol')) {
      return <Pill className="w-4 h-4 text-primary" />;
    }
    if (task.toLowerCase().includes('evolución') || task.toLowerCase().includes('interconsulta') || task.toLowerCase().includes('alta')) {
      return <Stethoscope className="w-4 h-4 text-primary" />;
    }
    if (task.toLowerCase().includes('aseo') || task.toLowerCase().includes('higiene')) {
      return <Bath className="w-4 h-4 text-primary" />;
    }
    if (task.toLowerCase().includes('alimentación') || task.toLowerCase().includes('comida')) {
      return <Utensils className="w-4 h-4 text-primary" />;
    }
    if (task.toLowerCase().includes('constantes') || task.toLowerCase().includes('glucemia') || task.toLowerCase().includes('cura')) {
      return <Activity className="w-4 h-4 text-primary" />;
    }
    return <ClipboardList className="w-4 h-4 text-primary" />;
  };

  const getScheduleTitle = () => {
    switch (currentRole) {
      case 'Médico/a':
        return 'Cronograma Médico';
      case 'Enfermero/a':
        return 'Cronograma de Enfermería';
      case 'TCAE':
        return 'Cronograma de Cuidados Auxiliares';
      default:
        return 'Cronograma de Tareas';
    }
  };

  const scheduleItems = allScheduleItems.filter(item => item.roles.includes(currentRole));

  const sortedItems = [...scheduleItems].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{getScheduleTitle()}</h2>
            <p className="text-sm text-muted-foreground">Horario en tiempo real</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-foreground">
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border transition-all ${
              item.status === 'delayed'
                ? 'bg-red-50 border-red-300 shadow-md'
                : isUpcoming(item.time)
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : item.status === 'completed'
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : 'bg-background border-border hover:border-primary hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(item.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-mono font-semibold text-foreground">
                      {item.time}
                    </span>
                    {getPriorityBadge(item.priority)}
                    {isUpcoming(item.time) && item.status === 'pending' && (
                      <span className="px-2 py-0.5 text-xs rounded bg-yellow-500 text-white animate-pulse">
                        PRÓXIMO
                      </span>
                    )}
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{item.patient}</span>
                      <span className="text-sm text-muted-foreground">• Hab. {item.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTaskIcon(item.task)}
                      <span className="text-sm text-foreground font-medium">{item.task}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {item.details}
                  </div>
                </div>

                {item.status === 'delayed' && (
                  <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Atención requerida: Tarea retrasada
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-2 lg:gap-4 text-center text-sm">
          <div>
            <div className="text-xl lg:text-2xl font-bold text-red-500">
              {scheduleItems.filter(i => i.status === 'delayed').length}
            </div>
            <div className="text-muted-foreground text-xs lg:text-sm">Retrasadas</div>
          </div>
          <div>
            <div className="text-xl lg:text-2xl font-bold text-blue-500">
              {scheduleItems.filter(i => i.status === 'in-progress').length}
            </div>
            <div className="text-muted-foreground text-xs lg:text-sm">En Progreso</div>
          </div>
          <div>
            <div className="text-xl lg:text-2xl font-bold text-gray-500">
              {scheduleItems.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-muted-foreground text-xs lg:text-sm">Pendientes</div>
          </div>
          <div>
            <div className="text-xl lg:text-2xl font-bold text-green-500">
              {scheduleItems.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-muted-foreground text-xs lg:text-sm">Completadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
