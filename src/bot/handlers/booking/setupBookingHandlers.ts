import { Telegraf, Context } from 'telegraf';

import { handleMyBookings } from './handleBooking';
import { BotCommand } from '../../../types/types';

export const setupBookingHandlers = (bot: Telegraf<Context>) => {
  bot.command(BotCommand.MY_BOOKINGS, async ctx => {
    await handleMyBookings(ctx, 'reply');
  });
};
