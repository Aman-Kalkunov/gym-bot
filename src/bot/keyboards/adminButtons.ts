import {
  AdminButtonsText,
  AdminButtons,
  crossfitTypes,
  crossfitTypesText,
} from '../../types/types';
import { Markup } from 'telegraf';

export const adminButtons = Markup.inlineKeyboard([
  [Markup.button.callback(AdminButtonsText.ADMIN_SCHEDULE, AdminButtons.ADMIN_SCHEDULE)],
  [Markup.button.callback(AdminButtonsText.ADMIN_BOOKINGS, AdminButtons.ADMIN_BOOKINGS)],
  [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
]);
