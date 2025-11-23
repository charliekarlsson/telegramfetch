# Monko Telegram Gallery Bot

Small Node.js service that listens for photos posted in your Telegram group and exposes them via a simple JSON feed + static media route for the landing page gallery.

## Prerequisites
- Node.js 18+
- Telegram bot token from [@BotFather](https://t.me/BotFather)

## Setup
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Copy the environment template and add your secrets:
   ```powershell
   copy .env.example .env
   ```
   - Replace `TELEGRAM_TOKEN` with the token BotFather gave you (keep it secret!).
   - Optionally tweak `PORT` and `GALLERY_LIMIT`.
3. Start the service (polling mode by default):
   ```powershell
   npm start
   ```

### Channel-specific steps
- Add the bot as an **administrator** in every channel you want to mirror.
- In BotFather, make sure **Group Privacy** is **Disabled** so the bot receives channel posts.
- Channel posts are delivered via `channel_post` updates; the service already listens for them, so no extra code is needed once the bot is an admin.

## What it does
- Polls Telegram for new photo messages the bot can see in your group.
- Downloads the largest version of each photo into `downloads/`.
- Keeps the latest `GALLERY_LIMIT` items in memory.
- Serves:
  - `GET /gallery/latest` → JSON list of images (url, caption, timestamp, sender).
  - `GET /media/<file>` → Serves the downloaded file directly.
  - `GET /healthz` → Simple health probe.

## Wiring it into the site
Fetch `https://YOUR_HOST/gallery/latest` from the landing page and render the returned URLs in a grid or carousel. Because `/media` is also exposed, you can point `<img>` tags directly at those paths.

## Production tips
- Run behind a process manager (PM2, systemd) or containerize it.
- Move image storage to object storage (S3, Supabase, Cloudinary) if you need persistence across deploys—swap the `downloadPhoto` helper accordingly.
- If you prefer webhooks over polling, disable polling in `server.js` and call `setWebhook` for your deployed URL.
