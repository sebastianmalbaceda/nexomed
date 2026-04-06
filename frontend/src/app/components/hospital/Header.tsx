import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getCurrentShift, POLLING_INTERVAL_MS, ROLE_LABELS } from '@/lib/constants';
import type { Notification } from '@/lib/types';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':     'Panel de Control',
  '/beds':          'Mapa de Camas',
  '/patients':      'Pacientes',
  '/notifications': 'Notificaciones',
  '/tests':         'Pruebas Diagnósticas',
  '/history':       'Historial',
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [search, setSearch] = useState('');

  const shift = getCurrentShift();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'NexoMed';

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    refetchInterval: POLLING_INTERVAL_MS,
    enabled: user?.role === 'NURSE' || user?.role === 'DOCTOR',
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left: page title */}
      <div className="flex items-center gap-4 min-w-0">
        <h2 className="text-lg font-semibold text-foreground truncate">{pageTitle}</h2>
        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <span>{shift.emoji}</span>
          <span>Turno de {shift.label}</span>
        </span>
      </div>

      {/* Right: search + bell + user */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-52"
          />
        </div>

        {/* Notification bell */}
        {(user?.role === 'NURSE' || user?.role === 'DOCTOR') && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* User pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block text-sm leading-tight">
            <p className="text-foreground font-medium">{user?.name ?? '—'}</p>
            <p className="text-muted-foreground text-xs">
              {user ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
