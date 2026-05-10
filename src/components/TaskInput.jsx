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
    <section className="zen-card">
      <div className="p-5 sm:p-6">
        {!hasTasks ? (
          <>
            <h2 className="text-base font-semibold text-zen-900 tracking-tight">
              Que necesitas descomponer hoy?
            </h2>
            <p className="mt-1.5 text-sm text-zen-500 leading-relaxed">
              Escribi una tarea grande o vaga. La AI la convierte en pasos de 15-30 min.
            </p>
          </>
        ) : (
          <h2 className="text-sm font-medium text-zen-800">
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
            className="w-full resize-y rounded-xl border border-zen-200 bg-zen-50 px-4 py-3 text-sm text-zen-900 placeholder:text-zen-400 focus:bg-[#fffef9] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-zen-400 tabular-nums">
              {text.length > 0 && `${text.length} caracteres`}
            </p>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Descomponiendo...</span>
                </>
              ) : (
                <>
                  Descomponer
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="border-t border-rose-100 bg-rose-50/70 px-5 sm:px-6 py-3 flex items-start gap-3 text-sm rounded-b-2xl animate-fade-in"
        >
          <span className="size-5 mt-0.5 grid place-items-center rounded-full bg-rose-200/80 text-rose-700 font-bold text-[10px]">!</span>
          <div className="flex-1 text-rose-800">
            <span className="text-rose-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-600 hover:text-rose-800 text-[11px] font-medium transition-colors duration-200"
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
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}
