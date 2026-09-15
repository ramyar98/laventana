import { lockStore, backendKind } from './_kv.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, tables: await lockStore.get(), store: backendKind(), lastWriteOk: lockStore.lastWriteOk, lastError: lockStore.lastError });
  }

  if (req.method === 'POST') {
    const tables = await lockStore.set(req.body?.tables);
    return res.status(200).json({ ok: true, tables, store: backendKind(), lastWriteOk: lockStore.lastWriteOk, lastError: lockStore.lastError });
  }

  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}