import { Markup } from 'telegraf';

import {
  ScheduleButtons,
  ScheduleButtonsText,
  crossfitTypes,
  crossfitTypesText,
} from '../../types/types';

export const scheduleButtons = Markup.inlineKeyboard([
  [Markup.button.callback(ScheduleButtonsText.CROSS_FIT, ScheduleButtons.CROSS_FIT)],
  [Markup.button.callback(ScheduleButtonsText.WEIGHTLIFTING, ScheduleButtons.WEIGHTLIFTING)],
  [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
]);
