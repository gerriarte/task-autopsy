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

function TaskCard({ task }) {
  const { deleteTask, setCurrentTask, getTaskProgress, reorderSubtasks } = useTaskStore();
  const progress = getTaskProgress(task.id);

  // PointerSensor con activationConstraint evita que clicks en botones inicien drag accidental
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>{task.title}</h3>
          <small>~{task.estimatedMinutes} min total | Progreso: {progress}%</small>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setCurrentTask(task.id)}>Ver</button>
          <button onClick={() => deleteTask(task.id)} style={{ color: 'red' }}>
            Eliminar
          </button>
        </div>
      </div>

      <div
        style={{
          height: 6,
          background: '#eee',
          borderRadius: 3,
          margin: '12px 0',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: progress === 100 ? 'green' : '#007bff',
            borderRadius: 3,
            transition: 'width 0.3s',
          }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
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
      </div>

      {task.tips?.length > 0 && (
        <div style={{ marginTop: 12, padding: 8, background: '#fffbe6', borderRadius: 4 }}>
          <strong>Tip:</strong> {task.tips[0]}
        </div>
      )}

      {task.learningGaps?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <small>
            <strong>Learning gaps:</strong> {task.learningGaps.join(', ')}
          </small>
        </div>
      )}
    </div>
  );
}

export function TaskTree() {
  const { tasks } = useTaskStore();

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
        <p>No hay tareas todavía.</p>
        <p>Ingresá una tarea arriba para empezar.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Tus tareas ({tasks.length})</h2>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
