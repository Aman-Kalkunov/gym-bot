import { Markup } from 'telegraf';
import { Context } from 'telegraf';

import { prisma } from '../../../db';
import { getFormatDate } from '../../helpers/helpers';
import { MessageType, IBooking, crossfitTypes, crossfitTypesText } from '../../../types/types';

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
    await ctx.reply('У вас нет активных записей.');
    return;
  }

  const buttons = bookings.map(b => {
    const { id, training } = b;
    const dateStr = getFormatDate(training?.date);
    return [
      Markup.button.callback(
        `${dateStr} — ${training?.time}`,
        `${crossfitTypes.CROSS_FIT_BOOKING}_${id}`,
      ),
    ];
  });

  buttons.push([Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)]);

  if (messageType === 'reply') {
    await ctx.reply('Ваши записи:', Markup.inlineKeyboard(buttons));
  } else {
    try {
      await ctx.editMessageText('Ваши записи:', Markup.inlineKeyboard(buttons));
    } catch {
      ctx.reply('Ваши записи:', Markup.inlineKeyboard(buttons));
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
      await ctx.editMessageText('Запись не найдена или уже удалена.');
      await handleMyBookings(ctx, 'reply');
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply('Запись не найдена или уже удалена.');
      await handleMyBookings(ctx, 'reply');
    }
    return;
  }

  const date = getFormatDate(booking.training?.date);
  const text = `Вы уверены, что хотите удалить запись?\n\n${booking.training?.time} (${date})`;

  await ctx.editMessageText(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback('Удалить запись', `${crossfitTypes.CROSS_FIT_CANCEL}_${bookingId}`)],
      [Markup.button.callback('Назад', crossfitTypes.CROSS_FIT_MY_BACK)],
      [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
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
      await ctx.editMessageText('Запись не найдена или уже удалена.');
      await handleMyBookings(ctx, 'reply');
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply('Запись не найдена или уже удалена.');
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
    `Отменена запись на' ${booking.training?.time} (${getFormatDate(booking.training?.date)}).`,
  );
};
