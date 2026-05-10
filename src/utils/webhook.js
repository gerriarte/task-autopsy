const WEBHOOK_KEY = 'task_autopsy_webhook';

/**
 * Tipos de eventos que disparan webhooks.
 */
export const WEBHOOK_EVENTS = {
  TASK_CREATED: 'task.created',
  TASK_COMPLETED: 'task.completed',
  SUBTASK_COMPLETED: 'subtask.completed',
};

/**
 * Lee la configuración de webhook desde localStorage.
 * Retorna { url, enabled, events[] } o null.
 */
export function loadWebhookConfig() {
  try {
    const raw = localStorage.getItem(WEBHOOK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda la configuración de webhook.
 */
export function saveWebhookConfig(config) {
  try {
    localStorage.setItem(WEBHOOK_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/**
 * Limpia la configuración de webhook.
 */
export function clearWebhookConfig() {
  try {
    localStorage.removeItem(WEBHOOK_KEY);
  } catch {}
}

/**
 * Dispara un webhook si está configurado y el evento está habilitado.
 * Fire-and-forget: no bloquea la UI ni lanza errores visibles.
 *
 * @param {string} eventType - uno de WEBHOOK_EVENTS
 * @param {object} payload - data del evento
 */
export async function fireWebhook(eventType, payload) {
  const config = loadWebhookConfig();
  if (!config?.enabled || !config?.url) return;
  if (config.events && !config.events.includes(eventType)) return;

  const body = {
    event: eventType,
    timestamp: new Date().toISOString(),
    source: 'Task Autopsy',
    data: payload,
  };

  try {
    await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // No-cors como fallback para webhooks que no envían CORS headers
      mode: 'no-cors',
    });
  } catch (err) {
    // Silencioso: los webhooks no deben romper la app
    console.warn('Webhook failed:', err.message);
  }
}

/**
 * Testea la conexión del webhook con un ping.
 * A diferencia de fireWebhook, este SÍ reporta errores.
 */
export async function testWebhook(url) {
  const body = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    source: 'Task Autopsy',
    data: { message: 'Test connection from Task Autopsy' },
  };

  // Intentamos con cors primero, si falla intentamos no-cors
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // Si tenemos respuesta con status, reportamos
    if (response.ok || response.type === 'opaque') {
      return { ok: true };
    }
    return { ok: false, error: `HTTP ${response.status}` };
  } catch {
    // Intentar no-cors (muchos webhooks no envían CORS headers pero sí reciben)
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        mode: 'no-cors',
      });
      // no-cors siempre da response.type === 'opaque', no podemos saber si funcionó
      return { ok: true, warning: 'Enviado (no se puede confirmar recepción por CORS)' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}
