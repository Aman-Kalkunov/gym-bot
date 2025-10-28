import { Telegraf, Context } from 'telegraf';

import { handleCrossfit } from './handleCrossfit';
import { ScheduleButtons } from '../../types/buttonTypes';
import { scheduleButtons } from '../keyboards/scheduleButtons';
import { messageText } from '../../constants/text/text';
import { BotCommand } from '../../types/botCommands';

export const setupScheduleHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.SCHEDULE, async ctx => {
    await ctx.reply(messageText.selectWorkoutType, scheduleButtons);
  });

  bot.action(ScheduleButtons.CROSS_FIT, async ctx => {
    try {
      await ctx.editMessageReplyMarkup(undefined);
      await handleCrossfit(ctx);
    } catch {
      await handleCrossfit(ctx);
    }
  });

  // Заглушка для Weightlifting
  bot.action(ScheduleButtons.WEIGHTLIFTING, async ctx => {
    await ctx.reply('Раздел для тяжёлой атлетики в разработке.');
  });
};
