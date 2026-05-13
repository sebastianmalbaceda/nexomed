import {
  LayoutDashboard,
  BedDouble,
  Bell,
  TestTube,
  History,
  ClipboardList,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Users,
  UserRoundCheck,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { Role } from '@/lib/types';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/beds', label: 'Mapa de Camas', icon: BedDouble, roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/beds?tab=my-patients', label: 'Mis Pacientes', icon: Users, roles: ['NURSE', 'TCAE'] },
  { to: '/doctor', label: 'Panel Médico', icon: UserRoundCheck, roles: ['DOCTOR'] },
  { to: '/patients', label: 'Pacientes', icon: Users, roles: ['DOCTOR'] },
  { to: '/nurse', label: 'Vista Enfermero', icon: ClipboardList, roles: ['NURSE'] },
  { to: '/vitals', label: 'Constantes Vitales', icon: Stethoscope, roles: ['TCAE', 'NURSE'] },
  { to: '/notifications', label: 'Notificaciones', icon: Bell, roles: ['NURSE', 'DOCTOR'] },
  { to: '/tests', label: 'Pruebas Diagnósticas', icon: TestTube, roles: ['DOCTOR', 'NURSE'] },
  { to: '/history', label: 'Historial', icon: History, roles: ['NURSE', 'DOCTOR'] },
  { to: '/schedule', label: 'Turno y Horario', icon: Calendar, roles: ['NURSE', 'DOCTOR', 'TCAE'] },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle, roles: ['NURSE', 'DOCTOR'] },
];

export function getVisibleNavItems(role: Role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isNavItemActive(itemTo: string, pathname: string, search: string) {
  const [itemPathname, itemSearch = ''] = itemTo.split('?');
  const normalizedItemSearch = itemSearch ? `?${itemSearch}` : '';

  return itemPathname === pathname && normalizedItemSearch === search;
}
