import { Context, Telegraf } from 'telegraf';

import { BotCommand } from '../../../types/types';
import { handleAdminSchedule } from './handleAdminSchedule';

export const setupAdminHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.ADMIN_PANEL, async ctx => {
    await handleAdminSchedule(ctx);
  });
};
