import { BOT_TOKEN } from "./utils/constants";
import { Bot, session, webhookCallback } from "grammy";
import { registerChatMember } from "./handlers/register-chat-member";
import { registerStartCommand } from "./handlers/register-start-command";
import { registerErrorHandler } from "./handlers/register-error-handler";
import { messageVideoHandler } from "./handlers/message-video";
import { messagePhotoHandler } from "./handlers/message-photo";
import { messageHandler } from "./handlers/message";
import { autoRetry } from "@grammyjs/auto-retry";
import { MyContext } from "./utils/types";
import { initial } from "./utils/session";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN topilmadi!");
export const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(session({ initial }));
bot.api.config.use(autoRetry());

// Faqat shaxsiy (private) chatlarda ishlashi kerak
bot.use(async (ctx, next) => {
    if (ctx.chat?.type !== "private") return;
    return next();
});

bot.command("start", registerStartCommand);

bot.on("message:video", messageVideoHandler);
bot.on("message:photo", messagePhotoHandler);
bot.on("message", messageHandler);

bot.on("my_chat_member", registerChatMember);

bot.catch(registerErrorHandler);

export const handleUpdate = webhookCallback(bot, "hono");

// export function startBot() {
//     return bot.start();
// }
