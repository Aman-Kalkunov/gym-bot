import { TrainingType } from '@prisma/client';
import { Context, Markup } from 'telegraf';
import { safeEditOrReply } from '../../../bot/helpers/helpers';
import { prisma } from '../../../db';
import {
  AdminButtons,
  AdminButtonsText,
  CrossfitTypes,
  CrossfitTypesText,
  ITraining,
} from '../../../types/types';

export const handleAdminReserve = async (ctx: Context, dayOfWeek: number, type: TrainingType) => {
  const trainingsOfDay: ITraining[] | null = await prisma.training.findMany({
    where: { dayOfWeek, type },
  });
  if (!trainingsOfDay) {
    return;
  }
  const existingTimes = trainingsOfDay.map(training => ({ time: training.time, id: training.id }));

  if (!existingTimes?.length) {
    await ctx.answerCbQuery('Нет тренировок на этот день', { show_alert: true });
    return;
  }

  const buttons = existingTimes.reduce(
    (acc, { time, id }, i) => {
      const btn = Markup.button.callback(time, `${AdminButtons.ADMIN_TIME_RESERVE}_${id}`);
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(btn);
      return acc;
    },
    [] as ReturnType<typeof Markup.button.callback>[][],
  );

  buttons.push(
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_BACK,
        `${AdminButtons.ADMIN_DAY}_${dayOfWeek}_${type}`,
      ),
    ],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, 'Выберите время для добавления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminReserveTime = async (ctx: Context, id: number) => {
  const training: ITraining | null = await prisma.training.findUnique({
    where: { id },
  });
  if (!training) {
    return;
  }
  const places = Array.from({ length: training.capacity - training.booked }, (_, i) => i + 1);

  if (!places) {
    await ctx.answerCbQuery('Все места заняты', { show_alert: true });
    return;
  }
  const buttons = places.reduce(
    (acc, place, i) => {
      const btn = Markup.button.callback(
        `${place}`,
        `${AdminButtons.ADMIN_PLACE_RESERVE}_${place}_${training.id}`,
      );
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(btn);
      return acc;
    },
    [] as ReturnType<typeof Markup.button.callback>[][],
  );

  buttons.push(
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_BACK,
        `${AdminButtons.ADMIN_RESERVE}_${training.dayOfWeek}_${training.type}`,
      ),
    ],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, 'Выберите количество мест:', Markup.inlineKeyboard(buttons));
};

export const handleAdminReservePlace = async (ctx: Context, place: number, id: number) => {
  try {
    const training = await prisma.training.findUnique({
      where: { id },
      select: {
        capacity: true,
        booked: true,
      },
    });

    if (!training) {
      await ctx.answerCbQuery('Тренировка не найдена', { show_alert: true });
      return;
    }

    const available = training.capacity - training.booked;

    if (available <= 0) {
      await ctx.answerCbQuery('Свободных мест нет', { show_alert: true });
      return;
    }

    if (place > available) {
      await ctx.answerCbQuery(`Недостаточно мест. Доступно: ${available}`, { show_alert: true });
      return;
    }

    await prisma.booking.createMany({
      data: Array.from({ length: place }).map(() => ({
        trainingId: id,
        userId: 0,
        userName: 'Admin',
        userNick: null,
      })),
    });

    await ctx.answerCbQuery(`Забронировано мест: ${place}`, { show_alert: true });
  } catch (err) {
    console.error('Ошибка при бронировании:', err);
  }
};
