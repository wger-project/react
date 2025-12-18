// src/components/Fasting/models.ts

export interface FastingWindow {
    id: number;
    start: string;            // ISO datetime string
    end: string | null;       // null while fasting
    goal_duration_minutes: number | null;
    note: string;
}
