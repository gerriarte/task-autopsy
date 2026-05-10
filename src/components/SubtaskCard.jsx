import { useState, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore.js';
import { useTimer, formatTime } from '../hooks/useTimer.js';
import { TASK_STATUS } from '../utils/constants.js';
import { FocusMode } from './FocusMode.jsx';

export function SubtaskCard({ subtask, taskId, taskTitle }) {
  const [showFocus, setShowFocus] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
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

  // Overtime detection: how far past estimated time
  const overtimeRatio = totalSeconds > 0 ? elapsedTotal / totalSeconds : 0;

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
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 400);
  }
  function handleReset() {
    timer.reset(totalSeconds);
    resetSubtask(taskId, subtask.id);
  }

  // ============ COMPLETED — compact, satisfying ============
  if (isCompleted) {
    const realMin = Math.round((subtask.timeSpentSeconds || 0) / 60);
    const estMin = subtask.estimatedMinutes;
    const onTime = realMin <= estMin;

    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        className={`group flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50/40 px-3.5 py-2.5 transition-all duration-300 ${
          isDragging ? 'opacity-40' : ''
        } ${justCompleted ? 'animate-complete-pop' : ''}`}
      >
        <DragHandle attributes={attributes} listeners={listeners} />
        <div className="size-5 shrink-0 rounded-full bg-emerald-500 text-white grid place-items-center">
          <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zen-500 line-through truncate">
            {subtask.title}
          </p>
          <p className="text-[11px] text-zen-400 mt-0.5">
            {realMin}m real
            <span className="mx-1.5 text-zen-300">·</span>
            {estMin}m est.
            {realMin > 0 && (
              <span className={`ml-1.5 font-medium ${onTime ? 'text-emerald-600' : 'text-amber-600'}`}>
                {onTime ? 'a tiempo' : `+${realMin - estMin}m`}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-[11px] text-zen-400 hover:text-zen-600 opacity-0 group-hover:opacity-100 transition-all duration-200 px-2"
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
  const isOvertime = overtimeRatio > 1;

  // Urgency border color — graduated, never alarming
  const borderClass = timer.isRunning
    ? isOvertime
      ? 'border-amber-300/70'          // overtime: warm amber
      : lowTime
      ? 'border-amber-200/60'          // low time: subtle amber
      : 'border-brand-200/60'          // normal: calm brand
    : isPaused
    ? 'border-amber-200/50'
    : 'border-zen-200';

  // Background hint for overtime — very subtle
  const bgClass = timer.isRunning
    ? isOvertime
      ? 'bg-amber-50/30'
      : 'bg-[#fffef9]'
    : isPaused
    ? 'bg-amber-50/20'
    : 'bg-[#fffef9]';

  const cardClass = [
    'rounded-xl border p-4 transition-all duration-300',
    borderClass,
    bgClass,
    timer.isRunning && !isOvertime ? 'animate-pulse-ring' : '',
    isDragging ? 'opacity-40' : '',
    isActiveElsewhere ? 'opacity-40' : '',
  ].join(' ');

  // Timer nudge when it hits zero
  const timerNudge = timer.secondsLeft === 0 && timer.hasStarted;

  return (
    <div ref={setNodeRef} style={dragStyle} className={cardClass}>
      <div className="flex items-start gap-3">
        <DragHandle attributes={attributes} listeners={listeners} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-zen-900 leading-snug">
                {subtask.title}
              </h4>
              <p className="mt-1 text-xs text-zen-500 leading-relaxed">
                {subtask.description}
              </p>
            </div>

            {/* Timer display */}
            <div className={`text-right shrink-0 ${timerNudge ? 'animate-nudge' : ''}`}>
              <div
                className={`font-mono text-2xl font-bold leading-none tabular-nums transition-colors duration-500 ${
                  isOvertime
                    ? 'text-amber-600'
                    : lowTime
                    ? 'text-amber-500'
                    : timer.isRunning
                    ? 'text-brand-600'
                    : isPaused
                    ? 'text-amber-600'
                    : 'text-zen-300'
                }`}
              >
                {formatTime(timer.secondsLeft)}
              </div>
              <p className={`text-[10px] uppercase tracking-wider mt-0.5 transition-colors duration-300 ${
                isOvertime ? 'text-amber-500' : 'text-zen-400'
              }`}>
                {timer.isRunning
                  ? isOvertime ? 'tiempo extra' : lowTime ? 'casi' : 'enfocado'
                  : isPaused ? 'pausado' : `${subtask.estimatedMinutes} min`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {timer.hasStarted && (
            <div className="mt-3 h-1 w-full rounded-full bg-zen-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOvertime ? 'bg-amber-400' : lowTime ? 'bg-amber-400' : timer.isRunning ? 'bg-brand-400' : 'bg-amber-300'
                }`}
                style={{
                  width: `${progressClamped}%`,
                  transitionDuration: timer.isRunning ? '1s' : '300ms',
                }}
              />
            </div>
          )}

          {/* Knowledge gaps */}
          {subtask.knowledgeGaps?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {subtask.knowledgeGaps.map((gap) => {
                const added = isInLearningPath(gap);
                return (
                  <button
                    key={gap}
                    onClick={() => !added && addToLearningPath(gap, taskId, taskTitle)}
                    disabled={added}
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all duration-200 ${
                      added
                        ? 'bg-emerald-50 text-emerald-600 cursor-default'
                        : 'bg-zen-100 text-zen-600 hover:bg-brand-50 hover:text-brand-700 cursor-pointer'
                    }`}
                    title={added ? 'En tu Learning Path' : 'Agregar al Learning Path'}
                  >
                    {added ? '✓' : '+'} {gap}
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions — clean, spaced */}
          <div className="mt-3.5 flex items-center gap-2 flex-wrap">
            {!timer.hasStarted && (
              <button
                onClick={handleStart}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                title={isActiveElsewhere ? 'Pausa la otra subtask primero' : undefined}
              >
                <PlayIcon /> Empezar
              </button>
            )}

            {timer.isRunning && (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zen-100 px-3.5 py-1.5 text-xs font-medium text-zen-700 hover:bg-zen-200 transition-colors duration-200"
              >
                <PauseIcon /> Pausar
              </button>
            )}

            {isPaused && (
              <button
                onClick={handleResume}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <PlayIcon /> Continuar
              </button>
            )}

            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors duration-200"
            >
              <CheckIcon /> Listo
            </button>

            {/* Focus mode button */}
            {!isCompleted && (
              <button
                onClick={() => {
                  if (timer.isRunning) {
                    timer.pause();
                    pauseSubtask(taskId, subtask.id, elapsedTotal);
                  }
                  setShowFocus(true);
                }}
                disabled={isActiveElsewhere}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/60 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                title="Modo sin distracciones"
              >
                <FocusIcon /> Foco
              </button>
            )}

            {timer.hasStarted && (
              <button
                onClick={handleReset}
                className="ml-auto text-[11px] text-zen-400 hover:text-zen-600 px-2 transition-colors duration-200"
                title="Reiniciar timer"
              >
                Reiniciar
              </button>
            )}
          </div>

          {isActiveElsewhere && (
            <p className="mt-2 text-[11px] text-amber-600 bg-amber-50/60 px-2.5 py-1 rounded-lg">
              Otra subtask esta activa. Pausala primero.
            </p>
          )}

          {/* Focus mode overlay */}
          {showFocus && (
            <FocusMode
              taskId={taskId}
              subtask={subtask}
              taskTitle={taskTitle}
              onExit={() => {
                setShowFocus(false);
                timer.reset(Math.max(0, totalSeconds - (subtask.timeSpentSeconds || 0)));
              }}
            />
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
      title="Arrastra para reordenar"
      className="shrink-0 cursor-grab active:cursor-grabbing text-zen-300 hover:text-zen-400 transition-colors duration-200 pt-0.5 touch-none"
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
