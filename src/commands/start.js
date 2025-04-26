const authService = require('../services/AuthService/authService');
const themes = require('../handlers/themes')

module.exports = async (bot) => {
    await bot.command('start', async (ctx) => {
        await authService.login(0);

        ctx.session = {
            themes: [],
            currentThemeId: null,
            contents: {}
        }

        themes.handleTheme(ctx, null, 'Привет! Я помогу тебе разобраться, как всё устроено. Выбери нужную тему ниже:');
    });
};

