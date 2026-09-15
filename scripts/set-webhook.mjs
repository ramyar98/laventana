import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const text = readFileSync(path.join(dir, '..', '.env.local'), 'utf8');
    const env = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return env;
  } catch {
    return {};
  }
}

const [mode, urlArg] = process.argv.slice(2);
const env = loadEnv();
const token = process.env.BOT_TOKEN || env.VITE_TELEGRAM_BOT_TOKEN || '';
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || env.TELEGRAM_WEBHOOK_SECRET || '';

if (!token) {
  console.error('No bot token found. Set VITE_TELEGRAM_BOT_TOKEN (or BOT_TOKEN) first.');
  process.exit(1);
}

async function api(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

const info = await api('getWebhookInfo');
console.log('Current getWebhookInfo:', JSON.stringify(info, null, 2));
console.log('');

if (mode === 'set') {
  const url = urlArg || env.WEBHOOK_URL || '';
  if (!url) {
    console.error('Usage:  node scripts/set-webhook.mjs set https://your-site.vercel.app/api/telegram');
    process.exit(1);
  }
  const payload = { url, allowed_updates: ['message'] };
  if (secret) payload.secret_token = secret;
  const r = await api('setWebhook', payload);
  console.log('setWebhook:', JSON.stringify(r, null, 2));
} else if (mode === 'delete') {
  const r = await api('deleteWebhook');
  console.log('deleteWebhook:', JSON.stringify(r, null, 2));
} else {
  console.log('Run one of:  node scripts/set-webhook.mjs set <URL>   |   node scripts/set-webhook.mjs delete');
}