import { Context, Telegraf } from 'telegraf';

import { BotCommand, ScheduleButtons } from '../../../types/types';
import { scheduleButtons } from '../../keyboards/scheduleButtons';
import { handleCrossfit } from './handleCrossfit';
import { handleWeightlifting } from './handleWeightlifting';

export const setupScheduleHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.SCHEDULE, async ctx => {
    await ctx.reply('Выберите тип тренировки', scheduleButtons);
  });

  bot.action(ScheduleButtons.CROSS_FIT, async ctx => {
    await handleCrossfit(ctx, 'edit');
    await ctx.answerCbQuery();
  });

  bot.action(ScheduleButtons.WEIGHTLIFTING, async ctx => {
    await handleWeightlifting(ctx);
    await ctx.answerCbQuery();
  });
};
