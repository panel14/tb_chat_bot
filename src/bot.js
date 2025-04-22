require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const startCommand = require('./commands/start');
const themes = require('./handlers/themes');
const instructionHandler = require('./handlers/instructions')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

// Подключаем обработчики команд
startCommand(bot);
themes.setupThemesHandlers(bot);

instructionHandler(bot);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));