import { TaskInput, TaskTree, TaskNav, TaskNavMobile } from './components/index.js';
import useTaskStore from './store/taskStore.js';

function App() {
  const { tasks, currentTaskId, isCreatingTask } = useTaskStore();
  const hasTasks = tasks.length > 0;
  const showInput = !hasTasks || isCreatingTask;
  const showTask = hasTasks && currentTaskId && !isCreatingTask;

  return (
    <div className="min-h-screen text-stone-800 antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-sm">
              T
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight">
                Task Autopsy
              </h1>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Disecciona tareas. Hacelas, paso a paso.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="mx-auto max-w-6xl">
        <div className="flex min-h-[calc(100vh-64px)]">

          {/* ── Sidebar (md+), siempre visible si hay tareas ── */}
          {hasTasks && (
            <aside className="hidden md:block w-60 shrink-0 border-r border-stone-200/60 bg-white/40 p-4 overflow-y-auto">
              <TaskNav />
            </aside>
          )}

          {/* ── Main content ── */}
          <main className={`flex-1 min-w-0 px-5 py-6 space-y-6 ${!hasTasks ? 'max-w-3xl mx-auto' : ''}`}>
            {/* Mobile task nav */}
            {hasTasks && (
              <div className="md:hidden">
                <TaskNavMobile />
              </div>
            )}

            {showInput && <TaskInput />}
            {showTask && <TaskTree />}

            {/* Si hay tareas pero ninguna seleccionada y no está creando */}
            {hasTasks && !currentTaskId && !isCreatingTask && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white/40 px-6 py-14 text-center">
                <p className="text-sm text-stone-500">
                  Seleccioná una tarea del menú o creá una nueva.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-100 py-5 text-center text-[11px] text-stone-400">
        Hecho con foco · Powered by Claude Sonnet 4
      </footer>
    </div>
  );
}

export default App;
