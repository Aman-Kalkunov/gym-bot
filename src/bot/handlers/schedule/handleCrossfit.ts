import { Context, Markup } from 'telegraf';

import { prisma } from '../../../db';
import {
  AdminButtonsText,
  CrossfitTypes,
  CrossfitTypesText,
  ITraining,
  MessageType,
} from '../../../types/types';
import {
  formatDate,
  getFormatDate,
  getPlacesWord,
  getSlotWord,
  getUserName,
} from '../../helpers/helpers';

export const handleCrossfit = async (ctx: Context, messageType: MessageType) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { date: { gte: formatDate(yesterday) } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  if (!trainings?.length) {
    await ctx.editMessageReplyMarkup(undefined);
    try {
      await ctx.editMessageText('Нет доступных тренировок на ближайшие дни.');
    } catch {
      await ctx.reply('Нет доступных тренировок на ближайшие дни.');
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
      `${CrossfitTypes.CROSS_FIT_DAY}_${slots[0].dayOfWeek}`,
    ),
  ]);

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, CrossfitTypes.CROSS_FIT_DAY_BACK)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  if (messageType === 'reply') {
    await ctx.reply('Выберите день', Markup.inlineKeyboard(buttons));
  } else {
    try {
      await ctx.editMessageText('Выберите день', Markup.inlineKeyboard(buttons));
    } catch {
      await ctx.reply('Выберите день', Markup.inlineKeyboard(buttons));
    }
  }
};

export const handleCrossfitDay = async (
  ctx: Context,
  dayOfWeek: number,
  messageType: MessageType,
) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  if (!trainings?.length) {
    try {
      await ctx.editMessageText('Нет доступных тренировок на этот день.');
      await handleCrossfit(ctx, 'reply');
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply('Нет доступных тренировок на этот день.');
      await handleCrossfit(ctx, 'reply');
    }
    return;
  }

  const buttons = trainings.map(slot => {
    const free = slot.capacity - slot.booked;

    return [
      Markup.button.callback(
        `${slot.time} ${free !== 0 ? `(${free} ${getPlacesWord(free)})` : '(Нет мест)'} `,
        free !== 0 ? `${CrossfitTypes.CROSS_FIT_TIME}_${slot.id}` : 'disabled',
      ),
    ];
  });

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, CrossfitTypes.CROSS_FIT_TIME_BACK)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  if (messageType === 'reply') {
    await ctx.reply('Выберите время', Markup.inlineKeyboard(buttons));
  } else {
    try {
      await ctx.editMessageText('Выберите время', Markup.inlineKeyboard(buttons));
    } catch {
      await ctx.reply('Выберите время', Markup.inlineKeyboard(buttons));
    }
  }
};

export const handleCrossfitTime = async (
  ctx: Context,
  trainingId: number,
  adminId: string,
  devId: string,
) => {
  const user = ctx.from;
  if (!user) {
    return;
  }

  const userName = getUserName(user);

  const training: ITraining | null = await prisma.crossfitTraining.findUnique({
    where: { id: trainingId },
  });

  if (!training) {
    await ctx.reply('Слот не найден');
    return;
  }

  const free = training.capacity - training.booked;

  if (free <= 0) {
    try {
      await ctx.editMessageText('Мест нет');
      await handleCrossfitDay(ctx, training.dayOfWeek, 'reply');
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply('Мест нет');
      await handleCrossfitDay(ctx, training.dayOfWeek, 'reply');
    }

    return;
  }

  const userBooking = await prisma.booking.findFirst({
    where: { userId: user.id, training: { date: training.date } },
  });

  if (!!userBooking) {
    try {
      await ctx.editMessageText(
        `${'Вы уже записаны на тренировку в этот день'} (${getFormatDate(training.date)})`,
      );
      await handleCrossfit(ctx, 'reply');
    } catch (e) {
      console.error('Ошибка при обновлении клавиатуры:', e);
      await ctx.reply('Вы уже записаны на тренировку в этот день');
      await handleCrossfit(ctx, 'reply');
    }
    return;
  }

  await prisma.booking.create({
    data: {
      userId: user.id,
      userName: `${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}`,
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
    `Вы записаны на CrossFit: ${training.time} (${getFormatDate(training.date)})`,
  );

  try {
    await ctx.telegram.sendMessage(
      adminId,
      `${userName} записался на CrossFit: ${training.time} (${getFormatDate(training.date)})`,
    );
    await ctx.telegram.sendMessage(
      devId,
      `${userName} записался на CrossFit: ${training.time} (${getFormatDate(training.date)})`,
    );
  } catch {}
};
