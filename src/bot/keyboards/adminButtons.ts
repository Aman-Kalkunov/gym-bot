import { Markup } from 'telegraf';

import {
  AdminButtons,
  AdminButtonsText,
  CrossfitTypes,
  CrossfitTypesText,
} from '../../types/types';

export const adminButtons = Markup.inlineKeyboard([
  [Markup.button.callback(AdminButtonsText.ADMIN_CROSS_FIT, AdminButtons.ADMIN_CROSS_FIT)],
  [Markup.button.callback(AdminButtonsText.ADMIN_HEALTHY_BACK, AdminButtons.ADMIN_HEALTHY_BACK)],
  [Markup.button.callback(CrossfitTypesText.CLOSE, CrossfitTypes.CLOSE)],
]);
