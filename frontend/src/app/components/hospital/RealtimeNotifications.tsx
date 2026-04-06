'use client';

import { X, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';

interface RealtimeNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RealtimeNotifications({ isOpen, onClose }: RealtimeNotificationsProps) {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Nueva incidencia reportada',
      message: 'Equipo 5 requiere mantenimiento',
      time: 'Ahora',
      icon: AlertCircle,
      color: 'bg-destructive',
    },
    {
      id: 2,
      type: 'info',
      title: 'Cambio de turno en 30 minutos',
      message: 'Preparar traspaso de información',
      time: 'Hace 5 min',
      icon: Info,
      color: 'bg-chart-2',
    },
    {
      id: 3,
      type: 'success',
      title: 'Tarea completada',
      message: 'Revisión de inventario finalizada',
      time: 'Hace 15 min',
      icon: CheckCircle,
      color: 'bg-chart-4',
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-16 right-6 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-6rem)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notificaciones</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className="p-4 border-b border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`${notification.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-medium mb-1">{notification.title}</h4>
                    <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button className="w-full text-center text-primary hover:text-primary/80 transition-colors font-medium text-sm">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </>
  );
}
