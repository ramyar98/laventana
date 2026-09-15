import { GEMINI_API_KEY, GEMINI_TRANSLATION_MODEL } from '../config';

const LANG_MAP = { ku: 'ku', bad: 'ku', ar: 'ar', fa: 'fa', tr: 'tr', en: 'en' };
const cache = new Map();
const TIMEOUT_MS = 5000;

export async function translateToEnglish(text, langCode) {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  if (!hasNonAscii(trimmed)) return trimmed;

  const from = LANG_MAP[langCode];
  if (!from || from === 'en') return trimmed;

  const key = `${from}\u0001${trimmed}`;
  if (cache.has(key)) return cache.get(key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TRANSLATION_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text to English. Return only the English translation — no explanations, no extra words. Keep it natural and concise.\n\n${trimmed}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = translated && translated.trim() ? translated.trim() : '';

    if (result) cache.set(key, result);
    return result;
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function hasNonAscii(text) {
  for (const ch of text) {
    if (ch.codePointAt(0) > 127) return true;
  }
  return false;
}