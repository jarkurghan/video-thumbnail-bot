import type { CommandContext, Context } from "grammy";
import { saveUser } from "../services/save-user";
import { MESSAGES } from "../utils/constants";
import { sendErrorLog } from "@/services/log";

export async function registerStartCommand(ctx: CommandContext<Context>) {
    try {
        const payload = ctx.match;
        const utm = payload.slice(payload.indexOf("utm-") + 4);

        await saveUser(ctx, { utm });

        await ctx.reply(MESSAGES.START);
    } catch (error) {
        await sendErrorLog({ event: "Start bosganda", error, ctx });
    }
}
