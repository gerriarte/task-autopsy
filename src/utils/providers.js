/**
 * Definiciones de proveedores de AI.
 * Cada uno tiene su endpoint, headers, formato de request/response y modelos.
 */

export const PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    placeholder: 'sk-ant-api03-...',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4', label: 'Claude Haiku 4' },
    ],
    defaultModel: 'claude-sonnet-4-6',

    buildRequest(systemPrompt, userMessage, maxTokens, apiKey, model) {
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: {
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        },
      };
    },

    extractText(data) {
      return data.content?.[0]?.text || '';
    },
  },

  openai: {
    id: 'openai',
    name: 'OpenAI (GPT)',
    placeholder: 'sk-proj-...',
    models: [
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    ],
    defaultModel: 'gpt-4.1-mini',

    buildRequest(systemPrompt, userMessage, maxTokens, apiKey, model) {
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: {
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        },
      };
    },

    extractText(data) {
      return data.choices?.[0]?.message?.content || '';
    },
  },

  gemini: {
    id: 'gemini',
    name: 'Google (Gemini)',
    placeholder: 'AIza...',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
    defaultModel: 'gemini-2.5-flash',

    buildRequest(systemPrompt, userMessage, maxTokens, apiKey, model) {
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        },
      };
    },

    extractText(data) {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);
export const DEFAULT_PROVIDER = 'anthropic';
