import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';

import { setupAdminHandlers } from './bot/handlers/admin/setupAdminHandlers';
import { setupBookingHandlers } from './bot/handlers/booking/setupBookingHandlers';
import { setupErrorHandlers } from './bot/handlers/error/errorHandler';
import { setupInfoHandlers } from './bot/handlers/info/setupInfoHandlers';
import { setupScheduleHandlers } from './bot/handlers/schedule/setupScheduleHandlers';
import { sayHello } from './bot/helpers/helpers';
import { initCrossfitSchedule } from './bot/helpers/initCrossfitSchedule';
import { setupCrossfitAutoUpdate } from './bot/helpers/scheduleMaintenance';
import { adminCommands, devCommands, mainCommands } from './bot/keyboards/commands';
import { callbackRouter } from './bot/router/callbackRouter';
import { prisma } from './db';

dotenv.config();

const token = process.env.BOT_TOKEN!;
const adminId = process.env.ADMIN_ID!;
const devId = process.env.DEV_ID!;

const bot = new Telegraf(token);

setupErrorHandlers(bot);

bot.start(sayHello());

bot.telegram.setMyCommands(mainCommands, {
  scope: { type: 'all_private_chats' },
});

bot.telegram.setMyCommands(adminCommands, {
  scope: { type: 'chat', chat_id: adminId },
});

bot.telegram.setMyCommands(devCommands, {
  scope: { type: 'chat', chat_id: devId },
});

(async () => {
  try {
    await prisma.$connect();
    await initCrossfitSchedule();
    setupCrossfitAutoUpdate();
    console.log('Бот работает');

    await bot.launch();
  } catch (error) {
    console.error('Ошибка при запуске:', error);
    process.exit(1);
  }
})();

setupInfoHandlers(bot, adminId);
setupScheduleHandlers(bot);
setupBookingHandlers(bot);
setupAdminHandlers(bot);

bot.on('callback_query', callbackRouter);

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
