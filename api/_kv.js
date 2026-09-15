const KEY = 'laventana-locked-tables';
const BASE = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const useUpstash = Boolean(BASE && TOKEN);

let memoryLocked = null;

export function cleanTables(tables) {
  return [...new Set((tables || []).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 33 && n !== 13))].sort((a, b) => a - b);
}

function upstashHeaders() {
  return { Authorization: `Bearer ${TOKEN}` };
}

async function upstashRead() {
  const res = await fetch(`${BASE}/get/${KEY}`, { headers: upstashHeaders() });
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
  await fetch(`${BASE}/set/${KEY}`, {
    method: 'POST',
    headers: { ...upstashHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(tables),
  });
}

export const lockStore = {
  async get() {
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
    if (useUpstash) {
      try {
        await upstashWrite(list);
      } catch {
        /* keep in-memory copy as fallback */
      }
    }
    return list;
  },
};