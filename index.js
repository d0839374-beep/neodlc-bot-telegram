const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_URL = process.env.DISCORD_URL;
const DOWNLOAD_URL = process.env.DOWNLOAD_URL;
const STATUS_TEXT = process.env.STATUS_TEXT;

if (!BOT_TOKEN || !DISCORD_URL || !DOWNLOAD_URL || !STATUS_TEXT) {
    console.error('Ошибка: все переменные окружения должны быть заданы');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const WELCOME_TEXT = `
✨ Добро пожаловать в **Neo DLC | 1.21.4 Free** ✨

Выберите действие с помощью кнопок ниже:
• Discord – присоединиться к нашему сообществу
• Скачать клиент – получить актуальную версию
• Статус – узнать текущее состояние сервера
`;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        inline_keyboard: [
            [{ text: '🎮 Discord', url: DISCORD_URL }],
            [
                { text: '⬇️ Скачать клиент', url: DOWNLOAD_URL },
                { text: '📊 Статус', callback_data: 'status' }
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
    const data = callbackQuery.data;

    if (data === 'status') {
        const statusMessage = `🟢 **СТАТУС:** ${STATUS_TEXT}`;
        const keyboardBack = {
            inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_to_menu' }]]
        };
        bot.editMessageText(statusMessage, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: keyboardBack
        }).catch(err => console.error('Ошибка редактирования:', err));
    } 
    else if (data === 'back_to_menu') {
        const keyboardMenu = {
            inline_keyboard: [
                [{ text: '🎮 Discord', url: DISCORD_URL }],
                [
                    { text: '⬇️ Скачать клиент', url: DOWNLOAD_URL },
                    { text: '📊 Статус', callback_data: 'status' }
                ]
            ]
        };
        bot.editMessageText(WELCOME_TEXT, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: keyboardMenu
        }).catch(err => console.error('Ошибка редактирования:', err));
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

console.log('Бот запущен (polling)');
