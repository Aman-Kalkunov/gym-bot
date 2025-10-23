import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { sayHello } from './bot/helpers/helpers';
import { setupInfoHandlers } from './bot/handlers/infoHandler';
import { adminCommands, mainCommands } from './bot/commands/commands';

dotenv.config();

const token = process.env.BOT_TOKEN!;
const adminId = process.env.ADMIN_ID!;

const bot = new Telegraf(token);

bot.start(sayHello());

bot.telegram.setMyCommands(mainCommands, {
  scope: { type: 'all_private_chats' },
});

bot.telegram.setMyCommands(adminCommands, {
  scope: { type: 'chat', chat_id: adminId },
});

/* bot.telegram.setMyCommands(adminCommands, {
  scope: { type: 'chat', chat_id: process.env.DEV_ID! },
}); */

setupInfoHandlers(bot, adminId);

// Команда Информация
/* bot.command('info', async ctx => {
  await ctx.reply('Информация', infoButtons);
}); */

// bot.telegram.onText('about', sayHello());

/* 
bot.start(async ctx => {
  await ctx.reply('Добро пожаловать в фитнес-клуб', mainMenu());
});
bot.command('info', adminOnly(admins), async ctx => {
  await ctx.reply('Админ-панель');
}); */

// Запуск
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
