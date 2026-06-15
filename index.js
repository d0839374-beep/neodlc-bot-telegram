const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_URL = process.env.DISCORD_URL;
const DOWNLOAD_URL = process.env.DOWNLOAD_URL;
const STATUS_TEXT = process.env.STATUS_TEXT; 

// Проверка обязательных переменных
if (!BOT_TOKEN || !DISCORD_URL || !DOWNLOAD_URL || !STATUS_TEXT) {
    console.error('Ошибка: BOT_TOKEN, DISCORD_URL, DOWNLOAD_URL, STATUS_TEXT не обнаружены');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const WELCOME_TEXT = `
✨ Добро пожаловать в **Neo DLC | 1.21.4** ✨

Выберите действие с помощью кнопок ниже:
`;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        inline_keyboard: [
            [{ text: 'Присоединиться к Discord', url: DISCORD_URL }],
            [
                { text: 'Сайт', url: DOWNLOAD_URL },
                { text: 'Статус', callback_data: 'status' }
            ]
        ]
    };
    bot.sendMessage(chatId, WELCOME_TEXT, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
});

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    if (callbackQuery.data === 'status') {
        // Статус — строго из переменной окружения
        const statusMessage = `**СТАТУС:** ${STATUS_TEXT}`;
        bot.editMessageText(statusMessage, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown'
        }).catch(err => console.error('Ошибка редактирования:', err));
    }
    bot.answerCallbackQuery(callbackQuery.id);
});
