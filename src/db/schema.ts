import { integer, pgTable, text, varchar, uniqueIndex, timestamp, boolean } from "drizzle-orm/pg-core";

export const vtu = pgTable(
    "video_thumbnail_users",
    {
        id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
        tg_id: varchar("tg_id", { length: 255 }),
        first_name: text("first_name"),
        last_name: text("last_name"),
        username: text("username"),
        today_count: integer("today_count").default(0).notNull(),
        total_count: integer("total_count").default(0).notNull(),
        is_blocked: boolean("is_blocked").default(false).notNull(),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [uniqueIndex("video_thumbnail_users_bot_tg_id_unique").on(table.tg_id)],
);
