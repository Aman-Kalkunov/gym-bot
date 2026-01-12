import cron from 'node-cron';

import { TrainingType } from '@prisma/client';
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

    const nextWeekDay = new Date(today);
    nextWeekDay.setDate(today.getDate() + 7);
    const nextWeekDayStr = formatDate(nextWeekDay);

    // Удаляем ВСЕ старые тренировки и брони в транзакции
    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: {
          training: {
            date: { lt: todayStr },
          },
        },
      }),
      prisma.training.deleteMany({
        where: { date: { lt: tomorrowStr } },
      }),
    ]);

    // Проверяем, есть ли уже тренировки на одноименный день следующей недели
    const existing: ITraining[] | null = await prisma.training.findMany({
      where: { date: nextWeekDayStr },
    });

    if (existing?.length > 0) {
      console.log(`Тренировки на ${nextWeekDayStr} уже существуют`);
      return;
    }

    const dow = nextWeekDay.getDay();
    const times = CROSS_FIT_SCHEDULE[dow];

    if (!times || times.length === 0) {
      console.warn(`Нет расписания для дня недели ${dow}`);
      return;
    }

    await prisma.$transaction(
      times.map(time =>
        prisma.training.create({
          data: {
            date: nextWeekDayStr,
            dayOfWeek: dow,
            time,
            capacity,
            type: TrainingType.CROSSFIT,
          },
        }),
      ),
    );

    console.log(`Добавлены тренировки на ${nextWeekDayStr}`);
  });
};
