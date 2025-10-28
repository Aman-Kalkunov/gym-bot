import cron from 'node-cron';
import { prisma } from '../../db';
import { CROSS_FIT_SCHEDULE } from '../../types/days';
import { ITraining } from '../../types/training';
import { CAPACITY as capacity } from '../../constants/crossfit/crossfitConstants';

export const setupCrossfitAutoUpdate = () => {
  cron.schedule('0 22 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.crossfitTraining.deleteMany({
      where: { date: { lt: tomorrow } },
    });

    const lastDateObj: ITraining | null = await prisma.crossfitTraining.findFirst({
      orderBy: { date: 'desc' },
    });

    let nextDate = new Date();
    nextDate.setHours(0, 0, 0, 0);
    if (lastDateObj) {
      nextDate = new Date(lastDateObj.date);
      nextDate.setDate(nextDate.getDate() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const dayOfWeek = nextDate.getDay();
    const times = CROSS_FIT_SCHEDULE[dayOfWeek];

    times.map(async time => {
      await prisma.crossfitTraining.create({
        data: { date: nextDate, dayOfWeek, time, capacity },
      });
    });
  });
};
