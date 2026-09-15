const BASE = '/api/bookings';

async function call(path, options = {}) {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (!body) body = { ok: res.ok };
    return body;
  } catch {
    return null;
  }
}

export async function submitBooking(booking) {
  return call(BASE, { method: 'POST', body: JSON.stringify(booking) });
}

export async function fetchBookings() {
  const res = await call(BASE);
  if (res && res.ok && Array.isArray(res.bookings)) return res.bookings;
  return null;
}

export async function updateBookingStatus(id, status) {
  return call(BASE, { method: 'PATCH', body: JSON.stringify({ id, status }) });
}

export async function deleteBooking(id) {
  return call(BASE, { method: 'DELETE', body: JSON.stringify({ id }) });
}