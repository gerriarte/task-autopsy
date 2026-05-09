import { useState } from 'react';
import useTaskStore from '../store/taskStore.js';
import { formatRelativeDate } from '../utils/dates.js';

/**
 * Panel de Learning Path curado por el usuario.
 * Los items se agregan manualmente o desde las sugerencias de Claude en cada tarea.
 */
export function LearningPanel() {
  const { learningPath, toggleLearningItem, removeLearningItem, setCurrentTask } = useTaskStore();
  const [newLabel, setNewLabel] = useState('');

  const pending = learningPath.filter((i) => i.status === 'pending');
  const completed = learningPath.filter((i) => i.status === 'completed');

  return (
    <section className="space-y-5">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.042 2.35M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.471.89-6.042 2.35M12 6.042V20.4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">Tu Learning Path</h2>
            <p className="text-xs text-stone-500">
              Lo que decidiste que necesitás aprender. Agregá temas manualmente o desde las sugerencias en cada tarea.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center">
            <div className="text-lg font-bold text-amber-800 leading-none">{pending.length}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Por aprender</div>
          </div>
          <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
            <div className="text-lg font-bold text-emerald-800 leading-none">{completed.length}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Aprendidos</div>
          </div>
        </div>

        {/* ── Agregar manualmente ── */}
        <AddLearningInput
          value={newLabel}
          onChange={setNewLabel}
          onClear={() => setNewLabel('')}
        />
      </div>

      {/* ── Items pendientes ── */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-1">
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

      {/* ── Items completados ── */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-1">
            Aprendidos ({completed.length})
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
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/40 px-6 py-10 text-center">
          <p className="text-sm text-stone-500">
            Tu Learning Path está vacío.
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Agregá temas arriba, o cuando veas sugerencias de Claude en una tarea, hacé click en "+" para agregarlas acá.
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
        className="flex-1 rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Agregar
      </button>
    </form>
  );
}

function LearningItem({ item, onToggle, onRemove, onGoToTask }) {
  const isDone = item.status === 'completed';

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 group transition ${
      isDone
        ? 'border-emerald-100 bg-emerald-50/40'
        : 'border-stone-200 bg-white hover:border-stone-300'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`shrink-0 mt-0.5 size-5 rounded-md border-2 grid place-items-center transition ${
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-stone-300 hover:border-brand-400'
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-stone-400">
            {isDone
              ? `Completado ${formatRelativeDate(item.completedAt)}`
              : `Agregado ${formatRelativeDate(item.addedAt)}`}
          </span>
          {item.sourceTaskTitle && (
            <>
              <span className="text-stone-300">·</span>
              {onGoToTask ? (
                <button
                  onClick={onGoToTask}
                  className="text-[10px] text-brand-600 hover:text-brand-800 transition"
                >
                  De: {item.sourceTaskTitle}
                </button>
              ) : (
                <span className="text-[10px] text-stone-400">De: {item.sourceTaskTitle}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1"
        title="Quitar del learning path"
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
