import { Context, type SessionFlavor } from "grammy";

import { ParseMode } from "@grammyjs/types";
import { CallbackQueryContext } from "grammy";
import { CommandContext } from "grammy";
import { vtu } from "../db/schema";

export interface User {
    id?: number;
    tg_id: string | number;
    first_name: string;
    last_name: string | null;
    username: string | null;
    today_count?: number;
    total_count?: number;
}

export type SaveUserData = { today_count: number; total_count: number; utm?: string } | { today_count?: undefined; total_count?: undefined; utm?: string };

export type CTX = CommandContext<Context> | CallbackQueryContext<Context> | Context | MyContext;

export type LogOptions = { parse_mode?: ParseMode; reply_to_message_id?: number };

export type VideoThumbnailUserSelect = typeof vtu.$inferSelect;
export type VideoThumbnailUserInsert = typeof vtu.$inferInsert;

export function mapDbUserToUser(row: VideoThumbnailUserSelect): User {
    return {
        id: row.id,
        tg_id: row.tg_id ?? "",
        first_name: row.first_name ?? "",
        last_name: row.last_name ?? null,
        username: row.username ?? null,
        today_count: row.today_count,
        total_count: row.total_count,
    };
}

export type Status = "new" | "active" | "inactive" | "deleted_account" | "has_blocked" | "other";

export interface SessionData {
    last_video_id?: string;
    last_photo_id?: string;
    success?: boolean;
    // media group (album) tracking
    media_group_id?: string;
    media_group_first_photo_id?: string;
    media_group_first_video_id?: string;
    media_group_completed?: boolean;
}

export type MyContext = Context & SessionFlavor<SessionData>;
