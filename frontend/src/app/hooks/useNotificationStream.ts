import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { BASE_URL } from '@/lib/api';

/**
 * ENF-RF3: Suscripción SSE a /notifications/stream para recibir
 * notificaciones en tiempo real. Cuando llega un evento, invalida
 * el query ['notifications'] para refrescar la UI inmediatamente.
 *
 * El polling en Header/NursePage/NotificationsPage sigue activo como fallback.
 */
export function useNotificationStream() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const url = `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    es.addEventListener('connected', () => {
      console.log('[SSE] conectado a /notifications/stream');
      // Refresca al conectar por si hubo cambios mientras estaba desconectado
      refresh();
    });

    es.addEventListener('notification', (e) => {
      console.log('[SSE] notificación recibida', (e as MessageEvent).data);
      refresh();
    });

    es.onerror = () => {
      // EventSource reconecta solo (con `retry:` del backend, 5s)
      console.warn('[SSE] error/desconexión — reintentando…');
    };

    return () => {
      es.close();
    };
  }, [token, queryClient]);
}
