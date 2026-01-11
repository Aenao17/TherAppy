
import { Capacitor } from '@capacitor/core';

const getBaseUrl = () => {
    if (Capacitor.getPlatform() === 'android') {
        // 10.0.2.2 este adresa specială prin care Emulatorul Android vede localhost-ul PC-ului
        return "http://10.0.2.2:8080";
    }
    return "http://localhost:8080";
};
export const BASE_URL = getBaseUrl();
// const BASE_URL = "http://10.0.2.2:8080";
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

export async function postJsonAuth<TResponse>(
    path: string,
    body: unknown
): Promise<TResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
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

    if (res.status === 204) return undefined as TResponse;
    if (res.headers.get("content-type")?.includes("application/json")) {
        return (await res.json()) as TResponse;
    }
    return undefined as TResponse;
}