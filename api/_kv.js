const KEY = 'laventana-locked-tables';

const GLOBAL_CONFIG = process.env.GLOBAL_CONFIG;
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

const useGlobalConfig = Boolean(GLOBAL_CONFIG && VERCEL_TOKEN);
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let memoryLocked = null;
let lastWriteOk = false;
let lastError = '';

export function cleanTables(tables) {
  return [...new Set((tables || []).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 33 && n !== 13))].sort((a, b) => a - b);
}

export function backendKind() {
  if (useGlobalConfig) return 'global-config';
  if (useUpstash) return 'upstash';
  return 'memory';
}

function parseGcConnection(cs) {
  try {
    const u = new URL(cs);
    const parts = u.pathname.replace(/^\/+/, '').split('/');
    return { storeId: parts[0], readToken: u.searchParams.get('token') || '' };
  } catch {
    return null;
  }
}

async function gcRead() {
  const p = parseGcConnection(GLOBAL_CONFIG);
  if (!p || !p.storeId || !p.readToken) return null;
  const res = await fetch(`https://global-config.vercel.com/${p.storeId}/items?token=${encodeURIComponent(p.readToken)}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) {
    const item = data.find((it) => it?.key === KEY);
    return item ? item.value : [];
  }
  if (data && Array.isArray(data.items)) {
    const item = data.items.find((it) => it?.key === KEY);
    return item ? item.value : [];
  }
  return data && data[KEY] !== undefined ? data[KEY] : [];
}

async function gcWrite(tables) {
  const p = parseGcConnection(GLOBAL_CONFIG);
  if (!p || !p.storeId || !VERCEL_TOKEN) {
    lastError = 'missing gc connection string or token';
    return false;
  }
  const slug = process.env.VERCEL_TEAM_SLUG || 'laventana';
  const patchItem = async (operation) => {
    const res = await fetch(`https://api.vercel.com/v1/global-config/${p.storeId}/items?slug=${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ operation, key: KEY, value: tables }] }),
    });
    if (res.ok) {
      lastError = '';
      return true;
    }
    const body = await res.text().catch(() => '');
    lastError = `http_${res.status} ${body.slice(0, 160)}`;
    return false;
  };

  try {
    let ok = await patchItem('upsert');
    if (!ok && lastError.startsWith('http_404')) ok = await patchItem('create');
    if (!ok && lastError.startsWith('http_409')) ok = await patchItem('update');
    return ok;
  } catch (err) {
    lastError = err.message;
    return false;
  }
}

function upstashHeaders() {
  return { Authorization: `Bearer ${UPSTASH_TOKEN}` };
}

async function upstashRead() {
  const res = await fetch(`${UPSTASH_URL}/get/${KEY}`, { headers: upstashHeaders() });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.result === null || json.result === undefined || json.result === '') return [];
  try {
    return JSON.parse(json.result);
  } catch {
    return [];
  }
}

async function upstashWrite(tables) {
  await fetch(`${UPSTASH_URL}/set/${KEY}`, {
    method: 'POST',
    headers: { ...upstashHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(tables),
  });
}

export const lockStore = {
  async get() {
    if (useGlobalConfig) {
      try {
        return cleanTables(await gcRead());
      } catch {
        /* fallthrough */
      }
    }
    if (useUpstash) {
      try {
        return cleanTables(await upstashRead());
      } catch {
        return cleanTables(memoryLocked);
      }
    }
    return cleanTables(memoryLocked);
  },

  async set(tables) {
    const list = cleanTables(tables);
    memoryLocked = list;
    if (useGlobalConfig) {
      const ok = await gcWrite(list);
      lastWriteOk = ok;
      if (!ok && useUpstash) {
        try {
          await upstashWrite(list);
          lastWriteOk = true;
        } catch {
          /* keep in-memory copy as fallback */
        }
      }
      return list;
    }
    if (useUpstash) {
      try {
        await upstashWrite(list);
        lastWriteOk = true;
      } catch {
        lastWriteOk = false;
      }
    }
    return list;
  },

  get lastWriteOk() {
    return lastWriteOk;
  },

  get lastError() {
    return lastError;
  },
};