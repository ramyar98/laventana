import { getLockedTables, setLockedTables } from './storage';

const API = '/api/locks';
const POLL_MS = 3000;

let started = false;
let timer = null;
let last = '';
let reachable = false;
const listeners = new Set();

export function serverReachable() {
  return reachable;
}

export function subscribeServer(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setReachable(value) {
  if (value === reachable) return;
  reachable = value;
  listeners.forEach((cb) => cb(value));
}

export function startLockSync() {
  if (started) return;
  started = true;
  tick();
}

export function stopLockSync() {
  started = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export function pushServerLocks() {
  const tables = getLockedTables();
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tables }),
  })
    .then((res) => {
      if (res.ok) setReachable(true);
    })
    .catch(() => setReachable(false));
}

async function tick() {
  if (!started) return;
  try {
    const res = await fetch(API);
    if (res.ok) {
      setReachable(true);
      const data = await res.json();
      if (Array.isArray(data?.tables)) apply(data.tables);
    }
  } catch {
    setReachable(false);
  }
  if (started) timer = setTimeout(tick, POLL_MS);
}

function apply(tables) {
  const sig = JSON.stringify(tables);
  if (sig === last) return;
  last = sig;
  setLockedTables(tables);
  window.dispatchEvent(new CustomEvent('laventana:locks', { detail: { tables } }));
}