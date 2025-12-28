import { getJsonAuth, postJsonAuth } from "./api";

export type MoodItem = {
    id: number;
    createdAt: string;
    score: number; // 1..5
};

export async function createMood(score: number): Promise<void> {
    await postJsonAuth<void>("/api/mood", { score });
}

export async function getMood(): Promise<MoodItem[]> {
    const resp = await getJsonAuth<{ items: MoodItem[] }>("/api/mood");
    return resp.items;
}