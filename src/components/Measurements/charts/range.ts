import { AVERAGE_WINDOWS } from "@/components/Measurements/models/Category";
import { ChartPoint } from "@/components/Measurements/charts/series";

/**
 * How far back the charts go.
 *
 * The default is the shortest one: a chart is only readable if the span it
 * covers is, and the recent values are what tracking progress is about.
 */
export const CHART_RANGES = ['lastMonth', 'last3Months', 'lastYear', 'all'] as const;
export type ChartRange = typeof CHART_RANGES[number];

export const DEFAULT_CHART_RANGE: ChartRange = 'last3Months';

const DAY_MS = 24 * 60 * 60 * 1000;

const DAYS: Record<ChartRange, number | null> = {
    lastMonth: 30,
    last3Months: 90,
    lastYear: 365,
    all: null,
};

/** Oldest date still shown, null for the full history */
export const cutoffFor = (range: ChartRange, now: Date = new Date()): Date | null => {
    const days = DAYS[range];

    return days === null ? null : new Date(now.getTime() - days * DAY_MS);
};

/**
 * Days fetched beyond the cutoff, so the moving average of the first days in
 * range averages the days before them instead of starting over at the cutoff.
 *
 * The largest window a category can be set to, rather than its own: this ends
 * up in a query key, so deriving it from the setting would refetch whenever
 * the setting changes.
 */
const AVERAGE_LEAD_DAYS = Math.max(...AVERAGE_WINDOWS);

/**
 * Oldest entry to fetch for a range, null for the full history.
 *
 * Rounded down to midnight, and deliberately so: this ends up in a query key,
 * and a bound derived from the current instant would differ on every render
 * and refetch forever.
 */
export const fetchCutoffFor = (range: ChartRange, now: Date = new Date()): Date | null => {
    const cutoff = cutoffFor(range, now);
    if (cutoff === null) {
        return null;
    }

    const lead = new Date(cutoff.getTime() - AVERAGE_LEAD_DAYS * DAY_MS);

    return new Date(lead.getFullYear(), lead.getMonth(), lead.getDate());
};

/**
 * Entry filter that fetches only what a range needs, empty for the full
 * history. The server has an index on (category, date), so this is cheaper
 * than fetching everything and filtering here.
 */
export const entryFilterFor = (range: ChartRange, now: Date = new Date()): object => {
    const cutoff = fetchCutoffFor(range, now);

    return cutoff === null ? {} : { "date__gte": cutoff.toISOString() };
};

/** The points from the cutoff on; a null cutoff covers the full history */
export const pointsSince = (points: ChartPoint[], cutoff: Date | null): ChartPoint[] =>
    cutoff === null ? points : points.filter(point => point.date >= cutoff.getTime());
