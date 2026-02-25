import { Context, Markup } from 'telegraf';

import { TrainingType } from '@prisma/client';
import { prisma } from '../../../db';
import {
  AdminButtonsText,
  CaloriesTypes,
  CaloriesTypesText,
  ITraining,
  MessageType,
} from '../../../types/types';
import {
  formatDate,
  getFormatDate,
  getPlacesWord,
  getSlotWord,
  getUserName,
  safeEditOrReply,
} from '../../helpers/helpers';

export const handleCalories = async (ctx: Context, messageType: MessageType) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const trainings: ITraining[] | null = await prisma.training.findMany({
    where: { date: { gte: formatDate(yesterday) } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  if (!trainings?.length) {
    await safeEditOrReply(ctx, 'Нет доступных тренировок на ближайшие дни.');
    return;
  }

  const daysMap = trainings
    ?.filter(t => t.type === TrainingType.CALORIES)
    .reduce(
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
      `${CaloriesTypes.CALORIES_DAY}_${slots[0].dayOfWeek}`,
    ),
  ]);

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, CaloriesTypes.CALORIES_DAY_BACK)],
    [Markup.button.callback(CaloriesTypesText.CLOSE, CaloriesTypes.CLOSE)],
  );

  if (messageType === 'reply') {
    await ctx.reply('Выберите день', Markup.inlineKeyboard(buttons));
  } else {
    await safeEditOrReply(ctx, 'Выберите день', Markup.inlineKeyboard(buttons));
  }
};

export const handleCaloriesDay = async (
  ctx: Context,
  dayOfWeek: number,
  messageType: MessageType,
) => {
  const trainings: ITraining[] | null = await prisma.training.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  if (!trainings?.length) {
    await safeEditOrReply(ctx, 'Нет доступных тренировок на этот день.');
    await handleCalories(ctx, 'reply');
    return;
  }

  const buttons = trainings
    .filter(t => t.type === TrainingType.CALORIES)
    .map(slot => {
      const free = slot.capacity - slot.booked;

      return [
        Markup.button.callback(
          `${slot.time} ${free > 0 ? `(${free} ${getPlacesWord(free)})` : '(Нет мест)'}`,
          free > 0 ? `${CaloriesTypes.CALORIES_TIME}_${slot.id}` : 'NO_SLOTS',
        ),
      ];
    });

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, CaloriesTypes.CALORIES_TIME_BACK)],
    [Markup.button.callback(CaloriesTypesText.CLOSE, CaloriesTypes.CLOSE)],
  );

  if (messageType === 'reply') {
    await ctx.reply('Выберите время', Markup.inlineKeyboard(buttons));
  } else {
    await safeEditOrReply(ctx, 'Выберите время', Markup.inlineKeyboard(buttons));
  }
};

export const handleCaloriesTime = async (ctx: Context, trainingId: number, adminId: string) => {
  const user = ctx.from;
  if (!user) {
    return;
  }

  const userName = getUserName(user);

  const training: ITraining | null = await prisma.training.findUnique({
    where: { id: trainingId },
  });

  if (!training) {
    await safeEditOrReply(ctx, 'Слот не найден.');
    return;
  }

  const free = training.capacity - training.booked;

  if (free <= 0) {
    await safeEditOrReply(ctx, 'Мест нет.');
    await handleCaloriesDay(ctx, training.dayOfWeek, 'reply');
    return;
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: user.id, training: { date: training.date } },
  });

  if (existingBooking) {
    await safeEditOrReply(ctx, `Вы уже записаны на тренировку (${getFormatDate(training.date)})`);
    await handleCalories(ctx, 'reply');
    return;
  }

  try {
    await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId: user.id,
          userName: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
          userNick: user.username ? `@${user.username}` : null,
          trainingId,
        },
      }),
    ]);
  } catch (err) {
    console.error('Ошибка транзакции при записи:', err);
    await safeEditOrReply(ctx, 'Не удалось записаться. Попробуйте позже.');
    return;
  }

  await safeEditOrReply(
    ctx,
    `Вы записаны на тренировку Kalorie Killa: ${training.time} (${getFormatDate(training.date)})`,
  );

  const msg = `${userName} записался(-ась) на тренировку Kalorie Killa: ${training.time} (${getFormatDate(
    training.date,
  )})`;

  try {
    await ctx.telegram.sendMessage(adminId, msg);
  } catch (err) {
    console.error('Ошибка отправки уведомления администратору:', err);
  }
};
