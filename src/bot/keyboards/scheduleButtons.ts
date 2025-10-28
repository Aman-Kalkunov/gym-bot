import { ScheduleButtons, ScheduleButtonsText } from '../../types/buttonTypes';
import { Markup } from 'telegraf';

export const scheduleButtons = Markup.inlineKeyboard([
  [Markup.button.callback(ScheduleButtonsText.CROSS_FIT, ScheduleButtons.CROSS_FIT)],
  [Markup.button.callback(ScheduleButtonsText.WEIGHTLIFTING, ScheduleButtons.WEIGHTLIFTING)],
]);
