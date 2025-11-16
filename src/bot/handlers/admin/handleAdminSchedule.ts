import { Context, Markup } from 'telegraf';

import {
  buildDayMessage,
  formatDate,
  getDayName,
  getFormatDate,
  safeEditOrReply,
} from '../../../bot/helpers/helpers';
import { prisma } from '../../../db';
import {
  AdminButtons,
  AdminButtonsText,
  CAPACITY as capacity,
  CROSS_FIT_ALL_TIME,
  CrossfitTypes,
  CrossfitTypesText,
  ITraining,
} from '../../../types/types';

export const handleAdminSchedule = async (ctx: Context) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    orderBy: { date: 'asc' },
  });

  if (!trainings?.length) {
    await safeEditOrReply(ctx, 'Расписание пустое.');
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

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_ADD_DAY, AdminButtons.ADMIN_ADD_DAY)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, AdminButtonsText.ADMIN_SCHEDULE, Markup.inlineKeyboard(buttons));
};

export const handleAdminScheduleDay = async (ctx: Context, dayOfWeek: number) => {
  const trainingsOfDay: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  const message = buildDayMessage(trainingsOfDay);

  const buttons = [
    [
      Markup.button.callback(
        AdminButtonsText.ADMIN_BOOKINGS,
        `${AdminButtons.ADMIN_BOOKINGS}_${dayOfWeek}`,
      ),
    ],
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
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
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
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, 'Выберите день для добавления:', Markup.inlineKeyboard(buttons));
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

  if (!available?.length) {
    await ctx.answerCbQuery('Все времена уже добавлены', { show_alert: true });
    return;
  }

  const buttons = available.reduce(
    (acc, time, i) => {
      const btn = Markup.button.callback(
        time,
        `${AdminButtons.ADMIN_SELECT_ADD_TIME}_${dayOfWeek}_${time}`,
      );
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(btn);
      return acc;
    },
    [] as ReturnType<typeof Markup.button.callback>[][],
  );

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, `${AdminButtons.ADMIN_DAY}_${dayOfWeek}`)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, 'Выберите время для добавления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminRemoveTime = async (ctx: Context, dayOfWeek: number) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    orderBy: { time: 'asc' },
  });

  if (!trainings?.length) {
    await safeEditOrReply(ctx, 'Нет тренировок для удаления на этот день.');
    return;
  }

  const buttons = trainings.reduce(
    (acc, time, i) => {
      const btn = Markup.button.callback(
        `${time.time}`,
        `${AdminButtons.ADMIN_SELECT_REMOVE_TIME}_${time.id}`,
      );
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(btn);
      return acc;
    },
    [] as ReturnType<typeof Markup.button.callback>[][],
  );

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, `${AdminButtons.ADMIN_DAY}_${dayOfWeek}`)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
  );

  await safeEditOrReply(ctx, 'Выберите время для удаления:', Markup.inlineKeyboard(buttons));
};

export const handleAdminRemoveDay = async (ctx: Context, dayOfWeek: number) => {
  const trainings: ITraining[] | null = await prisma.crossfitTraining.findMany({
    where: { dayOfWeek },
    include: { users: true },
  });

  if (!trainings?.length) {
    await ctx.answerCbQuery('День уже удалён или не найден');
    return;
  }

  // Сформируем карту: trainingId -> { time, date, userIds[] }
  const notifyMap: {
    trainingId: number;
    time: string;
    date: string;
    userIds: string[];
  }[] = trainings.map(training => ({
    trainingId: training.id,
    time: training.time,
    date: training.date,
    userIds: (training.users || []).map(user => user.userId.toString()),
  }));

  // 2. Удаляем тренировки (и связанные брони — cascade) в транзакции
  try {
    await prisma.$transaction([prisma.crossfitTraining.deleteMany({ where: { dayOfWeek } })]);
  } catch (err) {
    console.error('Ошибка при удалении дня:', err);
    await ctx.answerCbQuery('Не удалось удалить день. Попробуйте позже.');
    return;
  }

  // 3. Уведомляем пользователей о каждой отмене (вне транзакции)
  for (const item of notifyMap) {
    const { time, date, userIds } = item;
    const text = `Отменена тренировка на ${time} (${getFormatDate(date)})`;
    await Promise.all(
      userIds.map(async uid => {
        try {
          await ctx.telegram.sendMessage(uid, text);
        } catch (err) {
          // Логируем, но не мешаем основному потоку
          console.error(`Не удалось уведомить пользователя ${uid}:`, err);
        }
      }),
    );
  }

  await safeEditOrReply(ctx, 'День удален');
};

