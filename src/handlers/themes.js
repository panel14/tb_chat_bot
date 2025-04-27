const { Markup } = require('telegraf');
const themesService = require('../services/ThemesService/ThemesService');
const {ValidationError} = require('../middlewares/errors/Errors')

exports.handleTheme = async (ctx, themeId, message = null) => {
    const themesResponse = await themesService.getThemes(ctx.from.id, themeId);
    const content = themesResponse;

    let keyboard = [];

    if (content.leaf) {
        ctx.session.contents = [];
        content.instructions.forEach(instruction => {
            ctx.session.contents.push({
                content: instruction.content,
                type: instruction.instructionType.name
            });
        });

        if (ctx.session.contents.length > 0)
            keyboard.push(['Показать инструкции']);

        if (ctx.session.role === 'ROLE_ADMIN')
            keyboard.push(['Обновить список инструкций']);
    }
    else {
        content.children.forEach(theme => {
            ctx.session.themes.push({
                id: theme.id,
                name: theme.themeName,
                parentId: themeId
            });
            keyboard.push([`Тема: ${theme.themeName}`]);
        });
    }

    const currentTheme = ctx.session.themes.find(th => th.id == themeId);
    console.log(currentTheme);
    let isBack = false;
    let text = 'Выберите подтему:';
    if (currentTheme) {
        ctx.session.currentThemeId = themeId;
        isBack = true;
        text = `${currentTheme.name}:\n`;
        if (content.description)
            text += `${content.description}\n`;
    }

    if (ctx.session.role === 'ROLE_ADMIN') {
        let crudKeys = ['Создать новую тему'];
        if (ctx.session.currentThemeId) {
            crudKeys.push('Обновить текущую тему');
            crudKeys.push('Удалить текущую тему');
        }
        keyboard.push(crudKeys);
        keyboard.push(['Должности', 'Форма обратной связи', 'Выдача доступа'])
    }
    console.log(isBack);
    if (isBack)
        keyboard.push(['Назад']);

    if (message) text = message;
    await ctx.reply(
        text, Markup.keyboard(keyboard).resize()
    );
};

handleThemeBack = async (ctx) => {
    const themeId = ctx.session.currentThemeId;
    const theme = ctx.session.themes.filter(th => th.id == themeId)[0];
    await exports.handleTheme(ctx, theme.parentId);
}

handleThemeCreateOrUpdate = async (ctx, mode = 'create') => {
    ctx.session.themeCreation = {
        step: 'name',
        mode: mode,
        data: {}
    };

    await ctx.reply('Введите название темы:');
}

createOrUpdateThemeDialog = async (ctx) => {
    if (!ctx.session?.themeCreation) return;

    const { step, data } = ctx.session.themeCreation;
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
            if (!ctx.message.text || isNaN(ctx.message.text))
                throw new ValidationError('Уровень доступа должен быть числом');
            data.accessLevel = parseInt(ctx.message.text);
            ctx.session.themeCreation.step = 'parent';
            await ctx.reply('Введите ID родительской темы (или 0, если это корневая тема):');
            break;

        case 'parent':
            if (!ctx.message.text || isNaN(ctx.message.text))
                throw new ValidationError('ID родителя должен быть числом');
            const id = parseInt(ctx.message.text);
            data.parentId = id == 0 ? null : id;
            await handleThemeCreateOrUpdateMessage(ctx, data);
    }
}

handleThemeCreateOrUpdateMessage = async (ctx, data) => {
    const themeId = ctx.session.currentThemeId;
    switch (ctx.session.themeCreation.mode) {
        case 'create':
            await themesService.createTheme(data);
            await ctx.reply('Тема успешно создана!');
            break;
        case 'update':
            data.id = themeId;
            await themesService.updateTheme(data);
            await ctx.reply('Тема успешно обновлена!');
            console.log(ctx.session.themes);
            ctx.session.themes.find(th => th.id == themeId).name = data.name;
            break;
    }
    delete ctx.session.themeCreation;
    console.log(themeId);
    await exports.handleTheme(ctx, themeId);
}

handleThemeDelete = async (ctx) => {
    let themeId = ctx.session.currentThemeId;

    await themesService.deleteTheme(themeId);
    const currentTheme = ctx.session.themes.filter(th => th.id == themeId);
    themeId = ctx.session.themes.filter(th => th.id == currentTheme.parentId);

    await ctx.reply(`Тема успешно удалена!`)
    await exports.handleTheme(ctx, themeId);
}

exports.setupThemesHandlers = async (bot) => {
    bot.hears(/^Тема: (.+)$/, async (ctx) => {
        const themeName = ctx.match[1];
        const themeId = ctx.session.themes.filter(th => th.name == themeName)[0]?.id;
        await exports.handleTheme(ctx, themeId);
    });

    bot.hears('Назад', async (ctx) => {
        await handleThemeBack(ctx);
    });

    bot.hears('Создать новую тему', async (ctx) => {
        await handleThemeCreateOrUpdate(ctx);
    });

    bot.hears('Обновить текущую тему', async (ctx) => {
        await handleThemeCreateOrUpdate(ctx, 'update');
    })

    bot.hears('Удалить текущую тему', async (ctx) => {
        await handleThemeDelete(ctx);
    });

    bot.on('text', async (ctx, next) => {
        await createOrUpdateThemeDialog(ctx);
        await next();
    });
}