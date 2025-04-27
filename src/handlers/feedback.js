const { Markup } = require('telegraf');
const questionService = require('../services/FeedbackService/FeedbackService');
const themes = require('../handlers/themes')

const handleFeedbackForm = async (ctx) => {
    const feedbackKeyboard = [
        ['Задать вопрос', 'Мои вопросы'],
    ];
    if (ctx.session.role === 'ROLE_ADMIN') {
        feedbackKeyboard.push(['Ответить на вопрос'])
    }
    feedbackKeyboard.push(['Вернуться в главное меню'])
    await ctx.reply('Форма обратной связи', Markup.keyboard(feedbackKeyboard).resize());
};

const handleAskQuestion = async (ctx) => {
    if (!ctx.session) ctx.session = {};
    ctx.session.awaitingQuestion = true;
    await ctx.reply(
        'Пожалуйста, напишите ваш вопрос:',
        Markup.keyboard([
            ['Отменить вопрос']
        ]).resize()
    );
};

const handleMyQuestions = async (ctx) => {
    const questions = await questionService.list(ctx.from.id);

    if (questions.length === 0) {
        await ctx.reply('У вас пока нет заданных вопросов.');
        return;
    }


    let message = 'Ваши вопросы:\n\n';
    questions.forEach((question, index) => {
        message += `${index + 1}. Вопрос: ${question.question}\n`;
        message += `    Статус: ${question.answer ? 'Отвечен' : 'В обработке'}\n`;
        if (question.answer) message += `    Ответ: ${question.answer}\n`;
        message += '\n';
    });

    await ctx.reply(message);
};

const handleQuestionCreation = async (ctx) => {
    if (!ctx.session.awaitingQuestion ||
        ctx.message.text.startsWith('/') ||
        ['Отменить вопрос', 'Вернуться в главное меню', 'Задать вопрос', 'Мои вопросы', 'Ответить на вопрос', 'Отменить ответ'].includes(ctx.message.text)) {
        return;
    }

    const response = await questionService.create(
        ctx.from.id,
        ctx.message.text
    );

    ctx.session.awaitingQuestion = false;
    if (response === true) {
        await ctx.reply(
            'Ваш вопрос успешно отправлен! Мы ответим на него в ближайшее время.',
            await handleFeedbackForm(ctx)
        );
    } else {
        await ctx.reply('Произошла ошибка при отправке вопроса. Попробуйте позже.');
    }
}

const handleAnswerQuestion = async (ctx) => {
    const questions = await questionService.getForAnswer();
    if (questions.length === 0) {
        await ctx.reply('Нет вопросов для ответа.');
        return;
    }
    let inlineKeyboard = [];
    questions.forEach((question, index) => {
        inlineKeyboard.push([Markup.button.callback(`${index + 1}. ${question.question}`, `answer_${question.id}`)]);
    });
    await ctx.reply('Выберите вопрос для ответа:', Markup.inlineKeyboard(inlineKeyboard));
}

exports.setupFeedbackHandlers = (bot) => {
    bot.hears('Форма обратной связи', async (ctx) => {
        await handleFeedbackForm(ctx);
    });

    bot.hears('Задать вопрос', async (ctx) => {
        await handleAskQuestion(ctx);
    });

    bot.hears('Мои вопросы', async (ctx) => {
        await handleMyQuestions(ctx);
    });

    bot.hears('Отменить вопрос', async (ctx) => {
        ctx.session.awaitingQuestion = false;
        await ctx.reply('Вопрос отменен.');
        await handleFeedbackForm(ctx);
    });

    bot.hears('Ответить на вопрос', async (ctx) => {
        await handleAnswerQuestion(ctx);
    });

    bot.action(/^answer_(\d+)$/, async (ctx) => {
        const questionId = ctx.match[1];
        ctx.session.answeringQuestionId = questionId;
        await ctx.reply(
            'Введите ответ на вопрос:',
            Markup.keyboard([['Отменить']])
                .resize()
                .persistent()
        );
    });

    bot.hears('Отменить ответ', async (ctx) => {
        if (ctx.session.answeringQuestionId) {
            delete ctx.session.answeringQuestionId;
            await ctx.reply('Ответ отменен.');
            await handleFeedbackForm(ctx);
        } else if (ctx.session.awaitingQuestion) {
            ctx.session.awaitingQuestion = false;
            await ctx.reply('Вопрос отменен.');
            await handleFeedbackForm(ctx);
        }
    });

    bot.hears('Вернуться в главное меню', async (ctx) => {
        await themes.handleTheme(ctx, null, 'Вы вернулись в главное меню\n');
    });

    bot.on('text', async (ctx, next) => {
        if (ctx.session?.answeringQuestionId) {
            const response = await questionService.answerQuestion(
                ctx.session.answeringQuestionId,
                ctx.message.text,
                ctx.from.id
            );
            delete ctx.session.answeringQuestionId;
            if (response === true) {
                await ctx.reply('Ответ успешно отправлен!');
                await handleFeedbackForm(ctx);
            } else {
                await ctx.reply('Произошла ошибка при отправке ответа. Попробуйте позже.');
            }
        } else {
            await handleQuestionCreation(ctx);
        }
        await next();
    });
};