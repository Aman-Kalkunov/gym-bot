import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { mainMenu } from './bot/keyboards/mainMenu';
import { adminOnly } from './bot/keyboards/adminOnly';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

const admins = process.env.ADMINS?.split(',').map(id => Number(id.trim())) || [];

// Главное меню
bot.start(async ctx => {
  await ctx.reply('Добро пожаловать в фитнес-клуб', mainMenu());
});

// Команда для администратора
bot.command('admin', adminOnly(admins), async ctx => {
  await ctx.reply('Админ-панель');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
