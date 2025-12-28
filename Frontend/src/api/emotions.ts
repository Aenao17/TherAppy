import { getJsonAuth, postJsonAuth } from "./api";

export type EmotionLogItem = {
    id: number;
    createdAt: string;
    text: string;
};

export async function createEmotion(text: string): Promise<void> {
    await postJsonAuth<void>("/api/emotions", { text });
}

export async function getEmotions(): Promise<EmotionLogItem[]> {
    const resp = await getJsonAuth<{ items: EmotionLogItem[] }>("/api/emotions");
    return resp.items;
}