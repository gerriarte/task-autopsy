import { useState } from 'react';
import { PROVIDERS, PROVIDER_IDS, DEFAULT_PROVIDER } from '../utils/providers.js';
import { loadApiConfig, saveApiConfig, clearApiConfig, callClaudeAPI } from '../utils/api.js';
import { downloadCSV, downloadJSON } from '../utils/export.js';
import { loadWebhookConfig, saveWebhookConfig, clearWebhookConfig, testWebhook, WEBHOOK_EVENTS } from '../utils/webhook.js';
import useTaskStore from '../store/taskStore.js';

export function SettingsPanel() {
  const [config, setConfig] = useState(() => {
    const saved = loadApiConfig();
    return saved || { provider: DEFAULT_PROVIDER, apiKey: '', model: '' };
  });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // 'ok' | 'error' | null

  const provider = PROVIDERS[config.provider];

  function handleProviderChange(providerId) {
    const newProvider = PROVIDERS[providerId];
    setConfig({
      provider: providerId,
      apiKey: '',
      model: newProvider.defaultModel,
    });
    setSaved(false);
    setTestResult(null);
  }

  function handleSave() {
    if (!config.apiKey.trim()) return;
    const toSave = {
      provider: config.provider,
      apiKey: config.apiKey.trim(),
      model: config.model || provider.defaultModel,
    };
    saveApiConfig(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    if (!config.apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);

    // Save temporarily to test
    const prev = loadApiConfig();
    saveApiConfig({
      provider: config.provider,
      apiKey: config.apiKey.trim(),
      model: config.model || provider.defaultModel,
    });

    try {
      const result = await callClaudeAPI(
        'Respond with exactly: {"status":"ok"}',
        'Test connection',
        50
      );
      // If we got here without error, it works
      setTestResult('ok');
    } catch (err) {
      console.error('API test failed:', err);
      setTestResult('error');
      // Restore previous config if test failed
      if (prev) saveApiConfig(prev);
      else clearApiConfig();
    }
    setTesting(false);
  }

  function handleClear() {
    clearApiConfig();
    setConfig({ provider: DEFAULT_PROVIDER, apiKey: '', model: '' });
    setTestResult(null);
    setSaved(false);
  }

  const isConfigured = !!loadApiConfig()?.apiKey;

  return (
    <section className="space-y-5">
      <div className="zen-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 grid place-items-center text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-zen-900">Configuración de AI</h2>
            <p className="text-xs text-zen-500">
              Elegí tu proveedor y colocá tu API key. Se guarda localmente en tu navegador.
            </p>
          </div>
        </div>

        {/* ── Provider selector ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zen-700 mb-2">Proveedor</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_IDS.map((pid) => {
                const p = PROVIDERS[pid];
                const isActive = config.provider === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => handleProviderChange(pid)}
                    className={`rounded-xl border p-3 text-center transition ${
                      isActive
                        ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-200'
                        : 'border-zen-200 bg-[#fffef9] hover:border-zen-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isActive ? 'text-brand-800' : 'text-zen-700'}`}>
                      {p.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-zen-500 mt-0.5">
                      {p.name.match(/\((.+)\)/)?.[1] || ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Model selector ── */}
          <div>
            <label className="block text-xs font-medium text-zen-700 mb-1.5">Modelo</label>
            <select
              value={config.model || provider.defaultModel}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-lg border border-zen-300 bg-[#fffef9] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
            >
              {provider.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* ── API Key ── */}
          <div>
            <label className="block text-xs font-medium text-zen-700 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value });
                  setSaved(false);
                  setTestResult(null);
                }}
                placeholder={provider.placeholder}
                className="w-full rounded-lg border border-zen-300 bg-[#fffef9] px-3 py-2 pr-20 text-sm font-mono placeholder:text-zen-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zen-500 hover:text-zen-700 px-2 py-1"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <p className="text-[10px] text-zen-400 mt-1.5">
              Tu key se guarda solo en tu navegador (localStorage). Nunca se envía a ningún servidor excepto al proveedor de AI.
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={handleSave}
              disabled={!config.apiKey.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>

            <button
              onClick={handleTest}
              disabled={!config.apiKey.trim() || testing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zen-300 bg-[#fffef9] px-4 py-2 text-xs font-medium text-zen-700 hover:bg-zen-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {testing ? (
                <>
                  <svg className="animate-spin size-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Probando...
                </>
              ) : 'Probar conexión'}
            </button>

            {isConfigured && (
              <button
                onClick={handleClear}
                className="ml-auto text-xs text-zen-400 hover:text-rose-600 transition"
              >
                Borrar configuración
              </button>
            )}
          </div>

          {/* ── Test result ── */}
          {testResult === 'ok' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 flex items-center gap-2">
              <span className="size-4 rounded-full bg-emerald-500 text-white grid place-items-center text-[10px] font-bold">✓</span>
              Conexión exitosa con {provider.name}
            </div>
          )}
          {testResult === 'error' && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800 flex items-center gap-2">
              <span className="size-4 rounded-full bg-rose-500 text-white grid place-items-center text-[10px] font-bold">!</span>
              Error de conexión. Verificá tu API key y proveedor.
            </div>
          )}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoCard
          title="Anthropic"
          desc="Claude Sonnet 4 — mejor razonamiento"
          link="https://console.anthropic.com/settings/keys"
          linkLabel="Obtener key"
        />
        <InfoCard
          title="OpenAI"
          desc="GPT-4.1 — rápido y versátil"
          link="https://platform.openai.com/api-keys"
          linkLabel="Obtener key"
        />
        <InfoCard
          title="Google"
          desc="Gemini 2.5 — tier gratuito generoso"
          link="https://aistudio.google.com/apikey"
          linkLabel="Obtener key"
        />
      </div>

      {/* ═══════════════ EXPORT ═══════════════ */}
      <ExportSection />

      {/* ═══════════════ WEBHOOKS ═══════════════ */}
      <WebhookSection />
    </section>
  );
}

