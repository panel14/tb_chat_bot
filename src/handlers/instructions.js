const { Markup } = require('telegraf');
const apiService = require('../services/ApiService/ApiService');
const instructionsService = require('../services/InstructionsService/InstructionsService');

const callback_inst_type = {
    'callback_image': 1,
    'callback_video': 2
}

handleInstruction = async (ctx, instId) => {
    const content = ctx.session.contents[instId];
    const buffer = Buffer.from(content.content, 'base64');
    console.log('Размер (МБ):', buffer.length / 1024 /1024);
    switch (content.type) {
        case 'STRING':
            await ctx.reply(buffer.toString('utf-8'))
            break;

        case 'PHOTO':
            await ctx.replyWithPhoto({
                source: buffer
            });
            break;

        case 'VIDEO':
            await ctx.replyWithVideo({
                source: buffer
            });
            break;

        case 'LINK':
            const url = contentBuffer.toString('utf-8');
            await ctx.reply('Перейдите по ссылке:',
                Markup.inlineKeyboard([Markup.button.url('Открыть', url)])
            );
            break;

        default:
            break;
    }
}

handleInstrcutionCreate = async (ctx) => {
    if (!ctx.session?.isntructionCreation) {
        ctx.session.isntructionCreation = {
            data: [],
            activeInstruction: 0
        };
    }
    else {
        ctx.session.isntructionCreation.activeInstruction = ctx.session.isntructionCreation.data.length;
    }
    await ctx.reply('Создание новой инструкции. Загрузите контент (перетащите изображение или видео):');
}

exports.setupInstructionsHandlers = async (bot) => {
    
    bot.hears(/^Инструкция (.+)(:.+)?$/, async (ctx) => {
        const instId = ctx.match[1];
        await handleInstruction(ctx, instId);
    });

    bot.hears('Добавить новую инструкцию', async (ctx) => {
        await handleInstrcutionCreate(ctx);
    });

    bot.action('Добавить', async (ctx) => {
        ctx.answerCbQuery();
        if (!ctx.session.isntructionCreation) return;
        await handleInstrcutionCreate(ctx);
    });

    bot.action('Отправить', async(ctx) => {
        if (!ctx.session.isntructionCreation) return;
        await instructionsService.addInstructionsToTheme({
            authorTgId: ctx.from.id,
            themeId: ctx.session.currentThemeId,
            instructions: ctx.session.isntructionCreation.data
        });
        ctx.answerCbQuery();
        await ctx.reply('Инструкции успешно добавлены!');
        delete ctx.session.isntructionCreation;
    });

    bot.on(['photo', 'video'], async (ctx) => {
        if (!ctx.session.isntructionCreation) return;

        let fileId = 0;
        let typeId = -1;

        if (ctx.message.photo) {
            fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            typeId = callback_inst_type.callback_image;
        }
        else if (ctx.message.video) {
            fileId = ctx.message.video.file_id;
            typeId = callback_inst_type.callback_video;
        }

        const fileLink = await ctx.telegram.getFileLink(fileId);

        const file = await apiService.get(fileLink, null, { responseType: 'arraybuffer' });
        ctx.session.isntructionCreation.data.push({ typeId: typeId, content: file});

        await ctx.reply(`Добавить ещё инструкцию или отправить уже созданные инструкции(${ctx.session.isntructionCreation.data.length})?`,
            Markup.inlineKeyboard(
                [Markup.button.callback('Добавить', 'Добавить'),
                Markup.button.callback('Отправить', 'Отправить')]
            )
        )
    });
}