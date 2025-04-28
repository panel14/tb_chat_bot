const { BaseError } = require("./errors/Errors");
const startCommand = require("../commands/start")

const errorHandler = async (ctx, next) => {
    //const sessionExist = ctx.session !== undefined && ctx.session !== null;
    //const sessionBackup = sessionExist 
    //    ? JSON.parse(JSON.stringify(ctx.session))
    //    : null;

    try {
        await next();
    } 
    catch (error) {
        console.error(error);

        let message = 'Произошла ошибка при обработке запроса. Попробуйте повторить позже';
        if (error instanceof BaseError)
            message = error.message;
        await ctx.reply(message);

        //if (sessionExist)
        //    ctx.session = sessionBackup;
        //else
           await startCommand.handleStartCommand(ctx);
    }
}

module.exports = errorHandler;