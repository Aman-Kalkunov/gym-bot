import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';

import {
  addTrainingTime,
  handleAdminAddDay,
  handleAdminAddTime,
  handleAdminConfirmAdd,
  handleAdminRemoveDay,
  handleAdminRemoveTime,
  handleAdminScheduleDay,
  handleAdminSelectTime,
  removeTrainingTime,
} from './bot/handlers/admin/handleAdminSchedule';
import { setupAdminHandlers } from './bot/handlers/admin/setupAdminHandlers';
import {
  handleBookingInfo,
  handleCancelBooking,
  handleMyBookings,
} from './bot/handlers/booking/handleBooking';
import { setupBookingHandlers } from './bot/handlers/booking/setupBookingHandlers';
import { setupErrorHandlers } from './bot/handlers/error/errorHandler';
import { setupInfoHandlers } from './bot/handlers/info/setupInfoHandlers';
import {
  handleCrossfit,
  handleCrossfitDay,
  handleCrossfitTime,
} from './bot/handlers/schedule/handleCrossfit';
import { handleWeightliftingDay } from './bot/handlers/schedule/handleWeightlifting';
import { setupScheduleHandlers } from './bot/handlers/schedule/setupScheduleHandlers';
import { sayHello } from './bot/helpers/helpers';
import { initCrossfitSchedule } from './bot/helpers/initCrossfitSchedule';
import { setupCrossfitAutoUpdate } from './bot/helpers/scheduleMaintenance';
import { adminButtons } from './bot/keyboards/adminButtons';
import { adminCommands, devCommands, mainCommands } from './bot/keyboards/commands';
import { scheduleButtons } from './bot/keyboards/scheduleButtons';
import { prisma } from './db';
import { AdminButtons, CrossfitTypes, WeightliftingButtons } from './types/types';

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

setupInfoHandlers(bot, adminId, devId);
setupScheduleHandlers(bot);
setupBookingHandlers(bot);
setupAdminHandlers(bot);

bot.on('callback_query', async ctx => {
  const query = ctx.callbackQuery;

  if (!('data' in query) || !query.data) {
    await ctx.answerCbQuery();
    return;
  }

  const data = query.data;

  try {
    if (data === CrossfitTypes.CLOSE) {
      await ctx.editMessageReplyMarkup(undefined);
      await ctx.answerCbQuery();
      return;
    }
    if (data === CrossfitTypes.CROSS_FIT_TIME_BACK) {
      await handleCrossfit(ctx, 'edit');
      await ctx.answerCbQuery();
      return;
    }

    if (data === CrossfitTypes.CROSS_FIT_DAY_BACK) {
      await ctx.editMessageText('Выберите тип тренировки', scheduleButtons);
      await ctx.answerCbQuery();
      return;
    }

    if (data === AdminButtons.ADMIN_BACK) {
      await ctx.editMessageText('Выберите действие', adminButtons);
      await ctx.answerCbQuery();
      return;
    }

    if (data === CrossfitTypes.CROSS_FIT_MY_BACK) {
      await handleMyBookings(ctx, 'edit');
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${CrossfitTypes.CROSS_FIT_DAY}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);
      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('Некорректный день, попробуйте снова');
        return;
      }

      await handleCrossfitDay(ctx, dayOfWeek, 'edit');
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${CrossfitTypes.CROSS_FIT_TIME}_`)) {
      const trainingId = Number(data.split('_')[3]);
      if (Number.isNaN(trainingId)) {
        await ctx.answerCbQuery('Некорректное время, попробуйте снова');
        return;
      }

      await handleCrossfitTime(ctx, trainingId, adminId, devId);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${CrossfitTypes.CROSS_FIT_BOOKING}_`)) {
      const id = Number(data.split('_')[3]);
      if (Number.isNaN(id)) {
        await ctx.answerCbQuery('Запись не найдена, попробуйте снова');
        return;
      }

      await handleBookingInfo(ctx, id);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${CrossfitTypes.CROSS_FIT_CANCEL}_`)) {
      const id = Number(data.split('_')[3]);
      if (Number.isNaN(id)) {
        await ctx.answerCbQuery('Запись не найдена, попробуйте снова');
        return;
      }
      await handleCancelBooking(ctx, id, adminId, devId);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_DAY}_`)) {
      const dayOfWeek = Number(data.split('_')[2]);
      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await handleAdminScheduleDay(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_ADD_TIME}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);
      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await handleAdminAddTime(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_SELECT_ADD_TIME}_`)) {
      const dayOfWeek = Number(data.split('_')[4]);
      const time = data.split('_')[5];

      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await addTrainingTime(ctx, dayOfWeek, time);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_REMOVE_TIME}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);

      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await handleAdminRemoveTime(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_SELECT_REMOVE_TIME}_`)) {
      const id = Number(data.split('_')[4]);

      if (Number.isNaN(id)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await removeTrainingTime(ctx, id);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_REMOVE_DAY}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);

      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }

      await handleAdminRemoveDay(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data === AdminButtons.ADMIN_ADD_DAY) {
      await handleAdminAddDay(ctx);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_SELECT_DAY}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);

      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('День не найден, попробуйте снова');
        return;
      }
      handleAdminSelectTime(ctx, dayOfWeek);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith(`${AdminButtons.ADMIN_CONFIRM_ADD}_`)) {
      const dayOfWeek = Number(data.split('_')[3]);
      const time = data.split('_')[4];

      if (Number.isNaN(dayOfWeek)) {
        await ctx.answerCbQuery('Ошибка, попробуйте снова');
        return;
      }

      await handleAdminConfirmAdd(ctx, dayOfWeek, time);
      await ctx.answerCbQuery();
      return;
    }

    if (
      data === WeightliftingButtons.WEIGHTLIFTING_WEN ||
      data === WeightliftingButtons.WEIGHTLIFTING_RFI
    ) {
      handleWeightliftingDay(ctx, data, adminId);
      await ctx.answerCbQuery();
      return;
    }

    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка callback_query:', error);
    await ctx.answerCbQuery('Произошла ошибка');
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
