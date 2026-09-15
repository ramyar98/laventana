const STORAGE_KEY = 'laventana-bookings';
const LOCK_KEY = 'laventana-locked-tables';

export function getLockedTables() {
  try {
    const value = JSON.parse(localStorage.getItem(LOCK_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function setLockedTables(list) {
  localStorage.setItem(LOCK_KEY, JSON.stringify([...new Set(list.map(Number))]));
}

export function toggleLockedTable(num, lock) {
  const cur = getLockedTables();
  const next = lock ? (cur.includes(num) ? cur : [...cur, num]) : cur.filter((t) => t !== num);
  setLockedTables(next);
  return next;
}

export function setTableLocked(num, lock) {
  const cur = new Set(getLockedTables());
  if (lock) {
    cur.add(num);
  } else {
    cur.delete(num);
  }
  const next = [...cur];
  setLockedTables(next);
  return next;
}

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = getBookings();
  const newBooking = {
    ...booking,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}

export function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteBooking(id) {
  const bookings = getBookings().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return bookings;
}
