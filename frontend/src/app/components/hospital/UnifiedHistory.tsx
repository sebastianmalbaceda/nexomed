'use client';

import { Clock, FileText, AlertCircle, Pill, Bath, Stethoscope, Utensils, Activity } from 'lucide-react';

interface UnifiedHistoryProps {
  currentRole: string;
}

export function UnifiedHistory({ currentRole }: UnifiedHistoryProps) {
  const getAllHistory = () => {
    const medicalHistory = [
      {
        id: 1,
        type: 'medical',
        title: 'Evolución médica registrada - Hab. 101-A',
        user: 'Dr. Carlos Rodríguez',
        time: 'Hace 30 minutos',
        icon: Stethoscope,
        color: 'bg-chart-2',
      },
      {
        id: 2,
        type: 'medical',
        title: 'Prescripción actualizada - Paciente 102-B',
        user: 'Dr. Juan Pérez',
        time: 'Hace 1 hora',
        icon: FileText,
        color: 'bg-chart-3',
      },
      {
        id: 3,
        type: 'medical',
        title: 'Interconsulta solicitada a Cardiología - Hab. 103-A',
        user: 'Dra. Ana Martínez',
        time: 'Hace 2 horas',
        icon: Stethoscope,
        color: 'bg-chart-2',
      },
      {
        id: 4,
        type: 'medical',
        title: 'Alta médica programada - Paciente 105-B',
        user: 'Dr. Carlos Rodríguez',
        time: 'Hace 3 horas',
        icon: FileText,
        color: 'bg-chart-4',
      },
    ];

    const nursingHistory = [
      {
        id: 5,
        type: 'nursing',
        title: 'Medicación administrada - Hab. 101-A',
        user: 'Enfermera María García',
        time: 'Hace 15 minutos',
        icon: Pill,
        color: 'bg-chart-2',
      },
      {
        id: 6,
        type: 'alert',
        title: 'Alerta: Signos vitales anormales - Hab. 103-A',
        user: 'Sistema',
        time: 'Hace 1 hora',
        icon: AlertCircle,
        color: 'bg-destructive',
      },
      {
        id: 7,
        type: 'nursing',
        title: 'Cura de herida realizada - Hab. 107-A',
        user: 'Enfermera Laura Sánchez',
        time: 'Hace 2 horas',
        icon: Activity,
        color: 'bg-chart-3',
      },
      {
        id: 8,
        type: 'nursing',
        title: 'Constantes vitales registradas - Hab. 108-B',
        user: 'Enfermera Ana Martínez',
        time: 'Hace 45 minutos',
        icon: Activity,
        color: 'bg-chart-2',
      },
      {
        id: 9,
        type: 'alert',
        title: 'Medicación pendiente - Hab. 105-B',
        user: 'Sistema',
        time: 'Hace 30 minutos',
        icon: AlertCircle,
        color: 'bg-destructive',
      },
    ];

    const tcaeHistory = [
      {
        id: 10,
        type: 'care',
        title: 'Aseo personal completado - Hab. 101-A',
        user: 'TCAE Pedro Morales',
        time: 'Hace 20 minutos',
        icon: Bath,
        color: 'bg-chart-1',
      },
      {
        id: 11,
        type: 'care',
        title: 'Ayuda en alimentación - Hab. 102-B',
        user: 'TCAE Rosa Fernández',
        time: 'Hace 1 hora',
        icon: Utensils,
        color: 'bg-chart-3',
      },
      {
        id: 12,
        type: 'care',
        title: 'Cambio postural realizado - Hab. 105-B',
        user: 'TCAE Pedro Morales',
        time: 'Hace 2 horas',
        icon: Activity,
        color: 'bg-chart-2',
      },
      {
        id: 13,
        type: 'care',
        title: 'Cambio de ropa de cama - Hab. 107-A',
        user: 'TCAE Rosa Fernández',
        time: 'Hace 3 horas',
        icon: Bath,
        color: 'bg-chart-1',
      },
    ];

    switch (currentRole) {
      case 'Médico/a':
        return [...medicalHistory, ...nursingHistory.filter(h => h.type === 'alert')];
      case 'Enfermero/a':
        return nursingHistory;
      case 'TCAE':
        return tcaeHistory;
      default:
        return [...medicalHistory, ...nursingHistory, ...tcaeHistory];
    }
  };

  const historyItems = getAllHistory().sort((a, b) => a.id - b.id).slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historial Unificado - {currentRole}
        </h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          Ver todo
        </button>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
            >
              <div className={`${item.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground font-medium mb-1">{item.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.user}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
