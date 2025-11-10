import cron from 'node-cron';

import { prisma } from '../../db';
import { CROSS_FIT_SCHEDULE, ITraining, CAPACITY as capacity } from '../../types/types';
import { formatDate } from './helpers';

export const setupCrossfitAutoUpdate = () => {
  cron.schedule('0 19 * * *', async () => {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await prisma.booking.deleteMany({
      where: {
        training: {
          date: { lte: formatDate(today) },
        },
      },
    });

    console.log('Старые записи пользователей удалены');

    await prisma.crossfitTraining.deleteMany({
      where: { date: { lt: formatDate(tomorrow) } },
    });

    console.log('Старые тренировки удалены');

    const lastDateObj: ITraining | null = await prisma.crossfitTraining.findFirst({
      orderBy: { date: 'desc' },
    });

    let nextDate = new Date(today);
    if (lastDateObj) {
      nextDate = new Date(lastDateObj.date);
      nextDate.setDate(nextDate.getDate() + 1);
    } else {
      nextDate.setDate(today.getDate() + 1);
    }

    const dayOfWeek = nextDate.getDay();
    const times = CROSS_FIT_SCHEDULE[dayOfWeek];

    if (times?.length) {
      times.map(async time => {
        await prisma.crossfitTraining.create({
          data: { date: formatDate(nextDate), dayOfWeek, time, capacity },
        });
      });
      console.log(`Добавлены тренировки на ${nextDate.toLocaleDateString('ru-RU')}`);
    } else {
      console.warn(`Нет расписания для дня недели ${dayOfWeek}`);
    }
  });
};
