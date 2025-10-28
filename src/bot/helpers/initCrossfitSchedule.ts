import { prisma } from '../../db';
import { CROSS_FIT_SCHEDULE } from '../../types/days';
import { CAPACITY as capacity } from '../../constants/crossfit/crossfitConstants';

export const initCrossfitSchedule = async () => {
  const count: number = await prisma.crossfitTraining.count();

  if (count > 0) {
    return;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dayOfWeek = date.getDay();
    const times = CROSS_FIT_SCHEDULE[dayOfWeek];

    times.map(async time => {
      await prisma.crossfitTraining.create({
        data: { date, dayOfWeek, time, capacity },
      });
    });
  }
};
