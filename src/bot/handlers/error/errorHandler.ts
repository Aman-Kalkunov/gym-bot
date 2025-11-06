import fs from 'fs';
import cron from 'node-cron';
import path from 'path';
import { Context, Telegraf } from 'telegraf';

const LOG_FILE = path.resolve('errors.log');
const devId = process.env.DEV_ID;

/**
 * Запись ошибок в файл
 */
function writeToLogFile(message: string) {
  const logMessage = `[${new Date().toLocaleString('ru-RU')}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
}

/**
 * Отправка сообщения админу
 */
async function notifyAdmin(bot: Telegraf<Context>, message: string) {
  if (!devId) return;
  try {
    await bot.telegram.sendMessage(devId, message);
  } catch (err) {
    console.error('[Error notifying admin]', err);
  }
}

/**
 * Инициализация обработчиков ошибок и еженедельного отчёта
 */
export const setupErrorHandlers = (bot: Telegraf<Context>) => {
  // 🧩 Отлавливаем ошибки Telegraf (например, внутри обработчиков)
  bot.catch(async (err, ctx) => {
    const errorMessage = `Ошибка в апдейте от ${ctx.from?.username || 'неизвестного пользователя'}:
${err instanceof Error ? err.stack || err.message : JSON.stringify(err)}`;

    console.error('[Telegraf Error]', errorMessage);
    writeToLogFile(errorMessage);
    await notifyAdmin(bot, `⚠️ Произошла ошибка:\n${errorMessage.slice(0, 3000)}`);
  });

  // 🪲 Глобальные необработанные исключения
  process.on('unhandledRejection', async reason => {
    const message = `🚨 UnhandledRejection: ${reason}`;
    console.error(message);
    writeToLogFile(message);
    await notifyAdmin(bot, message);
  });

  process.on('uncaughtException', async err => {
    const message = `💥 UncaughtException: ${err.message}\n${err.stack}`;
    console.error(message);
    writeToLogFile(message);
    await notifyAdmin(bot, message);
  });

  // 🧹 Раз в неделю отправляем лог админу
  cron.schedule('0 10 * * 1', async () => {
    if (!fs.existsSync(LOG_FILE)) {
      await notifyAdmin(bot, '✅ За прошлую неделю ошибок не было.');
      return;
    }

    const logs = fs.readFileSync(LOG_FILE, 'utf8');
    const report =
      logs.length > 3500 ? logs.slice(-3500) + '\n\n(Обрезано до последних строк)' : logs;

    await notifyAdmin(bot, `📘 Еженедельный отчёт об ошибках:\n\n${report}`);

    fs.writeFileSync(LOG_FILE, ''); // очищаем файл
  });
};
