import { useEffect, useMemo, useCallback } from 'react';
import useTaskStore from '../store/taskStore.js';
import { useTimer, formatTime } from '../hooks/useTimer.js';
import { TASK_STATUS } from '../utils/constants.js';

/**
 * Modo Foco: pantalla completa con solo la subtask actual, timer y controles.
 * Cero distracciones. Diseñado para ADHD.
 */
export function FocusMode({ taskId, subtask, taskTitle, onExit }) {
  const {
    startSubtask,
    pauseSubtask,
    completeSubtask,
  } = useTaskStore();

  const totalSeconds = useMemo(
    () => Math.max(60, subtask.estimatedMinutes * 60),
    [subtask.estimatedMinutes]
  );

  const startingSeconds = useMemo(() => {
    const remaining = totalSeconds - (subtask.timeSpentSeconds || 0);
    return Math.max(0, remaining);
  }, [totalSeconds, subtask.timeSpentSeconds]);

  const handleComplete = useCallback(() => {
    // Will be called from timer onComplete or manual
  }, []);

  const timer = useTimer(startingSeconds, {
    onComplete: handleComplete,
  });

  const elapsedTotal = (subtask.timeSpentSeconds || 0) + timer.elapsedSeconds;
  const isPaused = timer.hasStarted && !timer.isRunning && timer.secondsLeft > 0;
  const lowTime = timer.secondsLeft < 60 && timer.isRunning;
  const progressPct = totalSeconds > 0 ? Math.min(100, (elapsedTotal / totalSeconds) * 100) : 0;

  // Auto-start when entering focus mode
  useEffect(() => {
    if (!timer.hasStarted) {
      startSubtask(taskId, subtask.id);
      timer.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC to exit
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        handlePause();
        onExit();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [timer.isRunning, elapsedTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePause() {
    if (timer.isRunning) {
      timer.pause();
      pauseSubtask(taskId, subtask.id, elapsedTotal);
    }
  }

  function handleResume() {
    startSubtask(taskId, subtask.id);
    timer.resume();
  }

  function handleDone() {
    timer.pause();
    completeSubtask(taskId, subtask.id, elapsedTotal);
    onExit();
  }

  function handleExitSafe() {
    handlePause();
    onExit();
  }

  // Timer color based on state
  const timerColor = lowTime
    ? 'text-rose-400'
    : timer.isRunning
    ? 'text-white'
    : isPaused
    ? 'text-amber-300'
    : 'text-stone-400';

  const ringColor = lowTime
    ? 'border-rose-500/40'
    : timer.isRunning
    ? 'border-brand-400/40'
    : 'border-stone-600';

  const progressColor = lowTime
    ? 'bg-rose-500'
    : timer.isRunning
    ? 'bg-brand-400'
    : 'bg-amber-400';

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center select-none">
      {/* Background glow */}
      {timer.isRunning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full blur-[120px] opacity-10 ${lowTime ? 'bg-rose-500' : 'bg-brand-500'} transition-colors duration-1000`} />
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={handleExitSafe}
        className="absolute top-6 right-6 text-stone-500 hover:text-stone-300 transition p-2 rounded-lg hover:bg-stone-800/50"
        title="Salir del modo foco (ESC)"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Task context */}
      <p className="text-stone-500 text-xs tracking-widest uppercase mb-8">
        {taskTitle}
      </p>

      {/* Subtask title */}
      <h1 className="text-white text-2xl sm:text-3xl font-bold text-center max-w-xl leading-snug px-6 mb-12">
        {subtask.title}
      </h1>

      {/* Timer circle */}
      <div className={`relative size-52 sm:size-64 rounded-full border-4 ${ringColor} grid place-items-center mb-10 transition-colors duration-500`}>
        {/* Circular progress ring */}
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-stone-800"
          />
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progressPct / 100)}`}
            className={lowTime ? 'text-rose-500' : timer.isRunning ? 'text-brand-400' : 'text-amber-400'}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Timer text */}
        <div className="text-center z-10">
          <div className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums leading-none ${timerColor} transition-colors duration-300`}>
            {formatTime(timer.secondsLeft)}
          </div>
          <p className="text-stone-500 text-xs mt-2 uppercase tracking-wider">
            {timer.isRunning
              ? lowTime ? 'Casi listo' : 'Enfocado'
              : isPaused
              ? 'Pausado'
              : 'Listo'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {timer.isRunning && (
          <button
            onClick={handlePause}
            className="size-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white grid place-items-center transition shadow-lg"
            title="Pausar"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            className="size-14 rounded-full bg-brand-600 hover:bg-brand-500 text-white grid place-items-center transition shadow-lg"
            title="Continuar"
          >
            <svg viewBox="0 0 24 24" className="size-7 ml-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleDone}
          className="size-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white grid place-items-center transition shadow-lg"
          title="Completar"
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {subtask.description && (
        <p className="text-stone-500 text-sm text-center max-w-md mt-10 px-6 leading-relaxed">
          {subtask.description}
        </p>
      )}

      {/* Keyboard hint */}
      <p className="absolute bottom-6 text-stone-700 text-[10px] tracking-wider">
        ESC para salir
      </p>
    </div>
  );
}
