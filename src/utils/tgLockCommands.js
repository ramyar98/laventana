import { TELEGRAM_BOT_TOKEN } from '../config';
import { getLockedTables, setTableLocked } from './storage';
import { postTelegramMessage } from './telegram';

const MIN_TABLE = 1;
const MAX_TABLE = 33;
const SKIP_TABLE = 13;
const POLL_MS = 4000;
const LOCK_NAME = 'laventana-tg-poll';
const OFFSET_KEY = 'laventana-tg-offset';
const PROCESSED_KEY = 'laventana-tg-processed';

let started = false;
let offset = readNum(OFFSET_KEY);

function readNum(key) {
  try {
    return parseInt(localStorage.getItem(key) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveNum(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

export function startTgLockPolling() {
  if (started || !TELEGRAM_BOT_TOKEN) return;
  started = true;

  const runLoop = async () => {
    while (started) {
      try {
        await poll();
      } catch {
        /* keep polling */
      }
      await sleep(POLL_MS);
    }
  };

  if (typeof navigator !== 'undefined' && navigator.locks) {
    navigator.locks.request(LOCK_NAME, () => runLoop()).catch(() => {});
    return;
  }

  runLoop();
}

export function stopTgLockPolling() {
  started = false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function poll() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=0&limit=10`;
  const res = await fetch(url);
  if (!res.ok) return;
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.result)) return;

  for (const update of data.result) {
    const id = update.update_id || 0;
    if (id <= readNum(PROCESSED_KEY)) {
      offset = Math.max(offset, id + 1);
      saveNum(OFFSET_KEY, offset);
      continue;
    }

    offset = Math.max(offset, id + 1);
    saveNum(OFFSET_KEY, offset);
    saveNum(PROCESSED_KEY, id);

    const text = update.message?.text;
    const chatId = update.message?.chat?.id;
    if (text && chatId) handleCommand(text.trim(), chatId);
  }
}

function handleCommand(text, chatId) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hasQuestion = text.includes('?') || text.includes('؟');

  if (hasQuestion) {
    const m = cleaned.match(/^(\d{1,2})$/);
    if (m) return replyStatus(parseInt(m[1], 10), chatId);
    return;
  }

  if (cleaned === 'all') return replyAll(chatId);

  const match = cleaned.match(/^([oc])(\d{1,2})$/);
  if (!match) return;

  const table = parseInt(match[2], 10);
  if (table < MIN_TABLE || table > MAX_TABLE || table === SKIP_TABLE) return;

  const isOpen = match[1] === 'o';
  setTableLocked(table, !isOpen);

  const reply = isOpen
    ? `🔓 *مێز #${table} کرایەوە / Table #${table} is now OPEN*`
    : `🔒 *مێز #${table} داخرا / Table #${table} is now LOCKED*`;
  postTelegramMessage(chatId, reply);

  window.dispatchEvent(new CustomEvent('laventana:locks', { detail: { tables: getLockedTables() } }));
  window.dispatchEvent(new CustomEvent('laventana:lock-reply', { detail: { text: reply, table } }));
}

function replyStatus(table, chatId) {
  if (table < MIN_TABLE || table > MAX_TABLE || table === SKIP_TABLE) return;
  const locked = getLockedTables().includes(table);
  const reply = locked
    ? `🔒 *مێز #${table} داخراوە / Table #${table} is LOCKED*`
    : `✅ *مێز #${table} کراوە / Table #${table} is OPEN*`;
  postTelegramMessage(chatId, reply);
}

function replyAll(chatId) {
  const locked = getLockedTables();
  const lines = ['*دۆخی مێزەکان / Table Status*', ''];
  for (let n = MIN_TABLE; n <= MAX_TABLE; n += 1) {
    if (n === SKIP_TABLE) continue;
    lines.push(locked.includes(n) ? `${n} close ❌` : `${n} open ✅`);
  }
  postTelegramMessage(chatId, lines.join('\n'));
}