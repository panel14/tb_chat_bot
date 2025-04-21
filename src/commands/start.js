const themesService = require('../services/ThemesService/ThemesService');
const authService = require('../services/AuthService/authService');
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
                backThemeId: null,
                contents: {}
            }

            const themesResponse = await themesService.getThemes(ctx.from.id);
            
            if (!themesResponse.success) {  
                await ctx.reply(themesResponse.message);
                return;
            }
            
            bot.context['backThemeId'] = 1;
            const keyboard = themesResponse.themes.map(theme => [Markup.button.callback(theme.themeName, `theme_${theme.id}`)]);
            
            await ctx.reply(
                'Привет! Я помогу тебе разобраться, как всё устроено. Выбери нужную тему ниже:',
                Markup.inlineKeyboard(keyboard)
            );
        } catch (error) {
            console.log(error)
            await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    });
};

