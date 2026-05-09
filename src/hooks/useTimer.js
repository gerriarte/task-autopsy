import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown timer hook con start/pause/resume/reset.
 *
 * @param {number} initialSeconds - duración total en segundos
 * @param {Object} options
 * @param {() => void} options.onComplete - callback cuando llega a 0 (se dispara una vez)
 * @returns {{
 *   secondsLeft: number,
 *   isRunning: boolean,
 *   hasStarted: boolean,
 *   isCompleted: boolean,
 *   elapsedSeconds: number,
 *   start: () => void,
 *   pause: () => void,
 *   resume: () => void,
 *   reset: (newSeconds?: number) => void,
 * }}
 */
export function useTimer(initialSeconds, { onComplete } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  // Mantener callback fresco sin re-crear el interval
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Si cambia initialSeconds y el timer no arrancó, resetear
  useEffect(() => {
    if (!hasStarted) {
      setSecondsLeft(initialSeconds);
    }
  }, [initialSeconds, hasStarted]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        clearTick();
        setIsRunning(false);
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        return 0;
      }
      return prev - 1;
    });
  }, [clearTick]);

  const start = useCallback(() => {
    if (isRunning || secondsLeft <= 0) return;
    completedRef.current = false;
    setHasStarted(true);
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, secondsLeft, tick]);

  const pause = useCallback(() => {
    clearTick();
    setIsRunning(false);
  }, [clearTick]);

  const resume = useCallback(() => {
    if (isRunning || secondsLeft <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, secondsLeft, tick]);

  const reset = useCallback((newSeconds) => {
    clearTick();
    completedRef.current = false;
    setIsRunning(false);
    setHasStarted(false);
    setSecondsLeft(newSeconds ?? initialSeconds);
  }, [clearTick, initialSeconds]);

  // Cleanup en unmount
  useEffect(() => () => clearTick(), [clearTick]);

  return {
    secondsLeft,
    isRunning,
    hasStarted,
    isCompleted: secondsLeft === 0,
    elapsedSeconds: initialSeconds - secondsLeft,
    start,
    pause,
    resume,
    reset,
  };
}

/**
 * Formatea segundos a "MM:SS"
 */
export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
