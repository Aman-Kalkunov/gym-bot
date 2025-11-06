import { Context, Telegraf } from 'telegraf';

import { BotCommand } from '../../../types/types';
import { handleMyBookings } from './handleBooking';

export const setupBookingHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.MY_BOOKINGS, async ctx => {
    await handleMyBookings(ctx, 'reply');
  });
};
