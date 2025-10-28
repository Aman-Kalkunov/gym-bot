import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

import { prisma } from './db';
import { sayHello } from './bot/helpers/helpers';
import { initCrossfitSchedule } from './bot/helpers/initCrossfitSchedule';
import { setupCrossfitAutoUpdate } from './bot/helpers/scheduleMaintenance';
import { setupInfoHandlers } from './bot/handlers/setupInfoHandlers';
import { setupScheduleHandlers } from './bot/handlers/setupScheduleHandlers';
import { adminCommands, mainCommands } from './bot/commands/commands';

dotenv.config();

const token = process.env.BOT_TOKEN!;
const adminId = process.env.ADMIN_ID!;

const bot = new Telegraf(token);

bot.start(sayHello());

bot.telegram.setMyCommands(mainCommands, {
  scope: { type: 'all_private_chats' },
});

bot.telegram.setMyCommands(adminCommands, {
  scope: { type: 'chat', chat_id: adminId },
});

/* bot.telegram.setMyCommands(adminCommands, {
  scope: { type: 'chat', chat_id: process.env.DEV_ID! },
}); */

setupInfoHandlers(bot, adminId);
setupScheduleHandlers(bot);

(async () => {
  try {
    await prisma.$connect();
    console.log('Подключено к БД');

    await initCrossfitSchedule();
    console.log('Расписание инициализировано');

    setupCrossfitAutoUpdate();
    console.log('Ежедневное обновление расписания запущено');

    await bot.launch();
  } catch (error) {
    console.error('Ошибка при запуске:', error);
    process.exit(1);
  }
})();

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
