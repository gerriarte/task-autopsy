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

export function useDecompose() {
  const { addTask, setLoading, setError, clearError } = useTaskStore();

  const decompose = useCallback(async (rawTaskText) => {
    if (!rawTaskText?.trim()) {
      setError('Ingresá una tarea para descomponer');
      return null;
    }

    clearError();
    setLoading(true);

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const userMessage = `Tarea a descomponer: "${rawTaskText.trim()}"`;
        const raw = await callClaudeAPI(DECOMPOSE_PROMPT, userMessage, 2500);

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new Error(`Claude retornó JSON inválido. Raw: ${raw.slice(0, 200)}`);
        }

        validateDecomposed(parsed);

        const task = addTask(parsed);
        setLoading(false);
        return task;
      } catch (error) {
        lastError = error;
        console.error(`Intento ${attempt}/${MAX_RETRIES} falló:`, error.message);

        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * attempt));
        }
      }
    }

    setLoading(false);
    setError(`No se pudo descomponer la tarea: ${lastError?.message || 'Error desconocido'}`);
    return null;
  }, [addTask, setLoading, setError, clearError]);

  return { decompose };
}
