import { InfoButtons } from '../../types/buttonTypes';
import { Markup } from 'telegraf';

export const infoButtons = Markup.inlineKeyboard([
  [
    Markup.button.callback('О нас', InfoButtons.INFO_ABOUT),
    Markup.button.callback('Расписание', InfoButtons.INFO_TIMETABLE),
  ],
  [
    Markup.button.callback('Стоимость занятий', InfoButtons.INFO_PRICE),
    Markup.button.callback('Первая тренировка', InfoButtons.INFO_FIRST_TIME),
  ],
  [
    Markup.button.callback('Акции', InfoButtons.INFO_PROMOTIONS),
    Markup.button.callback('Контакты', InfoButtons.INFO_CONTACTS),
  ],
  [Markup.button.callback('Задать вопрос', InfoButtons.INFO_QUESTION)],
  // [Markup.button.callback('Назад', InfoButtons.INFO_BACK)],
]);
