import { Context, Markup } from 'telegraf';

import { prisma } from '../../../db';
import { CrossfitTypes, CrossfitTypesText, IBooking, MessageType } from '../../../types/types';
import { getFormatDate, getUserName, safeEditOrReply } from '../../helpers/helpers';

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
        `${CrossfitTypes.CROSS_FIT_BOOKING}_${id}`,
      ),
    ];
  });

  buttons.push([Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)]);

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
      [Markup.button.callback('Удалить запись', `${CrossfitTypes.CROSS_FIT_CANCEL}_${bookingId}`)],
      [Markup.button.callback('Назад', CrossfitTypes.CROSS_FIT_MY_BACK)],
      [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
    ]),
  );
};

export const handleCancelBooking = async (
  ctx: Context,
  bookingId: number,
  adminId: string,
  devId: string,
) => {
  const user = ctx.from;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { training: true },
  });

  if (!booking) {
    await safeEditOrReply(ctx, 'Запись не найдена или уже удалена.');
    await handleMyBookings(ctx, 'reply');
    return;
  }

  try {
    await prisma.$transaction([
      prisma.booking.delete({ where: { id: bookingId } }),
      prisma.crossfitTraining.update({
        where: { id: booking.trainingId },
        data: {
          booked: { decrement: 1 },
        },
      }),
    ]);
  } catch (err) {
    console.error('Ошибка транзакции при отмене записи:', err);
    await safeEditOrReply(ctx, 'Не удалось отменить запись. Попробуйте позже.');
    return;
  }

  const time = booking.training?.time ?? '';
  const date = getFormatDate(booking.training?.date) ?? '';

  await safeEditOrReply(ctx, `Отменена запись на ${time} (${date}).`);

  await handleMyBookings(ctx, 'reply');

  if (user) {
    const userName = getUserName(user);

    const msg = `${userName} отменил(-а) запись на CrossFit: ${time} (${date})`;

    try {
      await Promise.all([
        ctx.telegram.sendMessage(adminId, msg),
        ctx.telegram.sendMessage(devId, msg),
      ]);
    } catch (err) {
      console.error('Ошибка при отправке уведомления администратору:', err);
    }
  }
};
