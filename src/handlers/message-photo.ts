import { GrammyError } from "grammy";
import { counter } from "../services/save-user";
import { saveUser } from "../services/save-user";
import { userLink } from "../services/save-user";
import { MESSAGES } from "../utils/constants";
import { MyContext } from "../utils/types";
import { sendErrorLog, sendLog } from "../services/log";

export async function messagePhotoHandler(ctx: MyContext) {
    try {
        await saveUser(ctx);

        if (!ctx.msg || !ctx.msg.photo) return;
        const mediaGroupId = ctx.msg.media_group_id;
        const photo_id = ctx.msg.photo[ctx.msg.photo.length - 1]?.file_id;

        // Agar bu media group (album) bo'lsa, faqad birinchi rasm va birinchi video bilan ishlaymiz
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

            // Faqat birinchi rasm uchun ishlaymiz
            if (!ctx.session.media_group_first_photo_id) {
                ctx.session.media_group_first_photo_id = photo_id;
            } else {
                // Ikkinchi va keyingi rasmlarni e'tiborsiz qoldiramiz
                return;
            }

            // Agar birinchi video ham mavjud bo'lsa, bitta video va bitta rasm kelgandek ishlaymiz
            if (ctx.session.media_group_first_video_id) {
                const video_id = ctx.session.media_group_first_video_id;

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
        if (!ctx.session.last_video_id || ctx.session.success) {
            ctx.session.last_photo_id = photo_id;
            ctx.session.last_video_id = "";

            ctx.session.success = false;
            await ctx.reply(MESSAGES.PHOTO_SAVED);
        } else {
            ctx.session.last_photo_id = photo_id;

            await counter(ctx);
            ctx.session.success = true;

            const caption = MESSAGES.SUCCESS_TITLE;
            await ctx.replyWithVideo(ctx.session.last_video_id, { caption, cover: photo_id });
        }
    } catch (error) {
        await ctx.reply(MESSAGES.ERROR).catch((e) => console.log(e));
        sendErrorLog({ ctx, event: "message_photo", error });
    }
}
