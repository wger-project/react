import { CHART_RANGES, ChartRange } from "@/components/Measurements";

const STORAGE_KEY = 'wgerAnalyticsRange';

export const loadAnalyticsRange = (): ChartRange => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if ((CHART_RANGES as readonly string[]).includes(stored ?? '')) {
            return stored as ChartRange;
        }
    } catch {
        // A blocked storage must not prevent loading the analytics page.
    }
    return 'lastYear';
};

export const saveAnalyticsRange = (range: ChartRange) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, range);
    } catch {
        // The selected range still applies for this page load.
    }
};