export const addTrainingTime = async (ctx: Context, dayOfWeek: number, time: string) => {
  // вычисляем ближайшую дату для этого дня недели
  const today = new Date();
  today.setDate(today.getDate() + ((dayOfWeek - today.getDay() + 7) % 7));
  const dateStr = formatDate(today);

  // защита от дубликатов: проверяем наличие entry с такой датой/time
  const existing = await prisma.crossfitTraining.findFirst({
    where: { dayOfWeek, time, date: dateStr },
  });

  if (existing) {
    await ctx.answerCbQuery('Такое время уже добавлено');
    return;
  }

  try {
    await prisma.crossfitTraining.create({
      data: { date: dateStr, dayOfWeek, time, capacity },
    });
  } catch (err) {
    console.error('Ошибка при добавлении времени:', err);
    await ctx.answerCbQuery('Не удалось добавить время. Попробуйте позже.');
    return;
  }

  await ctx.answerCbQuery(`Добавлено время ${time} (${getFormatDate(dateStr)})`);
};

export const removeTrainingTime = async (ctx: Context, trainingId: number) => {
  // получаем тренировку с пользователями
  const training: ITraining | null = await prisma.crossfitTraining.findUnique({
    where: { id: trainingId },
    include: { users: true },
  });

  if (!training) {
    await ctx.answerCbQuery('Тренировка уже удалена');
    return;
  }

  const userIds = (training.users || []).map(u => u.userId.toString());
  const time = training.time;
  const date = training.date;

  // удаляем тренировку (и каскадом брони) в транзакции
  try {
    await prisma.$transaction([prisma.crossfitTraining.delete({ where: { id: trainingId } })]);
  } catch (err) {
    console.error('Ошибка при удалении тренировки:', err);
    await ctx.answerCbQuery('Не удалось удалить тренировку. Попробуйте позже.');
    return;
  }

  // уведомляем пользователей
  const text = `Отменена тренировка на ${time} (${getFormatDate(date)})`;
  await Promise.all(
    userIds.map(async uid => {
      try {
        await ctx.telegram.sendMessage(uid, text);
      } catch (err) {
        console.error(`Не удалось уведомить пользователя ${uid}:`, err);
      }
    }),
  );

  await ctx.answerCbQuery('Тренировка удалена');
};

export const handleAdminSelectTime = async (ctx: Context, dayOfWeek: number) => {
  const times = CROSS_FIT_ALL_TIME;

  const buttons = times.reduce(
    (acc, time, i) => {
      const btn = Markup.button.callback(
        time,
        `${AdminButtons.ADMIN_CONFIRM_ADD}_${dayOfWeek}_${time}`,
      );
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(btn);
      return acc;
    },
    [] as ReturnType<typeof Markup.button.callback>[][],
  );

  buttons.push(
    [Markup.button.callback(AdminButtonsText.ADMIN_BACK, AdminButtons.ADMIN_SCHEDULE)],
    [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
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
  const dateStr = formatDate(date);

  // защита от дублей
  const existing = await prisma.crossfitTraining.findFirst({
    where: { dayOfWeek, time, date: dateStr },
  });

  if (existing) {
    await ctx.answerCbQuery('Такое время уже добавлено');
    return;
  }

  try {
    await prisma.crossfitTraining.create({
      data: {
        date: dateStr,
        dayOfWeek,
        time,
        capacity,
      },
    });
  } catch (err) {
    console.error('Ошибка при создании времени:', err);
    await ctx.answerCbQuery('Не удалось добавить время. Попробуйте позже.');
    return;
  }

  await ctx.answerCbQuery(`Добавлено время ${time} (${getDayName(dayOfWeek)})`);
};
