import useTaskStore from '../store/taskStore.js';
import { TASK_STATUS } from '../utils/constants.js';

function SubtaskItem({ subtask, taskId }) {
  const { updateSubtaskStatus } = useTaskStore();
  const isCompleted = subtask.status === TASK_STATUS.COMPLETED;

  function handleToggle() {
    const nextStatus = isCompleted ? TASK_STATUS.PENDING : TASK_STATUS.COMPLETED;
    updateSubtaskStatus(taskId, subtask.id, nextStatus);
  }

  return (
    <li style={{ marginBottom: 8, opacity: isCompleted ? 0.6 : 1 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggle}
          style={{ marginTop: 3 }}
        />
        <span>
          <strong style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {subtask.title}
          </strong>
          <br />
          <small>{subtask.description}</small>
          <br />
          <small>~{subtask.estimatedMinutes} min</small>
          {subtask.knowledgeGaps?.length > 0 && (
            <span> | Gaps: {subtask.knowledgeGaps.join(', ')}</span>
          )}
        </span>
      </label>
    </li>
  );
}

function TaskCard({ task }) {
  const { deleteTask, setCurrentTask, getTaskProgress } = useTaskStore();
  const progress = getTaskProgress(task.id);

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

      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {task.subtasks.map((st) => (
          <SubtaskItem key={st.id} subtask={st} taskId={task.id} />
        ))}
      </ol>

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
