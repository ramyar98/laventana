import { useState } from 'react';
import { useLanguage } from '../context/hooks';
import { getLockedTables, saveBooking } from '../utils/storage';
import { sendTelegramMessage, buildWhatsAppUrl } from '../utils/telegram';
import { translateToEnglish } from '../utils/translate';
import { submitBooking } from '../utils/api';
import { ArrowLeft, CheckCircle } from 'lucide-react';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validTime(t) {
  if (!t) return false;
  const [hh, mm] = t.split(':').map(Number);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return false;
  if (hh === 0 && mm === 0) return true;
  return hh >= 8;
}

function timeToMin(t) {
  const [hh, mm] = t.split(':').map(Number);
  return hh === 0 ? 1440 : hh * 60 + mm;
}

export default function BookingForm({ type, tableNumber, onBack }) {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [lockedError, setLockedError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [waUrl, setWaUrl] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', date: localToday(), time: '', arrival: '', departure: '', guests: '2', notes: '',
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'table' && tableNumber && getLockedTables().includes(tableNumber)) {
      setLockedError(lang.booking.locked);
      return;
    }
    setLockedError('');
    setTimeError('');
    if (type === 'vip' && (!validTime(form.arrival) || !validTime(form.departure) || timeToMin(form.arrival) >= timeToMin(form.departure))) {
      setTimeError(lang.booking.timeError);
      return;
    }
    setSending(true);
    const booking = { ...form, type, tableNumber: tableNumber || null, lang: lang.code };
    const serverRes = await submitBooking(booking);
    if (serverRes && serverRes.error === 'conflict') {
      setSending(false);
      setLockedError(lang.booking.conflict);
      return;
    }
    const finalBooking = serverRes && serverRes.booking ? { ...booking, id: serverRes.booking.id, status: serverRes.booking.status } : booking;
    const waLink = buildWhatsAppUrl(finalBooking);
    setWaUrl(waLink);
    window.open(waLink, '_blank', 'noopener');
    const notesEn = form.notes ? await translateToEnglish(form.notes, lang.code) : '';
    const saved = saveBooking({ ...finalBooking, notesEn });
    await sendTelegramMessage(saved);
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">{lang.booking.success}</h2>
          <p className="mt-3 text-sm dark:text-gray-400 text-gray-500">{lang.booking.successMsg}</p>
          <p className="mt-2 text-xs text-amber-500 font-medium">{lang.booking.pending}</p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all min-h-[44px] flex items-center justify-center"
            >
              {lang.booking.sendWhatsApp}
            </a>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl border-2 dark:border-gray-600 border-gray-300 dark:text-gray-300 text-gray-600 hover:dark:border-amber-500/50 hover:border-amber-500/50 hover:dark:text-amber-400 hover:text-amber-600 transition-all min-h-[44px]"
            >
              {lang.booking.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm dark:text-gray-400 text-gray-500 hover:dark:text-amber-400 hover:text-amber-600 transition-colors mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {lang.booking.cancel}
      </button>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold dark:text-white text-gray-900 mb-1">
        {lang.booking.title}
      </h1>
      {type === 'table' && tableNumber && (
        <p className="text-sm text-amber-500 font-medium mb-8">{lang.table.tableLabel} #{tableNumber}</p>
      )}
      {type === 'vip' && (
        <p className="text-sm text-amber-500 font-medium mb-8">{lang.vip.title}</p>
      )}

      {lockedError && (
        <p className="mb-6 p-3 rounded-xl dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 text-sm font-medium text-center border dark:border-red-500/20 border-red-200">
          {lockedError}
        </p>
      )}

      {timeError && (
        <p className="mb-6 p-3 rounded-xl dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 text-sm font-medium text-center border dark:border-red-500/20 border-red-200">
          {timeError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label={lang.booking.name} name="name" value={form.name} onChange={handleChange} required />
        <Input label={lang.booking.phone} name="phone" type="tel" inputMode="tel" placeholder="07501234567" value={form.phone} onChange={handleChange} required hint={lang.booking.phoneHint} />
        <Input label={lang.booking.date} name="date" type="date" value={form.date} onChange={handleChange} required min={localToday()} hint={lang.booking.dateAuto} />
        {type === 'vip' ? (
          <>
            <Input label={lang.booking.arrival} name="arrival" type="time" value={form.arrival} onChange={handleChange} required hint={lang.booking.hoursHint} />
            <Input label={lang.booking.departure} name="departure" type="time" value={form.departure} onChange={handleChange} required />
          </>
        ) : (
          <Input label={lang.booking.time} name="time" type="time" value={form.time} onChange={handleChange} required />
        )}
        <Input label={lang.booking.guests} name="guests" type="number" value={form.guests} onChange={handleChange} required min="1" max="1000" />

        <div>
          <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-2">{lang.booking.notes}</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/50 border-gray-200 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base resize-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] min-h-[48px]"
        >
          {sending ? '...' : lang.booking.submit}
        </button>
      </form>
    </div>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/50 border-gray-200 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base min-h-[44px] transition-all"
      />
      {hint && <p className="mt-1.5 text-[11px] sm:text-xs dark:text-gray-500 text-gray-400">{hint}</p>}
    </div>
  );
}
