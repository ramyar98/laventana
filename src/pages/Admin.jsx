import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/hooks';
import { getBookings, updateBookingStatus, deleteBooking, getLockedTables, setLockedTables, toggleLockedTable } from '../utils/storage';
import { pushServerLocks } from '../utils/lockSync';
import { sendStatusToTelegram } from '../utils/telegram';
import { ADMIN_PASSCODE, TOTAL_TABLES, SKIP_TABLE } from '../config';
import { Lock, Unlock, LogOut, Check, X, Trash2, Clock, CheckCircle, XCircle, List, LayoutGrid } from 'lucide-react';

export default function Admin() {
  const { lang } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('bookings');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthenticated(true);
      setBookings(getBookings());
      setError('');
    } else {
      setError(lang.admin.passcodeError);
      setPasscode('');
    }
  };

  const refresh = () => setBookings(getBookings());

  useEffect(() => {
    if (!authenticated) return;
    const sync = () => setBookings(getBookings());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [authenticated]);

  const handleAccept = (id) => {
    const booking = bookings.find((b) => b.id === id);
    updateBookingStatus(id, 'confirmed');
    refresh();
    if (booking) sendStatusToTelegram(booking, 'confirmed');
  };
  const handleReject = (id) => {
    const booking = bookings.find((b) => b.id === id);
    updateBookingStatus(id, 'rejected');
    refresh();
    if (booking) sendStatusToTelegram(booking, 'rejected');
  };
  const handleDelete = (id) => { deleteBooking(id); refresh(); };

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
  }), [bookings]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">{lang.admin.title}</h1>
            <p className="mt-2 text-sm dark:text-gray-400 text-gray-500">{lang.admin.passcode}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/50 border-gray-200 dark:text-white text-gray-900 text-center text-lg tracking-widest dark:placeholder-gray-600 placeholder-gray-300 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[48px] transition-all"
            />
            {error && <p className="text-xs sm:text-sm text-red-500 text-center font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-[0.98] min-h-[48px]"
            >
              {lang.admin.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">{lang.admin.title}</h1>
        <button
          onClick={() => setAuthenticated(false)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm dark:text-gray-400 text-gray-500 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all min-h-[44px]"
        >
          <LogOut className="w-4 h-4 rtl:rotate-180" />
          <span>{lang.admin.logout}</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setView('bookings')}
          className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
            view === 'bookings'
              ? 'dark:bg-amber-500/20 bg-amber-50 dark:text-amber-400 text-amber-600 border dark:border-amber-500/30 border-amber-200'
              : 'dark:bg-gray-800/50 bg-gray-100 dark:text-gray-400 text-gray-500 border dark:border-gray-700/30 border-gray-200 hover:dark:border-gray-600 hover:border-gray-300'
          }`}
        >
          <List className="w-4 h-4" />
          <span>{lang.admin.reservations}</span>
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
            view === 'map'
              ? 'dark:bg-amber-500/20 bg-amber-50 dark:text-amber-400 text-amber-600 border dark:border-amber-500/30 border-amber-200'
              : 'dark:bg-gray-800/50 bg-gray-100 dark:text-gray-400 text-gray-500 border dark:border-gray-700/30 border-gray-200 hover:dark:border-gray-600 hover:border-gray-300'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{lang.admin.tablesMap}</span>
        </button>
      </div>

      {view === 'map' ? (
        <TablesMap lang={lang} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard icon={<List className="w-4 h-4" />} label={lang.admin.all} value={stats.total} color="dark:text-white text-gray-900" />
            <StatCard icon={<Clock className="w-4 h-4" />} label={lang.admin.pending} value={stats.pending} color="text-amber-500" />
            <StatCard icon={<CheckCircle className="w-4 h-4" />} label={lang.admin.confirmed} value={stats.confirmed} color="text-emerald-500" />
            <StatCard icon={<XCircle className="w-4 h-4" />} label={lang.admin.rejected} value={stats.rejected} color="text-red-500" />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'pending', 'confirmed', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                  filter === f
                    ? 'dark:bg-amber-500/20 bg-amber-50 dark:text-amber-400 text-amber-600 border dark:border-amber-500/30 border-amber-200'
                    : 'dark:bg-gray-800/50 bg-gray-100 dark:text-gray-400 text-gray-500 border dark:border-gray-700/30 border-gray-200 hover:dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{lang.admin[f === 'all' ? 'all' : f]}</span>
                {f === 'pending' && stats.pending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-sm dark:text-gray-500 text-gray-400">{lang.admin.noBookings}</p>
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    b.status === 'confirmed'
                      ? 'dark:bg-emerald-500/5 bg-emerald-50/50 dark:border-emerald-500/20 border-emerald-200'
                      : b.status === 'rejected'
                        ? 'dark:bg-red-500/5 bg-red-50/50 dark:border-red-500/20 border-red-200'
                        : 'dark:bg-gray-800/50 bg-white dark:border-gray-700/50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold dark:text-white text-gray-900 text-sm sm:text-base">{b.name}</span>
                        <StatusBadge status={b.status} lang={lang} />
                        <span className="text-xs px-2 py-0.5 rounded dark:bg-gray-700 bg-gray-100 dark:text-gray-300 text-gray-600 font-medium">
                          {b.type === 'vip' ? `👑 ${lang.vip.title}` : `🍽️ ${lang.table.tableLabel} #${b.tableNumber}`}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
                        <span dir="ltr">📞 {b.phone}</span>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.time}</span>
                        <span>👥 {b.guests}</span>
                      </div>
                      {b.notes && (
                        <div className="mt-2 space-y-1 text-xs dark:text-gray-400 text-gray-500 break-words">
                          <p>📝 {b.notes}</p>
                          {b.notesEn && b.notesEn !== b.notes && <p dir="auto">🌐 {b.notesEn}</p>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(b.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg dark:bg-emerald-500/10 bg-emerald-50 text-emerald-600 dark:text-emerald-400 border dark:border-emerald-500/20 border-emerald-200 hover:dark:bg-emerald-500/20 hover:bg-emerald-100 text-xs sm:text-sm transition-all min-h-[44px]"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">{lang.admin.accept}</span>
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg dark:bg-red-500/10 bg-red-50 text-red-600 dark:text-red-400 border dark:border-red-500/20 border-red-200 hover:dark:bg-red-500/20 hover:bg-red-100 text-xs sm:text-sm transition-all min-h-[44px]"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">{lang.admin.reject}</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg dark:text-gray-500 text-gray-400 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all text-xs sm:text-sm min-h-[44px] flex-shrink-0"
                        title={lang.admin.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TablesMap({ lang }) {
  const [locked, setLocked] = useState(() => getLockedTables());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const sync = () => setLocked(getLockedTables());
    window.addEventListener('storage', sync);
    window.addEventListener('laventana:locks', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('laventana:locks', sync);
    };
  }, []);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 4000);
  };

  const toggle = (num) => {
    const isLocked = locked.includes(num);
    toggleLockedTable(num, !isLocked);
    setLocked(getLockedTables());
    pushServerLocks();
    showToast(isLocked ? `🔓 Table #${num} is now OPEN` : `🔒 Table #${num} is now LOCKED`);
  };

  const openAll = () => {
    setLockedTables([]);
    setLocked([]);
    pushServerLocks();
    showToast('🔓 ' + lang.admin.openAll);
  };

  const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1).filter((n) => n !== SKIP_TABLE);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-500">{lang.admin.lockedHint}</p>
        <span className="flex items-center gap-1.5 ms-auto px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {locked.length} / {tables.length}
        </span>
        <button
          onClick={openAll}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all min-h-[36px] ${
            locked.length
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:dark:bg-emerald-500/20 hover:bg-emerald-100'
              : 'dark:bg-gray-800/30 bg-gray-100 dark:text-gray-500 text-gray-400 border dark:border-gray-700/30 border-gray-200 cursor-default'
          }`}
          disabled={!locked.length}
        >
          <Unlock className="w-3.5 h-3.5" />
          {lang.admin.openAll}
        </button>
      </div>

      <div className="mb-5 flex items-center justify-center gap-8 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-emerald-500" />
          <span className="dark:text-gray-400 text-gray-500 font-medium">{lang.table.available}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-red-500" />
          <span className="dark:text-gray-400 text-gray-500 font-medium">{lang.table.locked}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
        {tables.map((num) => {
          const isLocked = locked.includes(num);
          return (
            <button
              key={num}
              onClick={() => toggle(num)}
              aria-label={`Table ${num}`}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-sm sm:text-lg font-bold border-2 transition-all active:scale-95 min-h-[64px] ${
                isLocked
                  ? 'dark:bg-red-500/15 bg-red-50 dark:text-red-400 text-red-600 dark:border-red-400/50 border-red-300 shadow-lg shadow-red-500/10'
                  : 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-500 text-emerald-600 dark:border-emerald-500/40 border-emerald-300 hover:dark:bg-emerald-500/20 hover:bg-emerald-100'
              }`}
            >
              {num}
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 opacity-60" />}
            </button>
          );
        })}
      </div>

      {toast && (
        <div
          dir="auto"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium shadow-2xl shadow-black/30 text-center border border-emerald-500/30"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/30 border-gray-200">
      <div className={`flex items-center gap-2 text-xs font-medium ${color}`}>
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status, lang }) {
  const styles = {
    pending: 'dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600 dark:border-amber-500/20 border-amber-200',
    confirmed: 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-400 text-emerald-600 dark:border-emerald-500/20 border-emerald-200',
    rejected: 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 dark:border-red-500/20 border-red-200',
  };
  const labels = { pending: lang.admin.pending, confirmed: lang.admin.confirmed, rejected: lang.admin.rejected };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}