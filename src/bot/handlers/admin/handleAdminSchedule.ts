import { Context, Markup } from 'telegraf';

import { formatDate, getDayName, getFormatDate } from '../../../bot/helpers/helpers';
import { prisma } from '../../../db';
import {
  AdminButtons,
  AdminButtonsText,
  CAPACITY as capacity,
  CROSS_FIT_ALL_TIME,
  crossfitTypes,
  crossfitTypesText,
  ITraining,
} from '../../../types/types';

export const handleAdminSchedule = async (ctx: Context) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    orderBy: { date: 'asc' },
  });

  if (!trainings) {
    return;
  }

  const days = trainings.reduce((acc: Record<string, number>, training) => {
    const key = getFormatDate(training.date);
    if (!acc[key]) {
      acc[key] = training.dayOfWeek;
    }
    return acc;
  }, {});

  const buttons = Object.entries(days).map(([day, id]) => [
    Markup.button.callback(day, `${AdminButtons.ADMIN_DAY}_${id}`),
  ]);

  buttons.push([
    Markup.button.callback(AdminButtonsText.ADMIN_ADD_DAY, AdminButtons.ADMIN_ADD_DAY),
  ]);

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, AdminButtons.ADMIN_BACK)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  );

  await ctx.editMessageText(AdminButtonsText.ADMIN_SCHEDULE, Markup.inlineKeyboard(buttons));
};

export const handleAdminScheduleDay = async (ctx: Context, dayOfWeek: number) => {
  const trainingsOfDay: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });
  if (!trainingsOfDay) {
    return;
  }

  const dayName = getFormatDate(trainingsOfDay[0].date);
  let message = `<b>${dayName}</b>\n\n`;

  if (trainingsOfDay.length === 0) {
    message += 'Нет запланированных тренировок.';
  } else {
    const list = trainingsOfDay.map(t => `${t.time} — ${t.booked}/${t.capacity} мест`).join('\n');
    message += list;
  }

  const buttons = [
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_ADD_TIME,
        `${AdminButtons.ADMIN_ADD_TIME}_${dayOfWeek}`,
      ),
    ],
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_REMOVE_TIME,
        `${AdminButtons.ADMIN_REMOVE_TIME}_${dayOfWeek}`,
      ),
    ],
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_REMOVE_DAY,
        `${AdminButtons.ADMIN_REMOVE_DAY}_${dayOfWeek}`,
      ),
    ],
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, AdminButtons.ADMIN_SCHEDULE)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  ];

  await ctx.editMessageText(message, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(buttons),
  });
};

export const handleAdminAddDay = async (ctx: Context) => {
  const existingDays: ITraining[] | null = await prisma.crossfitTraining.findMany();
  if (!existingDays) {
    return;
  }
  const existingIds = new Set(existingDays.map(t => t.dayOfWeek));

  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const availableDays = allDays.filter(d => !existingIds.has(d));

  if (!availableDays.length) {
    await ctx.answerCbQuery('Все дни уже добавлены', { show_alert: true });
    return;
  }

  const buttons = availableDays.map(day => [
    Markup.button.callback(getDayName(day), `${AdminButtons.ADMIN_SELECT_DAY}_${day}`),
  ]);
  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, AdminButtons.ADMIN_SCHEDULE)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  );

  await ctx.editMessageText('Выберите день для добавления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminAddTime = async (ctx: Context, dayOfWeek: number) => {
  const times = CROSS_FIT_ALL_TIME;

  const trainingsOfDay: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
  });
  if (!trainingsOfDay) {
    return;
  }
  const existingTimes = trainingsOfDay.map(training => training.time);

  const available = times.filter(time => !existingTimes?.includes(time));

  const buttons = available.map(time => [
    Markup.button.callback(time, `${AdminButtons.ADMIN_SELECT_ADD_TIME}_${dayOfWeek}_${time}`),
  ]);
  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, `${AdminButtons.ADMIN_DAY}_${dayOfWeek}`)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  );

  await ctx.editMessageText('Выберите время для добавления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminRemoveTime = async (ctx: Context, dayOfWeek: number) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  if (!trainings) {
    return;
  }

  const buttons = trainings.map(t => [
    Markup.button.callback(`${t.time}`, `${AdminButtons.ADMIN_SELECT_REMOVE_TIME}_${t.id}`),
  ]);
  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, `${AdminButtons.ADMIN_DAY}_${dayOfWeek}`)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  );

  await ctx.editMessageText('Выберите время для удаления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminRemoveDay = async (ctx: Context, dayOfWeek: number) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    include: { users: true },
  });

  if (!trainings?.length) {
    return;
  }
  trainings.forEach(training => {
    training.users?.forEach(async user => {
      try {
        await ctx.telegram.sendMessage(
          user.userId,
          `Отменена тренировка на ${training.time} (${getFormatDate(training.date)})`,
        );
      } catch {}
    });
  });

  await prisma.crossfitTraining.deleteMany({ where: { dayOfWeek } });
  await ctx.editMessageText('День удален');
};

export const addTrainingTime = async (ctx: Context, dayOfWeek: number, time: string) => {
  const today = new Date();
  today.setDate(today.getDate() + ((dayOfWeek - today.getDay() + 7) % 7));

  const existing = await prisma.crossfitTraining.findFirst({
    where: { dayOfWeek, time },
  });

  if (existing) {
    await ctx.answerCbQuery('Такое время уже добавлено');
    return;
  }

  await prisma.crossfitTraining.create({
    data: { date: formatDate(today), dayOfWeek, time, capacity },
  });

  await ctx.answerCbQuery(`Добавлено время ${time} (${getFormatDate(today.toISOString())})`);
};

export const removeTrainingTime = async (ctx: Context, trainingId: number) => {
  const training: ITraining | null = await prisma.crossfitTraining.findFirst({
    where: { id: trainingId },
    include: { users: true },
  });

  if (!training) {
    await ctx.answerCbQuery('Тренировка уже удалена');
    return;
  }

  training.users?.forEach(async user => {
    try {
      await ctx.telegram.sendMessage(
        user.userId,
        `Отменена тренировка на ${training.time} (${getFormatDate(training.date)})`,
      );
    } catch {}
  });

  await prisma.crossfitTraining.delete({ where: { id: trainingId } });

  await ctx.answerCbQuery('Тренировка удалена');
};

export const handleAdminSelectTime = async (ctx: Context, dayOfWeek: number) => {
  const times = CROSS_FIT_ALL_TIME;

  const buttons = times.map(time => [
    Markup.button.callback(time, `${AdminButtons.ADMIN_CONFIRM_ADD}_${dayOfWeek}_${time}`),
  ]);

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, AdminButtons.ADMIN_SCHEDULE)],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  );

  await ctx.editMessageText(
    `Выберите время для добавления (${getDayName(dayOfWeek)}):`,
    Markup.inlineKeyboard(buttons),
  );
};

export const handleAdminConfirmAdd = async (ctx: Context, dayOfWeek: number, time: string) => {
  const date = new Date();
  const diff = (dayOfWeek + 7 - date.getDay()) % 7;
  date.setDate(date.getDate() + diff);

  const existing = await prisma.crossfitTraining.findFirst({
    where: { dayOfWeek, time },
  });

  if (existing) {
    await ctx.answerCbQuery('Такое время уже добавлено');
    return;
  }

  await prisma.crossfitTraining.create({
    data: {
      date: formatDate(date),
      dayOfWeek,
      time,
      capacity,
    },
  });

  await ctx.answerCbQuery(`Добавлено время ${time} (${getDayName(dayOfWeek)})`);
};
