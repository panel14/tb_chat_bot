const { Markup } = require('telegraf');
const positionsService = require('../services/PositionsService/PositionsService');
const themes = require('./themes');

const showPositionsMenu = async (ctx) => {
    const keyboard = [
        ['Добавить должность', 'Удалить должность'],
        ['Обновить должность', 'Список должностей'],
        ['Вернуться в главное меню']
    ];

    await ctx.reply('Выберите действие:', Markup.keyboard(keyboard).resize());
};

const handleAddPosition = async (ctx) => {
    ctx.session.awaitingPosition = {
        step: 'name',
        data: {}
    };
    await ctx.reply(
        'Введите название должности:',
        Markup.keyboard([['Отменить']]).resize()
    );
};

const handleDeletePosition = async (ctx) => {
    const positions = await positionsService.list();

    if (positions.length === 0) {
        await ctx.reply('Нет доступных должностей для удаления.');
        return;
    }

    let inlineKeyboard = [];
    positions.forEach((position, index) => {
        inlineKeyboard.push([Markup.button.callback(`${index + 1}. ${position.name}`, `delete_position_${position.id}`)]);
    });

    await ctx.reply('Выберите должность для удаления:', Markup.inlineKeyboard(inlineKeyboard));
};

const handleUpdatePosition = async (ctx) => {
    const positions = await positionsService.list();

    if (positions.length === 0) {
        await ctx.reply('Нет доступных должностей для обновления.');
        return;
    }

    let inlineKeyboard = [];
    positions.forEach((position, index) => {
        inlineKeyboard.push([Markup.button.callback(`${index + 1}. ${position.name}`, `update_position_${position.id}`)]);
    });

    await ctx.reply('Выберите должность для обновления:', Markup.inlineKeyboard(inlineKeyboard));
};

const handleListPositions = async (ctx) => {
    const positions = await positionsService.list();
    if (positions.length === 0) {
        await ctx.reply('Должности не найдены.');
        return;
    }

    let inlineKeyboard = [];
    positions.forEach((position, index) => {
        inlineKeyboard.push([Markup.button.callback(`${index + 1}. ${position.name}`, `view_position_${position.id}`)]);
    });

    await ctx.reply('Список должностей:', Markup.inlineKeyboard(inlineKeyboard));
};

exports.setupPositionsHandlers = (bot) => {
    bot.hears('Должности', async (ctx) => {
        await showPositionsMenu(ctx);
    });

    bot.hears('Добавить должность', async (ctx) => {
        await handleAddPosition(ctx);
    });

    bot.hears('Удалить должность', async (ctx) => {
        await handleDeletePosition(ctx);
    });

    bot.hears('Обновить должность', async (ctx) => {
        await handleUpdatePosition(ctx);
    });

    bot.hears('Список должностей', async (ctx) => {
        await handleListPositions(ctx);
    });

    bot.hears('Отменить', async (ctx) => {
        if (ctx.session.awaitingPosition) {
            delete ctx.session.awaitingPosition;
            await ctx.reply('Действие отменено.');
            await showPositionsMenu(ctx);
        }
    });

    bot.hears('Вернуться в главное меню', async (ctx) => {
        if (ctx.session.awaitingPosition) {
            delete ctx.session.awaitingPosition;
        }
        await themes.handleTheme(ctx, null, 'Вы вернулись в главное меню\n');
    });

    bot.action(/^delete_position_(\d+)$/, async (ctx) => {
        const positionId = ctx.match[1];
        const response = await positionsService.delete(positionId);
        if (response) {
            await ctx.reply('Должность успешно удалена!');
        } else {
            await ctx.reply('Ошибка при удалении должности.');
        }
        await showPositionsMenu(ctx);
    });

    bot.action(/^update_position_(\d+)$/, async (ctx) => {
        const positionId = ctx.match[1];
        ctx.session.awaitingPosition = {
            step: 'name',
            data: { id: positionId }
        };
        await ctx.reply(
            'Введите новое название должности:',
            Markup.keyboard([['Отменить']]).resize()
        );
    });

    bot.on('text', async (ctx) => {
        if (ctx.session?.awaitingPosition) {
            const { step, data } = ctx.session.awaitingPosition;

            if (ctx.message.text === 'Отменить') {
                delete ctx.session.awaitingPosition;
                await ctx.reply('Действие отменено.');
                await showPositionsMenu(ctx);
                return;
            }

            if (step === 'name') {
                const response = data.id
                    ? await positionsService.update(data.id, ctx.message.text)
                    : await positionsService.create(ctx.message.text);

                delete ctx.session.awaitingPosition;
                if (response) {
                    await ctx.reply(data.id ? 'Должность успешно обновлена!' : 'Должность успешно добавлена!');
                } else {
                    await ctx.reply('Ошибка при сохранении должности.');
                }
                await showPositionsMenu(ctx);
            }
        }
    });
};
