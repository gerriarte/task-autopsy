import { TASK_STATUS } from './constants.js';

/**
 * Genera un CSV con todas las tareas y subtasks aplanadas.
 * Formato: Task, Subtask, Status, Estimated (min), Real (min), Created, Completed
 */
export function exportToCSV(tasks) {
  const headers = [
    'Tarea',
    'Subtask',
    'Estado',
    'Estimado (min)',
    'Real (min)',
    'Creada',
    'Completada',
  ];

  const rows = [];

  for (const task of tasks) {
    if (task.subtasks.length === 0) {
      rows.push([
        escapeCSV(task.title),
        '',
        translateStatus(task.status),
        task.estimatedMinutes || '',
        '',
        formatDate(task.createdAt),
        formatDate(task.completedAt),
      ]);
    }

    for (const st of task.subtasks) {
      rows.push([
        escapeCSV(task.title),
        escapeCSV(st.title),
        translateStatus(st.status),
        st.estimatedMinutes || '',
        st.timeSpentSeconds ? Math.round(st.timeSpentSeconds / 60) : '',
        formatDate(task.createdAt),
        formatDate(st.completedAt),
      ]);
    }
  }

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csv;
}

/**
 * Genera un JSON completo con toda la data del usuario.
 * Incluye tasks, learning path, y metadata.
 */
export function exportToJSON(tasks, learningPath = []) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      app: 'Task Autopsy',
      data: {
        tasks,
        learningPath,
      },
    },
    null,
    2
  );
}

/**
 * Descarga un string como archivo.
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Shortcut: exportar y descargar CSV.
 */
export function downloadCSV(tasks) {
  const csv = exportToCSV(tasks);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(csv, `task-autopsy-${date}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Shortcut: exportar y descargar JSON.
 */
export function downloadJSON(tasks, learningPath = []) {
  const json = exportToJSON(tasks, learningPath);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(json, `task-autopsy-${date}.json`, 'application/json');
}

// ═══════════════ HELPERS ═══════════════

function escapeCSV(str) {
  if (!str) return '';
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function translateStatus(status) {
  const map = {
    [TASK_STATUS.PENDING]: 'Pendiente',
    [TASK_STATUS.IN_PROGRESS]: 'En progreso',
    [TASK_STATUS.COMPLETED]: 'Completada',
    [TASK_STATUS.BLOCKED]: 'Bloqueada',
  };
  return map[status] || status || '';
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}
