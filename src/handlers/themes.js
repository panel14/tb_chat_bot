const { Markup } = require('telegraf');
const themesService = require('../services/ThemesService/ThemesService');

module.exports = async (bot) => {
    bot.action(/^theme_(\d+)$/, async (ctx) => {
        const themeId = ctx.match[1];
        
        try {
            await ctx.answerCbQuery();

            const themesResponse = await themesService.getThemes(themeId, ctx.from.id);
            if (!themesResponse.success) {
                await ctx.reply(themesResponse.message);
                return;
            }
            
            const backThemeId = ctx.session.backThemeId;
            const keyboard = [];

            if (themesResponse.leaf) {
                themesResponse.instructions.forEach(instruction => {
                    keyboard.push([Markup.button.callback(themesResponse.description, `instruction_${instruction.id}`)]);
                    ctx.contents[`${instruction.id}`] = {
                        content: instruction.content,
                        type: instruction.instructionType.id
                    };
                });
            }
                
            else {
                keyboard = themesResponse.themes.map(theme => [Markup.button.callback(theme.themeName, `theme_${theme.id}`)])
            }
            
            keyboard.push([Markup.button.callback('◀️ Назад', `theme_${backThemeId}`)]);
            ctx.session.backThemeId = themeId;

            await ctx.reply(
                `Тема: ${currentTheme.name}\n\nВыберите подтему:`,
                Markup.inlineKeyboard(keyboard)
            );

        } catch (error) {
            await ctx.reply('Произошла ошибка при обработке темы. Попробуйте позже.');
        }
    });
}; 