module.exports = async (bot) => {
    await bot.command('start', async (ctx) => {
        await ctx.reply('Привет! Я помогу тебе разобраться , как всё устроено. Выбери нужную тему ниже:');
    });
};

