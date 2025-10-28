import { BotCommand, BotCommandText } from '../../types/botCommands';

export const mainCommands = [
  { command: BotCommand.INFO, description: BotCommandText.INFO },
  { command: BotCommand.SCHEDULE, description: BotCommandText.SCHEDULE },
  { command: BotCommand.MY_BOOKINGS, description: BotCommandText.MY_BOOKINGS },
];

export const adminCommands = [
  { command: BotCommand.INFO, description: BotCommandText.INFO },
  { command: BotCommand.SCHEDULE, description: BotCommandText.SCHEDULE },
  { command: BotCommand.MY_BOOKINGS, description: BotCommandText.MY_BOOKINGS },
  { command: BotCommand.ADMIN_PANEL, description: BotCommandText.ADMIN_PANEL },
];
