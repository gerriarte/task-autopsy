import { useState } from 'react';
import { useDecompose } from '../hooks/useDecompose.js';
import useTaskStore from '../store/taskStore.js';

export function TaskInput() {
  const [text, setText] = useState('');
  const { decompose } = useDecompose();
  const { tasks, isLoading, error, clearError } = useTaskStore();
  const hasTasks = tasks.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const result = await decompose(text);
    if (result) setText('');
  }

  function handleChange(e) {
    setText(e.target.value);
    if (error) clearError();
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        {!hasTasks ? (
          <>
            <h2 className="text-base font-semibold text-stone-900">
              ¿Qué necesitás romper en pedazos hoy?
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Escribí una tarea grande o vaga. Claude la convierte en micro-tareas de 15–30 min.
            </p>
          </>
        ) : (
          <h2 className="text-sm font-semibold text-stone-900">
            Nueva tarea
          </h2>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Ej: Crear propuesta de servicios para cliente nuevo"
            rows={hasTasks ? 2 : 3}
            disabled={isLoading}
            autoFocus={hasTasks}
            className="w-full resize-y rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-stone-400">
              {text.length > 0 && `${text.length} caracteres`}
            </p>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Descomponiendo...
                </>
              ) : (
                <>
                  Descomponer
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="border-t border-rose-100 bg-rose-50 px-5 sm:px-6 py-3 flex items-start gap-3 text-sm rounded-b-2xl"
        >
          <span className="size-5 mt-0.5 grid place-items-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs">!</span>
          <div className="flex-1 text-rose-800">
            <strong className="font-semibold">Error.</strong>{' '}
            <span className="text-rose-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-700 hover:text-rose-900 text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      )}
    </section>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
