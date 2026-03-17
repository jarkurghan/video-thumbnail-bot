import type { BotError, Context } from "grammy";
import { sendLog } from "../services/log";

export async function registerErrorHandler(err: BotError<Context>) {
    if (err.error instanceof Error) await sendLog(err.error.message);
    else await sendLog(String(err.error));
}
