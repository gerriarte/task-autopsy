import { useStats, formatMinutes } from '../hooks/useStats.js';
import useTaskStore from '../store/taskStore.js';

export function StatsPanel() {
  const stats = useStats();
  const { setCurrentTask } = useTaskStore();

  return (
    <section className="space-y-5">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 grid place-items-center text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">Tu progreso</h2>
            <p className="text-xs text-stone-500">Métricas de productividad y foco</p>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Streak"
            value={stats.streak}
            suffix={stats.streak === 1 ? 'día' : 'días'}
            icon="🔥"
            color={stats.streak >= 3 ? 'amber' : 'stone'}
            highlight={stats.streak >= 3}
          />
          <StatCard
            label="Subtasks hechas"
            value={stats.completedSubtasks}
            suffix={`/ ${stats.totalSubtasks}`}
            icon="✓"
            color="emerald"
          />
          <StatCard
            label="Tiempo real"
            value={formatMinutes(stats.totalRealMin)}
            suffix=""
            icon="⏱"
            color="brand"
          />
          <StatCard
            label="Precisión"
            value={stats.accuracy !== null ? `${stats.accuracy}%` : '—'}
            suffix={stats.accuracy !== null ? (stats.accuracy <= 110 ? 'bien' : 'lento') : ''}
            icon="🎯"
            color={stats.accuracy && stats.accuracy <= 110 ? 'emerald' : stats.accuracy ? 'amber' : 'stone'}
          />
        </div>
      </div>

      {/* ── Detalle de accuracy ── */}
      {stats.accuracy !== null && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-stone-700 mb-3">Estimado vs Real</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                <span>Estimado: {formatMinutes(stats.totalEstimatedMin)}</span>
                <span>Real: {formatMinutes(stats.totalRealMin)}</span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden flex">
                <div
                  className="h-full bg-brand-200 rounded-l-full"
                  style={{ width: `${Math.min(100, (stats.totalEstimatedMin / Math.max(stats.totalEstimatedMin, stats.totalRealMin)) * 100)}%` }}
                />
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden flex mt-1">
                <div
                  className={`h-full rounded-l-full ${stats.accuracy <= 110 ? 'bg-emerald-400' : stats.accuracy <= 150 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(100, (stats.totalRealMin / Math.max(stats.totalEstimatedMin, stats.totalRealMin)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-2">
                {stats.accuracy <= 100
                  ? 'Estás terminando más rápido de lo estimado. ¡Bien!'
                  : stats.accuracy <= 130
                  ? 'Bastante cerca del estimado. Claude te calibra bien.'
                  : 'Las tareas tardan más de lo estimado. Normal al principio — los estimados mejoran con el tiempo.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Streak visual ── */}
      <StreakWeek streak={stats.streak} />

      {/* ── Vista "Hoy" ── */}
      <TodayView items={stats.todayItems} onGoToTask={setCurrentTask} />

      {/* ── Tareas completadas ── */}
      {stats.completedTasks > 0 && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{stats.completedTasks}</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            {stats.completedTasks === 1 ? 'tarea completada' : 'tareas completadas'} en total
          </p>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, suffix, icon, color, highlight }) {
  const colors = {
    stone: 'border-stone-200 bg-stone-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    brand: 'border-brand-200 bg-brand-50',
    amber: 'border-amber-200 bg-amber-50',
  };
  const textColors = {
    stone: 'text-stone-800',
    emerald: 'text-emerald-800',
    brand: 'text-brand-800',
    amber: 'text-amber-800',
  };

  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]} ${highlight ? 'ring-1 ring-amber-300' : ''}`}>
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-xl font-bold leading-none ${textColors[color]}`}>{value}</div>
      {suffix && <div className="text-[10px] text-stone-500 mt-0.5">{suffix}</div>}
      <div className="text-[10px] font-medium text-stone-400 mt-1">{label}</div>
    </div>
  );
}

/**
 * Visualización de los últimos 7 días como cuadritos (como GitHub contributions)
 */
function StreakWeek({ streak }) {
  const days = [];
  const today = new Date();
  const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isActive = i < streak;
    const isToday = i === 0;

    days.push({
      label: dayLabels[d.getDay()],
      isActive,
      isToday,
      date: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    });
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="text-xs font-semibold text-stone-700 mb-3">Últimos 7 días</h3>
      <div className="flex justify-between gap-1.5">
        {days.map((day, i) => (
          <div key={i} className="flex-1 text-center" title={day.date}>
            <div className="text-[10px] text-stone-400 mb-1.5">{day.label}</div>
            <div
              className={`mx-auto size-8 rounded-lg grid place-items-center text-xs font-semibold transition ${
                day.isActive
                  ? 'bg-emerald-500 text-white'
                  : day.isToday
                  ? 'border-2 border-dashed border-stone-300 text-stone-400'
                  : 'bg-stone-100 text-stone-300'
              }`}
            >
              {day.isActive ? '✓' : day.isToday ? 'Hoy' : ''}
            </div>
          </div>
        ))}
      </div>
      {streak > 0 && (
        <p className="text-center text-xs text-stone-500 mt-3">
          🔥 {streak} {streak === 1 ? 'día' : 'días'} de racha
          {streak >= 7 && ' — ¡Una semana entera!'}
          {streak >= 3 && streak < 7 && ' — ¡Seguí así!'}
        </p>
      )}
      {streak === 0 && (
        <p className="text-center text-xs text-stone-400 mt-3">
          Completá una subtask hoy para empezar tu racha.
        </p>
      )}
    </div>
  );
}

/**
 * Vista "¿Qué hago hoy?": subtasks activas y próximas
 */
function TodayView({ items, onGoToTask }) {
  const inProgress = items.filter((i) => i.priority === 0);
  const pending = items.filter((i) => i.priority === 1).slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white/40 p-6 text-center">
        <p className="text-sm font-medium text-stone-700">¡Todo al día!</p>
        <p className="text-xs text-stone-400 mt-1">No hay subtasks pendientes. Creá una nueva tarea.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
      <h3 className="text-xs font-semibold text-stone-700">¿Qué hago ahora?</h3>

      {inProgress.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-brand-500 font-semibold">En progreso</p>
          {inProgress.map((item) => (
            <TodayItem key={item.id} item={item} onGoToTask={onGoToTask} active />
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
            Siguientes
          </p>
          {pending.map((item) => (
            <TodayItem key={item.id} item={item} onGoToTask={onGoToTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function TodayItem({ item, onGoToTask, active }) {
  return (
    <button
      onClick={() => onGoToTask(item.taskId)}
      className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 transition group ${
        active
          ? 'bg-brand-50 border border-brand-200'
          : 'hover:bg-stone-50 border border-transparent'
      }`}
    >
      <span className={`shrink-0 size-2 rounded-full ${active ? 'bg-brand-500 animate-pulse' : 'bg-stone-300'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? 'text-brand-800' : 'text-stone-700'}`}>
          {item.title}
        </p>
        <p className="text-[10px] text-stone-400 truncate">{item.taskTitle}</p>
      </div>
      <span className="text-[10px] text-stone-400">{item.estimatedMinutes}m</span>
      <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition">→</span>
    </button>
  );
}
