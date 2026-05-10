import { PROVIDERS, DEFAULT_PROVIDER } from './providers.js';
import { API_TIMEOUT_MS } from './constants.js';

const CONFIG_KEY = 'task_autopsy_api_config';

/**
 * Lee la configuración de API desde localStorage.
 * Fallback: .env.local para compatibilidad hacia atrás.
 */
export function loadApiConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Fallback a .env.local (solo Anthropic)
  const envKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
  if (envKey && envKey !== 'your_api_key_here') {
    return {
      provider: 'anthropic',
      apiKey: envKey,
      model: PROVIDERS.anthropic.defaultModel,
    };
  }

  return null;
}

export function saveApiConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearApiConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch {}
}

function cleanJSON(raw) {
  return raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
}

/**
 * Llama a la API del proveedor configurado.
 * Si no hay configuración, lanza error descriptivo.
 */
export async function callClaudeAPI(systemPrompt, userMessage, maxTokens = 2500) {
  const config = loadApiConfig();

  if (!config || !config.apiKey) {
    throw new Error('API no configurada. Andá a Ajustes (⚙) y configurá tu proveedor y API key.');
  }

  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`Proveedor "${config.provider}" no soportado.`);
  }

  const model = config.model || provider.defaultModel;
  const { url, headers, body } = provider.buildRequest(systemPrompt, userMessage, maxTokens, config.apiKey, model);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message
        || errorData.error?.status
        || response.statusText;
      throw new Error(`${provider.name} error ${response.status}: ${msg}`);
    }

    const data = await response.json();
    const raw = provider.extractText(data);

    if (!raw) {
      throw new Error(`Respuesta vacía de ${provider.name}`);
    }

    return cleanJSON(raw);
  } finally {
    clearTimeout(timeout);
  }
}
