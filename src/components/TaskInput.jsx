import { useState } from 'react';
import { useDecompose } from '../hooks/useDecompose.js';
import useTaskStore from '../store/taskStore.js';

export function TaskInput() {
  const [text, setText] = useState('');
  const { decompose } = useDecompose();
  const { isLoading, error, clearError } = useTaskStore();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const result = await decompose(text);
    if (result) {
      setText('');
    }
  }

  function handleChange(e) {
    setText(e.target.value);
    if (error) clearError();
  }

  return (
    <div>
      <h1>Task Autopsy</h1>
      <p>Descomponé cualquier tarea compleja en micro-tareas de 15-30 min</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Ej: Crear propuesta de servicios para cliente nuevo..."
          rows={4}
          disabled={isLoading}
          style={{ width: '100%', resize: 'vertical' }}
        />

        <button type="submit" disabled={isLoading || !text.trim()}>
          {isLoading ? 'Descomponiendo...' : 'Descomponer tarea'}
        </button>
      </form>

      {isLoading && (
        <p role="status">
          Claude está analizando tu tarea, un momento...
        </p>
      )}

      {error && (
        <div role="alert" style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
          <button onClick={clearError} style={{ marginLeft: 8 }}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
