import { BotCommand } from '../../types/botCommands';

export const mainCommands = [
  { command: BotCommand.INFO, description: 'Информация' },
  { command: BotCommand.SCHEDULE, description: 'Записаться' },
  { command: BotCommand.MY_BOOKINGS, description: 'Мои записи' },
];

export const adminCommands = [
  { command: BotCommand.INFO, description: 'Информация' },
  { command: BotCommand.SCHEDULE, description: 'Записаться' },
  { command: BotCommand.MY_BOOKINGS, description: 'Мои записи' },
  { command: BotCommand.ADMIN_PANEL, description: 'Админ-панель' },
];
