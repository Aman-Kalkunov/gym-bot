import { Markup } from 'telegraf';

export const mainMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('Информация', 'info')],
    [Markup.button.callback('Записаться', 'schedule')],
    [Markup.button.callback('Мои записи', 'my_bookings')],
    [Markup.button.callback('Админ-панель', 'admin_panel')],
  ]);
