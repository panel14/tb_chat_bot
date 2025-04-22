const themesService = require('../services/ThemesService/ThemesService');
const authService = require('../services/AuthService/authService');
const themes = require('../handlers/themes')
const { Markup } = require('telegraf');

module.exports = async (bot) => {
    await bot.command('start', async (ctx) => {
        try {

            const isAuthorized = await authService.login(ctx.from.id);
            if (!isAuthorized) {
                await ctx.reply('Ошибка авторизации. Пожалуйста, попробуйте позже.');
                return;
            }

            ctx.session = {
                themes: [],
                currentThemeId: null,
                contents: {}
            }

            themes.handleTheme(ctx, null, 'Привет! Я помогу тебе разобраться, как всё устроено. Выбери нужную тему ниже:');
        } catch (error) {
            console.log(error)
            await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    });
};

