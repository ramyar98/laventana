import { recordStore, backendKind } from './_kv.js';

const BOOKINGS_KEY = 'laventana-bookings';

function timeToMin(t) {
  if (!t) return 0;
  const [hh, mm] = t.split(':').map(Number);
  if (!Number.isInteger(hh)) return 0;
  return hh === 0 && Number.isInteger(mm) ? 1440 + mm : hh * 60 + (Number.isInteger(mm) ? mm : 0);
}

function overlaps(a1, d1, a2, d2) {
  return timeToMin(a1) < timeToMin(d2) && timeToMin(a2) < timeToMin(d1);
}

function conflicts(existing, booking) {
  const sameSlot = (a, b) =>
    a.type === b.type &&
    (a.type === 'vip' || a.tableNumber === b.tableNumber) &&
    a.date === b.date;

  for (const ex of existing) {
    if (ex.id === booking.id) continue;
    if (ex.status !== 'confirmed') continue;
    if (!sameSlot(ex, booking)) continue;
    if (ex.type === 'vip') {
      if (overlaps(ex.arrival, ex.departure, booking.arrival, booking.departure)) return true;
    } else {
      if (ex.time === booking.time) return true;
    }
  }
  return false;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const bookings = (await recordStore.get(BOOKINGS_KEY)) || [];
    return res.status(200).json({ ok: true, bookings, store: backendKind() });
  }

  if (req.method === 'POST') {
    const incoming = req.body || {};
    const current = (await recordStore.get(BOOKINGS_KEY, [])) || [];
    const booking = {
      ...incoming,
      id: incoming.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      status: incoming.status || 'pending',
      createdAt: incoming.createdAt || new Date().toISOString(),
    };

    if (conflicts(current, booking)) {
      return res.status(409).json({ ok: false, error: 'conflict', booking });
    }

    current.unshift(booking);
    await recordStore.set(BOOKINGS_KEY, current);
    return res.status(200).json({
      ok: true,
      booking,
      saved: recordStore.lastWriteOk,
      store: backendKind(),
      error: recordStore.lastWriteOk ? undefined : recordStore.lastError,
    });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    const current = (await recordStore.get(BOOKINGS_KEY, [])) || [];
    const next = current.map((b) => (b.id === id ? { ...b, status } : b));
    await recordStore.set(BOOKINGS_KEY, next);
    return res.status(200).json({
      ok: true,
      bookings: next,
      saved: recordStore.lastWriteOk,
      store: backendKind(),
      error: recordStore.lastWriteOk ? undefined : recordStore.lastError,
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    const current = (await recordStore.get(BOOKINGS_KEY, [])) || [];
    const next = current.filter((b) => b.id !== id);
    await recordStore.set(BOOKINGS_KEY, next);
    return res.status(200).json({
      ok: true,
      bookings: next,
      saved: recordStore.lastWriteOk,
      store: backendKind(),
      error: recordStore.lastWriteOk ? undefined : recordStore.lastError,
    });
  }

  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}