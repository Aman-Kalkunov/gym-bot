import { Telegraf, Context } from 'telegraf';

import { handleCrossfit } from './handleCrossfit';
import { scheduleButtons } from '../../keyboards/scheduleButtons';
import { BotCommand, ScheduleButtons } from '../../../types/types';

export const setupScheduleHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.SCHEDULE, async ctx => {
    await ctx.reply('Выберите тип тренировки', scheduleButtons);
  });

  bot.action(ScheduleButtons.CROSS_FIT, async ctx => {
    await handleCrossfit(ctx, 'edit');
    await ctx.answerCbQuery();
  });

  // Заглушка для Weightlifting
  bot.action(ScheduleButtons.WEIGHTLIFTING, async ctx => {
    await ctx.reply('Раздел для тяжёлой атлетики в разработке.');
    await ctx.answerCbQuery();
  });
};
