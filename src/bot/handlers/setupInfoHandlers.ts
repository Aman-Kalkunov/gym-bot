import { Telegraf, Context } from 'telegraf';
import { infoButtons } from '../keyboards/infoButtons';
import { InfoButtons } from '../../types/buttonTypes';
import { mainInfoText, messageText } from '../../constants/text/text';
import { getUserName } from '../helpers/helpers';

const waitingForQuestion = new Map<number, NodeJS.Timeout>();

export const setupInfoHandlers = (bot: Telegraf<Context>, adminId: string) => {
  bot.command('info', async ctx => {
    await ctx.reply(messageText.information, infoButtons);
  });

  const safeEdit = async (ctx: Context, text: string, extra?: any) => {
    try {
      await ctx.editMessageReplyMarkup(undefined);
      await ctx.reply(text, extra);
    } catch {
      await ctx.reply(text, extra);
    }
  };

  bot.action(InfoButtons.INFO_ABOUT, async ctx => {
    await ctx.answerCbQuery();
    await safeEdit(ctx, mainInfoText.startText, {
      ...infoButtons,
    });
  });

  bot.action(InfoButtons.INFO_PROMOTIONS, async ctx => {
    await ctx.answerCbQuery();
    await safeEdit(ctx, mainInfoText.promotionsText, infoButtons);
  });

  bot.action(InfoButtons.INFO_CONTACTS, async ctx => {
    await ctx.answerCbQuery();
    await safeEdit(ctx, mainInfoText.contactsText, infoButtons);
  });

  bot.action(InfoButtons.INFO_TIMETABLE, async ctx => {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.replyWithPhoto(
      { source: './src/assets/timetable.jpg' },
      {
        caption: messageText.schedule,
        ...infoButtons,
      },
    );
  });

  bot.action(InfoButtons.INFO_PRICE, async ctx => {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.replyWithPhoto(
      { source: './src/assets/price.jpg' },
      {
        caption: mainInfoText.priceText,
        ...infoButtons,
      },
    );
  });

  bot.action(InfoButtons.INFO_FIRST_TIME, async ctx => {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.replyWithPhoto(
      { source: './src/assets/firstTime.jpg' },
      {
        caption: mainInfoText.firstTimeText,
        ...infoButtons,
      },
    );
  });

  bot.action(InfoButtons.INFO_QUESTION, async ctx => {
    const userId = ctx.from.id;
    const oldTimer = waitingForQuestion.get(userId);

    if (oldTimer) {
      clearTimeout(oldTimer);
    }

    const timer = setTimeout(async () => {
      waitingForQuestion.delete(userId);
    }, 300000);

    waitingForQuestion.set(userId, timer);

    await ctx.answerCbQuery();
    await safeEdit(ctx, mainInfoText.questionText);

    bot.hears(/.*/, async ctx => {
      const userId = ctx.from.id;
      const timer = waitingForQuestion.get(userId);

      if (!timer) {
        return;
      }

      const text = ctx.message.text.trim();
      const userName = getUserName(ctx.from);

      await ctx.telegram.sendMessage(adminId, `${messageText.question} ${userName}:\n\n${text}`);

      clearTimeout(timer);
      waitingForQuestion.delete(userId);

      await ctx.reply(messageText.answer);
    });
  });

  /* bot.action(InfoButtons.INFO_BACK, async ctx => {
    await ctx.answerCbQuery();
    try {
      await ctx.deleteMessage();
    } catch {}

    await ctx.reply('⬅Главное меню:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Информация', callback_data: 'MAIN_INFO' }],
          [{ text: 'Записаться', callback_data: 'MAIN_SCHEDULE' }],
        ],
      },
    });
  }); */
};
