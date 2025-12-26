const BASE_URL = "http://localhost:8080"; // pentru moment, hardcodat

export type ApiError = {
    error?: string;
};

import { getAccessToken } from "../auth/authStorage";

export async function getJsonAuth<TResponse>(path: string): Promise<TResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        let payload: ApiError | null = null;
        try {
            payload = await res.json();
        } catch {
            // ignore
        }
        const msg = payload?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return (await res.json()) as TResponse;
}

export async function patchJsonAuth<TResponse>(
    path: string,
    body: unknown
): Promise<TResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        let payload: ApiError | null = null;
        try {
            payload = await res.json();
        } catch {}
        const msg = payload?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    // majoritatea endpointurilor noastre returnează void
    if (res.status === 204) return undefined as TResponse;
    if (res.headers.get("content-type")?.includes("application/json")) {
        return (await res.json()) as TResponse;
    }
    return undefined as TResponse;
}

export async function deleteAuth(path: string): Promise<void> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        let payload: ApiError | null = null;
        try {
            payload = await res.json();
        } catch {}
        const msg = payload?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }
}

export async function postJson<TResponse>(
    path: string,
    body: unknown
): Promise<TResponse> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        let payload: ApiError | null = null;
        try {
            payload = await res.json();
        } catch {
            // ignore
        }
        const msg = payload?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return (await res.json()) as TResponse;
}
