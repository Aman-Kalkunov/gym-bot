import { Context } from 'telegraf';

import { getFormatDate } from '../../../bot/helpers/helpers';
import { prisma } from '../../../db';
import { ITraining } from '../../../types/types';

export const handleAdminBookings = async (ctx: Context, dayOfWeek: number) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { users: { some: {} }, dayOfWeek },
    include: { users: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  if (!trainings?.length) {
    await ctx.reply('Нет записей');
    return;
  }

  const groupedByDate = trainings.reduce(
    (acc, training) => {
      const dateKey = training.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(training);
      return acc;
    },
    {} as Record<string, typeof trainings>,
  );

  for (const [dateKey, dayTrainings] of Object.entries(groupedByDate)) {
    const dateLabel = getFormatDate(dateKey);

    let message = `<b>${dateLabel}</b>\n\n`;

    dayTrainings.forEach(training => {
      message += `<b>${training.time}</b>\n`;
      if (!training.users?.length) {
        message += '— никто не записался\n\n';
        return;
      }

      const list = training.users
        .map(
          (user, index) =>
            `${index + 1}. ${user.userName || 'Без имени'}${user.userNick ? ` (${user.userNick})` : ''}`,
        )
        .join('\n');

      message += `${list}\n\n`;
    });

    await ctx.reply(message.trim(), { parse_mode: 'HTML' });
  }
};
