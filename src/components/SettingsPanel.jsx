import { useState } from 'react';
import { PROVIDERS, PROVIDER_IDS, DEFAULT_PROVIDER } from '../utils/providers.js';
import { loadApiConfig, saveApiConfig, clearApiConfig, callClaudeAPI } from '../utils/api.js';

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
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 grid place-items-center text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">Configuración de AI</h2>
            <p className="text-xs text-stone-500">
              Elegí tu proveedor y colocá tu API key. Se guarda localmente en tu navegador.
            </p>
          </div>
        </div>

        {/* ── Provider selector ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2">Proveedor</label>
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
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isActive ? 'text-brand-800' : 'text-stone-700'}`}>
                      {p.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {p.name.match(/\((.+)\)/)?.[1] || ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Model selector ── */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Modelo</label>
            <select
              value={config.model || provider.defaultModel}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
            >
              {provider.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* ── API Key ── */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">API Key</label>
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
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pr-20 text-sm font-mono placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 hover:text-stone-700 px-2 py-1"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">
              Tu key se guarda solo en tu navegador (localStorage). Nunca se envía a ningún servidor excepto al proveedor de AI.
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={handleSave}
              disabled={!config.apiKey.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>

            <button
              onClick={handleTest}
              disabled={!config.apiKey.trim() || testing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                className="ml-auto text-xs text-stone-400 hover:text-rose-600 transition"
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
    </section>
  );
}

function InfoCard({ title, desc, link, linkLabel }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3.5">
      <h4 className="text-xs font-semibold text-stone-800">{title}</h4>
      <p className="text-[10px] text-stone-500 mt-0.5">{desc}</p>
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
