import { Telegraf, Context } from 'telegraf';

import { adminButtons } from '../../../bot/keyboards/adminButtons';
import { handleAdminSchedule } from './handleAdminSchedule';
import { handleAdminBookings } from './handleAdminBookings';
import { BotCommand, AdminButtons } from '../../../types/types';

export const setupAdminHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.ADMIN_PANEL, async ctx => {
    await ctx.reply('Выберите действие', adminButtons);
  });

  bot.action(AdminButtons.ADMIN_SCHEDULE, async ctx => {
    await handleAdminSchedule(ctx);
    await ctx.answerCbQuery();
  });

  bot.action(AdminButtons.ADMIN_BOOKINGS, async ctx => {
    await ctx.editMessageReplyMarkup(undefined);
    await handleAdminBookings(ctx);
    await ctx.answerCbQuery();
  });
};
