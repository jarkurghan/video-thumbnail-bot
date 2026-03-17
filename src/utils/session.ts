import { SessionData } from "./types";

export function initial(): SessionData {
    return { last_video_id: "", last_photo_id: "", success: false };
}
