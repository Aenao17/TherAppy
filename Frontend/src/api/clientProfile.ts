import { getJsonAuth } from "./api";

export type EmotionItem = {
    id: number;
    createdAt: string;
    text: string;
};

export type MoodPoint = {
    createdAt: string;
    score: number;
};

export async function getClientEmotions(clientId: number): Promise<EmotionItem[]> {
    const resp = await getJsonAuth<{ items: EmotionItem[] }>(
        `/api/psychologist/clients/${clientId}/emotions`
    );
    return resp.items;
}

export async function getClientMood(clientId: number): Promise<MoodPoint[]> {
    const resp = await getJsonAuth<{ items: MoodPoint[] }>(
        `/api/psychologist/clients/${clientId}/mood`
    );
    return resp.items;
}