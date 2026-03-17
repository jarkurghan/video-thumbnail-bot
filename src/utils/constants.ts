export const BOT_TOKEN = process.env.BOT_TOKEN || "";
export const ADMIN_CHAT = process.env.ADMIN_CHAT_ID || "";
export const LOG_CHAT = process.env.LOG_CHAT_ID || "";
export const ADMIN_ID = process.env.ADMIN_PRIVATE_CHAT_ID || "";

export const MESSAGES = {
    START: "👋 Xush kelibsiz!\n\nMenga video va rasm yuboring, men siz yuborgan video uchun thumbnail rasmini o'zgartiraman!",
    SEND_VIDEO: "🎥 Video yuboring!",
    SEND_PHOTO: "🖼️ Rasm yuboring!",
    VIDEO_SAVED: "✅ Video saqlandi, rasm yuboring!",
    PHOTO_SAVED: "✅ Rasm saqlandi, video yuboring!",
    SUCCESS_TITLE: "@video_thumbs_bot orqali video thumbnail rasmi o'zgartirildi",
    ERROR: "❌ Xatolik yuz berdi, keyinroq qayta urinib ko'ring.",
};
