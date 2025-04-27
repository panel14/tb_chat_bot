require('dotenv').config();
const { Markup } = require('telegraf');
const apiService = require('../services/ApiService/ApiService');
const instructionsService = require('../services/InstructionsService/InstructionsService');

const handleInstructions = async (ctx) => {
    ctx.session.contents.forEach(async (content) => {
        const buffer = Buffer.from(content.content, 'base64');
        switch (content.type) {
            case 'TEXT':
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
                await ctx.reply('Неизвестный тип инструкции! Обратитесь в службу поддержки.')
                break;
        }
    });
}

const handleInstrcutionCreate = async (ctx) => {
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

const handleInstructionsContent = async (ctx) => {
    if (!ctx.session.isntructionCreation) return;

    let fileId = 0;
    let typeId = -1;

    let content = null;
    if (ctx.message.photo || ctx.message.video) {
        if (ctx.message.photo) {
            fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            typeId = process.env.INSTRUCTIONS_CONTENT_MAPPING_IMAGE;
        }
        else if (ctx.message.video) {
            fileId = ctx.message.video.file_id;
            typeId = process.env.INSTRUCTIONS_CONTENT_MAPPING_VIDEO;
        }

        const fileLink = await ctx.telegram.getFileLink(fileId);

        content = await apiService.get(fileLink, null, { responseType: 'arraybuffer' });
    }
    else if (ctx.message.text) {
        typeId = process.env.INSTRUCTIONS_CONTENT_MAPPING_TEXT;
        content = Buffer.from(ctx.message.text, 'utf-8');
    }
    ctx.session.isntructionCreation.data.push({ typeId: typeId, content: content});

    await ctx.reply(`Добавить ещё инструкцию или отправить уже созданные инструкции(${ctx.session.isntructionCreation.data.length})?`,
        Markup.inlineKeyboard(
            [Markup.button.callback('Добавить', 'Добавить'),
            Markup.button.callback('Отправить', 'Отправить')]
        )
    );
} 

exports.setupInstructionsHandlers = async (bot) => {
    
    bot.hears('Показать инструкции', async (ctx) => {
        await handleInstructions(ctx);
    });

    bot.hears('Обновить список инструкций', async (ctx) => {
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

    bot.on(['photo', 'video', 'text'], async (ctx, next) => {
        await handleInstructionsContent(ctx);
        await next();
    });
}