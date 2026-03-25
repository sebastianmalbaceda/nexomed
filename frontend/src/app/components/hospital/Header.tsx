'use client';

import { Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  notifications: number;
  onNotificationsClick: () => void;
}

export function Header({ currentRole, onRoleChange, notifications, onNotificationsClick }: HeaderProps) {
  const { data: session } = useSession();
  const roles = ['Médico/a', 'Enfermero/a', 'TCAE'];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="appearance-none bg-primary text-primary-foreground px-4 py-2 pr-10 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors font-semibold text-sm"
          >
            {roles.map((role) => (
              <option key={role} value={role} className="bg-background text-foreground">
                {role}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground pointer-events-none" />
        </div>
        <div className="hidden md:block text-sm text-muted-foreground capitalize">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNotificationsClick}
          className="relative p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
              {notifications}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-sm hidden sm:block">
            <div className="text-foreground font-medium">{session?.user?.name || 'Usuario'}</div>
            <div className="text-muted-foreground text-xs">ID: {session?.user?.employeeId || 'N/A'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors text-sm font-medium"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
