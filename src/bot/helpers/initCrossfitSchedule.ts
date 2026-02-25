import { TrainingType } from '@prisma/client';
import { prisma } from '../../db';

import { CALORIES_SCHEDULE, CROSS_FIT_SCHEDULE, HEALTHY_BACK_SCHEDULE } from '../../types/types';
import { formatDate, getCapacity } from './helpers';

const SCHEDULE_BY_TYPE: Record<TrainingType, Record<number, string[]>> = {
  [TrainingType.CROSSFIT]: CROSS_FIT_SCHEDULE,
  [TrainingType.BACK]: HEALTHY_BACK_SCHEDULE,
  [TrainingType.CALORIES]: CALORIES_SCHEDULE,
};

export const initSchedule = async () => {
  const trainings = await prisma.training.findMany({
    select: { type: true },
  });

  const existingTypes = new Set(trainings.map(t => t.type));
  const today = new Date();

  for (const type of Object.values(TrainingType)) {
    if (existingTypes.has(type)) {
      continue;
    }

    const schedule = SCHEDULE_BY_TYPE[type];

    if (!schedule) {
      continue;
    }

    const creates = [];

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + i);
      const dayOfWeek = dateObj.getDay();
      const times = schedule[dayOfWeek];

      if (!times || times.length === 0) {
        continue;
      }

      const dateStr = formatDate(dateObj);

      for (const time of times) {
        creates.push(
          prisma.training.create({
            data: {
              type,
              date: dateStr,
              dayOfWeek,
              time,
              capacity: getCapacity(type),
            },
          }),
        );
      }
    }

    if (creates.length > 0) {
      await prisma.$transaction(creates);
      console.log(`Расписание инициализировано для ${type}`);
    }
  }
};
