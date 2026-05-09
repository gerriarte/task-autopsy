import { STORAGE_KEY, PENDING_SYNC_KEY } from './constants.js';

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

export function loadTasks() {
  return safeGet(STORAGE_KEY, []);
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
