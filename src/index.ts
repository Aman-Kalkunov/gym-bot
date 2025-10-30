import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { prisma } from './db';
import { sayHello } from './bot/helpers/helpers';
import { initCrossfitSchedule } from './bot/helpers/initCrossfitSchedule';
import { setupCrossfitAutoUpdate } from './bot/helpers/scheduleMaintenance';
import { setupInfoHandlers } from './bot/handlers/setupInfoHandlers';
import { setupScheduleHandlers } from './bot/handlers/setupScheduleHandlers';
import { adminCommands, mainCommands } from './bot/commands/commands';
import { crossfitTypes } from './types/crossfitTypes';
import {
  handleCrossfit,
  handleCrossfitDay,
  handleCrossfitTime,
} from './bot/handlers/handleCrossfit';
import { messageText } from './constants/text/text';
import { scheduleButtons } from './bot/keyboards/scheduleButtons';
import {
  handleBookingInfo,
  handleCancelBooking,
  handleMyBookings,
} from './bot/handlers/handleBooking';
import { setupBookingHandlers } from './bot/handlers/setupBookingHandlers';

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

setupInfoHandlers(bot, adminId);
setupScheduleHandlers(bot);
setupBookingHandlers(bot);

bot.on('callback_query', async ctx => {
  const query = ctx.callbackQuery;

  if (!('data' in query) || !query.data) {
    await ctx.answerCbQuery();
    return;
  }

  const data = query.data;

  try {
    if (data === crossfitTypes.CROSS_FIT_TIME_BACK) {
      await handleCrossfit(ctx);
      await ctx.answerCbQuery();
      return;
    }

    if (data === crossfitTypes.CROSS_FIT_DAY_BACK) {
      await ctx.editMessageText(messageText.selectWorkoutType, scheduleButtons);
      await ctx.answerCbQuery();
      return;
    }

    if (data === crossfitTypes.CROSS_FIT_MY_BACK) {
      await handleMyBookings(ctx, true);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${crossfitTypes.CROSS_FIT_DAY}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);
      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('Некорректный день, попробуйте снова', { show_alert: true });
        return;
      }

      await handleCrossfitDay(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${crossfitTypes.CROSS_FIT_TIME}_`)) {
      const trainingId = Number(data.split('_')[3]);
      if (Number.isNaN(trainingId)) {
        await ctx.answerCbQuery('Некорректное время, попробуйте снова', { show_alert: true });
        return;
      }

      await handleCrossfitTime(ctx, trainingId);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${crossfitTypes.CROSS_FIT_BOOKING}_`)) {
      const id = Number(data.split('_')[3]);
      if (Number.isNaN(id)) {
        await ctx.answerCbQuery('Запись не найдена, попробуйте снова', { show_alert: true });
        return;
      }

      await handleBookingInfo(ctx, id);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${crossfitTypes.CROSS_FIT_CANCEL}_`)) {
      const id = Number(data.split('_')[3]);
      if (Number.isNaN(id)) {
        await ctx.answerCbQuery('Запись не найдена, попробуйте снова', { show_alert: true });
        return;
      }
      await handleCancelBooking(ctx, id);
      await ctx.answerCbQuery();
      return;
    }

    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка callback_query:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
