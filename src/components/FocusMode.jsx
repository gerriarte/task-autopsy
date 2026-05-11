import { useEffect, useMemo, useCallback } from 'react';
import useTaskStore from '../store/taskStore.js';
import { useTimer, formatTime } from '../hooks/useTimer.js';
import { notifyTimerComplete, notifySubtaskComplete } from '../utils/notifications.js';

/**
 * Modo Foco: pantalla completa, un solo proposito.
 * Zen: solo lo esencial — titulo, timer circular, 2 botones.
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

  const handleTimerComplete = useCallback(() => {
    notifyTimerComplete(subtask.title);
  }, [subtask.title]);

  const timer = useTimer(startingSeconds, {
    onComplete: handleTimerComplete,
  });

  const elapsedTotal = (subtask.timeSpentSeconds || 0) + timer.elapsedSeconds;
  const isPaused = timer.hasStarted && !timer.isRunning && timer.secondsLeft > 0;
  const lowTime = timer.secondsLeft < 60 && timer.isRunning;
  const isOvertime = elapsedTotal > totalSeconds;
  const progressPct = totalSeconds > 0 ? Math.min(100, (elapsedTotal / totalSeconds) * 100) : 0;
  const timerNudge = timer.secondsLeft === 0 && timer.hasStarted;

  // Auto-start on mount
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
        handleExitSafe();
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
    notifySubtaskComplete(subtask.title, taskTitle);
    onExit();
  }

  function handleExitSafe() {
    handlePause();
    onExit();
  }

  // Color states — graduated, never jarring
  const timerColor = isOvertime
    ? 'text-amber-300'
    : lowTime
    ? 'text-amber-200'
    : timer.isRunning
    ? 'text-white'
    : isPaused
    ? 'text-zen-400'
    : 'text-zen-500';

  const ringStroke = isOvertime
    ? 'text-amber-500/70'
    : lowTime
    ? 'text-amber-400/60'
    : timer.isRunning
    ? 'text-brand-400/60'
    : 'text-zen-600';

  const glowColor = isOvertime
    ? 'bg-amber-500'
    : lowTime
    ? 'bg-amber-400'
    : 'bg-brand-500';

  return (
    <div className="fixed inset-0 z-50 bg-zen-900 flex flex-col items-center justify-center select-none">
      {/* Background breathing glow */}
      {timer.isRunning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 size-[500px] rounded-full blur-[150px] ${glowColor} animate-focus-breathe`} />
        </div>
      )}

      {/* Exit button — minimal */}
      <button
        onClick={handleExitSafe}
        className="absolute top-5 right-5 text-zen-600 hover:text-zen-400 transition-colors duration-200 p-2 rounded-lg"
        title="Salir (ESC)"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Task context — whisper */}
      <p className="text-zen-600 text-[11px] tracking-[0.2em] uppercase mb-6">
        {taskTitle}
      </p>

      {/* Subtask title */}
      <h1 className="text-white text-xl sm:text-2xl font-semibold text-center max-w-md leading-relaxed px-8 mb-14">
        {subtask.title}
      </h1>

      {/* Timer circle */}
      <div className={`relative size-48 sm:size-56 rounded-full grid place-items-center mb-12 ${timerNudge ? 'animate-nudge' : ''}`}>
        {/* Ring SVG */}
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zen-800"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progressPct / 100)}`}
            className={ringStroke}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Timer text */}
        <div className="text-center z-10">
          <div className={`font-mono text-4xl sm:text-5xl font-bold tabular-nums leading-none ${timerColor} transition-colors duration-500`}>
            {formatTime(timer.secondsLeft)}
          </div>
          <p className="text-zen-600 text-[10px] mt-2.5 uppercase tracking-[0.15em]">
            {timer.isRunning
              ? isOvertime ? 'tiempo extra' : lowTime ? 'casi' : 'enfocado'
              : isPaused
              ? 'pausado'
              : 'listo'}
          </p>
        </div>
      </div>

      {/* Controls — just two buttons */}
      <div className="flex items-center gap-5">
        {timer.isRunning && (
          <button
            onClick={handlePause}
            className="size-12 rounded-full bg-zen-800 hover:bg-zen-700 text-zen-300 grid place-items-center transition-colors duration-200"
            title="Pausar"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            className="size-12 rounded-full bg-brand-600/80 hover:bg-brand-600 text-white grid place-items-center transition-colors duration-200"
            title="Continuar"
          >
            <svg viewBox="0 0 24 24" className="size-5 ml-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleDone}
          className="size-12 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white grid place-items-center transition-colors duration-200"
          title="Completar"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Description — soft, optional */}
      {subtask.description && (
        <p className="text-zen-600 text-xs text-center max-w-sm mt-10 px-8 leading-relaxed">
          {subtask.description}
        </p>
      )}

      {/* Hint */}
      <p className="absolute bottom-5 text-zen-700 text-[9px] tracking-[0.15em] uppercase">
        ESC para salir
      </p>
    </div>
  );
}
