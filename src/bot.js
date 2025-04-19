const { Telegraf, session } = require('telegraf');
const startCommand = require('./commands/start');
const themesHandler = require('./handlers/themes');
const instructionHandler = require('./handlers/instructions')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

// Подключаем обработчики команд
startCommand(bot);
themesHandler(bot);
instructionHandler(bot);

bot.launch();


