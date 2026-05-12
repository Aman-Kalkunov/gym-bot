import { TrainingType } from '@prisma/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Context } from 'telegraf';
import { InlineKeyboardMarkup, User } from 'telegraf/typings/core/types/typegram';

import { Markup } from 'telegraf/typings/markup';
import { mainInfoText } from '../../constants/text/text';
import {
  ITraining,
  BACK_CAPACITY as backCapacity,
  CALORIES_CAPACITY as caloriesCapacity,
  CAPACITY as capacity,
  HYROX_CAPACITY as hyroxCapacity,
} from '../../types/types';

export const sayHello = () => async (ctx: Context) => {
  await ctx.reply(mainInfoText.startText);
};

export const getUserName = (user: User) => {
  const name = user.first_name || '';
  const lastName = user.last_name || '';
  const username = user.username ? `@${user.username}` : '';
  return `${name} ${lastName} ${username}`.trim();
};

export const getSlotWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return 'слотов';
  }
  if (mod10 === 1) {
    return 'слот';
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'слота';
  }
  return 'слотов';
};

export const getPlacesWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return 'мест';
  }
  if (mod10 === 1) {
    return 'место';
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'места';
  }
  return 'мест';
};

export const getFormatDate = (date?: string) => {
  if (!date) {
    return '';
  }
  const formatted = format(new Date(date), 'EEEE, d MMMM', { locale: ru });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const getDayName = (day: number): string => {
  const names = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return names[day];
};

export const safeEditOrReply = async (
  ctx: Context,
  text: string,
  keyBoard?: Markup<InlineKeyboardMarkup>,
) => {
  try {
    await ctx.editMessageText(text, keyBoard);
  } catch {
    await ctx.reply(text, keyBoard);
  }
};

export const buildDayMessage = (trainingsOfDay: ITraining[]) => {
  const dayName = trainingsOfDay.length ? getFormatDate(trainingsOfDay[0].date) : '';
  let message = `<b>${dayName}</b>\n\n`;

  if (trainingsOfDay.length === 0) {
    message += 'Нет запланированных тренировок.';
  } else {
    const list = trainingsOfDay.map(t => `${t.time} — ${t.booked}/${t.capacity} мест`).join('\n');
    message += list;
  }

  return message;
};

export const getCapacity = (type: TrainingType) => {
  if (type === 'BACK') {
    return backCapacity;
  }

  if (type === 'CALORIES') {
    return caloriesCapacity;
  }

  if (type === 'HYROX') {
    return hyroxCapacity;
  }

  return capacity;
};

export const getCancelQuestion = (type: TrainingType, time: string, date: string) => {
  const cancelText =
    type === TrainingType.CROSSFIT
      ? `Вы уверены, что хотите удалить запись на CrossFit?\n\n${time} (${date})`
      : type === TrainingType.BACK
        ? `Вы уверены, что хотите удалить запись на тренировку Здоровая спина?\n\n${time} (${date})`
        : type === TrainingType.HYROX
          ? `Вы уверены, что хотите удалить запись на тренировку Hyrox?\n\n${time} (${date})`
          : `Вы уверены, что хотите удалить запись на тренировку Kalorie Killa?\n\n${time} (${date})`;
  return cancelText;
};

export const getCancelText = (type: TrainingType, userName: string, time: string, date: string) => {
  const cancelText =
    type === TrainingType.CROSSFIT
      ? `${userName} отменил(-а) запись на CrossFit: ${time} (${date})`
      : type === TrainingType.BACK
        ? `${userName} отменил(-а) запись на тренировку Здоровая спина: ${time} (${date})`
        : type === TrainingType.HYROX
          ? `${userName} отменил(-а) запись на тренировку Hyrox: ${time} (${date})`
          : `${userName} отменил(-а) запись на тренировку Kalorie Killa: ${time} (${date})`;
  return cancelText;
};

export const isValidType = (type: TrainingType) =>
  type === TrainingType.CROSSFIT ||
  type === TrainingType.BACK ||
  type === TrainingType.CALORIES ||
  type === TrainingType.HYROX;
