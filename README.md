# Laventana VIP Lounge & Restaurant

Booking app for Laventana — VIP lounge and table reservations in 6 languages (Kurdish, Badini, Arabic, Farsi, English, Turkish), send bookings to Telegram and show them in a hidden admin panel.

## Setup (local development)

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in real values (Telegram bot token, chat id, Gemini API key). The default admin passcode is `RamYar` (override with `VITE_ADMIN_PASSCODE`).

## Commands

- `npm run dev` — dev server (http://localhost:5173/)
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build
- `npm run lint` — oxlint

## Admin access

There is **no button or link** to the admin panel in the app. It is reached only by changing the URL:

- Public site + admin: `https://laventana.vercel.app/#/admin`
- Admin-only deployment: `https://laventana1.vercel.app/` (shown automatically when built with `VITE_ADMIN_ONLY=true`)

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** → select the repo (framework auto-detected: Vite). Build command `npm run build`, output directory `dist`. The `api/` folder is deployed as Vercel Functions automatically.
3. Add the environment variables (Settings → Environment Variables) for the **public** project (`laventana`):
   - `VITE_TELEGRAM_BOT_TOKEN`, `VITE_TELEGRAM_CHAT_ID`, `VITE_GEMINI_API_KEY`, `VITE_WHATSAPP_PHONE`, `VITE_ADMIN_PASSCODE`
   - `VITE_ADMIN_ONLY=false`
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` (from a **Vercel KV / Upstash Redis** store — free tier is fine)
4. Create a **second** Vercel project from the same repo. Give it the **same** env vars (including `KV_REST_API_URL`, `KV_REST_API_TOKEN` — share the same KV store so both deployments stay in sync). Then in **Project → Settings → Domains** add the alias `laventana1.vercel.app`. That host renders **only the admin panel** (the app forces admin-only UI on the `laventana1.vercel.app` host, so `VITE_ADMIN_ONLY` is optional).
5. After the main deploy is live, register the Telegram webhook (once):
   ```bash
   node scripts/set-webhook.mjs set https://laventana.vercel.app/api/telegram
   ```
   Verify with `node scripts/set-webhook.mjs info` (status should be `ok`, no `last_error`).
   To switch back to local/dev testing run `node scripts/set-webhook.mjs delete` — then follow the local section below.

**Security note:** this is a client-side app, so anything in `VITE_*` is visible in the deployed JavaScript. Never commit real values — keep them only in `.env.local` (gitignored) and Vercel environment variables. The `KV_REST_API_*` and `TELEGRAM_WEBHOOK_SECRET` variables never reach the client.

## Locking tables from Telegram (deployed)

Once the webhook is registered, **Telegram delivers every command to exactly one server endpoint**, so each command gets exactly **one** reply — no matter how many browsers/tabs/devices are open. Command state is stored in **Vercel KV** and every open tab syncs from it every ~3 seconds, so the floor plan is always consistent across all devices.

| Command | Meaning |
| --- | --- |
| `o 20` (or `o20`, `O 20`) | open table 20 |
| `c 20` (or `c20`, `C 20`) | close/lock table 20 |
| `20?` (or `20 ?`) | reply whether table 20 is open or locked |
| `all` | reply with the status of every table (1–33, skipping 13) |

Case and spacing don't matter. Valid tables are 1–33 excluding 13 (`o13`, `c0`, `o99` are ignored). The bot updates the table immediately and replies in the group with the new state.

Setup: add the bot to the group and disable privacy mode in BotFather (`/setprivacy` → Disable), otherwise the bot cannot read plain messages. Locked tables appear red in the floor plan in every open tab and customers cannot submit bookings for them.

## Locking tables from Telegram (local dev, no server)

During plain `npm run dev` there is **no webhook and no KV**, so Telegram commands are ignored. Use the admin panel (`/#/admin` → Tables Map) or run `node scripts/set-webhook.mjs set <LOCAL_TUNNEL_URL>/api/telegram` if you want to test the bot locally with a public tunnel (e.g. `curl https://telegram-bot-api...`).