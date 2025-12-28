import { postJsonAuth } from "./api";

export async function triggerPanic(longPress: boolean) {
    return await postJsonAuth<{ id: number }>("/api/panic/trigger", { longPress });
}