import {
  ScheduleButtonsText,
  ScheduleButtons,
  crossfitTypes,
  crossfitTypesText,
} from '../../types/types';
import { Markup } from 'telegraf';

export const scheduleButtons = Markup.inlineKeyboard([
  [Markup.button.callback(ScheduleButtonsText.CROSS_FIT, ScheduleButtons.CROSS_FIT)],
  [Markup.button.callback(ScheduleButtonsText.WEIGHTLIFTING, ScheduleButtons.WEIGHTLIFTING)],
  [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
]);
