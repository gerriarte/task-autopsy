export const STORAGE_KEY = 'task_autopsy_tasks';
export const PENDING_SYNC_KEY = 'task_autopsy_pending_sync';

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

export const SUBTASK_DURATION_MIN = 15;
export const SUBTASK_DURATION_MAX = 30;
export const MAX_RETRIES = 3;
export const API_TIMEOUT_MS = 30000;

export const DECOMPOSE_PROMPT = `Sos un experto en productividad y gestión de tareas para personas con TDAH.
Tu trabajo es descomponer tareas complejas en micro-tareas accionables de 15-30 minutos.

Dado una tarea, retorná ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin backticks):
{
  "title": "Título resumido de la tarea",
  "estimatedMinutes": 90,
  "subtasks": [
    {
      "id": "st_1",
      "title": "Título de la micro-tarea",
      "description": "Qué hacer exactamente (1-2 oraciones)",
      "estimatedMinutes": 20,
      "order": 1,
      "knowledgeGaps": ["concepto que puede necesitar aprender"]
    }
  ],
  "learningGaps": ["gaps de conocimiento detectados globalmente"],
  "tips": ["tip motivacional específico para esta tarea"]
}

Reglas:
- Cada subtask: 15-30 minutos, accionable, específica
- Máximo 6 subtasks por tarea
- knowledgeGaps: vacío [] si no hay gaps
- tips: 1-2 tips máximo, motivacionales y específicos
- Retorná SOLO el JSON, nada más`;
