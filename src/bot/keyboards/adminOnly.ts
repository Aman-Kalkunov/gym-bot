import { Context } from 'telegraf';

export const adminOnly = (admins: number[]) => async (ctx: Context, next: any) => {
  const userId = ctx.from?.id;
  if (!userId || !admins.includes(userId)) {
    await ctx.reply('У вас нет доступа к админ-панели');
    return;
  }
  return next();
};
