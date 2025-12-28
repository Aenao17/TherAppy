import { getAccessToken } from "./authStorage";

export type AppRole = "ADMIN" | "USER" | "CLIENT" | "PSYCHOLOGIST";

export function getRole(): AppRole | null {
    const token = getAccessToken();
    if (!token) return null;

    const payload = parseJwt(token);
    const role = payload?.role;

    if (role === "ADMIN" || role === "USER" || role === "CLIENT" || role === "PSYCHOLOGIST") {
        return role;
    }
    return null;
}

export function getUsername(): string | null {
    const token = getAccessToken();
    if (!token) return null;

    const payload = parseJwt(token);
    const username = payload?.sub;

    if (typeof username === "string") {
        return username;
    }
    return null;
}



export function parseJwt(token: string): any | null {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}