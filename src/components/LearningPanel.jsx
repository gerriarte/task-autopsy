import { useState } from 'react';
import useTaskStore from '../store/taskStore.js';
import { formatRelativeDate } from '../utils/dates.js';

/**
 * Panel de Learning Path curado por el usuario.
 */
export function LearningPanel() {
  const { learningPath, toggleLearningItem, removeLearningItem, setCurrentTask } = useTaskStore();
  const [newLabel, setNewLabel] = useState('');

  const pending = learningPath.filter((i) => i.status === 'pending');
  const completed = learningPath.filter((i) => i.status === 'completed');

  return (
    <section className="space-y-5">
      {/* ── Header ── */}
      <div className="zen-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-xl bg-amber-100 grid place-items-center">
            <svg viewBox="0 0 24 24" className="size-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.042 2.35M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.471.89-6.042 2.35M12 6.042V20.4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-zen-900 tracking-tight">Learning Path</h2>
            <p className="text-xs text-zen-500">
              Lo que decidiste aprender. Agrega temas o promove sugerencias de cada tarea.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-center">
            <div className="text-lg font-bold text-amber-700 leading-none">{pending.length}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Por aprender</div>
          </div>
          <div className="flex-1 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-center">
            <div className="text-lg font-bold text-emerald-700 leading-none">{completed.length}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Aprendidos</div>
          </div>
        </div>

        {/* ── Agregar ── */}
        <AddLearningInput
          value={newLabel}
          onChange={setNewLabel}
          onClear={() => setNewLabel('')}
        />
      </div>

      {/* ── Pendientes ── */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zen-400 px-1">
            Por aprender
          </h3>
          {pending.map((item) => (
            <LearningItem
              key={item.id}
              item={item}
              onToggle={() => toggleLearningItem(item.id)}
              onRemove={() => removeLearningItem(item.id)}
              onGoToTask={item.sourceTaskId ? () => setCurrentTask(item.sourceTaskId) : null}
            />
          ))}
        </div>
      )}

      {/* ── Completados ── */}
      {completed.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zen-400 px-1">
            Aprendidos
          </h3>
          {completed.map((item) => (
            <LearningItem
              key={item.id}
              item={item}
              onToggle={() => toggleLearningItem(item.id)}
              onRemove={() => removeLearningItem(item.id)}
              onGoToTask={item.sourceTaskId ? () => setCurrentTask(item.sourceTaskId) : null}
            />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {learningPath.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zen-200 px-6 py-12 text-center animate-fade-in">
          <p className="text-sm text-zen-500">
            Tu Learning Path esta vacio.
          </p>
          <p className="text-xs text-zen-400 mt-1.5 leading-relaxed">
            Agrega temas arriba, o desde las sugerencias que aparecen en cada tarea.
          </p>
        </div>
      )}
    </section>
  );
}

function AddLearningInput({ value, onChange, onClear }) {
  const { addToLearningPath } = useTaskStore();

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    addToLearningPath(value.trim());
    onClear();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Aprender a escribir copy de ventas..."
        className="flex-1 rounded-lg border border-zen-200 bg-zen-50 px-3 py-2 text-sm placeholder:text-zen-400 focus:border-brand-400 focus:bg-[#fffef9] focus:outline-none focus:ring-2 focus:ring-brand-500/15 transition-all duration-200"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Agregar
      </button>
    </form>
  );
}

function LearningItem({ item, onToggle, onRemove, onGoToTask }) {
  const isDone = item.status === 'completed';

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 group transition-all duration-200 ${
      isDone
        ? 'border-emerald-100/60 bg-emerald-50/30'
        : 'border-zen-200 bg-[#fffef9] hover:border-zen-300'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`shrink-0 mt-0.5 size-4.5 rounded border-2 grid place-items-center transition-all duration-200 ${
          isDone
            ? 'border-emerald-400 bg-emerald-400 text-white'
            : 'border-zen-300 hover:border-brand-400'
        }`}
        style={{ width: '18px', height: '18px' }}
      >
        {isDone && (
          <svg viewBox="0 0 20 20" className="size-2.5" fill="currentColor">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${isDone ? 'text-zen-400 line-through' : 'text-zen-800'}`}>
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-zen-400">
            {isDone
              ? `Completado ${formatRelativeDate(item.completedAt)}`
              : `Agregado ${formatRelativeDate(item.addedAt)}`}
          </span>
          {item.sourceTaskTitle && (
            <>
              <span className="text-zen-300">·</span>
              {onGoToTask ? (
                <button
                  onClick={onGoToTask}
                  className="text-[10px] text-brand-500 hover:text-brand-700 transition-colors duration-200"
                >
                  {item.sourceTaskTitle}
                </button>
              ) : (
                <span className="text-[10px] text-zen-400">{item.sourceTaskTitle}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 text-zen-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1"
        title="Quitar"
      >
        <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
