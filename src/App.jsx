import { TaskInput, TaskTree, TaskNav, TaskNavMobile, LearningPanel, StatsPanel, SettingsPanel } from './components/index.js';
import useTaskStore from './store/taskStore.js';
import { loadApiConfig } from './utils/api.js';

function App() {
  const { tasks, currentTaskId, isCreatingTask, activeView, setActiveView } = useTaskStore();
  const hasTasks = tasks.length > 0;
  const apiConfigured = !!loadApiConfig()?.apiKey;
  const showInput = !hasTasks || isCreatingTask;
  const showTask = hasTasks && currentTaskId && !isCreatingTask && activeView === 'tasks';
  const showLearning = hasTasks && activeView === 'learning';
  const showStats = hasTasks && activeView === 'stats';
  const showSettings = activeView === 'settings';

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

          <div className="flex items-center gap-2">
            {!apiConfigured && (
              <button
                onClick={() => setActiveView('settings')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
              >
                ⚙ Configurar API
              </button>
            )}
            {apiConfigured && (
              <button
                onClick={() => setActiveView('settings')}
                className="text-stone-400 hover:text-stone-600 transition p-1"
                title="Ajustes"
              >
                <svg viewBox="0 0 20 20" className="size-5" fill="currentColor">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
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
            showTask || showLearning || showStats || showSettings ? 'max-w-4xl' : 'max-w-2xl'
          }`}>
            {/* Mobile task nav */}
            {hasTasks && (
              <div className="lg:hidden">
                <TaskNavMobile />
              </div>
            )}

            {showSettings && <SettingsPanel />}
            {!showSettings && showInput && <TaskInput />}
            {!showSettings && showTask && <TaskTree />}
            {!showSettings && showLearning && <LearningPanel />}
            {!showSettings && showStats && <StatsPanel />}

            {!showSettings && hasTasks && !currentTaskId && !isCreatingTask && activeView === 'tasks' && (
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
