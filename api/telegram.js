import { lockStore } from './_kv.js';

const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const MIN_TABLE = 1;
const MAX_TABLE = 33;
const SKIP_TABLE = 13;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = req.body || {};
  const msg = body.message;
  const text = msg?.text;
  const chatId = msg?.chat?.id;

  if (!text || !chatId) {
    return res.status(200).json({ ok: true, handled: false });
  }

  const result = await handleCommand(text.trim(), chatId);
  if (!result) {
    return res.status(200).json({ ok: true, handled: false, reply: null });
  }
  return res.status(200).json({ ok: true, handled: true, reply: result.reply, ...result.send });
}

function parseCommand(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9?]/g, '');
  const hasQuestion = text.includes('?') || text.includes('؟');

  if (hasQuestion) {
    const m = cleaned.match(/^(\d{1,2})\??$/);
    if (m) return { kind: 'status', table: Number(m[1]) };
    return null;
  }

  if (cleaned === 'all') return { kind: 'all' };

  const m = cleaned.match(/^([oc])(\d{1,2})$/);
  if (m) return { kind: m[1] === 'o' ? 'open' : 'close', table: Number(m[2]) };
  return null;
}

async function handleCommand(text, chatId) {
  const cmd = parseCommand(text);
  if (!cmd) return null;

  const validTable = (t) => t >= MIN_TABLE && t <= MAX_TABLE && t !== SKIP_TABLE;
  const tables = await lockStore.get();
  let reply = null;

  if (cmd.kind === 'open' || cmd.kind === 'close') {
    if (!validTable(cmd.table)) return null;
    const locked = new Set(tables);
    if (cmd.kind === 'open') {
      locked.delete(cmd.table);
    } else {
      locked.add(cmd.table);
    }
    await lockStore.set([...locked]);
    reply = cmd.kind === 'open'
      ? `🔓 *مێز #${cmd.table} کرایەوە / Table #${cmd.table} is now OPEN*`
      : `🔒 *مێز #${cmd.table} داخرا / Table #${cmd.table} is now LOCKED*`;
  } else if (cmd.kind === 'status') {
    if (!validTable(cmd.table)) return null;
    reply = tables.includes(cmd.table)
      ? `🔒 *مێز #${cmd.table} داخراوە / Table #${cmd.table} is LOCKED*`
      : `✅ *مێز #${cmd.table} کراوە / Table #${cmd.table} is OPEN*`;
  } else if (cmd.kind === 'all') {
    const lines = ['*دۆخی مێزەکان / Table Status*', ''];
    for (let n = MIN_TABLE; n <= MAX_TABLE; n += 1) {
      if (n === SKIP_TABLE) continue;
      lines.push(tables.includes(n) ? `${n} close ❌` : `${n} open ✅`);
    }
    reply = lines.join('\n');
  }

  if (!reply) return null;
  const send = await sendMessage(chatId, reply);
  return { reply, send };
}

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) return { sent: false, reason: 'no_token' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const data = await res.json().catch(() => null);
    return data && data.ok ? { sent: true } : { sent: false, reason: data?.description || `http_${res.status}` };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}