import { useState } from 'react';
import { useDecompose } from '../hooks/useDecompose.js';
import useTaskStore from '../store/taskStore.js';

/**
 * Input inline para agregar mas subtasks a una tarea existente.
 */
export function AddStepsInput({ taskId, taskTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const { decomposeInto } = useDecompose();
  const { isLoading } = useTaskStore();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const result = await decomposeInto(text, taskId, taskTitle);
    if (result) {
      setText('');
      setIsOpen(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-dashed border-zen-200 py-3 text-[11px] font-medium text-zen-400 hover:border-brand-300/60 hover:text-brand-500 transition-colors duration-200"
      >
        + Agregar mas pasos
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zen-200 bg-zen-50/30 p-3 space-y-2 animate-fade-in"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ej: Investigar competencia de..."
        rows={2}
        disabled={isLoading}
        autoFocus
        className="w-full resize-none rounded-lg border border-zen-200 bg-[#fffef9] px-3 py-2 text-sm text-zen-800 placeholder:text-zen-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 disabled:opacity-50 transition-all duration-200"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-zen-400">
          La AI descompone y agrega a esta tarea
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setIsOpen(false); setText(''); }}
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-zen-500 hover:bg-zen-100 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <Spinner />
                Descomponiendo...
              </>
            ) : (
              'Agregar'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin size-3" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}
