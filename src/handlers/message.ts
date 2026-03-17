import { saveUser } from "../services/save-user";
import { CTX, SessionData } from "../utils/types";
import { MESSAGES } from "../utils/constants";

export async function messageHandler(ctx: CTX & { session: SessionData }) {
    await saveUser(ctx);

    const msg = ctx.message;
    if (!msg || "video" in msg || "photo" in msg) return;

    if (!ctx.session.last_video_id || ctx.session.success) {
        await ctx.reply(MESSAGES.SEND_VIDEO);
    } else {
        await ctx.reply(MESSAGES.SEND_PHOTO);
    }
}
