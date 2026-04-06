import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Loader2, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { NOTIFICATION_TYPE_LABELS, POLLING_INTERVAL_MS } from '@/lib/constants';
import type { Notification } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  MED_NEW:     'bg-primary/10 text-primary border-primary/20',
  MED_CHANGE:  'bg-chart-4/20 text-yellow-400 border-yellow-400/20',
  MED_REMOVED: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      api.put<Notification>(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = () => {
    notifications
      .filter((n) => !n.read)
      .forEach((n) => markReadMutation.mutate(n.id));
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Actualización automática cada 5 s
            {unread > 0 && (
              <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
                {unread} sin leer
              </span>
            )}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markReadMutation.isPending}
            className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-60"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          No se pudieron cargar las notificaciones.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <BellOff className="w-10 h-10 opacity-40" />
            <p>Sin notificaciones</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-5 py-4 flex items-start gap-4 transition-opacity ${n.read ? 'opacity-50' : ''}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        TYPE_COLORS[n.type] ?? 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markReadMutation.mutate(n.id)}
                    disabled={markReadMutation.isPending}
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-60"
                  >
                    Leída
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
