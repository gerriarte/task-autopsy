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

function TaskCard({ task }) {
  const { deleteTask, getTaskProgress, reorderSubtasks } = useTaskStore();
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
    <article className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <header className="p-5 sm:p-6 border-b border-stone-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-stone-900 truncate">
              {task.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
              <span>~{task.estimatedMinutes} min total</span>
              <span aria-hidden>·</span>
              <span>{task.subtasks.length} pasos</span>
              <span aria-hidden>·</span>
              <span className={isDone ? 'text-emerald-600 font-medium' : ''}>
                {progress}% completado
              </span>
            </div>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-xs text-stone-400 hover:text-rose-600 transition px-2 py-1"
            title="Eliminar tarea"
          >
            Eliminar
          </button>
        </div>

        <div className="mt-4 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-500 to-brand-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="p-5 sm:p-6 space-y-2.5">
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
              <SubtaskCard key={st.id} subtask={st} taskId={task.id} />
            ))}
          </SortableContext>
        </DndContext>

        {/* Input inline para agregar más pasos */}
        <div className="mt-3">
          <AddStepsInput taskId={task.id} taskTitle={task.title} />
        </div>
      </div>

      {(task.tips?.length > 0 || task.learningGaps?.length > 0) && (
        <footer className="border-t border-stone-100 bg-stone-50/50 p-5 sm:p-6 space-y-3">
          {task.tips?.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="shrink-0 text-amber-500" aria-hidden>💡</span>
              <p className="text-stone-700">
                <span className="font-medium">Tip: </span>
                {task.tips[0]}
              </p>
            </div>
          )}

          {task.learningGaps?.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="shrink-0 text-brand-500" aria-hidden>📚</span>
              <div className="text-stone-600">
                <span className="font-medium text-stone-700">Vas a necesitar saber: </span>
                <span className="inline-flex flex-wrap gap-1.5 mt-1">
                  {task.learningGaps.map((gap) => (
                    <span
                      key={gap}
                      className="rounded-md bg-brand-50 text-brand-700 px-2 py-0.5 text-xs font-medium"
                    >
                      {gap}
                    </span>
                  ))}
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
 * Muestra la tarea seleccionada (currentTaskId).
 * La navegación entre tareas la controla el sidebar (TaskNav).
 */
export function TaskTree() {
  const { getCurrentTask } = useTaskStore();
  const currentTask = getCurrentTask();

  if (!currentTask) return null;

  return (
    <section>
      <TaskCard task={currentTask} />
    </section>
  );
}
