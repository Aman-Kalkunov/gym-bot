import { Markup } from 'telegraf';
import { Context } from 'telegraf';

import { prisma } from '../../db';
import { getFormatDate } from '../helpers/helpers';
import { crossfitTypes } from '../../types/crossfitTypes';
import { messageText } from '../../constants/text/text';
import { IBooking, MessageType } from '../../types/training';

export const handleMyBookings = async (ctx: Context, messageType: MessageType) => {
  const user = ctx.from;
  if (!user) {
    return;
  }

  const bookings: IBooking[] | null = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { training: true },
    orderBy: { training: { date: 'asc' } },
  });

  if (!bookings?.length) {
    await ctx.reply(messageText.noBooking);
    return;
  }

  const buttons = bookings.map(b => {
    const { id, training } = b;
    const dateStr = getFormatDate(training.date);
    return [
      Markup.button.callback(
        `${dateStr} — ${training.time}`,
        `${crossfitTypes.CROSS_FIT_BOOKING}_${id}`,
      ),
    ];
  });

  if (messageType === 'reply') {
    await ctx.reply(messageText.yourBookings, Markup.inlineKeyboard(buttons));
  } else {
    try {
      await ctx.editMessageText(messageText.yourBookings, Markup.inlineKeyboard(buttons));
    } catch {
      ctx.reply(messageText.yourBookings, Markup.inlineKeyboard(buttons));
    }
  }
};

export const handleBookingInfo = async (ctx: Context, bookingId: number) => {
  const booking: IBooking | null = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { training: true },
  });

  if (!booking) {
    try {
      await ctx.editMessageText(messageText.bookingNotFund);
      await handleMyBookings(ctx, 'reply');
    } catch (e) {
      console.error(messageText.keyboardError, e);
      await ctx.reply(messageText.bookingNotFund);
      await handleMyBookings(ctx, 'reply');
    }
    return;
  }

  const date = getFormatDate(booking.training.date);
  const text = `${messageText.youSureDelete}\n\n${booking.training.time} (${date})`;

  await ctx.editMessageText(
    text,
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          messageText.delete,
          `${crossfitTypes.CROSS_FIT_CANCEL}_${bookingId}`,
        ),
      ],
      [Markup.button.callback(messageText.back, crossfitTypes.CROSS_FIT_MY_BACK)],
    ]),
  );
};

export const handleCancelBooking = async (ctx: Context, bookingId: number) => {
  const booking: IBooking | null = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { training: true },
  });

  if (!booking) {
    try {
      await ctx.editMessageText(messageText.bookingNotFund);
      await handleMyBookings(ctx, 'reply');
    } catch (e) {
      console.error(messageText.keyboardError, e);
      await ctx.reply(messageText.bookingNotFund);
      await handleMyBookings(ctx, 'reply');
    }
    return;
  }

  await prisma.booking.delete({ where: { id: bookingId } });

  await prisma.crossfitTraining.update({
    where: { id: booking.trainingId },
    data: { booked: { decrement: 1 } },
  });

  await ctx.editMessageText(
    `${messageText.bookingCanceled} ${booking.training.time} (${getFormatDate(booking.training.date)}).`,
  );
};
