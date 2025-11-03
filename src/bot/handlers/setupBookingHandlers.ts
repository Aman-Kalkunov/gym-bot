import { Telegraf, Context } from 'telegraf';

import { BotCommand } from '../../types/botCommands';
import { handleMyBookings } from './handleBooking';

export const setupBookingHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.MY_BOOKINGS, async ctx => {
    await handleMyBookings(ctx, 'reply');
  });
};
