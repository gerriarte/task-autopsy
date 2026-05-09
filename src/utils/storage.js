import { STORAGE_KEY, PENDING_SYNC_KEY, LEARNING_PATH_KEY } from './constants.js';

function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`localStorage read failed for "${key}":`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`localStorage write failed for "${key}":`, e);
    return false;
  }
}

/**
 * Normaliza tasks viejas: agrega campos nuevos con defaults
 * para compatibilidad con storage de versiones anteriores.
 */
function migrateTask(task) {
  return {
    completedAt: null,
    ...task,
    subtasks: (task.subtasks || []).map((st) => ({
      timeSpentSeconds: 0,
      startedAt: null,
      ...st,
    })),
  };
}

export function loadTasks() {
  const raw = safeGet(STORAGE_KEY, []);
  return Array.isArray(raw) ? raw.map(migrateTask) : [];
}

export function saveTasks(tasks) {
  return safeSet(STORAGE_KEY, tasks);
}

export function clearTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('localStorage clear failed:', e);
    return false;
  }
}

export function loadPendingSync() {
  return safeGet(PENDING_SYNC_KEY, []);
}

export function savePendingSync(items) {
  return safeSet(PENDING_SYNC_KEY, items);
}

export function addPendingSync(item) {
  const pending = loadPendingSync();
  pending.push({ ...item, queuedAt: new Date().toISOString() });
  return safeSet(PENDING_SYNC_KEY, pending);
}

export function loadLearningPath() {
  return safeGet(LEARNING_PATH_KEY, []);
}

export function saveLearningPath(items) {
  return safeSet(LEARNING_PATH_KEY, items);
}
