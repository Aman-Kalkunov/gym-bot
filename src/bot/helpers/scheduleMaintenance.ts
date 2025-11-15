import cron from 'node-cron';

import { prisma } from '../../db';
import { CROSS_FIT_SCHEDULE, ITraining, CAPACITY as capacity } from '../../types/types';
import { formatDate } from './helpers';

export const setupCrossfitAutoUpdate = () => {
  cron.schedule('0 19 * * *', async () => {
    const today = new Date();
    const todayStr = formatDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    // Удаляем ВСЕ старые тренировки и брони в транзакции
    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: {
          training: {
            date: { lt: todayStr },
          },
        },
      }),
      prisma.crossfitTraining.deleteMany({
        where: { date: { lt: tomorrowStr } },
      }),
    ]);

    // Проверяем, есть ли уже тренировки на завтра
    const existing: ITraining[] | null = await prisma.crossfitTraining.findMany({
      where: { date: tomorrowStr },
    });

    if (existing?.length > 0) {
      console.log(`Тренировки на ${tomorrowStr} уже существуют`);
      return;
    }

    const dow = tomorrow.getDay();
    const times = CROSS_FIT_SCHEDULE[dow];

    if (!times || times.length === 0) {
      console.warn(`Нет расписания для дня недели ${dow}`);
      return;
    }

    // Создаём новые тренировки последовательно или через Promise.all
    await prisma.$transaction(
      times.map(time =>
        prisma.crossfitTraining.create({
          data: {
            date: tomorrowStr,
            dayOfWeek: dow,
            time,
            capacity,
          },
        }),
      ),
    );

    console.log(`Добавлены тренировки на ${tomorrowStr}`);
  });
};
