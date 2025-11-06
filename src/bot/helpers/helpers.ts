import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Context } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';

import { mainInfoText } from '../../constants/text/text';

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
