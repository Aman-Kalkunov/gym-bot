import { Context } from 'telegraf';
import { mainInfoText } from '../../constants/text/text';
import { User } from 'telegraf/typings/core/types/typegram';

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
