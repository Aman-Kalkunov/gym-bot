import { Context, Markup } from 'telegraf';

import { TrainingType } from '@prisma/client';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { prisma } from '../../../db';
import {
  CrossfitTypes,
  CrossfitTypesText,
  HealthyBackTypes,
  IBooking,
  MessageType,
  ScheduleButtonsText,
} from '../../../types/types';
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

  const crossfitRows: InlineKeyboardButton[][] = [];
  const healthyBackRows: InlineKeyboardButton[][] = [];

  bookings.forEach(b => {
    const { id, training } = b;
    if (!training) {
      return;
    }

    const dateStr = getFormatDate(training?.date);

    if (training.type === TrainingType.CROSSFIT) {
      crossfitRows.push([
        Markup.button.callback(
          `${dateStr} — ${training?.time}`,
          `${CrossfitTypes.CROSS_FIT_BOOKING}_${id}`,
        ),
      ]);
    }

    if (training.type === TrainingType.BACK) {
      healthyBackRows.push([
        Markup.button.callback(
          `${dateStr} — ${training.time}`,
          `${HealthyBackTypes.HEALTHY_BACK_BOOKING}_${id}`,
        ),
      ]);
    }
  });

  const buttons: InlineKeyboardButton[][] = [];

  if (crossfitRows.length > 0) {
    buttons.push([Markup.button.callback(ScheduleButtonsText.CROSS_FIT, 'NOOP')]);
    buttons.push(...crossfitRows);
  }

  if (healthyBackRows.length > 0) {
    buttons.push([Markup.button.callback(ScheduleButtonsText.HEALTHY_BACK, 'NOOP')]);
    buttons.push(...healthyBackRows);
  }

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
  const text =
    booking.training?.type === TrainingType.CROSSFIT
      ? `Вы уверены, что хотите удалить запись на CrossFit?\n\n${booking.training?.time} (${date})`
      : `Вы уверены, что хотите удалить запись на тренировку Здоровая спина?\n\n${booking.training?.time} (${date})`;

  await ctx.editMessageText(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback('Удалить запись', `${CrossfitTypes.CROSS_FIT_CANCEL}_${bookingId}`)],
      [Markup.button.callback('Назад', CrossfitTypes.CROSS_FIT_MY_BACK)],
      [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
    ]),
  );
};

export const handleCancelBooking = async (ctx: Context, bookingId: number, adminId: string) => {
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
    await prisma.$transaction([prisma.booking.delete({ where: { id: bookingId } })]);
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

    const msg =
      booking.training?.type === TrainingType.CROSSFIT
        ? `${userName} отменил(-а) запись на CrossFit: ${time} (${date})`
        : `${userName} отменил(-а) запись на тренировку Здоровая спина: ${time} (${date})`;

    try {
      await ctx.telegram.sendMessage(adminId, msg);
    } catch (err) {
      console.error('Ошибка при отправке уведомления администратору:', err);
    }
  }
};
