import { Markup } from 'telegraf';

import {
  CrossfitTypes,
  CrossfitTypesText,
  ScheduleButtons,
  ScheduleButtonsText,
} from '../../types/types';

export const scheduleButtons = Markup.inlineKeyboard([
  [Markup.button.callback(ScheduleButtonsText.CROSS_FIT, ScheduleButtons.CROSS_FIT)],
  [Markup.button.callback(ScheduleButtonsText.HEALTHY_BACK, ScheduleButtons.HEALTHY_BACK)],
  [Markup.button.callback(ScheduleButtonsText.CALORIES, ScheduleButtons.CALORIES)],
  [Markup.button.callback(ScheduleButtonsText.WEIGHTLIFTING, ScheduleButtons.WEIGHTLIFTING)],
  [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
]);
