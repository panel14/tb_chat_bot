const authService = require('../services/AuthService/authService');
const themes = require('../handlers/themes')


exports.handleStartCommand = async (ctx) => {
    const loginResponse = await authService.login(ctx.from.id);

    ctx.session = {
        themes: [],
        currentThemeId: null,
        contents: [],
        role: loginResponse.role
    }
    console.log(ctx.session.themes);
    themes.handleTheme(ctx, null, 'Привет! Я помогу тебе разобраться, как всё устроено. Выбери нужную тему ниже:');
}

exports.setupStartHandlers = async (bot) => {
    bot.command('start', async (ctx) => {
        await this.handleStartCommand(ctx)
    });
};

