import { eq } from "drizzle-orm/sql/expressions/conditions";
import { VideoThumbnailUserInsert } from "../utils/types";
import { mapDbUserToUser } from "../utils/types";
import { SaveUserData } from "../utils/types";
import { ADMIN_CHAT } from "../utils/constants";
import { sendLog } from "./log";
import { User } from "../utils/types";
import { vtu } from "../db/schema";
import { CTX } from "../utils/types";
import { bot } from "../bot";
import { db } from "../db";

export function userLink(user: User): string {
    const fullName = `${user.first_name || "Noma'lum"} ${user.last_name || ""}`;
    return user.username ? `<a href="tg://resolve?domain=${user.username}">${fullName}</a>` : `<a href="tg://user?id=${user.tg_id}">${fullName}</a>`;
}

export function groupLink(chat: { id: number; title?: string; username?: string | null }): string {
    const name = chat.title || "Noma'lum";
    return chat.username ? `<a href="https://t.me/${chat.username}">${name}</a>` : name;
}

export async function saveUser(ctx: CTX, data?: SaveUserData): Promise<User[]> {
    const user = ctx.from;
    if (!user) return [];

    const userData: User = {
        tg_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
    };

    if (data?.today_count) userData.today_count = data.today_count;
    if (data?.total_count) userData.total_count = data.total_count;

    try {
        const whereCondition = eq(vtu.tg_id, String(userData.tg_id));
        const [existingUser] = await db.select().from(vtu).where(whereCondition).limit(1);

        if (!existingUser) {
            const utm = data?.utm || "-";
            const username = user.username ? `@${user.username}` : "Noma'lum";
            const userlink = userLink(userData);
            const msg =
                `🆕 Yangi foydalanuvchi:\n\n👤 Ism: ${userlink}\n🔗 Username: ${username}\n` +
                `🆔 ID: <code>${user.id}</code>\n🚪 Source: ${utm}\n🤖 Bot: @video_thumbs_bot`;
            await bot.api.sendMessage(ADMIN_CHAT, msg, { parse_mode: "HTML" });
        }

        const upsertedData = await db
            .insert(vtu)
            .values(userData as VideoThumbnailUserInsert)
            .onConflictDoUpdate({ target: vtu.tg_id, set: userData as VideoThumbnailUserInsert })
            .returning();

        return upsertedData.map(mapDbUserToUser);
    } catch (error) {
        console.log(error);

        const user = {
            tg_id: ctx.from?.id || "",
            first_name: ctx.from?.first_name || "",
            last_name: ctx.from?.last_name || "",
            username: ctx.from?.username || "",
        };

        if (error instanceof Error) {
            await sendLog(`User create qilib bo'lmadi\n\n User: (${userLink(user)})\nError type: Error\nError message: ${error.message}`);
        } else {
            await sendLog(`User create qilib bo'lmadi\n\n User: (${userLink(user)})\nError type: Unknown Error\nError message: ${String(error)}`);
        }

        return [];
    }
}

export const counter = async (ctx: CTX) => {
    const tg_id = ctx.from?.id;

    const whereCondition = eq(vtu.tg_id, String(tg_id));
    const [user] = await db.select().from(vtu).where(whereCondition).limit(1);

    if (user) {
        let { total_count, today_count } = user;

        today_count++;
        total_count++;

        const userData = { today_count, total_count };
        await db.update(vtu).set(userData).where(whereCondition);
    } else {
        saveUser(ctx, { today_count: 1, total_count: 1 });
    }
};
