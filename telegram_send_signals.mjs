// GitHub Actions için: tarama sonucundaki SVG görsellerini PNG'ye çevirir ve
// Telegram'a fotoğraf olarak yollar. Anahtarlar yalnızca GitHub Secrets'tan gelir.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID GitHub Secrets olarak tanımlanmalı.');

const resultDir = path.resolve('bb-squeeze-results');
const report = JSON.parse(await fs.readFile(path.join(resultDir, 'signals.json'), 'utf8'));
for (const signal of report.signals ?? []) {
  const svg = path.join(resultDir, signal.image);
  const png = await sharp(svg).png().toBuffer();
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', `⭐ ${signal.name} 4S BUY\nParite: ${signal.symbol}\nSistem: BB Squeeze + Hacim + RSI/MACD`);
  form.append('photo', new Blob([png], { type: 'image/png' }), signal.image.replace(/\.svg$/, '.png'));
  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(`Telegram gönderimi başarısız: ${response.status}`);
}
console.log(`${report.signals?.length ?? 0} sinyal Telegram'a gönderildi.`);
