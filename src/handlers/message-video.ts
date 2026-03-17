import { GrammyError } from "grammy";
import { counter } from "../services/save-user";
import { saveUser } from "../services/save-user";
import { userLink } from "../services/save-user";
import { MESSAGES } from "../utils/constants";
import { MyContext } from "../utils/types";
import { sendLog } from "../services/log";

export async function messageVideoHandler(ctx: MyContext) {
    try {
        await saveUser(ctx);

        if (!ctx.msg || !ctx.msg.video) return;
        const mediaGroupId = ctx.msg.media_group_id;
        const video_id = ctx.msg.video.file_id;

        // Agar bu media group (album) bo'lsa, faqad birinchi video va birinchi rasm bilan ishlaymiz
        if (mediaGroupId) {
            // Yangi media group bo'lsa, eski holatni tozalaymiz
            if (ctx.session.media_group_id !== mediaGroupId) {
                ctx.session.media_group_id = mediaGroupId;
                ctx.session.media_group_first_photo_id = undefined;
                ctx.session.media_group_first_video_id = undefined;
                ctx.session.media_group_completed = false;
            }

            // Agar allaqachon yakunlangan bo'lsa, boshqa xabarlarni e'tiborsiz qoldiramiz
            if (ctx.session.media_group_completed) return;

            // Faqat birinchi video uchun ishlaymiz
            if (!ctx.session.media_group_first_video_id) {
                ctx.session.media_group_first_video_id = video_id;
            } else {
                // Ikkinchi va keyingi videolarni e'tiborsiz qoldiramiz
                return;
            }

            // Agar birinchi rasm ham mavjud bo'lsa, bitta video va bitta rasm kelgandek ishlaymiz
            if (ctx.session.media_group_first_photo_id) {
                const photo_id = ctx.session.media_group_first_photo_id;

                ctx.session.last_photo_id = photo_id;
                ctx.session.last_video_id = video_id;

                await counter(ctx);
                ctx.session.success = true;

                const caption = MESSAGES.SUCCESS_TITLE;
                await ctx.replyWithVideo(video_id, { caption, cover: photo_id });

                // Shu media group uchun ish yakunlandi
                ctx.session.media_group_completed = true;
            }

            // Media group ichida VIDEO_SAVED/PHOTO_SAVED xabarlari yuborilmaydi
            return;
        }

        // Oddiy (media group bo'lmagan) xabarlar uchun eski mantiq
        if (!ctx.session.last_photo_id || ctx.session.success) {
            ctx.session.last_video_id = video_id;
            ctx.session.last_photo_id = "";

            ctx.session.success = false;
            await ctx.reply(MESSAGES.VIDEO_SAVED);
        } else {
            ctx.session.last_video_id = video_id;

            await counter(ctx);
            ctx.session.success = true;

            const caption = MESSAGES.SUCCESS_TITLE;
            await ctx.replyWithVideo(video_id, { caption, cover: ctx.session.last_photo_id });

            // thumbnail bilan qilish
            // const videoFile = await ctx.api.getFile(video_id);
            // const videoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${videoFile.file_path}`;

            // const photoFile = await ctx.api.getFile(ctx.session.last_photo_id);
            // const thumbnailUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${photoFile.file_path}`;

            // await ctx.replyWithVideo(new InputFile({ url: videoUrl }), { caption, thumbnail: new InputFile({ url: thumbnailUrl }) });
        }
    } catch (error) {
        console.log(error);

        await ctx.reply(MESSAGES.ERROR).catch((e) => console.log(e));

        const user = {
            tg_id: ctx.from?.id || "",
            first_name: ctx.from?.first_name || "",
            last_name: ctx.from?.last_name || "",
            username: ctx.from?.username || "",
        };

        if (error instanceof GrammyError) {
            const description = error.description || "";
            await sendLog(`Xabar yuborishda xatolik\n\n User: (${userLink(user)})\nError type: Grammy Error\nDescription: ${description}`);
        } else if (error instanceof Error) {
            await sendLog(`Xabar yuborishda xatolik\n\n User: (${userLink(user)})\nError type: Error\nError message: ${error.message}`);
        } else {
            await sendLog(`Xabar yuborishda xatolik\n\n User: (${userLink(user)})\nError type: Unknown Error\nError message: ${String(error)}`);
        }
    }
}
