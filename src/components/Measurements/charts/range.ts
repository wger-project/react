import { ChartPoint } from "@/components/Measurements/charts/series";

/**
 * How far back the charts go.
 *
 * The default is the shortest one: a chart is only readable if the span it
 * covers is, and the recent values are what tracking progress is about.
 */
export const CHART_RANGES = ['last3Months', 'lastYear', 'all'] as const;
export type ChartRange = typeof CHART_RANGES[number];

export const DEFAULT_CHART_RANGE: ChartRange = 'last3Months';

const DAYS: Record<ChartRange, number | null> = {
    last3Months: 90,
    lastYear: 365,
    all: null,
};

/** Oldest date still shown, null for the full history */
export const cutoffFor = (range: ChartRange, now: Date = new Date()): Date | null => {
    const days = DAYS[range];

    return days === null ? null : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

/** The points from the cutoff on; a null cutoff covers the full history */
export const pointsSince = (points: ChartPoint[], cutoff: Date | null): ChartPoint[] =>
    cutoff === null ? points : points.filter(point => point.date >= cutoff.getTime());
