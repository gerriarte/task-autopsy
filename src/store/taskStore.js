import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { loadTasks, saveTasks } from '../utils/storage.js';
import { TASK_STATUS } from '../utils/constants.js';

const useTaskStore = create((set, get) => ({
  tasks: loadTasks(),
  currentTaskId: null,
  isLoading: false,
  error: null,

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
      })),
      learningGaps: decomposedData.learningGaps || [],
      tips: decomposedData.tips || [],
    };

    set((state) => {
      const tasks = [newTask, ...state.tasks];
      saveTasks(tasks);
      return { tasks, currentTaskId: newTask.id, error: null };
    });

    return newTask;
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
    set({ currentTaskId: taskId });
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
}));

export default useTaskStore;
