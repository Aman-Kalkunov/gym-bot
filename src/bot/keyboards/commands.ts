import { BotCommand, BotCommandText } from '../../types/types';

export const mainCommands = [
  { command: BotCommand.INFO, description: BotCommandText.INFO },
  { command: BotCommand.SCHEDULE, description: BotCommandText.SCHEDULE },
  { command: BotCommand.MY_BOOKINGS, description: BotCommandText.MY_BOOKINGS },
];

export const adminCommands = [
  { command: BotCommand.ADMIN_PANEL, description: BotCommandText.ADMIN_PANEL },
];

export const devCommands = [
  { command: BotCommand.INFO, description: BotCommandText.INFO },
  { command: BotCommand.SCHEDULE, description: BotCommandText.SCHEDULE },
  { command: BotCommand.MY_BOOKINGS, description: BotCommandText.MY_BOOKINGS },
  { command: BotCommand.ADMIN_PANEL, description: BotCommandText.ADMIN_PANEL },
];
