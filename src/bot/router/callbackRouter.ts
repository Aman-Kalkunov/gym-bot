import { Context } from 'telegraf';
import { routes } from './routes';

export const callbackRouter = async (ctx: Context) => {
  const query = ctx.callbackQuery;

  if (!query || !('data' in query) || !query.data) {
    return ctx.answerCbQuery();
  }

  const data = query.data;

  try {
    for (const route of routes) {
      if (route.match(data)) {
        const match = data.match(/(.+)?/);
        await route.handler(ctx, match);
        return;
      }
    }

    await ctx.answerCbQuery('Неизвестная команда');
  } catch (err) {
    console.error('Ошибка callback_router:', err);
    await ctx.answerCbQuery('Ошибка');
  }
};
