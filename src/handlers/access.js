const { Markup } = require("telegraf");
const userService = require("../services/UserService/UserService");

const getAccessKeyboard = async(ctx) => {
    await ctx.reply('Выдача доступа', 
        Markup.keyboard([['Добавить пользователя', 'Обновить пользователя', 'Заблокировать/разблокировать пользователя'], ['Назад']])
        .resize());
}

const createOrUpdateUserDialog = async (ctx) => {
    if (ctx.session.userCreation) {
        const {step, data} = ctx.session.userCreation;
        switch (step) {
            case 'id':
                if (!ctx.message.text || isNaN(ctx.message.text))
                    throw new ValidationError('ID пользователя должен быть числом');
                data.id = parseInt(ctx.message.text);
                ctx.session.userCreation.step = 'name';
                await ctx.reply('Введите полное имя пользователя:');
                break;
            case 'name':
                data.fullName = ctx.message.text;
                ctx.session.userCreation.step = 'position';
                await ctx.reply('Введите ID должности пользователя:');
                break;
            case 'position':
                if (!ctx.message.text || isNaN(ctx.message.text))
                    throw new ValidationError('ID должности должен быть числом');
                data.positionId = parseInt(ctx.message.text);
                ctx.session.userCreation.step = 'role';
                await ctx.reply('Введите ID роли пользователя:');
                break;
            case 'role':
                if (!ctx.message.text || isNaN(ctx.message.text))
                    throw new ValidationError('ID роли должен быть числом');
                data.roleId = parseInt(ctx.message.text);
                await createOrUpdateUser(ctx);
                break;
        }
    }
    else if (ctx.session.userBlock) {
        if (!ctx.message.text || isNaN(ctx.message.text))
            throw new ValidationError('ID пользователя должен быть числом');
        ctx.session.userBlock.id = parseInt(ctx.message.text);
        ctx.reply('Что сделать с пользователем?',
            Markup.inlineKeyboard(
                [Markup.button.callback('Заблокировать', 'Заблокировать'), 
                    Markup.button.callback('Разблокировать', 'Разблокировать')]
            )
        )
    }
}

const handleCreateOrUpdateUser = async (ctx, mode = 'create') => {
    ctx.session.userCreation = {
        step: 'id',
        data: {},
        mode: mode
    };
    const text = (mode == 'create') ? 'Создание' : 'Обновление';
    ctx.reply(`${text} пользователя. Введите Telegram ID пользователя:`);
}

const createOrUpdateUser = async(ctx) => {
    const {data, mode} = ctx.session.userCreation;
    await userService.createOrUpdateUser(data);
    await ctx.reply(`Пользователь ${(mode == 'create') ? 'создан' : 'обновлен'}!`);
    delete ctx.session.userCreation;
    await getAccessKeyboard(ctx);
}

const handleBlockUser = async (ctx) => {
    ctx.session.userBlock = {
        id: null
    };
    ctx.reply('Введите Telegram ID пользователя:');
}

exports.setupAccessHandlers = async (bot) => {

    bot.hears('Выдача доступа', async (ctx) => {
        console.log('выдача доступа');
        await getAccessKeyboard(ctx);
    })

    bot.hears('Добавить пользователя', async (ctx) => {
        await handleCreateOrUpdateUser(ctx, 'create');
    });

    bot.hears('Обновить пользователя', async (ctx) => {
        await handleCreateOrUpdateUser(ctx, 'update')
    })

    bot.hears('Заблокировать/разблокировать пользователя', async (ctx) => {
        await handleBlockUser(ctx);
    });

    bot.action(['Заблокировать', 'Разблокировать'], async (ctx) => {
        const isBlock = ctx.callbackQuery.data == 'Заблокировать';
        await userService.blockUser({
            id: ctx.session.userBlock.id,
            archived: isBlock
        });    
        await ctx.reply(`Пользователь с ID ${ctx.session.userBlock.id} ${(isBlock) ? 'заблокирован.' : 'разблокирован.'}`);
        delete ctx.session.userBlock;
        await ctx.answerCbQuery();
    });

    bot.on('text', async (ctx, next) => {
        await createOrUpdateUserDialog(ctx);
        await next();
    });
};