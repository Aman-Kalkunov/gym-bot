import { Context, Telegraf } from 'telegraf';

import { TrainingType } from '@prisma/client';
import { AdminButtons, BotCommand } from '../../../types/types';
import { adminButtons } from '../../keyboards/adminButtons';
import { handleAdminSchedule } from './handleAdminSchedule';

export const setupAdminHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.ADMIN_PANEL, async ctx => {
    await ctx.reply('Выберите тип тренировки', adminButtons);
  });

  bot.action(AdminButtons.ADMIN_CROSS_FIT, async ctx => {
    await handleAdminSchedule(ctx, TrainingType.CROSSFIT);
    await ctx.answerCbQuery();
  });

  bot.action(AdminButtons.ADMIN_HEALTHY_BACK, async ctx => {
    await handleAdminSchedule(ctx, TrainingType.BACK);
    await ctx.answerCbQuery();
  });

  bot.action(AdminButtons.ADMIN_CALORIES, async ctx => {
    await handleAdminSchedule(ctx, TrainingType.CALORIES);
    await ctx.answerCbQuery();
  });
};
