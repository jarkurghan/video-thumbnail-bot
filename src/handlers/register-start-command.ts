import type { CommandContext, Context } from "grammy";
import { saveUser } from "../services/save-user";
import { MESSAGES } from "../utils/constants";

export async function registerStartCommand(ctx: CommandContext<Context>) {
    const payload = ctx.match;
    const utm = payload.slice(payload.indexOf("utm-") + 4);

    await saveUser(ctx, { utm });

    await ctx.reply(MESSAGES.START);
}
