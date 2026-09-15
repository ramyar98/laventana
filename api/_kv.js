const KEY = 'laventana-locked-tables';

const GLOBAL_CONFIG = process.env.GLOBAL_CONFIG;
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

const useGlobalConfig = Boolean(GLOBAL_CONFIG && VERCEL_TOKEN);
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let memory = {};
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

async function gcReadValue(key) {
  const p = parseGcConnection(GLOBAL_CONFIG);
  if (!p || !p.storeId || !p.readToken) return null;
  const res = await fetch(`https://global-config.vercel.com/${p.storeId}/items?token=${encodeURIComponent(p.readToken)}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) {
    const item = data.find((it) => it?.key === key);
    return item ? item.value : undefined;
  }
  if (data && Array.isArray(data.items)) {
    const item = data.items.find((it) => it?.key === key);
    return item ? item.value : undefined;
  }
  return data && data[key] !== undefined ? data[key] : undefined;
}

async function gcWriteValue(key, value) {
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
      body: JSON.stringify({ items: [{ operation, key, value }] }),
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

async function upstashReadValue(key) {
  const res = await fetch(`${UPSTASH_URL}/get/${key}`, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.result === null || json.result === undefined || json.result === '') return undefined;
  try {
    return JSON.parse(json.result);
  } catch {
    return undefined;
  }
}

async function upstashWriteValue(key, value) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
}

async function readValue(key) {
  if (useGlobalConfig) {
    try {
      const v = await gcReadValue(key);
      if (v !== undefined && v !== null) return v;
    } catch {
      /* fallthrough */
    }
  }
  if (useUpstash) {
    try {
      const v = await upstashReadValue(key);
      if (v !== undefined && v !== null) return v;
    } catch {
      /* fallthrough */
    }
  }
  return memory[key] ?? null;
}

async function writeValue(key, value) {
  memory[key] = value;
  if (useGlobalConfig) {
    let ok = await gcWriteValue(key, value);
    lastWriteOk = ok;
    if (!ok && useUpstash) {
      try {
        await upstashWriteValue(key, value);
        lastWriteOk = true;
      } catch {
        lastWriteOk = false;
      }
    }
    return ok;
  }
  if (useUpstash) {
    try {
      await upstashWriteValue(key, value);
      lastWriteOk = true;
    } catch {
      lastWriteOk = false;
    }
    return lastWriteOk;
  }
  lastWriteOk = true;
  return true;
}

export const lockStore = {
  async get() {
    return cleanTables((await readValue(KEY)) ?? []);
  },
  async set(tables) {
    const list = cleanTables(tables);
    await writeValue(KEY, list);
    return list;
  },
  get lastWriteOk() {
    return lastWriteOk;
  },
  get lastError() {
    return lastError;
  },
};

export const recordStore = {
  async get(key, fallback = null) {
    const v = await readValue(key);
    return v ?? fallback;
  },
  async set(key, value) {
    return writeValue(key, value);
  },
  get lastWriteOk() {
    return lastWriteOk;
  },
  get lastError() {
    return lastError;
  },
};