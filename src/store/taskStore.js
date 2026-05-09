import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { loadTasks, saveTasks, loadLearningPath, saveLearningPath } from '../utils/storage.js';
import { TASK_STATUS } from '../utils/constants.js';

/**
 * Chequea si una tarea tiene todas sus subtasks completadas.
 * Si sí, marca la tarea como COMPLETED con fecha.
 * Si no (alguna se reabrió), la vuelve a PENDING.
 */
function autoCompleteTask(task) {
  if (!task.subtasks.length) return task;
  const allDone = task.subtasks.every((st) => st.status === TASK_STATUS.COMPLETED);
  if (allDone && task.status !== TASK_STATUS.COMPLETED) {
    return { ...task, status: TASK_STATUS.COMPLETED, completedAt: new Date().toISOString() };
  }
  if (!allDone && task.status === TASK_STATUS.COMPLETED) {
    return { ...task, status: TASK_STATUS.PENDING, completedAt: null };
  }
  return task;
}

const useTaskStore = create((set, get) => ({
  tasks: loadTasks(),
  currentTaskId: null,
  // { taskId, subtaskId } - solo una subtask puede estar activa a la vez
  activeSubtask: null,
  // true cuando el usuario pidió crear una tarea nueva (como "New chat" en Claude)
  isCreatingTask: false,
  // 'tasks' | 'learning' — vista activa en el panel principal
  activeView: 'tasks',
  isLoading: false,
  error: null,

  // Learning path curado por el usuario
  learningPath: loadLearningPath(),

  addTask(decomposedData) {
    const newTask = {
      id: uuidv4(),
      title: decomposedData.title,
      estimatedMinutes: decomposedData.estimatedMinutes,
      status: TASK_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      subtasks: (decomposedData.subtasks || []).map((st) => ({
        ...st,
        id: uuidv4(),
        status: TASK_STATUS.PENDING,
        completedAt: null,
        startedAt: null,
        timeSpentSeconds: 0, // tiempo trackeado real
      })),
      learningGaps: decomposedData.learningGaps || [],
      tips: decomposedData.tips || [],
    };

    set((state) => {
      const tasks = [newTask, ...state.tasks];
      saveTasks(tasks);
      return { tasks, currentTaskId: newTask.id, isCreatingTask: false, error: null };
    });

    return newTask;
  },

  startCreatingTask() {
    set({ isCreatingTask: true, currentTaskId: null, activeView: 'tasks' });
  },

  setActiveView(view) {
    set({ activeView: view, isCreatingTask: false });
  },

  /**
   * Agrega subtasks nuevas a una tarea existente (decompose-in-place).
   * Las nuevas subtasks se insertan al final de la lista.
   */
  addSubtasksToTask(taskId, decomposedData) {
    const newSubtasks = (decomposedData.subtasks || []).map((st) => ({
      ...st,
      id: uuidv4(),
      status: TASK_STATUS.PENDING,
      completedAt: null,
      startedAt: null,
      timeSpentSeconds: 0,
    }));

    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const allSubtasks = [...task.subtasks, ...newSubtasks].map((st, i) => ({
          ...st,
          order: i + 1,
        }));
        return {
          ...task,
          subtasks: allSubtasks,
          estimatedMinutes: task.estimatedMinutes + (decomposedData.estimatedMinutes || 0),
          learningGaps: [
            ...new Set([...(task.learningGaps || []), ...(decomposedData.learningGaps || [])]),
          ],
          tips: [
            ...new Set([...(task.tips || []), ...(decomposedData.tips || [])]),
          ],
        };
      });
      saveTasks(tasks);
      return { tasks, error: null };
    });

    return newSubtasks;
  },

  updateSubtaskStatus(taskId, subtaskId, status) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId
              ? { ...st, status, completedAt: status === TASK_STATUS.COMPLETED ? new Date().toISOString() : null }
              : st
          ),
        };
      });
      saveTasks(tasks);
      return { tasks };
    });
  },

  /**
   * Marca una subtask como activa (en progreso) y registra startedAt si es la primera vez.
   * Solo una subtask puede estar activa global a la vez: si había otra, se pausa.
   */
  startSubtask(taskId, subtaskId) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((st) => {
            if (st.id !== subtaskId) return st;
            return {
              ...st,
              status: TASK_STATUS.IN_PROGRESS,
              startedAt: st.startedAt || new Date().toISOString(),
            };
          }),
        };
      });
      saveTasks(tasks);
      return {
        tasks,
        activeSubtask: { taskId, subtaskId },
      };
    });
  },

  /**
   * Persiste tiempo trackeado y vuelve a PENDING (sin completar).
   */
  pauseSubtask(taskId, subtaskId, timeSpentSeconds) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId
              ? { ...st, status: TASK_STATUS.PENDING, timeSpentSeconds }
              : st
          ),
        };
      });
      saveTasks(tasks);
      const wasActive = state.activeSubtask?.subtaskId === subtaskId;
      return {
        tasks,
        activeSubtask: wasActive ? null : state.activeSubtask,
      };
    });
  },

  /**
   * Completa la subtask con tiempo real trackeado.
   */
  completeSubtask(taskId, subtaskId, timeSpentSeconds) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updated = {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId
              ? {
                  ...st,
                  status: TASK_STATUS.COMPLETED,
                  completedAt: new Date().toISOString(),
                  timeSpentSeconds,
                }
              : st
          ),
        };
        return autoCompleteTask(updated);
      });
      saveTasks(tasks);
      const wasActive = state.activeSubtask?.subtaskId === subtaskId;
      return {
        tasks,
        activeSubtask: wasActive ? null : state.activeSubtask,
      };
    });
  },

  /**
   * Reordena subtasks dentro de una task. Recibe el array final ya ordenado
   * (más simple que from/to indices con dnd-kit).
   */
  reorderSubtasks(taskId, orderedSubtaskIds) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const byId = new Map(task.subtasks.map((st) => [st.id, st]));
        const reordered = orderedSubtaskIds
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((st, idx) => ({ ...st, order: idx + 1 }));
        return { ...task, subtasks: reordered };
      });
      saveTasks(tasks);
      return { tasks };
    });
  },

  resetSubtask(taskId, subtaskId) {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updated = {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId
              ? {
                  ...st,
                  status: TASK_STATUS.PENDING,
                  startedAt: null,
                  completedAt: null,
                  timeSpentSeconds: 0,
                }
              : st
          ),
        };
        return autoCompleteTask(updated);
      });
      saveTasks(tasks);
      const wasActive = state.activeSubtask?.subtaskId === subtaskId;
      return {
        tasks,
        activeSubtask: wasActive ? null : state.activeSubtask,
      };
    });
  },

  updateTaskStatus(taskId, status) {
    set((state) => {
      const tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      saveTasks(tasks);
      return { tasks };
    });
  },

  deleteTask(taskId) {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== taskId);
      saveTasks(tasks);
      const currentTaskId = state.currentTaskId === taskId ? null : state.currentTaskId;
      return { tasks, currentTaskId };
    });
  },

  setCurrentTask(taskId) {
    set({ currentTaskId: taskId, isCreatingTask: false, activeView: 'tasks' });
  },

  setLoading(isLoading) {
    set({ isLoading });
  },

  setError(error) {
    set({ error });
  },

  clearError() {
    set({ error: null });
  },

  getCurrentTask() {
    const { tasks, currentTaskId } = get();
    return tasks.find((t) => t.id === currentTaskId) || null;
  },

  getTaskProgress(taskId) {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks.length) return 0;
    const completed = task.subtasks.filter((st) => st.status === TASK_STATUS.COMPLETED).length;
    return Math.round((completed / task.subtasks.length) * 100);
  },

  // ═══════════════ LEARNING PATH (curado por el usuario) ═══════════════

  /**
   * Agrega un item al learning path del usuario.
   * @param {string} label - qué quiere aprender
   * @param {string} [sourceTaskId] - de qué tarea viene (opcional)
   * @param {string} [sourceTaskTitle] - título de la tarea fuente
   */
  addToLearningPath(label, sourceTaskId = null, sourceTaskTitle = null) {
    set((state) => {
      // Evitar duplicados por label
      const exists = state.learningPath.some(
        (item) => item.label.toLowerCase().trim() === label.toLowerCase().trim()
      );
      if (exists) return state;

      const item = {
        id: uuidv4(),
        label,
        status: 'pending', // pending | completed
        addedAt: new Date().toISOString(),
        completedAt: null,
        sourceTaskId,
        sourceTaskTitle,
      };
      const learningPath = [item, ...state.learningPath];
      saveLearningPath(learningPath);
      return { learningPath };
    });
  },

  /**
   * Agrega un item escrito manualmente por el usuario (sin tarea fuente).
   */
  addCustomLearningItem(label) {
    get().addToLearningPath(label);
  },

  toggleLearningItem(itemId) {
    set((state) => {
      const learningPath = state.learningPath.map((item) => {
        if (item.id !== itemId) return item;
        const isDone = item.status === 'completed';
        return {
          ...item,
          status: isDone ? 'pending' : 'completed',
          completedAt: isDone ? null : new Date().toISOString(),
        };
      });
      saveLearningPath(learningPath);
      return { learningPath };
    });
  },

  removeLearningItem(itemId) {
    set((state) => {
      const learningPath = state.learningPath.filter((item) => item.id !== itemId);
      saveLearningPath(learningPath);
      return { learningPath };
    });
  },

  isInLearningPath(label) {
    return get().learningPath.some(
      (item) => item.label.toLowerCase().trim() === label.toLowerCase().trim()
    );
  },
}));

export default useTaskStore;
