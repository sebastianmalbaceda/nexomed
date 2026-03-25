'use client';

import { Home, ClipboardList, History, Users, Settings, BarChart3, Building2, TestTube, BedDouble, Activity } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bed-map', label: 'Mapa de Camas', icon: BedDouble },
    { id: 'tests', label: 'Pruebas Diagnósticas', icon: TestTube },
    { id: 'shift-report', label: 'Informe de Turno', icon: ClipboardList },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'personnel', label: 'Personal', icon: Users },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">NexoMed</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestión Clínica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Planta Única</span>
          </div>
          <div className="text-sm text-muted-foreground">
            12 habitaciones • 24 pacientes
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            8 profesionales activos
          </div>
        </div>
      </div>
    </aside>
  );
}
