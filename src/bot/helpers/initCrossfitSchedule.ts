import { prisma } from '../../db';

import { formatDate } from './helpers';
import { CROSS_FIT_SCHEDULE, CAPACITY as capacity } from '../../types/types';

export const initCrossfitSchedule = async () => {
  const count: number = await prisma.crossfitTraining.count();

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
      await prisma.crossfitTraining.create({
        data: {
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
