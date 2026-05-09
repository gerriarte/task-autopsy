import { useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore.js';
import { useTimer, formatTime } from '../hooks/useTimer.js';
import { TASK_STATUS } from '../utils/constants.js';

export function SubtaskCard({ subtask, taskId }) {
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
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : undefined,
  };

  const {
    activeSubtask,
    startSubtask,
    pauseSubtask,
    completeSubtask,
    resetSubtask,
  } = useTaskStore();

  const isCompleted = subtask.status === TASK_STATUS.COMPLETED;
  const isActiveElsewhere =
    activeSubtask &&
    activeSubtask.subtaskId !== subtask.id;

  // Duración total en segundos basada en estimate de Claude
  const totalSeconds = useMemo(
    () => Math.max(60, subtask.estimatedMinutes * 60),
    [subtask.estimatedMinutes]
  );

  // Tiempo ya trackeado (si pausó antes y está retomando)
  const startingSeconds = useMemo(() => {
    const remaining = totalSeconds - (subtask.timeSpentSeconds || 0);
    return Math.max(0, remaining);
  }, [totalSeconds, subtask.timeSpentSeconds]);

  const timer = useTimer(startingSeconds, {
    onComplete: () => {
      // Cuando llega a 0, autocompletar
      completeSubtask(taskId, subtask.id, totalSeconds);
    },
  });

  // Si esta subtask deja de ser la activa global (otra empezó), pausar timer local
  useEffect(() => {
    if (isActiveElsewhere && timer.isRunning) {
      timer.pause();
    }
  }, [isActiveElsewhere, timer]);

  const elapsedTotal = (subtask.timeSpentSeconds || 0) + timer.elapsedSeconds;

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

  // Ya completada: vista compacta
  if (isCompleted) {
    const realMin = Math.round((subtask.timeSpentSeconds || 0) / 60);
    const estMin = subtask.estimatedMinutes;
    return (
      <div
        ref={setNodeRef}
        style={{
          ...dragStyle,
          border: '1px solid #c3e6cb',
          background: '#f0f9f4',
          padding: 12,
          marginBottom: 8,
          borderRadius: 6,
          opacity: isDragging ? 0.5 : 0.85,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <DragHandle attributes={attributes} listeners={listeners} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
          <div>
            <span style={{ marginRight: 6 }}>✓</span>
            <strong style={{ textDecoration: 'line-through' }}>{subtask.title}</strong>
            <br />
            <small>
              Real: {realMin} min | Estimado: {estMin} min
              {realMin > 0 && estMin > 0 && (
                <> ({realMin <= estMin ? '✓ a tiempo' : `+${realMin - estMin} min`})</>
              )}
            </small>
          </div>
          <button onClick={handleReset} title="Reabrir tarea">
            ↺
          </button>
        </div>
      </div>
    );
  }

  const isPaused = timer.hasStarted && !timer.isRunning && timer.secondsLeft > 0;
  const progressPct = totalSeconds > 0 ? (elapsedTotal / totalSeconds) * 100 : 0;
  const progressClamped = Math.min(100, progressPct);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        border: timer.isRunning ? '2px solid #007bff' : '1px solid #ddd',
        padding: 14,
        marginBottom: 10,
        borderRadius: 8,
        background: timer.isRunning ? '#f0f7ff' : '#fff',
        opacity: isDragging ? 0.5 : isActiveElsewhere ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
          <DragHandle attributes={attributes} listeners={listeners} />
          <div style={{ flex: 1 }}>
          <strong>{subtask.title}</strong>
          <p style={{ margin: '4px 0', fontSize: '0.9em', color: '#555' }}>
            {subtask.description}
          </p>
          {subtask.knowledgeGaps?.length > 0 && (
            <small style={{ color: '#888' }}>
              Gaps: {subtask.knowledgeGaps.join(', ')}
            </small>
          )}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 90 }}>
          <div
            style={{
              fontSize: '1.6em',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: timer.secondsLeft < 60 ? '#d9534f' : timer.isRunning ? '#007bff' : '#333',
            }}
          >
            {formatTime(timer.secondsLeft)}
          </div>
          <small style={{ color: '#888' }}>
            de {subtask.estimatedMinutes} min
          </small>
        </div>
      </div>

      <div
        style={{
          height: 4,
          background: '#eee',
          borderRadius: 2,
          margin: '10px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressClamped}%`,
            background: timer.isRunning ? '#007bff' : '#999',
            transition: 'width 1s linear',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {!timer.hasStarted && (
          <button
            onClick={handleStart}
            disabled={isActiveElsewhere}
            style={{ background: '#28a745', color: '#fff', border: 'none' }}
            title={isActiveElsewhere ? 'Pausá la otra subtask primero' : 'Empezar timer'}
          >
            ▶ Empezar
          </button>
        )}

        {timer.isRunning && (
          <button onClick={handlePause}>⏸ Pausar</button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            disabled={isActiveElsewhere}
            style={{ background: '#007bff', color: '#fff', border: 'none' }}
          >
            ▶ Continuar
          </button>
        )}

        <button
          onClick={handleComplete}
          style={{ background: '#fff', border: '1px solid #28a745', color: '#28a745' }}
        >
          ✓ Listo
        </button>

        {timer.hasStarted && (
          <button onClick={handleReset} style={{ marginLeft: 'auto' }} title="Reset timer">
            ↺
          </button>
        )}
      </div>

      {isActiveElsewhere && (
        <small style={{ display: 'block', marginTop: 8, color: '#856404' }}>
          Otra subtask está activa. Pausala antes de empezar esta.
        </small>
      )}
    </div>
  );
}

/**
 * Handle visible para arrastrar la card. Solo este elemento dispara el drag,
 * para que los botones internos sigan funcionando normal.
 */
function DragHandle({ attributes, listeners }) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Reordenar subtask"
      title="Arrastrá para reordenar"
      style={{
        cursor: 'grab',
        background: 'transparent',
        border: 'none',
        padding: '4px 6px',
        color: '#999',
        fontSize: '1.1em',
        lineHeight: 1,
        touchAction: 'none',
      }}
    >
      ⋮⋮
    </button>
  );
}
