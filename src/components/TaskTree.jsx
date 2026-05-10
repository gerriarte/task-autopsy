import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import useTaskStore from '../store/taskStore.js';
import { SubtaskCard } from './SubtaskCard.jsx';
import { AddStepsInput } from './AddStepsInput.jsx';
import { formatRelativeDate } from '../utils/dates.js';

function TaskCard({ task }) {
  const { deleteTask, getTaskProgress, reorderSubtasks, addToLearningPath, isInLearningPath } = useTaskStore();
  const progress = getTaskProgress(task.id);
  const isDone = progress === 100;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = task.subtasks.findIndex((st) => st.id === active.id);
    const newIndex = task.subtasks.findIndex((st) => st.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(task.subtasks, oldIndex, newIndex);
    reorderSubtasks(task.id, reordered.map((st) => st.id));
  }

  return (
    <article className="rounded-2xl border border-zen-200 bg-white overflow-hidden">
      {/* Header — clean, breathing */}
      <header className="p-5 sm:p-6 border-b border-zen-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-zen-900 tracking-tight">
              {task.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zen-400 flex-wrap">
              <span>{task.estimatedMinutes} min</span>
              <span className="text-zen-300">·</span>
              <span>{task.subtasks.length} pasos</span>
              <span className="text-zen-300">·</span>
              <span className={isDone ? 'text-emerald-600 font-medium' : ''}>
                {progress}%
              </span>
              <span className="text-zen-300">·</span>
              <span>
                {isDone
                  ? `Completada ${formatRelativeDate(task.completedAt)}`
                  : formatRelativeDate(task.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-[11px] text-zen-400 hover:text-rose-500 transition-colors duration-200 px-2 py-1"
            title="Eliminar tarea"
          >
            Eliminar
          </button>
        </div>

        {/* Progress bar — thin, elegant */}
        <div className="mt-4 h-1 w-full rounded-full bg-zen-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isDone ? 'bg-emerald-400' : 'bg-brand-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Subtasks */}
      <div className="p-5 sm:p-6 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={task.subtasks.map((st) => st.id)}
            strategy={verticalListSortingStrategy}
          >
            {task.subtasks.map((st) => (
              <SubtaskCard key={st.id} subtask={st} taskId={task.id} taskTitle={task.title} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="mt-2">
          <AddStepsInput taskId={task.id} taskTitle={task.title} />
        </div>
      </div>

      {/* Footer — tips & learning gaps */}
      {(task.tips?.length > 0 || task.learningGaps?.length > 0) && (
        <footer className="border-t border-zen-100 bg-zen-50/30 p-5 sm:p-6 space-y-3">
          {task.tips?.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="shrink-0 text-zen-400 text-xs mt-0.5">tip</span>
              <p className="text-zen-600 leading-relaxed">
                {task.tips[0]}
              </p>
            </div>
          )}

          {task.learningGaps?.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="shrink-0 text-zen-400 text-xs mt-0.5">learn</span>
              <div className="text-zen-600">
                <span className="inline-flex flex-wrap gap-1.5">
                  {task.learningGaps.map((gap) => {
                    const alreadyAdded = isInLearningPath(gap);
                    return (
                      <button
                        key={gap}
                        onClick={() => !alreadyAdded && addToLearningPath(gap, task.id, task.title)}
                        disabled={alreadyAdded}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all duration-200 ${
                          alreadyAdded
                            ? 'bg-emerald-50 text-emerald-600 cursor-default'
                            : 'bg-zen-100 text-zen-600 hover:bg-brand-50 hover:text-brand-700 cursor-pointer'
                        }`}
                        title={alreadyAdded ? 'Ya en tu Learning Path' : 'Agregar al Learning Path'}
                      >
                        {alreadyAdded ? '✓' : '+'} {gap}
                      </button>
                    );
                  })}
                </span>
              </div>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}

/**
 * Muestra la tarea seleccionada.
 */
export function TaskTree() {
  const { getCurrentTask } = useTaskStore();
  const currentTask = getCurrentTask();

  if (!currentTask) return null;

  return (
    <section className="animate-fade-in">
      <TaskCard task={currentTask} />
    </section>
  );
}
