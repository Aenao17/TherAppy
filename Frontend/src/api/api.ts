const BASE_URL = "http://localhost:8080"; // pentru moment, hardcodat

export type ApiError = {
    error?: string;
};

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
