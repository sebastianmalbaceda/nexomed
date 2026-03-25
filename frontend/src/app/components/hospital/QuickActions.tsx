'use client';

import { Plus, FileText, UserPlus, AlertTriangle, Pill, Stethoscope, Bath, Utensils, ClipboardCheck, FileCheck, Activity } from 'lucide-react';

interface QuickActionsProps {
  currentRole: string;
}

export function QuickActions({ currentRole }: QuickActionsProps) {
  const getRoleActions = () => {
    switch (currentRole) {
      case 'Médico/a':
        return [
          { label: 'Nueva Prescripción', icon: Pill, color: 'bg-primary hover:bg-primary/90' },
          { label: 'Evolución Médica', icon: FileText, color: 'bg-chart-2 hover:bg-chart-2/90' },
          { label: 'Solicitar Interconsulta', icon: Stethoscope, color: 'bg-chart-3 hover:bg-chart-3/90' },
          { label: 'Programar Alta', icon: FileCheck, color: 'bg-chart-4 hover:bg-chart-4/90' },
        ];
      
      case 'Enfermero/a':
        return [
          { label: 'Registrar Medicación', icon: Pill, color: 'bg-primary hover:bg-primary/90' },
          { label: 'Tomar Constantes', icon: Activity, color: 'bg-chart-2 hover:bg-chart-2/90' },
          { label: 'Registro de Curas', icon: ClipboardCheck, color: 'bg-chart-3 hover:bg-chart-3/90' },
          { label: 'Reportar Incidencia', icon: AlertTriangle, color: 'bg-destructive hover:bg-destructive/90' },
        ];
      
      case 'TCAE':
        return [
          { label: 'Registrar Higiene', icon: Bath, color: 'bg-primary hover:bg-primary/90' },
          { label: 'Control Alimentación', icon: Utensils, color: 'bg-chart-2 hover:bg-chart-2/90' },
          { label: 'Cambio Postural', icon: ClipboardCheck, color: 'bg-chart-3 hover:bg-chart-3/90' },
          { label: 'Reportar Incidencia', icon: AlertTriangle, color: 'bg-destructive hover:bg-destructive/90' },
        ];
      
      default:
        return [
          { label: 'Nuevo Registro', icon: Plus, color: 'bg-primary hover:bg-primary/90' },
          { label: 'Crear Informe', icon: FileText, color: 'bg-chart-2 hover:bg-chart-2/90' },
          { label: 'Añadir Personal', icon: UserPlus, color: 'bg-chart-1 hover:bg-chart-1/90' },
          { label: 'Reportar Incidencia', icon: AlertTriangle, color: 'bg-destructive hover:bg-destructive/90' },
        ];
    }
  };

  const actions = getRoleActions();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg transition-all flex items-center gap-3 text-left`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
