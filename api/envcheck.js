export default async function handler(req, res) {
  const has = (key) => Boolean(process.env[key]);
  return res.status(200).json({
    ok: true,
    vercel: {
      env: process.env.VERCEL_ENV || null,
      projectId: process.env.VERCEL_PROJECT_ID || null,
      region: process.env.VERCEL_REGION || null,
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    vars: {
      VITE_TELEGRAM_BOT_TOKEN: has('VITE_TELEGRAM_BOT_TOKEN'),
      TELEGRAM_BOT_TOKEN: has('TELEGRAM_BOT_TOKEN'),
      VITE_TELEGRAM_CHAT_ID: has('VITE_TELEGRAM_CHAT_ID'),
      VITE_GEMINI_API_KEY: has('VITE_GEMINI_API_KEY'),
      VITE_WHATSAPP_PHONE: has('VITE_WHATSAPP_PHONE'),
      VITE_ADMIN_PASSCODE: has('VITE_ADMIN_PASSCODE'),
      VITE_ADMIN_ONLY: process.env.VITE_ADMIN_ONLY === 'true',
      KV_REST_API_URL: has('KV_REST_API_URL'),
      KV_REST_API_TOKEN: has('KV_REST_API_TOKEN'),
      TELEGRAM_WEBHOOK_SECRET: has('TELEGRAM_WEBHOOK_SECRET'),
      GLOBAL_CONFIG: has('GLOBAL_CONFIG'),
      VERCEL_API_TOKEN: has('VERCEL_API_TOKEN'),
    },
  });
}