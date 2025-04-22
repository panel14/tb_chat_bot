const { Markup } = require('telegraf');
const themesService = require('../services/ThemesService/ThemesService');
const { CreateThemeRequest, UpdateThemeRequest } = require('../contracts/ThemesContracts');

exports.handleTheme = async (ctx, themeId, message = null) => {
    try {
        const themesResponse = await themesService.getThemes(ctx.from.id, themeId);
        if (!themesResponse.success) {
            await ctx.reply(themesResponse.message);
            return;
        }
        const content = themesResponse.content;

        let keyboard = [];

        if (content.leaf) {
            content.instructions.forEach(instruction => {
                keyboard.push([Markup.button.callback(content.description, `instruction_${instruction.id}`)]);
                ctx.contents[`${instruction.id}`] = {
                    content: instruction.content,
                    type: instruction.instructionType.id
                };
            });
        }
        else {

            content.themes.forEach(theme => {
                ctx.session.themes[theme.id] = {
                    id: theme.id,
                    name: theme.themeName,
                    parentId: themeId
                }
            })

            keyboard = content.themes.map(theme => [`Тема: ${theme.themeName}`])
        }

        //Кнопки админа для круда по темам
        keyboard.push(['Создать новую тему']);

        const currentTheme = ctx.session.themes.filter(th => th.id == themeId)[0];
        let text = '';
        if (currentTheme) {
            ctx.session.currentThemeId = themeId;
            keyboard.push(['Назад']);
            text = `${currentTheme.name}:\n\n`;
        }

        if (message) text = message;
        await ctx.reply(
            `${text}Выберите подтему:`,
            Markup.keyboard(keyboard)
                .resize()
        );

    } catch (error) {
        console.log(error);
        await ctx.reply('Произошла ошибка при обработке темы. Попробуйте позже.');
    }

};

exports.handleThemeBack = async (ctx) => {
    const themeId = ctx.session.currentThemeId;
    const theme = ctx.session.themes.filter(th => th.id == themeId)[0];
    await exports.handleTheme(ctx, theme.parentId);
}

exports.handleThemeCreateOrUpdate = async (ctx) => {
    try {
        ctx.session.themeCreation = {
            step: 'name',
        };

        await ctx.reply('Введите название темы:');
    }
    catch (error) {
        await ctx.reply('Произошла ошибка при добавлении темы. Попробуйте позже');
    }
}

createOrUpdateThemeDialog = async (ctx) => {
    if (!ctx.session?.themeCreation) return;

    const { step } = ctx.session.themeCreation;
    let data = {};
    switch (step) {
        case 'name':
            data.name = ctx.message.text;
            ctx.session.themeCreation.step = 'description';
            await ctx.reply('Отлично! Теперь введите описание темы:');
            break;

        case 'description':
            data.description = ctx.message.text;
            ctx.session.themeCreation.step = 'accessLevel';
            await ctx.reply('Введите уровень доступа:');
            break;

        case 'accessLevel':
            data.accessLevel = ctx.message.text;
            ctx.session.themeCreation.step = 'parent';
            await ctx.reply('Введите ID родительской темы (или 0, если это корневая тема):');
            break;
        case 'parent':
            data.parentId = parseInt(ctx.message.text);
            delete ctx.session.themeCreation;
            return data;
    }
}

// Обработчик текстовых сообщений для создания темы
exports.handleThemeCreationMessage = async (ctx) => {
    try {
        const data = await createOrUpdateThemeDialog(ctx);
        const result = await themesService.createTheme(new CreateThemeRequest(data.name, data.description, data.parentId, data.accessLevel));

        if (result.success) {
            await ctx.reply('Тема успешно создана!');
        } else {
            await ctx.reply(`Ошибка при создании темы: ${result.message}`);
        }
        delete ctx.session.themeCreation;
        await exports.handleTheme(ctx, ctx.session.currentThemeId);

    }
    catch (error) {
        await ctx.reply('Произошла ошибка при создании темы. Попробуйте позже');
        delete ctx.session.themeCreation;
    }
}

exports.handleThemeUpdateMessage = async (ctx) => {
    try {
        const themeId = ctx.session.currentThemeId;
        const data = await createOrUpdateThemeDialog(ctx);
        const result = await themesService.updateTheme(new UpdateThemeRequest(themeId, data.name, data.description, data.parentId, data.accessLevel))

        if (result.success) {
            await ctx.reply('Тема успешно обновлена!');
        } else {
            await ctx.reply(`Ошибка при обновлении темы: ${result.message}`);
        }
        await exports.handleTheme(ctx, themeId);
        delete ctx.session.themeCreation;
    }
    catch (error) {
        await ctx.reply('')
    }
}

exports.setupThemesHandlers = async (bot) => {
    bot.hears(/^Тема: (.+)$/, async (ctx) => {
        const themeName = ctx.match[1];
        const themeId = ctx.session.themes.filter(th => th.name == themeName)[0]?.id;
        await exports.handleTheme(ctx, themeId);
    });

    bot.hears('Назад', async (ctx) => {
        await exports.handleThemeBack(ctx);
    });

    // Добавляем обработчик для кнопки создания темы
    bot.hears('Создать новую тему', async (ctx) => {
        await exports.handleThemeCreateOrUpdate(ctx);
    });

    bot.hears('Обновить тему', async (ctx) => {
        await exports.handleThemeCreateOrUpdate(ctx);
    })

    // Добавляем обработчик текстовых сообщений для создания темы
    bot.on('text', exports.handleThemeCreationMessage);
}