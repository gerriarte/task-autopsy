import { useMemo } from 'react';
import useTaskStore from '../store/taskStore.js';
import { TASK_STATUS } from '../utils/constants.js';

/**
 * Calcula métricas agregadas de productividad.
 */
export function useStats() {
  const { tasks } = useTaskStore();

  return useMemo(() => {
    let totalTasks = tasks.length;
    let completedTasks = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    let totalEstimatedMin = 0;
    let totalRealMin = 0;
    let totalTimeSpentSec = 0;

    // Para streaks: set de días con al menos una subtask completada
    const activeDays = new Set();
    // Para "hoy": subtasks en progreso o pendientes de tareas no terminadas
    const todayItems = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const task of tasks) {
      if (task.status === TASK_STATUS.COMPLETED) completedTasks++;

      for (const st of task.subtasks) {
        totalSubtasks++;
        totalEstimatedMin += st.estimatedMinutes || 0;

        if (st.status === TASK_STATUS.COMPLETED) {
          completedSubtasks++;
          totalTimeSpentSec += st.timeSpentSeconds || 0;
          totalRealMin += Math.round((st.timeSpentSeconds || 0) / 60);

          // Registrar día de completación para streaks
          if (st.completedAt) {
            activeDays.add(st.completedAt.slice(0, 10));
          }
        }

        // Items para vista "hoy": in_progress primero, luego pending de tareas no completadas
        if (task.status !== TASK_STATUS.COMPLETED) {
          if (st.status === TASK_STATUS.IN_PROGRESS) {
            todayItems.push({ ...st, taskId: task.id, taskTitle: task.title, priority: 0 });
          } else if (st.status === TASK_STATUS.PENDING) {
            todayItems.push({ ...st, taskId: task.id, taskTitle: task.title, priority: 1 });
          }
        }
      }
    }

    // ─── Streak calculation ───
    const streak = calculateStreak(activeDays, todayStr);

    // ─── Accuracy (estimado vs real) ───
    const accuracy = totalEstimatedMin > 0 && totalRealMin > 0
      ? Math.round((totalRealMin / totalEstimatedMin) * 100)
      : null; // null = sin datos suficientes

    // ─── Today items: in_progress primero, después pending por orden ───
    todayItems.sort((a, b) => a.priority - b.priority || (a.order || 0) - (b.order || 0));

    return {
      totalTasks,
      completedTasks,
      totalSubtasks,
      completedSubtasks,
      totalEstimatedMin,
      totalRealMin,
      totalTimeSpentSec,
      accuracy,
      streak,
      todayItems,
      activeDays: activeDays.size,
    };
  }, [tasks]);
}

/**
 * Calcula el streak actual: días consecutivos con actividad
 * contando hacia atrás desde hoy (o ayer si hoy aún no hubo actividad).
 */
function calculateStreak(activeDays, todayStr) {
  if (activeDays.size === 0) return 0;

  let streak = 0;
  const check = new Date(todayStr);

  // Si hoy hay actividad, empezar desde hoy. Si no, desde ayer.
  if (activeDays.has(todayStr)) {
    streak = 1;
    check.setDate(check.getDate() - 1);
  } else {
    check.setDate(check.getDate() - 1);
    if (!activeDays.has(check.toISOString().slice(0, 10))) {
      return 0; // ni hoy ni ayer → streak roto
    }
  }

  // Contar hacia atrás
  while (activeDays.has(check.toISOString().slice(0, 10))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  return streak;
}

/**
 * Formatea minutos a "Xh Ym"
 */
export function formatMinutes(min) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
