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
    <nav aria-label="Navegador" className="flex flex-col h-full gap-0.5">
      {/* ── Nueva tarea ── */}
      <button
        onClick={startCreatingTask}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 ${
          isCreatingTask
            ? 'bg-brand-50 text-brand-700'
            : 'text-zen-600 hover:bg-zen-100 hover:text-zen-800'
        }`}
      >
        <svg viewBox="0 0 20 20" className="size-3.5 shrink-0" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        Nueva tarea
      </button>

      {/* ── Lista de tareas ── */}
      {tasks.length > 0 && (
        <div className="border-t border-zen-200/50 pt-2 mt-1 flex-1 overflow-y-auto space-y-0.5 scrollbar-none">
          <h3 className="px-2 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-zen-400">
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
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-brand-50/70 text-brand-800'
                    : 'hover:bg-zen-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 size-1.5 rounded-full transition-colors duration-300 ${
                      isDone
                        ? 'bg-emerald-400'
                        : activeCount > 0
                        ? 'bg-brand-400'
                        : 'bg-zen-300'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium truncate flex-1 ${
                      isCurrent ? 'text-brand-800' : isDone ? 'text-zen-400' : 'text-zen-700'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-2 ml-3.5">
                  <div className="flex-1 h-0.5 rounded-full bg-zen-200/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isCurrent
                          ? 'bg-brand-400'
                          : 'bg-zen-300'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums text-zen-400 w-7 text-right">
                    {progress}%
                  </span>
                </div>

                <div className="ml-3.5 mt-0.5 text-[10px] text-zen-400">
                  {isDone
                    ? `Completada ${formatRelativeDate(task.completedAt)}`
                    : formatRelativeDate(task.createdAt)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Bottom links ── */}
      <div className="border-t border-zen-200/50 pt-2 mt-auto space-y-0.5">
        <NavLink
          label="Progreso"
          active={activeView === 'stats'}
          onClick={() => setActiveView('stats')}
          icon={<svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />

        <NavLink
          label="Learning Path"
          active={activeView === 'learning'}
          onClick={() => setActiveView('learning')}
          badge={pendingLearning}
          icon={<svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.042 2.35M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.471.89-6.042 2.35M12 6.042V20.4" /></svg>}
        />

        <NavLink
          label="Ajustes"
          active={activeView === 'settings'}
          onClick={() => setActiveView('settings')}
          muted
          icon={<svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>
    </nav>
  );
}

function NavLink({ label, active, onClick, icon, badge, muted }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 ${
        active
          ? 'bg-brand-50/70 text-brand-700'
          : muted
          ? 'text-zen-400 hover:bg-zen-100 hover:text-zen-600'
          : 'text-zen-600 hover:bg-zen-100 hover:text-zen-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

export function TaskNavMobile() {
  const {
    tasks, currentTaskId, isCreatingTask, activeView, learningPath,
    setCurrentTask, startCreatingTask, setActiveView, getTaskProgress,
  } = useTaskStore();

  const pendingLearning = learningPath.filter((i) => i.status === 'pending').length;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <button
        onClick={startCreatingTask}
        className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors duration-200 whitespace-nowrap ${
          isCreatingTask
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-zen-200 bg-[#fffef9] text-zen-600 hover:border-zen-300'
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
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors duration-200 whitespace-nowrap max-w-[180px] ${
              isCurrent
                ? 'border-brand-200 bg-brand-50 text-brand-800'
                : isDone
                ? 'border-emerald-200/60 bg-emerald-50/30 text-emerald-700'
                : 'border-zen-200 bg-[#fffef9] text-zen-600 hover:border-zen-300'
            }`}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                isDone ? 'bg-emerald-400' : isCurrent ? 'bg-brand-400' : 'bg-zen-300'
              }`}
            />
            <span className="truncate">{task.title}</span>
            <span className="text-[10px] text-zen-400 tabular-nums">{progress}%</span>
          </button>
        );
      })}

      <MobileNavPill label="Progreso" active={activeView === 'stats'} onClick={() => setActiveView('stats')} />
      <MobileNavPill label="Learning" active={activeView === 'learning'} onClick={() => setActiveView('learning')} badge={pendingLearning} />
      <MobileNavPill label="Ajustes" active={activeView === 'settings'} onClick={() => setActiveView('settings')} muted />
    </div>
  );
}

function MobileNavPill({ label, active, onClick, badge, muted }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors duration-200 whitespace-nowrap ${
        active
          ? 'border-brand-200 bg-brand-50 text-brand-800'
          : muted
          ? 'border-zen-200 bg-[#fffef9] text-zen-400 hover:border-zen-300'
          : 'border-zen-200 bg-[#fffef9] text-zen-600 hover:border-zen-300'
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
