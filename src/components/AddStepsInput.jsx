import { useState } from 'react';
import { useDecompose } from '../hooks/useDecompose.js';
import useTaskStore from '../store/taskStore.js';

/**
 * Input inline para agregar más subtasks a una tarea existente.
 * Se muestra colapsado ("+ Agregar pasos") y se expande al hacer click.
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
        className="w-full rounded-xl border border-dashed border-stone-300 py-3 text-xs font-medium text-stone-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/30 transition"
      >
        + Agregar más pasos
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 space-y-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Ej: Investigar competencia de...`}
        rows={2}
        disabled={isLoading}
        autoFocus
        className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 transition"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-stone-400">
          Claude va a descomponer esto y agregarlo a esta tarea
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setIsOpen(false); setText(''); }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <>
                <Spinner />
                Descomponiendo...
              </>
            ) : (
              <>Agregar →</>
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
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
