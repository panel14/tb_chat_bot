require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const startCommand = require('./commands/start');
const themes = require('./handlers/themes');
const instructions = require('./handlers/instructions');
const feedback = require('./handlers/feedback');

const access = require('./handlers/access');

const errorMiddleware = require('./middlewares/ErrorMiddleware');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(errorMiddleware);

startCommand.setupStartHandlers(bot);

instructions.setupInstructionsHandlers(bot);
feedback.setupFeedbackHandlers(bot);
themes.setupThemesHandlers(bot);

access.setupAccessHandlers(bot);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));