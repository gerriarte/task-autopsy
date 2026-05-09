import useTaskStore from '../store/taskStore.js';
import { TASK_STATUS } from '../utils/constants.js';
import { formatRelativeDate } from '../utils/dates.js';

export function TaskNav() {
  const {
    tasks, currentTaskId, isCreatingTask, activeView, learningPath,
    setCurrentTask, startCreatingTask, setActiveView, getTaskProgress,
  } = useTaskStore();

  const pendingLearning = learningPath.filter((i) => i.status === 'pending').length;

  return (
    <nav aria-label="Navegador" className="flex flex-col h-full gap-1">
      {/* ── Nueva tarea ── */}
      <button
        onClick={startCreatingTask}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
          isCreatingTask
            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
            : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-800'
        }`}
      >
        <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        Nueva tarea
      </button>

      {/* ── Lista de tareas ── */}
      {tasks.length > 0 && (
        <div className="border-t border-stone-200/60 pt-2 mt-1 flex-1 overflow-y-auto space-y-0.5">
          <h3 className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Tareas
          </h3>

          {tasks.map((task) => {
            const progress = getTaskProgress(task.id);
            const isCurrent = task.id === currentTaskId && !isCreatingTask && activeView === 'tasks';
            const isDone = progress === 100;
            const activeCount = task.subtasks.filter(
              (st) => st.status === TASK_STATUS.IN_PROGRESS
            ).length;

            return (
              <button
                key={task.id}
                onClick={() => setCurrentTask(task.id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-all group ${
                  isCurrent
                    ? 'bg-brand-50 ring-1 ring-brand-200 shadow-sm'
                    : 'hover:bg-stone-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 size-2 rounded-full ${
                      isDone
                        ? 'bg-emerald-500'
                        : activeCount > 0
                        ? 'bg-brand-500 animate-pulse'
                        : 'bg-stone-300'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium truncate flex-1 ${
                      isCurrent ? 'text-brand-800' : isDone ? 'text-stone-500' : 'text-stone-700'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-2 ml-4">
                  <div className="flex-1 h-1 rounded-full bg-stone-200/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isCurrent
                          ? 'bg-brand-500'
                          : 'bg-stone-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums text-stone-400 w-7 text-right">
                    {progress}%
                  </span>
                </div>

                <div className="ml-4 mt-0.5 text-[10px] text-stone-400">
                  {isDone
                    ? `Completada ${formatRelativeDate(task.completedAt)}`
                    : formatRelativeDate(task.createdAt)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Learning Path link ── */}
      <div className="border-t border-stone-200/60 pt-2 mt-auto">
        <button
          onClick={() => setActiveView('learning')}
          className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
            activeView === 'learning'
              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
              : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-800'
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.042 2.35M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.471.89-6.042 2.35M12 6.042V20.4" />
          </svg>
          <span className="flex-1 text-left">Learning Path</span>
          {pendingLearning > 0 && (
            <span className="rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {pendingLearning}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

export function TaskNavMobile() {
  const {
    tasks, currentTaskId, isCreatingTask, activeView, learningPath,
    setCurrentTask, startCreatingTask, setActiveView, getTaskProgress,
  } = useTaskStore();

  const pendingLearning = learningPath.filter((i) => i.status === 'pending').length;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <button
        onClick={startCreatingTask}
        className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
          isCreatingTask
            ? 'border-brand-300 bg-brand-50 text-brand-700'
            : 'border-stone-300 bg-white text-stone-600 hover:border-brand-300'
        }`}
      >
        <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        Nueva
      </button>

      {tasks.map((task) => {
        const progress = getTaskProgress(task.id);
        const isCurrent = task.id === currentTaskId && !isCreatingTask && activeView === 'tasks';
        const isDone = progress === 100;

        return (
          <button
            key={task.id}
            onClick={() => setCurrentTask(task.id)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap max-w-[200px] ${
              isCurrent
                ? 'border-brand-300 bg-brand-50 text-brand-800'
                : isDone
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                isDone ? 'bg-emerald-500' : isCurrent ? 'bg-brand-500' : 'bg-stone-300'
              }`}
            />
            <span className="truncate">{task.title}</span>
            <span className="text-[10px] text-stone-400">{progress}%</span>
          </button>
        );
      })}

      <button
        onClick={() => setActiveView('learning')}
        className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
          activeView === 'learning'
            ? 'border-amber-300 bg-amber-50 text-amber-800'
            : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300'
        }`}
      >
        📚 Learning
        {pendingLearning > 0 && (
          <span className="ml-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 leading-none">
            {pendingLearning}
          </span>
        )}
      </button>
    </div>
  );
}
