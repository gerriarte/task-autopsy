const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function cleanJSON(raw) {
  return raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
}

export async function callClaudeAPI(systemPrompt, userMessage, maxTokens = 2500) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('API key no configurada. Revisá .env.local (VITE_ANTHROPIC_API_KEY).');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text;

    if (!raw) {
      throw new Error('Respuesta vacía de Claude');
    }

    return cleanJSON(raw);
  } finally {
    clearTimeout(timeout);
  }
}
