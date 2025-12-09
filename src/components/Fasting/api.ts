// src/components/Fasting/api.ts

import type { FastingWindow } from "components/Fasting/models";

// Base URL of the Django server; make sure VITE_BASE_URL is set in .env.development
const API_BASE = import.meta.env.VITE_BASE_URL ?? "http://localhost:8000";

function getApiUrl(path: string) {
    return `${API_BASE}${path}`;
}

// GET /api/v2/fastingwindow/
export async function fetchFastingWindows(): Promise<FastingWindow[]> {
    const res = await fetch(getApiUrl("/api/v2/fastingwindow/"), {
        //credentials: "include", // send session cookie
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch fasting windows: ${res.status}`);
    }

    const data = await res.json();

    // DRF can return either a plain list or a paginated { results: [...] }
    if (Array.isArray(data)) {
        return data as FastingWindow[];
    }
    if (Array.isArray(data.results)) {
        return data.results as FastingWindow[];
    }
    return [];
}

// POST /api/v2/fastingwindow/
interface StartFastBody {
    start: string;
    goal_duration_minutes?: number;
    note?: string;
}

export async function startFast(
    goalMinutes?: number,
    note?: string
): Promise<FastingWindow> {
    const body: StartFastBody = {
        start: new Date().toISOString(),
    };

    if (goalMinutes != null) {
        // keep snake_case for the Django field, but avoid camelcase lint errors
        body["goal_duration_minutes"] = goalMinutes;
    }
    if (note) {
        body.note = note;
    }

    const res = await fetch(getApiUrl("/api/v2/fastingwindow/"), {
        method: "POST",
        //credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to start fast: ${res.status} – ${text}`);
    }

    return (await res.json()) as FastingWindow;
}

// PATCH /api/v2/fastingwindow/:id/
export async function stopFast(id: number): Promise<FastingWindow> {
    const res = await fetch(getApiUrl(`/api/v2/fastingwindow/${id}/`), {
        method: "PATCH",
        //credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            end: new Date().toISOString(),
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to stop fast: ${res.status} – ${text}`);
    }

    return (await res.json()) as FastingWindow;
}