/**
 * Sección de Export CSV/JSON
 */
function ExportSection() {
  const { tasks, learningPath } = useTaskStore();
  const hasTasks = tasks.length > 0;

  return (
    <div className="zen-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zen-900">Exportar datos</h2>
          <p className="text-xs text-zen-500">
            Descargá tus tareas como CSV (para Sheets) o JSON (backup completo).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => downloadCSV(tasks)}
          disabled={!hasTasks}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Exportar CSV
        </button>

        <button
          onClick={() => downloadJSON(tasks, learningPath)}
          disabled={!hasTasks}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zen-300 bg-[#fffef9] px-4 py-2 text-xs font-medium text-zen-700 hover:bg-zen-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Exportar JSON
        </button>

        {!hasTasks && (
          <span className="text-[10px] text-zen-400">Creá una tarea primero</span>
        )}
      </div>

      <p className="text-[10px] text-zen-400 mt-3">
        El CSV se puede abrir directo en Google Sheets, Excel o importar en ClickUp.
        El JSON incluye toda tu data (tareas + learning path) como backup.
      </p>
    </div>
  );
}

/**
 * Sección de Webhooks
 */
function WebhookSection() {
  const [webhook, setWebhook] = useState(() => {
    const saved = loadWebhookConfig();
    return saved || { url: '', enabled: false, events: Object.values(WEBHOOK_EVENTS) };
  });
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState(null); // { ok, error?, warning? } | null

  function handleWebhookSave() {
    if (!webhook.url.trim()) return;
    const toSave = {
      url: webhook.url.trim(),
      enabled: webhook.enabled,
      events: webhook.events,
    };
    saveWebhookConfig(toSave);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  }

  async function handleWebhookTest() {
    if (!webhook.url.trim()) return;
    setWebhookTesting(true);
    setWebhookTestResult(null);
    const result = await testWebhook(webhook.url.trim());
    setWebhookTestResult(result);
    setWebhookTesting(false);
  }

  function handleWebhookClear() {
    clearWebhookConfig();
    setWebhook({ url: '', enabled: false, events: Object.values(WEBHOOK_EVENTS) });
    setWebhookTestResult(null);
    setWebhookSaved(false);
  }

  function toggleEvent(event) {
    setWebhook((prev) => {
      const events = prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event];
      return { ...prev, events };
    });
    setWebhookSaved(false);
  }

  const eventLabels = {
    [WEBHOOK_EVENTS.TASK_CREATED]: 'Tarea creada',
    [WEBHOOK_EVENTS.TASK_COMPLETED]: 'Tarea completada',
    [WEBHOOK_EVENTS.SUBTASK_COMPLETED]: 'Subtask completada',
  };

  const hasWebhookConfig = !!loadWebhookConfig()?.url;

  return (
    <div className="zen-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 grid place-items-center text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zen-900">Webhooks</h2>
          <p className="text-xs text-zen-500">
            Conectá con Zapier, Make, n8n o cualquier herramienta para automatizar.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── URL ── */}
        <div>
          <label className="block text-xs font-medium text-zen-700 mb-1.5">Webhook URL</label>
          <input
            type="url"
            value={webhook.url}
            onChange={(e) => {
              setWebhook({ ...webhook, url: e.target.value });
              setWebhookSaved(false);
              setWebhookTestResult(null);
            }}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full rounded-lg border border-zen-300 bg-[#fffef9] px-3 py-2 text-sm font-mono placeholder:text-zen-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        {/* ── Eventos ── */}
        <div>
          <label className="block text-xs font-medium text-zen-700 mb-2">Eventos</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventLabels).map(([event, label]) => {
              const isOn = webhook.events.includes(event);
              return (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isOn
                      ? 'border-violet-300 bg-violet-50 text-violet-800'
                      : 'border-zen-200 bg-[#fffef9] text-zen-500 hover:border-zen-300'
                  }`}
                >
                  {isOn && <span className="mr-1">✓</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Enabled toggle ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setWebhook({ ...webhook, enabled: !webhook.enabled });
              setWebhookSaved(false);
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              webhook.enabled ? 'bg-violet-600' : 'bg-zen-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-4 rounded-full bg-[#fffef9] shadow transform transition-transform duration-200 ${
                webhook.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs text-zen-600">
            {webhook.enabled ? 'Webhooks activos' : 'Webhooks desactivados'}
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={handleWebhookSave}
            disabled={!webhook.url.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {webhookSaved ? '✓ Guardado' : 'Guardar webhook'}
          </button>

          <button
            onClick={handleWebhookTest}
            disabled={!webhook.url.trim() || webhookTesting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zen-300 bg-[#fffef9] px-4 py-2 text-xs font-medium text-zen-700 hover:bg-zen-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {webhookTesting ? (
              <>
                <svg className="animate-spin size-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Probando...
              </>
            ) : 'Probar webhook'}
          </button>

          {hasWebhookConfig && (
            <button
              onClick={handleWebhookClear}
              className="ml-auto text-xs text-zen-400 hover:text-rose-600 transition"
            >
              Borrar webhook
            </button>
          )}
        </div>

        {/* ── Test result ── */}
        {webhookTestResult?.ok && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 flex items-center gap-2">
            <span className="size-4 rounded-full bg-emerald-500 text-white grid place-items-center text-[10px] font-bold">✓</span>
            {webhookTestResult.warning || 'Webhook enviado correctamente'}
          </div>
        )}
        {webhookTestResult && !webhookTestResult.ok && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800 flex items-center gap-2">
            <span className="size-4 rounded-full bg-rose-500 text-white grid place-items-center text-[10px] font-bold">!</span>
            Error: {webhookTestResult.error}
          </div>
        )}

        <p className="text-[10px] text-zen-400">
          Cada evento envía un POST con JSON: {"{"} event, timestamp, data {"}"}. Compatible con Zapier, Make, n8n, y cualquier endpoint HTTP.
        </p>
      </div>

      {/* ── Guía de configuración ── */}
      <WebhookGuide />
    </div>
  );
}

/**
 * Guía paso a paso para configurar webhooks con Zapier, Make y n8n.
 * Colapsable para no ocupar espacio si el usuario ya sabe.
 */
function WebhookGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zen-200 bg-zen-50/50 mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-zen-600 hover:text-zen-800 transition"
      >
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-4 text-violet-500" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          Como configurar un webhook
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* ── Zapier ── */}
          <GuideBlock
            title="Zapier"
            color="amber"
            link="https://zapier.com/apps/webhook/integrations"
            steps={[
              'Creá un nuevo Zap y elegí "Webhooks by Zapier" como trigger.',
              'Seleccioná "Catch Hook" como evento.',
              'Zapier te da una URL tipo: https://hooks.zapier.com/hooks/catch/123/abc/',
              'Copiá esa URL y pegala arriba en "Webhook URL".',
              'Hacé click en "Probar webhook" para enviar un test.',
              'Volvé a Zapier y clickeá "Test trigger" — deberia ver el payload.',
              'Agregá la acción que quieras: Google Sheets, Slack, ClickUp, etc.',
            ]}
          />

          {/* ── Make ── */}
          <GuideBlock
            title="Make (ex Integromat)"
            color="violet"
            link="https://www.make.com/en/integrations/webhook"
            steps={[
              'Creá un nuevo Scenario y agregá el modulo "Webhooks > Custom webhook".',
              'Clickeá "Add" para crear un nuevo webhook — Make genera una URL.',
              'Copiá la URL y pegala arriba en "Webhook URL".',
              'Hacé click en "Probar webhook" en Task Autopsy.',
              'En Make, clickeá "Re-determine data structure" para mapear los campos.',
              'Conectá los modulos que necesites: Google Sheets, Notion, Slack, etc.',
            ]}
          />

          {/* ── n8n ── */}
          <GuideBlock
            title="n8n (self-hosted)"
            color="emerald"
            link="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
            steps={[
              'Creá un nuevo Workflow y agregá un nodo "Webhook".',
              'Configurá el metodo como POST y elegí una ruta (ej: /task-autopsy).',
              'Activá el workflow — n8n te muestra la URL de produccion.',
              'Copiá la URL y pegala arriba en "Webhook URL".',
              'Probá la conexion desde Task Autopsy.',
              'Agregá los nodos que necesites despues del webhook.',
            ]}
          />

          {/* ── Google Sheets directo ── */}
          <GuideBlock
            title="Google Sheets (via Zapier/Make)"
            color="brand"
            link="https://zapier.com/apps/google-sheets/integrations/webhook"
            steps={[
              'Seguí la guía de Zapier o Make de arriba.',
              'Como accion, elegí "Google Sheets > Create Spreadsheet Row".',
              'Conectá tu cuenta de Google y elegí la hoja.',
              'Mapeá los campos: Tarea = data.taskTitle, Subtask = data.subtaskTitle, etc.',
              'Cada vez que completes una subtask, se agrega una fila automaticamente.',
            ]}
          />

          {/* ── Payload reference ── */}
          <div className="rounded-lg border border-zen-200 bg-[#fffef9] p-3">
            <h4 className="text-[11px] font-semibold text-zen-700 mb-2">Referencia del payload</h4>
            <div className="rounded-md bg-zen-900 text-zen-100 p-3 text-[10px] font-mono leading-relaxed overflow-x-auto">
              <pre>{`{
  "event": "subtask.completed",
  "timestamp": "2026-05-09T14:30:00.000Z",
  "source": "Task Autopsy",
  "data": {
    "taskId": "abc-123",
    "taskTitle": "Disenar landing page",
    "subtaskId": "def-456",
    "subtaskTitle": "Armar wireframe mobile",
    "timeSpentSeconds": 1200,
    "estimatedMinutes": 20
  }
}`}</pre>
            </div>
            <div className="mt-2 space-y-1">
              <PayloadField name="event" values="task.created | task.completed | subtask.completed" />
              <PayloadField name="data.taskTitle" values="Nombre de la tarea principal" />
              <PayloadField name="data.subtaskTitle" values="Nombre de la subtask (solo en subtask.completed)" />
              <PayloadField name="data.timeSpentSeconds" values="Tiempo real en segundos (solo en subtask.completed)" />
              <PayloadField name="data.estimatedMinutes" values="Tiempo estimado por la AI en minutos" />
              <PayloadField name="data.subtaskCount" values="Cantidad de subtasks (solo en task.created y task.completed)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuideBlock({ title, color, link, steps }) {
  const dotColors = {
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    brand: 'bg-brand-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-semibold text-zen-700 flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${dotColors[color]}`} />
          {title}
        </h4>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-violet-600 hover:text-violet-800 transition"
        >
          Ir a {title.split(' ')[0]} →
        </a>
      </div>
      <ol className="space-y-1.5 ml-1">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-[11px] text-zen-600 leading-relaxed">
            <span className="shrink-0 size-4 rounded-full bg-zen-200 text-zen-500 grid place-items-center text-[9px] font-bold mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PayloadField({ name, values }) {
  return (
    <div className="flex gap-2 text-[10px]">
      <code className="font-mono text-violet-600 shrink-0">{name}</code>
      <span className="text-zen-400">—</span>
      <span className="text-zen-500">{values}</span>
    </div>
  );
}

function InfoCard({ title, desc, link, linkLabel }) {
  return (
    <div className="rounded-xl border border-zen-200 bg-[#fffef9] p-3.5">
      <h4 className="text-xs font-semibold text-zen-800">{title}</h4>
      <p className="text-[10px] text-zen-500 mt-0.5">{desc}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-[10px] font-medium text-brand-600 hover:text-brand-800 transition"
      >
        {linkLabel} →
      </a>
    </div>
  );
}
