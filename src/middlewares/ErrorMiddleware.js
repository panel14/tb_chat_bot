const { BaseError, AuthenticationError } = require("./errors/Errors");
const themes = require("../handlers/themes");
const authService = require("../services/AuthService/authService");

const errorHandler = async (ctx, next) => {
    const sessionExist = ctx.session !== undefined && ctx.session !== null;
    const sessionBackup = sessionExist 
        ? JSON.parse(JSON.stringify(ctx.session))
        : null;

    try {
        await next();
    } 
    catch (error) {
        console.error(error);

        let message = 'Произошла ошибка при обработке запроса. Попробуйте повторить позже';
        if (error instanceof BaseError)
            message = error.message;
        await ctx.reply(message);
        if (sessionExist) 
            ctx.session = sessionBackup;

        try {
            console.log('here!')
            await authService.login(ctx.from.id);
            await themes.handleTheme(ctx, null);
        }
        catch (error) {
            if (error instanceof AuthenticationError)
                await ctx.reply(error.message);
        }
    }
}

module.exports = errorHandler;