const { BaseError } = require("./errors/Errors");

const errorHandler = async (ctx, next) => {
    try {
        await next();
    } 
    catch (error) {
        console.error(error);

        let message = 'Произошла ошибка при обработке запроса. Попробуйте повторить позже';
        if (error instanceof BaseError)
            message = error.message;
        await ctx.reply(message);
    }
}

module.exports = errorHandler;