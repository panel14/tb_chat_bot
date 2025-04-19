const { Markup } = require('telegraf');

module.exports = async (bot) => {
    bot.action(/^instruction_(\d+)$/, async (ctx) => {
        const backThemeId = ctx.backThemeId;

        // Берем контент, пока просто заглушка
        const content = ctx.contents[`${backThemeId}`];

        const buffer = Buffer.from(content.content);
        try {
            switch (content.type) {
                case '1':
                    await ctx.reply(buffer.toString('utf-8'))
                    break;

                case '2':
                    await ctx.replyWithPhoto({
                        source: buffer
                    });
                    break;

                case '3':
                    await ctx.replyWithVideo({ 
                        source: contentBuffer 
                    });
                    break;

                case '4':
                    const url = contentBuffer.toString('utf-8');
                    await ctx.reply('Перейдите по ссылке:', 
                        Markup.inlineKeyboard([
                            Markup.button.url('Открыть', url)
                        ])
                    );
                    break;

                default:
                    break;
            }
            await ctx.reply(
                Markup.inlineKeyboard([Markup.button.callback('◀️ Назад', `theme_${backThemeId}`)])
            );

        }
        catch (error) {
            await ctx.reply('Произошла ошибка при обработке темы. Попробуйте позже.');
        }
    });
}