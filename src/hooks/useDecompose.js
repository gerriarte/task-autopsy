import { useCallback } from 'react';
import useTaskStore from '../store/taskStore.js';
import { callClaudeAPI } from '../utils/api.js';
import { DECOMPOSE_PROMPT, MAX_RETRIES } from '../utils/constants.js';

function validateDecomposed(data) {
  if (!data || typeof data !== 'object') throw new Error('Respuesta inválida: no es un objeto');
  if (!data.title) throw new Error('Falta título en la respuesta');
  if (!Array.isArray(data.subtasks) || data.subtasks.length === 0) {
    throw new Error('La descomposición no incluye subtareas');
  }
  return true;
}

/**
 * Hook para descomponer tareas con Claude.
 * Soporta dos modos:
 *  - decompose(text)          → crea una nueva tarea
 *  - decomposeInto(text, id)  → agrega subtasks a una tarea existente
 */
export function useDecompose() {
  const { addTask, addSubtasksToTask, setLoading, setError, clearError } = useTaskStore();

  const callWithRetries = useCallback(async (rawTaskText, context) => {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const userMessage = context
          ? `Contexto de la tarea principal: "${context}"\n\nNuevo paso/sub-tarea a descomponer: "${rawTaskText.trim()}"`
          : `Tarea a descomponer: "${rawTaskText.trim()}"`;

        const raw = await callClaudeAPI(DECOMPOSE_PROMPT, userMessage, 2500);

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new Error(`Claude retornó JSON inválido. Raw: ${raw.slice(0, 200)}`);
        }

        validateDecomposed(parsed);
        return parsed;
      } catch (error) {
        lastError = error;
        console.error(`Intento ${attempt}/${MAX_RETRIES} falló:`, error.message);

        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }, []);

  /**
   * Crea una tarea nueva desde texto libre.
   */
  const decompose = useCallback(async (rawTaskText) => {
    if (!rawTaskText?.trim()) {
      setError('Ingresá una tarea para descomponer');
      return null;
    }

    clearError();
    setLoading(true);

    try {
      const parsed = await callWithRetries(rawTaskText);
      const task = addTask(parsed);
      setLoading(false);
      return task;
    } catch (error) {
      setLoading(false);
      setError(`No se pudo descomponer la tarea: ${error?.message || 'Error desconocido'}`);
      return null;
    }
  }, [addTask, setLoading, setError, clearError, callWithRetries]);

  /**
   * Descompone texto y agrega las subtasks a una tarea existente.
   * @param {string} rawTaskText - texto a descomponer
   * @param {string} taskId - ID de la tarea destino
   * @param {string} taskContext - título de la tarea padre (para darle contexto a Claude)
   */
  const decomposeInto = useCallback(async (rawTaskText, taskId, taskContext) => {
    if (!rawTaskText?.trim()) {
      setError('Ingresá qué querés agregar');
      return null;
    }

    clearError();
    setLoading(true);

    try {
      const parsed = await callWithRetries(rawTaskText, taskContext);
      const subtasks = addSubtasksToTask(taskId, parsed);
      setLoading(false);
      return subtasks;
    } catch (error) {
      setLoading(false);
      setError(`No se pudo descomponer: ${error?.message || 'Error desconocido'}`);
      return null;
    }
  }, [addSubtasksToTask, setLoading, setError, clearError, callWithRetries]);

  return { decompose, decomposeInto };
}
