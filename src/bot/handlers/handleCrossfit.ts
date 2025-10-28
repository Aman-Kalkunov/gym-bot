import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { getSlotWord } from '../helpers/helpers';
import { prisma } from '../../db';
import { messageText } from '../../constants/text/text';
import { ISlot, ITraining } from '../../types/training';
import { crossfitTypes } from '../../types/crossfitTypes';

export const handleCrossfit = async (ctx: Context) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { date: { gte: tomorrow } },
    orderBy: { date: 'asc' },
  });

  if (!trainings?.length) {
    await ctx.reply(messageText.noWorkoutsAvailable);
    return;
  }

  const days = trainings.reduce((acc: Record<string, ISlot[]>, training) => {
    const dateKey = format(new Date(training.date), 'EEEE, d MMMM', { locale: ru });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({ id: training.id, time: training.time });
    return acc;
  }, {});

  const buttons = Object.entries(days).map(([day, slots]) => [
    Markup.button.callback(
      `${day} (${slots.length} ${getSlotWord(slots.length)})`,
      `${crossfitTypes.CROSS_FIT_DAY}_${Object.keys(days).indexOf(day)}`,
    ),
  ]);

  await ctx.reply(messageText.selectDay, Markup.inlineKeyboard(buttons));
};
