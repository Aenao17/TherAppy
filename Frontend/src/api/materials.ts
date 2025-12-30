import { getJsonAuth, postJsonAuth } from "./api";

export type MaterialItem = {
    id: number;
    filename: string;
    contentType: string;
    sizeBytes: number;
    uploadedAt: string;
};

export async function listMyMaterials() {
    const r = await getJsonAuth<{ items: MaterialItem[] }>("/api/materials/mine");
    return r.items;
}

export async function listClientMaterials(clientId: number) {
    const r = await getJsonAuth<{ items: MaterialItem[] }>(`/api/materials/clients/${clientId}`);
    return r.items;
}

import { getAccessToken } from "../auth/authStorage"; // folosește sursa ta reală

export async function uploadClientMaterial(clientId: number, file: File) {
    const form = new FormData();
    form.append("file", file); // cheia trebuie să fie "file"

    const token = getAccessToken();

    const resp = await fetch(`http://localhost:8080/api/materials/clients/${clientId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // IMPORTANT: NU pune Content-Type aici!
        },
        body: form,
    });

    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    return (await resp.json()) as { id: number };
}

export async function downloadUrl(materialId: number) {
    const token = getAccessToken();

    const resp = await fetch(`http://localhost:8080/api/materials/${materialId}/download`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!resp.ok) {
        throw new Error(await resp.text());
    }

    // încercăm să luăm filename din header
    const cd = resp.headers.get("Content-Disposition") || resp.headers.get("content-disposition") || "";
    const match = cd.match(/filename="(.+?)"/);
    const filename = match?.[1] || `material-${materialId}`;

    const blob = await resp.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function deleteMaterial(materialId: number) {
    const token = getAccessToken();

    const resp = await fetch(`http://localhost:8080/api/materials/${materialId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!resp.ok) {
        throw new Error(await resp.text());
    }
}
