import { sendAdmin, sendErrorLog, sendLog } from "./log";
import { userLink } from "./save-user";
import { UserStatus } from "../utils/types";
import { Context } from "grammy";
import { vtu } from "../db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../db";

export async function changeStatusOld(tg_id: number | string, status: UserStatus): Promise<void> {
    try {
        const updated = await db
            .update(vtu)
            .set({ status: status })
            .where(eq(vtu.tg_id, String(tg_id)))
            .returning();

        if (!updated.length) {
            await sendLog(`❗️ Status o'zgartirilmadi (foydalanuvchi topilmadi):\n\n👤 User ID: ${tg_id}`);
        } else {
            await sendLog(`⚰️ Foydalanuvchi ${tg_id} uchun status o'zgartirildi`);
        }
    } catch (error) {
        const errorMsg = `❗️ Status o'zgartirish jarayonida xatolik yuz berdi:\n\n👤 User ID: ${tg_id}\n💣 Xato: `;
        if (error instanceof Error) {
            await sendLog(`${errorMsg}${error.message}`);
        } else {
            await sendLog(`${errorMsg}${error}`);
        }
    }
}

export async function changeStatus(ctx: Context, status: UserStatus): Promise<void> {
    const tg_id = ctx.from?.id;
    if (!tg_id) return;

    const user = { tg_id, first_name: ctx.from?.first_name || "", last_name: ctx.from?.last_name || "", username: ctx.from?.username || "" };
    const userlink = userLink(user);

    try {
        const whereCondition = eq(vtu.tg_id, String(tg_id));
        const [updated] = await db.update(vtu).set({ status }).where(whereCondition).returning();

        if (!updated) {
            const msg =
                `❗️ <b>Xato:</b>\n\n` +
                `🔦 Tafsilot: Status o'zgartirilmadi (foydalanuvchi topilmadi)\n` +
                `🆔 User ID: <code>${tg_id}</code>\n` +
                `👤 User: ${userlink}`;

            await sendLog(msg);
        } else {
            const msg =
                `♻️ Status o'zgartirildi:\n\n` +
                `👤 Ism: ${userlink}\n` +
                `🆔 User ID: <code>${tg_id}</code>\n` +
                `🔦 Yangi status: ${status}\n` +
                `🤖 Bot: @video_thumbs_bot`;
            await sendAdmin(msg);
        }
    } catch (error) {
        await sendErrorLog({ event: "Status o'zgartirish jarayonida xatolik yuz berdi", error, ctx });
    }
}
