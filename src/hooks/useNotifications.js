import { useEffect, useRef } from 'react';
import useTaskStore from '../store/taskStore.js';
import { useStats } from './useStats.js';
import {
  checkReminders,
  recordActivity,
  getNotificationPermission,
} from '../utils/notifications.js';

/**
 * Hook que inicializa el sistema de notificaciones.
 * - Registra actividad del usuario
 * - Corre checks periodicos para reminders (streak, pendientes)
 * - Se monta una sola vez en App.jsx
 */
export function useNotifications() {
  const { tasks } = useTaskStore();
  const { streak } = useStats();
  const intervalRef = useRef(null);

  // Registrar actividad al interactuar con la app
  useEffect(() => {
    function handleActivity() {
      recordActivity();
    }

    // Registrar actividad en clicks y teclas (throttled via passive)
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });

    // Registrar actividad al montar
    recordActivity();

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  // Check reminders al cargar y cada 30 min
  useEffect(() => {
    if (getNotificationPermission() !== 'granted') return;

    // Check inicial (con delay para no ser intrusivo al abrir)
    const initialTimeout = setTimeout(() => {
      checkReminders(tasks, streak);
    }, 10000); // 10 segundos despues de abrir

    // Check periodico cada 30 minutos
    intervalRef.current = setInterval(() => {
      checkReminders(tasks, streak);
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tasks, streak]);
}
