'use client';

import { Users, AlertCircle, CheckCircle, BedDouble, Pill, ClipboardList, Activity } from 'lucide-react';

interface DashboardOverviewProps {
  currentRole: string;
}

export function DashboardOverview({ currentRole }: DashboardOverviewProps) {
  const getRoleStats = () => {
    switch (currentRole) {
      case 'Médico/a':
        return [
          { label: 'Pacientes Asignados', value: '24', icon: Users, color: 'bg-chart-1' },
          { label: 'Pendientes Evolución', value: '8', icon: ClipboardList, color: 'bg-chart-3' },
          { label: 'Interconsultas', value: '3', icon: Activity, color: 'bg-chart-5' },
          { label: 'Altas Programadas', value: '2', icon: CheckCircle, color: 'bg-chart-4' },
        ];
      
      case 'Enfermero/a':
        return [
          { label: 'Pacientes a Cargo', value: '12', icon: Users, color: 'bg-chart-1' },
          { label: 'Medicaciones Pendientes', value: '8', icon: Pill, color: 'bg-chart-3' },
          { label: 'Alertas Activas', value: '3', icon: AlertCircle, color: 'bg-chart-5' },
          { label: 'Tareas Completadas', value: '15', icon: CheckCircle, color: 'bg-chart-4' },
        ];
      
      case 'TCAE':
        return [
          { label: 'Pacientes Asignados', value: '12', icon: Users, color: 'bg-chart-1' },
          { label: 'Cuidados Pendientes', value: '6', icon: BedDouble, color: 'bg-chart-3' },
          { label: 'Alertas de Higiene', value: '2', icon: AlertCircle, color: 'bg-chart-5' },
          { label: 'Tareas Completadas', value: '18', icon: CheckCircle, color: 'bg-chart-4' },
        ];
      
      default:
        return [
          { label: 'Personal Activo', value: '8', icon: Users, color: 'bg-chart-1' },
          { label: 'Pacientes', value: '24/24', icon: BedDouble, color: 'bg-chart-3' },
          { label: 'Alertas Pendientes', value: '3', icon: AlertCircle, color: 'bg-chart-5' },
          { label: 'Tareas Completadas', value: '18', icon: CheckCircle, color: 'bg-chart-4' },
        ];
    }
  };

  const stats = getRoleStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-card border border-border rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</h3>
              </div>
              <div className={`${stat.color} w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
