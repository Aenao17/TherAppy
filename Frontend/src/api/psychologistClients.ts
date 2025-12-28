import { getJsonAuth } from "./api";

export type PsychClient = {
    id: number;
    username: string;
};

export type ClientsPageResponse = {
    items: PsychClient[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export async function getMyClients(params: {
    search?: string;
    page: number;
    size: number;
}): Promise<ClientsPageResponse> {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("size", String(params.size));
    if (params.search && params.search.trim().length > 0) {
        qs.set("search", params.search.trim());
    }

    return await getJsonAuth<ClientsPageResponse>(`/api/psychologist/clients?${qs.toString()}`);
}