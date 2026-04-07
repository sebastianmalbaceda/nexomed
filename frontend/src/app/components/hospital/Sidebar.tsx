import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Bell,
  TestTube,
  History,
  Activity,
  LogOut,
  Building2,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS } from '@/lib/constants';
import type { Role } from '@/lib/types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',      label: 'Dashboard',            icon: LayoutDashboard, roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/beds',           label: 'Mapa de Camas',        icon: BedDouble,       roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/patients',       label: 'Pacientes',            icon: Users,           roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/nurse',          label: 'Vista Enfermero',      icon: ClipboardList,   roles: ['NURSE', 'DOCTOR'] },
  { to: '/vitals',         label: 'Constantes Vitales',   icon: Stethoscope,     roles: ['TCAE', 'NURSE'] },
  { to: '/notifications',  label: 'Notificaciones',       icon: Bell,            roles: ['NURSE', 'DOCTOR'] },
  { to: '/tests',          label: 'Pruebas Diagnósticas', icon: TestTube,        roles: ['DOCTOR'] },
  { to: '/history',        label: 'Historial',            icon: History,         roles: ['NURSE', 'DOCTOR'] },
];

export function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const role = user?.role ?? 'NURSE';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-4 mb-2">
          Menú
        </p>
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + hospital info */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="bg-sidebar-accent rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-sidebar-foreground">Planta Única</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 pl-6">12 hab. · 24 camas</p>
        </div>

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user?.name ?? '—'}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {ROLE_LABELS[role]}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
