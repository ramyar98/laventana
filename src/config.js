export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const GEMINI_TRANSLATION_MODEL = import.meta.env.VITE_GEMINI_TRANSLATION_MODEL || 'gemini-flash-lite-latest';
export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '9647509085555';
export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'RamYar';
const ADMIN_ONLY_HOSTS = ['laventana1.vercel.app'];
function isAdminHost() {
  if (typeof window === 'undefined') return false;
  return ADMIN_ONLY_HOSTS.some((h) => window.location.hostname === h);
}
export const ADMIN_ONLY = import.meta.env.VITE_ADMIN_ONLY === 'true' || isAdminHost();
export const ADMIN_DOMAIN = 'laventana1.vercel.app';
export const PUBLIC_DOMAIN = 'laventana.vercel.app';
export const TOTAL_TABLES = 33;
export const SKIP_TABLE = 13;