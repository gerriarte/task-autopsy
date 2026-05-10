import { useState, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore.js';
import { useTimer, formatTime } from '../hooks/useTimer.js';
import { TASK_STATUS } from '../utils/constants.js';
import { FocusMode } from './FocusMode.jsx';

export function SubtaskCard({ subtask, taskId, taskTitle }) {
  const [showFocus, setShowFocus] = useState(false);
  const {
    activeSubtask,
    startSubtask,
    pauseSubtask,
    completeSubtask,
    resetSubtask,
    addToLearningPath,
    isInLearningPath,
  } = useTaskStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = subtask.status === TASK_STATUS.COMPLETED;
  const isActiveElsewhere =
    activeSubtask && activeSubtask.subtaskId !== subtask.id;

  const totalSeconds = useMemo(
    () => Math.max(60, subtask.estimatedMinutes * 60),
    [subtask.estimatedMinutes]
  );

  const startingSeconds = useMemo(() => {
    const remaining = totalSeconds - (subtask.timeSpentSeconds || 0);
    return Math.max(0, remaining);
  }, [totalSeconds, subtask.timeSpentSeconds]);

  const timer = useTimer(startingSeconds, {
    onComplete: () => completeSubtask(taskId, subtask.id, totalSeconds),
  });

  useEffect(() => {
    if (isActiveElsewhere && timer.isRunning) timer.pause();
  }, [isActiveElsewhere, timer]);

  const elapsedTotal = (subtask.timeSpentSeconds || 0) + timer.elapsedSeconds;
  const isPaused = timer.hasStarted && !timer.isRunning && timer.secondsLeft > 0;

  function handleStart() {
    startSubtask(taskId, subtask.id);
    timer.start();
  }
  function handlePause() {
    timer.pause();
    pauseSubtask(taskId, subtask.id, elapsedTotal);
  }
  function handleResume() {
    startSubtask(taskId, subtask.id);
    timer.resume();
  }
  function handleComplete() {
    timer.pause();
    completeSubtask(taskId, subtask.id, elapsedTotal);
  }
  function handleReset() {
    timer.reset(totalSeconds);
    resetSubtask(taskId, subtask.id);
  }

  // ============ COMPLETED ============
  if (isCompleted) {
    const realMin = Math.round((subtask.timeSpentSeconds || 0) / 60);
    const estMin = subtask.estimatedMinutes;
    const onTime = realMin <= estMin;

    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        className={`group flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <DragHandle attributes={attributes} listeners={listeners} />
        <div className="size-5 shrink-0 rounded-full bg-emerald-500 text-white grid place-items-center">
          <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-600 line-through truncate">
            {subtask.title}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            Real: <span className="font-medium">{realMin} min</span>
            <span className="mx-1.5 text-stone-300">·</span>
            Estimado: {estMin} min
            {realMin > 0 && (
              <span className={`ml-1.5 ${onTime ? 'text-emerald-600' : 'text-amber-600'}`}>
                {onTime ? '✓ a tiempo' : `+${realMin - estMin} min`}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-stone-400 hover:text-stone-700 opacity-0 group-hover:opacity-100 transition px-2"
          title="Reabrir"
        >
          Reabrir
        </button>
      </div>
    );
  }

  // ============ ACTIVE / PENDING ============
  const progressPct = totalSeconds > 0 ? (elapsedTotal / totalSeconds) * 100 : 0;
  const progressClamped = Math.min(100, progressPct);
  const lowTime = timer.secondsLeft < 60 && timer.isRunning;

  // Visual state ring
  const cardClass = [
    'rounded-xl border bg-white p-4 transition-all',
    timer.isRunning
      ? 'border-brand-300 ring-2 ring-brand-500/20 shadow-md animate-pulse-ring'
      : isPaused
      ? 'border-amber-200 bg-amber-50/30'
      : 'border-stone-200 hover:border-stone-300',
    isDragging ? 'opacity-50' : '',
    isActiveElsewhere ? 'opacity-50' : '',
  ].join(' ');

  return (
    <div ref={setNodeRef} style={dragStyle} className={cardClass}>
      <div className="flex items-start gap-3">
        <DragHandle attributes={attributes} listeners={listeners} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                {subtask.title}
              </h4>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                {subtask.description}
              </p>
            </div>

            {/* Timer display */}
            <div className="text-right shrink-0">
              <div
                className={`font-mono text-2xl font-bold leading-none tabular-nums ${
                  lowTime
                    ? 'text-rose-600'
                    : timer.isRunning
                    ? 'text-brand-600'
                    : isPaused
                    ? 'text-amber-700'
                    : 'text-stone-400'
                }`}
              >
                {formatTime(timer.secondsLeft)}
              </div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">
                {timer.isRunning ? 'corriendo' : isPaused ? 'pausado' : `${subtask.estimatedMinutes} min`}
              </p>
            </div>
          </div>

          {/* Progress */}
          {timer.hasStarted && (
            <div className="mt-3 h-1 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  lowTime ? 'bg-rose-500' : timer.isRunning ? 'bg-brand-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progressClamped}%`, transitionDuration: timer.isRunning ? '1s' : '300ms' }}
              />
            </div>
          )}

          {/* Knowledge gaps — clickeables para agregar al Learning Path */}
          {subtask.knowledgeGaps?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {subtask.knowledgeGaps.map((gap) => {
                const added = isInLearningPath(gap);
                return (
                  <button
                    key={gap}
                    onClick={() => !added && addToLearningPath(gap, taskId, taskTitle)}
                    disabled={added}
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition ${
                      added
                        ? 'bg-emerald-50 text-emerald-600 cursor-default'
                        : 'bg-stone-100 text-stone-600 hover:bg-brand-50 hover:text-brand-700 cursor-pointer'
                    }`}
                    title={added ? 'En tu Learning Path' : 'Agregar al Learning Path'}
                  >
                    {added ? '✓' : '+'} {gap}
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {!timer.hasStarted && (
              <button
                onClick={handleStart}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title={isActiveElsewhere ? 'Pausá la otra subtask primero' : undefined}
              >
                <PlayIcon /> Empezar
              </button>
            )}

            {timer.isRunning && (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition"
              >
                <PauseIcon /> Pausar
              </button>
            )}

            {isPaused && (
              <button
                onClick={handleResume}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <PlayIcon /> Continuar
              </button>
            )}

            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
            >
              <CheckIcon /> Listo
            </button>

            {/* Focus mode button */}
            {!isCompleted && (
              <button
                onClick={() => {
                  // Pause the card's own timer — FocusMode will take over
                  if (timer.isRunning) {
                    timer.pause();
                    pauseSubtask(taskId, subtask.id, elapsedTotal);
                  }
                  setShowFocus(true);
                }}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Modo sin distracciones"
              >
                <FocusIcon /> Foco
              </button>
            )}

            {timer.hasStarted && (
              <button
                onClick={handleReset}
                className="ml-auto text-xs text-stone-400 hover:text-stone-700 px-2 transition"
                title="Reiniciar timer"
              >
                Reiniciar
              </button>
            )}
          </div>

          {/* Focus mode overlay */}
          {showFocus && (
            <FocusMode
              taskId={taskId}
              subtask={subtask}
              taskTitle={taskTitle}
              onExit={() => {
                setShowFocus(false);
                // Re-sync the card timer with the store's updated timeSpentSeconds
                // The FocusMode already saved to store via pause/complete, so
                // the card will re-render with fresh subtask.timeSpentSeconds
                // and its own startingSeconds memo will recalculate
                timer.reset(Math.max(0, totalSeconds - (subtask.timeSpentSeconds || 0)));
              }}
            />
          )}

          {isActiveElsewhere && (
            <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
              Otra subtask está activa. Pausala primero.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DragHandle({ attributes, listeners }) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Reordenar"
      title="Arrastrá para reordenar"
      className="shrink-0 cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition pt-0.5 touch-none"
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
        <circle cx="7" cy="5" r="1.5" />
        <circle cx="13" cy="5" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="7" cy="15" r="1.5" />
        <circle cx="13" cy="15" r="1.5" />
      </svg>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
      <path d="M6 4l10 6-10 6V4z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
      <rect x="5" y="4" width="3.5" height="12" rx="0.5" />
      <rect x="11.5" y="4" width="3.5" height="12" rx="0.5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
    </svg>
  );
}
function FocusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="3" />
      <path strokeLinecap="round" d="M10 3v2M10 15v2M3 10h2M15 10h2" />
    </svg>
  );
}
