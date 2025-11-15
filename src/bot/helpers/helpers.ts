import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Context } from 'telegraf';
import { InlineKeyboardMarkup, User } from 'telegraf/typings/core/types/typegram';

import { Markup } from 'telegraf/typings/markup';
import { mainInfoText } from '../../constants/text/text';
import { ITraining } from '../../types/types';

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
