/**
 * Sistema de notificaciones browser para Task Autopsy.
 * Usa la Notification API nativa + service worker.
 * Sin backend: las notificaciones se disparan mientras la app esta abierta.
 */

const NOTIF_CONFIG_KEY = 'task_autopsy_notif_config';
const LAST_ACTIVITY_KEY = 'task_autopsy_last_activity';
const LAST_REMINDER_KEY = 'task_autopsy_last_reminder';

// ─── Defaults ───
const DEFAULT_CONFIG = {
  enabled: true,
  timerComplete: true,      // cuando un timer llega a 0
  subtaskComplete: true,    // cuando completas una subtask
  taskComplete: true,       // cuando completas todas las subtasks
  streakReminder: true,     // "tu racha se corta hoy"
  pendingReminder: true,    // "tenes X subtasks pendientes"
  quietHoursStart: 22,      // no molestar desde las 22
  quietHoursEnd: 8,         // hasta las 8
};

// ─── Permission ───

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const result = await Notification.requestPermission();
  return result;
}

// ─── Config ───

export function loadNotifConfig() {
  try {
    const raw = localStorage.getItem(NOTIF_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveNotifConfig(config) {
  localStorage.setItem(NOTIF_CONFIG_KEY, JSON.stringify(config));
}

// ─── Activity tracking ───

export function recordActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
}

function getLastActivity() {
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  return raw ? new Date(raw) : null;
}

function getLastReminder() {
  const raw = localStorage.getItem(LAST_REMINDER_KEY);
  return raw ? new Date(raw) : null;
}

function recordReminder() {
  localStorage.setItem(LAST_REMINDER_KEY, new Date().toISOString());
}

// ─── Quiet hours check ───

function isQuietHours(config) {
  const hour = new Date().getHours();
  const { quietHoursStart, quietHoursEnd } = config;

  if (quietHoursStart > quietHoursEnd) {
    // Crosses midnight: e.g. 22-8
    return hour >= quietHoursStart || hour < quietHoursEnd;
  }
  return hour >= quietHoursStart && hour < quietHoursEnd;
}

// ─── Send notification ───

/**
 * Envia una notificacion browser.
 * Respeta permisos, enabled flag, y quiet hours.
 */
export function sendNotification(title, options = {}) {
  const config = loadNotifConfig();

  if (!config.enabled) return null;
  if (getNotificationPermission() !== 'granted') return null;
  if (isQuietHours(config)) return null;

  const defaults = {
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: 'task-autopsy',
    renotify: true,
    silent: false,
  };

  try {
    // Try service worker notification first (works when tab is in background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, { ...defaults, ...options });
      });
      return true;
    }

    // Fallback to regular Notification
    const notif = new Notification(title, { ...defaults, ...options });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return notif;
  } catch {
    return null;
  }
}

// ─── Specific notification types ───

export function notifyTimerComplete(subtaskTitle) {
  const config = loadNotifConfig();
  if (!config.timerComplete) return;

  sendNotification('Tiempo cumplido', {
    body: `"${subtaskTitle}" — Marca como listo o segui un poco mas.`,
    tag: 'timer-complete',
  });
}

export function notifySubtaskComplete(subtaskTitle, taskTitle) {
  const config = loadNotifConfig();
  if (!config.subtaskComplete) return;

  sendNotification('Paso completado', {
    body: `"${subtaskTitle}" de ${taskTitle}`,
    tag: 'subtask-complete',
  });
}

export function notifyTaskComplete(taskTitle, subtaskCount) {
  const config = loadNotifConfig();
  if (!config.taskComplete) return;

  sendNotification('Tarea completada!', {
    body: `"${taskTitle}" — ${subtaskCount} pasos completados.`,
    tag: 'task-complete',
  });
}

export function notifyStreakAtRisk(streak) {
  const config = loadNotifConfig();
  if (!config.streakReminder) return;

  sendNotification('Tu racha esta en juego', {
    body: `Llevas ${streak} ${streak === 1 ? 'dia' : 'dias'} seguidos. Completa algo hoy para no perderla.`,
    tag: 'streak-risk',
  });
}

export function notifyPendingTasks(count) {
  const config = loadNotifConfig();
  if (!config.pendingReminder) return;

  sendNotification('Subtasks pendientes', {
    body: `Tenes ${count} ${count === 1 ? 'paso pendiente' : 'pasos pendientes'}. Elegí uno y arranca.`,
    tag: 'pending-tasks',
  });
}

// ─── Reminder scheduler (runs on app load + periodic) ───

/**
 * Evalua si hay que enviar un reminder.
 * Se llama al cargar la app y cada ~30 minutos.
 * Maximo 1 reminder por sesion (no spam).
 */
export function checkReminders(tasks, streak) {
  const config = loadNotifConfig();
  if (!config.enabled) return;
  if (getNotificationPermission() !== 'granted') return;
  if (isQuietHours(config)) return;

  // Max 1 reminder por sesion (4 horas)
  const lastReminder = getLastReminder();
  if (lastReminder) {
    const hoursSince = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 4) return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  // Check 1: Streak at risk (tiene streak > 0, no completo nada hoy)
  if (config.streakReminder && streak > 0) {
    const completedToday = tasks.some((t) =>
      t.subtasks.some(
        (st) => st.completedAt && st.completedAt.slice(0, 10) === todayStr
      )
    );

    if (!completedToday) {
      const hour = new Date().getHours();
      // Solo enviar reminder de streak despues de las 14h (tarde)
      if (hour >= 14) {
        notifyStreakAtRisk(streak);
        recordReminder();
        return; // 1 reminder max
      }
    }
  }

  // Check 2: Pending tasks sin actividad hoy
  if (config.pendingReminder) {
    const pendingCount = tasks.reduce((count, t) => {
      if (t.status === 'completed') return count;
      return count + t.subtasks.filter((st) => st.status === 'pending' || st.status === 'in_progress').length;
    }, 0);

    if (pendingCount > 0) {
      const lastAct = getLastActivity();
      const hoursSinceActivity = lastAct
        ? (Date.now() - lastAct.getTime()) / (1000 * 60 * 60)
        : 999;

      // Si paso mas de 2 horas sin actividad y hay cosas pendientes
      if (hoursSinceActivity > 2) {
        notifyPendingTasks(pendingCount);
        recordReminder();
        return;
      }
    }
  }
}
