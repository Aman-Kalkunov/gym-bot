import { Context } from 'telegraf';
import { startText } from '../../constants/text/text';

export const sayHello = () => async (ctx: Context) => {
  await ctx.reply(startText);
};

export const getUserName = (user: any) => {
  const name = user.first_name || '';
  const lastName = user.last_name || '';
  const username = user.username ? `@${user.username}` : '';
  return `${name} ${lastName} ${username}`.trim();
};
