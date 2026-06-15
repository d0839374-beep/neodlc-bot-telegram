const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_URL = process.env.DISCORD_URL;
const DOWNLOAD_URL = process.env.DOWNLOAD_URL;
const STATUS_TEXT = process.env.STATUS_TEXT;
const INFO_TEXT = process.env.INFO_TEXT;

if (!BOT_TOKEN || !DISCORD_URL || !DOWNLOAD_URL || !STATUS_TEXT  || !INFO_TEXT) {
    console.error('Ошибка: BOT_TOKEN, DISCORD_URL, DOWNLOAD_URL, STATUS_TEXT,INFO_TEXT не обнаружено');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const WELCOME_TEXT = `
✨ Добро пожаловать в **Neo DLC | 1.21.4** ✨

`;

const mainKeyboard = {
    inline_keyboard: [
        [{ text: 'Посетить Discord', url: DISCORD_URL }],
        [
            { text: 'Посетить Сайт', url: DOWNLOAD_URL },
            { text: 'Статус', callback_data: 'status' }
        ],
        [{ text: 'Информация', url: INFO_TEXT }]
    ]
};

const backKeyboard = {
    inline_keyboard: [[{ text: 'Назад', callback_data: 'back_to_menu' }]]
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const photoPath = path.join(__dirname, 'neodlc.png');

    if (fs.existsSync(photoPath)) {
        const photoStream = fs.createReadStream(photoPath);
        try {
            await bot.sendPhoto(chatId, photoStream, {
                caption: WELCOME_TEXT,
                parse_mode: 'Markdown',
                reply_markup: mainKeyboard
            });
        } catch (err) {
            console.error('Ошибка отправки фото:', err.message);
            await bot.sendMessage(chatId, WELCOME_TEXT, {
                parse_mode: 'Markdown',
                reply_markup: mainKeyboard
            });
        }
    } else {
        console.error(`Файл ${photoPath} не найден`);
        await bot.sendMessage(chatId, WELCOME_TEXT, {
            parse_mode: 'Markdown',
            reply_markup: mainKeyboard
        });
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (data === 'status') {
        const statusMessage = `**СТАТУС:** ${STATUS_TEXT}`;
        try {
            await bot.editMessageText(statusMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: backKeyboard
            });
        } catch (err) {
            console.error('Ошибка редактирования на статус:', err.message);
        }
    }
    else if (data === 'back_to_menu') {
        try {
            await bot.editMessageText(WELCOME_TEXT, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: mainKeyboard
            });
        } catch (err) {
            console.error('Ошибка возврата в меню:', err.message);
        }
    }

    await bot.answerCallbackQuery(callbackQuery.id);
});
