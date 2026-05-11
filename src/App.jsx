import { TaskInput, TaskTree, TaskNav, TaskNavMobile, LearningPanel, StatsPanel, SettingsPanel } from './components/index.js';
import useTaskStore from './store/taskStore.js';
import { loadApiConfig } from './utils/api.js';
import { useNotifications } from './hooks/useNotifications.js';

function App() {
  const { tasks, currentTaskId, isCreatingTask, activeView, setActiveView } = useTaskStore();
  useNotifications();
  const hasTasks = tasks.length > 0;
  const apiConfigured = !!loadApiConfig()?.apiKey;
  const showInput = !hasTasks || isCreatingTask;
  const showTask = hasTasks && currentTaskId && !isCreatingTask && activeView === 'tasks';
  const showLearning = hasTasks && activeView === 'learning';
  const showStats = hasTasks && activeView === 'stats';
  const showSettings = activeView === 'settings';

  return (
    <div className="min-h-screen text-zen-800 antialiased flex flex-col">
      {/* ── Header — warm parchment, distinct ── */}
      <header className="sticky top-0 z-20 border-b border-zen-300/60 bg-[#fffef9]/95 backdrop-blur-lg shrink-0 shadow-[0_1px_3px_rgb(26_22_16/0.05)]">
        <div className="px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-brand-700 grid place-items-center text-white font-bold text-sm tracking-tight shadow-sm">
              T
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none tracking-tight text-zen-900">
                Task Autopsy
              </h1>
              <p className="text-[10px] text-zen-400 mt-0.5 hidden sm:block tracking-wide">
                Descompone. Enfoca. Completa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!apiConfigured && (
              <button
                onClick={() => setActiveView('settings')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-50 transition-colors duration-200"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 1.5l.3 1.5c.2.3.5.5.8.6l.2.1c.3.1.6.1.8 0l1.4-.5.9 1.6-1.1.9c-.2.2-.3.5-.3.8v.2c0 .3.1.6.3.8l1.1.9-.9 1.6-1.4-.5c-.2-.1-.5-.1-.8 0l-.2.1c-.3.1-.6.3-.8.6L6.5 14.5h-1.8l-.3-1.5c-.2-.3-.5-.5-.8-.6L3.4 12.3c-.3-.1-.6-.1-.8 0L1.2 12.8l-.9-1.6 1.1-.9c.2-.2.3-.5.3-.8V9.3c0-.3-.1-.6-.3-.8L.3 7.6l.9-1.6 1.4.5c.2.1.5.1.8 0l.2-.1c.3-.1.6-.3.8-.6l.3-1.5h1.8zM5.6 7a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
                Configurar API
              </button>
            )}
            {apiConfigured && (
              <button
                onClick={() => setActiveView('settings')}
                className="text-zen-400 hover:text-zen-600 transition-colors duration-200 p-1.5 rounded-lg hover:bg-zen-100"
                title="Ajustes"
              >
                <svg viewBox="0 0 20 20" className="size-[18px]" fill="currentColor">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (lg+) — warm, recessive ── */}
        {hasTasks && (
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-zen-300/50 bg-zen-100/70 overflow-y-auto">
            <div className="p-3.5 flex-1 flex flex-col">
              <TaskNav />
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className={`px-5 lg:px-8 py-6 space-y-5 mx-auto ${
            showTask || showLearning || showStats || showSettings ? 'max-w-3xl' : 'max-w-xl'
          }`}>
            {/* Mobile task nav */}
            {hasTasks && (
              <div className="lg:hidden">
                <TaskNavMobile />
              </div>
            )}

            <div className="animate-fade-in">
              {showSettings && <SettingsPanel />}
              {!showSettings && showInput && <TaskInput />}
              {!showSettings && showTask && <TaskTree />}
              {!showSettings && showLearning && <LearningPanel />}
              {!showSettings && showStats && <StatsPanel />}
            </div>

            {!showSettings && hasTasks && !currentTaskId && !isCreatingTask && activeView === 'tasks' && (
              <div className="rounded-2xl border border-dashed border-zen-300 px-6 py-16 text-center animate-fade-in">
                <p className="text-sm text-zen-500">
                  Selecciona una tarea del menu o crea una nueva.
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
