import { TrainingType } from '@prisma/client';
import { prisma } from '../../db';

import { CROSS_FIT_SCHEDULE, CAPACITY as capacity } from '../../types/types';
import { formatDate } from './helpers';

export const initCrossfitSchedule = async () => {
  const count: number = await prisma.training.count();

  if (count > 0) {
    return;
  }

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() + i);
    const dayOfWeek = dateObj.getDay();

    const dateStr = formatDate(dateObj);
    const times = CROSS_FIT_SCHEDULE[dayOfWeek];

    for (const time of times) {
      await prisma.training.create({
        data: {
          type: TrainingType.CROSSFIT,
          date: dateStr,
          dayOfWeek,
          time,
          capacity,
        },
      });
    }
  }

  console.log('Расписание инициализировано');
};
