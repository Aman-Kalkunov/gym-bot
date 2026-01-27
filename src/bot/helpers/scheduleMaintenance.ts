import cron from 'node-cron';

import { TrainingType } from '@prisma/client';
import { prisma } from '../../db';
import {
  CROSS_FIT_SCHEDULE,
  HEALTHY_BACK_SCHEDULE,
  ITraining,
  BACK_CAPACITY as backCapacity,
  CAPACITY as capacity,
} from '../../types/types';
import { formatDate } from './helpers';

const SCHEDULE_BY_TYPE: Record<TrainingType, Record<number, string[]>> = {
  [TrainingType.CROSSFIT]: CROSS_FIT_SCHEDULE,
  [TrainingType.BACK]: HEALTHY_BACK_SCHEDULE,
};

export const setupAutoUpdate = () => {
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

    const dow = nextWeekDay.getDay();

    for (const type of Object.values(TrainingType)) {
      const schedule = SCHEDULE_BY_TYPE[type];
      const times = schedule?.[dow];

      if (!times || times.length === 0) {
        continue; // нет тренировок этого типа в этот день — и ладно
      }

      // Проверяем, есть ли уже тренировки этого типа
      const existing: ITraining | null = await prisma.training.findFirst({
        where: {
          date: nextWeekDayStr,
          type,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.$transaction(
        times.map(time =>
          prisma.training.create({
            data: {
              type,
              date: nextWeekDayStr,
              dayOfWeek: dow,
              time,
              capacity: type === 'CROSSFIT' ? capacity : backCapacity,
            },
          }),
        ),
      );

      console.log(`Добавлены тренировки ${type} на ${nextWeekDayStr}`);
    }
  });
};
