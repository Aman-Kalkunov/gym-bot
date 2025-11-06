import { Markup } from 'telegraf';

import { crossfitTypes, crossfitTypesText, InfoButtons, InfoButtonsText } from '../../types/types';

export const infoButtons = Markup.inlineKeyboard([
  [
    Markup.button.callback(InfoButtonsText.INFO_ABOUT, InfoButtons.INFO_ABOUT),
    Markup.button.callback(InfoButtonsText.INFO_TIMETABLE, InfoButtons.INFO_TIMETABLE),
  ],
  [
    Markup.button.callback(InfoButtonsText.INFO_PRICE, InfoButtons.INFO_PRICE),
    Markup.button.callback(InfoButtonsText.INFO_FIRST_TIME, InfoButtons.INFO_FIRST_TIME),
  ],
  [
    Markup.button.callback(InfoButtonsText.INFO_PROMOTIONS, InfoButtons.INFO_PROMOTIONS),
    Markup.button.callback(InfoButtonsText.INFO_CONTACTS, InfoButtons.INFO_CONTACTS),
  ],
  [Markup.button.callback(InfoButtonsText.INFO_QUESTION, InfoButtons.INFO_QUESTION)],
  [Markup.button.callback(crossfitTypesText.CLOSE, crossfitTypes.CLOSE)],
]);
