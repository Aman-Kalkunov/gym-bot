import { Context } from 'telegraf';
import { Markup } from 'telegraf';

import { getFormatDate, getPlacesWord, getSlotWord } from '../helpers/helpers';
import { prisma } from '../../db';
import { messageText } from '../../constants/text/text';
import { ITraining } from '../../types/training';
import { crossfitTypes } from '../../types/crossfitTypes';

export const handleCrossfit = async (ctx: Context, reply?: boolean) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { date: { gte: yesterday } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  if (!trainings?.length) {
    await ctx.editMessageReplyMarkup(undefined);
    try {
      await ctx.editMessageText(messageText.noWorkoutsAvailable);
    } catch {
      await ctx.reply(messageText.noWorkoutsAvailable);
    }
    return;
  }

  const daysMap = trainings?.reduce(
    (acc, training) => {
      const dateKey = getFormatDate(training.date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(training);
      return acc;
    },
    {} as Record<string, ITraining[]>,
  );

  const buttons = Object.entries(daysMap).map(([day, slots]) => [
    Markup.button.callback(
      `${day} (${slots.length} ${getSlotWord(slots.length)})`,
      `${crossfitTypes.CROSS_FIT_DAY}_${slots[0].dayOfWeek}`,
    ),
  ]);

  buttons.push([Markup.button.callback('Назад', crossfitTypes.CROSS_FIT_DAY_BACK)]);
  reply
    ? await ctx.reply(messageText.selectDay, Markup.inlineKeyboard(buttons))
    : await ctx.editMessageText(messageText.selectDay, Markup.inlineKeyboard(buttons));
};

export const handleCrossfitDay = async (ctx: Context, dayOfWeek: number, reply?: boolean) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  if (!trainings?.length) {
    try {
      await ctx.editMessageText(messageText.noDayAvailable);
      await handleCrossfit(ctx, true);
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply(messageText.noDayAvailable);
      await handleCrossfit(ctx, true);
    }
    return;
  }

  const buttons = trainings.map(slot => {
    const free = slot.capacity - slot.booked;

    return [
      Markup.button.callback(
        `${slot.time} ${free !== 0 ? `(${free} ${getPlacesWord(free)})` : '(Нет мест)'} `,
        free !== 0 ? `${crossfitTypes.CROSS_FIT_TIME}_${slot.id}` : 'disabled',
      ),
    ];
  });

  buttons.push([Markup.button.callback('Назад', crossfitTypes.CROSS_FIT_TIME_BACK)]);
  reply
    ? await ctx.reply(messageText.selectTime, Markup.inlineKeyboard(buttons))
    : await ctx.editMessageText(messageText.selectTime, Markup.inlineKeyboard(buttons));
};

export const handleCrossfitTime = async (ctx: Context, trainingId: number) => {
  const user = ctx.from;
  if (!user) {
    return;
  }

  const training: ITraining | null = await prisma.crossfitTraining.findUnique({
    where: { id: trainingId },
  });

  if (!training) {
    await ctx.reply(messageText.slotUndefined);
    return;
  }

  const free = training.capacity - training.booked;

  if (free <= 0) {
    try {
      await ctx.editMessageText(messageText.full);
      await handleCrossfitDay(ctx, training.dayOfWeek, true);
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply(messageText.full);
      await handleCrossfitDay(ctx, training.dayOfWeek, true);
    }

    return;
  }

  const userBooking = await prisma.booking.findFirst({
    where: { userId: user.id, training: { date: training.date } },
  });

  if (!!userBooking) {
    try {
      await ctx.editMessageText(`${messageText.alreadyBooked} (${getFormatDate(training.date)})`);
      await handleCrossfit(ctx, true);
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply(messageText.alreadyBooked);
      await handleCrossfit(ctx, true);
    }
    return;
  }

  await prisma.booking.create({
    data: {
      userId: user.id,
      userName: user.first_name,
      userNick: user.username ? `@${user.username}` : null,
      trainingId,
    },
  });

  await prisma.crossfitTraining.update({
    where: { id: trainingId },
    data: { booked: { increment: 1 } },
  });

  await ctx.editMessageReplyMarkup(undefined);
  await ctx.editMessageText(
    `${messageText.createBooked} ${training.time} (${getFormatDate(training.date)})`,
  );
};
