import { TaskInput, TaskTree, TaskNav, TaskNavMobile, LearningPanel, StatsPanel } from './components/index.js';
import useTaskStore from './store/taskStore.js';

function App() {
  const { tasks, currentTaskId, isCreatingTask, activeView } = useTaskStore();
  const hasTasks = tasks.length > 0;
  const showInput = !hasTasks || isCreatingTask;
  const showTask = hasTasks && currentTaskId && !isCreatingTask && activeView === 'tasks';
  const showLearning = hasTasks && activeView === 'learning';
  const showStats = hasTasks && activeView === 'stats';

  return (
    <div className="min-h-screen text-stone-800 antialiased flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/80 backdrop-blur-md shrink-0">
        <div className="px-5 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-sm">
              T
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight">
                Task Autopsy
              </h1>
              <p className="text-[11px] text-stone-500 mt-0.5 hidden sm:block">
                Disecciona tareas. Hacelas, paso a paso.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (lg+) ── */}
        {hasTasks && (
          <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-stone-200/60 bg-stone-50/60 overflow-y-auto">
            <div className="p-4 flex-1 flex flex-col">
              <TaskNav />
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className={`px-5 lg:px-8 py-6 space-y-6 mx-auto ${
            showTask || showLearning ? 'max-w-4xl' : 'max-w-2xl'
          }`}>
            {/* Mobile task nav */}
            {hasTasks && (
              <div className="lg:hidden">
                <TaskNavMobile />
              </div>
            )}

            {showInput && <TaskInput />}
            {showTask && <TaskTree />}
            {showLearning && <LearningPanel />}
            {showStats && <StatsPanel />}

            {hasTasks && !currentTaskId && !isCreatingTask && activeView === 'tasks' && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white/40 px-6 py-14 text-center">
                <p className="text-sm text-stone-500">
                  Seleccioná una tarea del menú o creá una nueva.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
