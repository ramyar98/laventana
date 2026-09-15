import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WHATSAPP_PHONE } from '../config';

export async function sendTelegramMessage(booking) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return { ok: false, reason: 'not_configured' };
  }

  const msg = formatBookingMessage(booking);
  return postTelegramMessage(TELEGRAM_CHAT_ID, msg);
}

export async function sendStatusToTelegram(booking, status) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return { ok: false, reason: 'not_configured' };
  }

  const isVip = booking.type === 'vip';
  const statusLine = status === 'confirmed'
    ? '✅ *قبوڵ کراوە / Accepted*'
    : '❌ *ڕەفز کراوە / Rejected*';
  const typeLine = isVip
    ? '👑 *VIP Lounge (ژوورا تایبەت)*'
    : `🍽️ *Regular Table (مێزا ئاسایی) #${booking.tableNumber}*`;

  const lines = [
    statusLine,
    '',
    typeLine,
    '',
    `👤 *Name:* ${booking.name}`,
    `📞 *Phone:* ${booking.phone}`,
    `🆔 *ID:* \`${booking.id}\``,
  ];

  return postTelegramMessage(TELEGRAM_CHAT_ID, lines.join('\n'));
}

export function postTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
    .then((res) => ({ ok: res.ok }))
    .catch((err) => {
      console.error('Telegram send failed:', err);
      return { ok: false, reason: err.message };
    });
}

function formatBookingMessage(b) {
  const isVip = b.type === 'vip';
  const title = isVip
    ? '👑 *VIP Lounge (ژوورا تایبەت)*'
    : `🍽️ *Regular Table (مێزا ئاسایی) #${b.tableNumber}*`;

  const lines = [
    '📋 *New Reservation*',
    '',
    title,
    '',
    `👤 *Name:* ${b.name}`,
    `📞 *Phone:* ${b.phone}`,
    `📅 *Date:* ${b.date}`,
    `🕐 *Time:* ${formatTime(b.time)}`,
    `👥 *Guests:* ${b.guests}`,
  ];
  if (b.notes) lines.push(`📝 *Notes:* ${b.notes}`);
  if (b.notesEn && b.notesEn !== b.notes) lines.push(`🌐 *Notes (EN):* ${b.notesEn}`);
  lines.push('', `🆔 *ID:* \`${b.id}\``);
  return lines.join('\n');
}

export function formatTime(t) {
  if (!t) return t;
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${period}`;
}

export function buildWhatsAppUrl(b) {
  const isVip = b.type === 'vip';
  const title = isVip
    ? '👑 VIP Lounge (ژوورا تایبەت)'
    : `🍽️ Regular Table (مێزا ئاسایی) #${b.tableNumber}`;

  const lines = [
    '📋 New Reservation',
    title,
    `👤 Name: ${b.name}`,
    `📞 Phone: ${b.phone}`,
    `📅 Date: ${b.date}`,
    `🕐 Time: ${formatTime(b.time)}`,
    `👥 Guests: ${b.guests}`,
  ];
  if (b.notes) lines.push(`📝 Notes: ${b.notes}`);
  if (b.notesEn && b.notesEn !== b.notes) lines.push(`🌐 Notes (EN): ${b.notesEn}`);
  lines.push(`🆔 ID: ${b.id || ''}`);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}
