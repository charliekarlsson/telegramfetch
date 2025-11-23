require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');
const fs = require('fs/promises');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 4000;
const GALLERY_LIMIT = Number(process.env.GALLERY_LIMIT || 30);

if (!TELEGRAM_TOKEN) {
  console.error('Missing TELEGRAM_TOKEN. Copy .env.example to .env and add your bot token.');
  process.exit(1);
}

const app = express();
const downloadsDir = path.join(__dirname, 'downloads');
const gallery = [];

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
}

ensureDir(downloadsDir).catch((error) => {
  console.error('Cannot initialize downloads directory:', error);
  process.exit(1);
});

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('polling_error', (error) => console.error('Polling error', error));
bot.on('webhook_error', (error) => console.error('Webhook error', error));

async function downloadPhoto(fileId) {
  const { file_path: filePath } = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
  const ext = path.extname(filePath) || '.jpg';
  const filename = `${fileId}-${Date.now()}${ext}`;
  const destination = path.join(downloadsDir, filename);
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  await fs.writeFile(destination, response.data);
  return `/media/${filename}`;
}

function pushToGallery(entry) {
  gallery.unshift(entry);
  if (gallery.length > GALLERY_LIMIT) {
    gallery.length = GALLERY_LIMIT;
  }
}

const resolveDisplayName = (msg) => {
  const username = msg.from?.username && `@${msg.from.username}`;
  const senderTitle = msg.sender_chat?.title;
  const chatTitle = msg.chat?.title;
  const fullName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ').trim();
  return senderTitle || chatTitle || username || fullName || 'anon troop';
};

async function handlePhotoContainer(msg, context = 'message') {
  const photos = msg.photo;
  if (!Array.isArray(photos) || !photos.length) return;

  const largestPhoto = photos.at(-1);
  const relativeUrl = await downloadPhoto(largestPhoto.file_id);
  const postedAtMs = (msg.date || Math.floor(Date.now() / 1000)) * 1000;
  const author = resolveDisplayName(msg);
  const chatType = msg.chat?.type || context;

  pushToGallery({
    url: relativeUrl,
    caption: msg.caption || '',
    postedAt: postedAtMs,
    from: author,
    messageId: msg.message_id,
    chatId: msg.chat?.id,
    chatType,
  });

  console.log(`[gallery] stored ${relativeUrl} from ${author} (${chatType})`);
}

bot.on('message', (msg) => {
  if (!msg.photo) return;
  handlePhotoContainer(msg, 'group-message').catch((error) => {
    console.error('Failed to process group photo', error);
  });
});

bot.on('channel_post', (channelPost) => {
  if (!channelPost.photo) return;
  handlePhotoContainer(channelPost, 'channel-post').catch((error) => {
    console.error('Failed to process channel photo', error);
  });
});

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  next();
});

app.get('/gallery/latest', (req, res) => {
  res.json(gallery);
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true, items: gallery.length });
});

app.use('/media', express.static(downloadsDir));

app.listen(PORT, () => {
  console.log(`Telegram gallery bot listening on http://localhost:${PORT}`);
});
