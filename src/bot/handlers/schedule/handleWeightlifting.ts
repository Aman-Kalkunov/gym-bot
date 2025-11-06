import { Context } from 'telegraf';
import { Markup } from 'telegraf';

import {
  crossfitTypes,
  crossfitTypesText,
  WeightliftingButtons,
  WeightliftingButtonsText,
} from '../../../types/types';
import { getUserName } from '../../../bot/helpers/helpers';

export const handleWeightlifting = async (ctx: Context) => {
  const buttons = [
    [
      Markup.button.callback(
        WeightliftingButtonsText.WEIGHTLIFTING_WEN,
        WeightliftingButtons.WEIGHTLIFTING_WEN,
      ),
    ],
    [
      Markup.button.callback(
        WeightliftingButtonsText.WEIGHTLIFTING_RFI,
        WeightliftingButtons.WEIGHTLIFTING_RFI,
      ),
    ],
    [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
  ];

  try {
    await ctx.editMessageText('Выберите день', Markup.inlineKeyboard(buttons));
  } catch {
    await ctx.reply('Выберите день', Markup.inlineKeyboard(buttons));
  }
};

export const handleWeightliftingDay = async (
  ctx: Context,
  data: WeightliftingButtons,
  adminId: string,
) => {
  if (ctx.from) {
    const userName = getUserName(ctx.from);

    await ctx.editMessageReplyMarkup(undefined);
    await ctx.editMessageText(
      `Вы записаны на тяжелую атлетику в ${data === WeightliftingButtons.WEIGHTLIFTING_WEN ? 'среду' : 'пятницу'}`,
    );

    try {
      await ctx.telegram.sendMessage(
        adminId,
        `${userName} записался на тяжелую атлетику в ${data === WeightliftingButtons.WEIGHTLIFTING_WEN ? 'среду' : 'пятницу'}`,
      );
    } catch {}
  }
};
