import {
    chartPointsForBuckets,
    downsample,
    movingAverage,
    smoothedTrendline,
} from "@/components/Measurements/charts/data";
import { pointsSince } from "@/components/Measurements/charts/range";
import { ChartPoint, ChartSeries } from "@/components/Measurements/charts/series";
import { MeasurementBucket } from "@/components/Measurements/models/Bucket";
import {
    averageWindowOf,
    ChartConfig,
    isGroupTotalMetricType,
    isSummedPerDay,
    MeasurementCategory,
    trendPeriodOf,
} from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";

/**
 * The readings of a multi-value group as ranges: one point per timestamp,
 * spanning from the lower component to the upper one.
 *
 * A reading is one event, so it is drawn as a single bar (diastolic to
 * systolic) rather than as two lines: the components belong together, and
 * nothing was measured between two readings. Components are paired by their
 * shared timestamp, which is how both the importer and the group form write
 * them; an unpaired half-reading is skipped, it has no range.
 */
export const groupComponentPoints = (
    group: MeasurementCategory,
    buckets: MeasurementBucket[],
    cutoff: Date | null = null,
): Map<string, ChartPoint[]> => new Map(group.children.map(child => [
    child.id!,
    pointsSince(
        chartPointsForBuckets(
            buckets.filter(bucket => bucket.category === child.id),
            child.unit,
            child.unit,
            // A stage the night was slept in twice is that night's total, not
            // the average of its two stretches
            isSummedPerDay(child.metricType),
        ),
        cutoff,
    ),
]));

export const groupRangeEntries = (points: Map<string, ChartPoint[]>): ChartPoint[] => {
    const byDate = new Map<number, number[]>();
    for (const component of points.values()) {
        for (const point of component) {
            const values = byDate.get(point.date);
            if (values === undefined) {
                byDate.set(point.date, [point.value]);
            } else {
                values.push(point.value);
            }
        }
    }

    const ranges = [...byDate.entries()]
        .filter(([, values]) => values.length > 1)
        .map(([date, values]) => ({
            date: date,
            value: values.reduce((sum, value) => sum + value, 0) / values.length,
            // The low/high assignment comes from the values, not from the
            // component order, so a reordered group still reads correctly
            min: Math.min(...values),
            max: Math.max(...values),
        }))
        .sort((a, b) => a.date - b.date);

    return ranges;
};

/**
 * One series per component of a multi-value group, in the children's in-group
 * order and named after them
 */
export const groupComponentSeries = (
    group: MeasurementCategory,
    points: Map<string, ChartPoint[]>,
    labelOf: (category: MeasurementCategory) => string = category => category.name,
): ChartSeries[] =>
    group.children.map(child => ({
        points: points.get(child.id!) ?? [],
        role: 'component' as const,
        label: labelOf(child),
    }));

/**
 * The values of a category with the average and trend derived from them.
 *
 * The points are condensed before anything is derived: a trend line over raw
 * samples follows the swings within a single day instead of the trend across
 * weeks, and the average would be as dense as the values it summarises. The
 * average itself is computed over every point and only condensed afterwards,
 * so it stays a 7-day average rather than an average of bucket means.
 */
export const measurementSeries = (
    all: ChartPoint[],
    cutoff: Date | null = null,
    config: ChartConfig = {},
): ChartSeries[] => {
    // Both lines can be turned off, then only the values are drawn
    const window = averageWindowOf(config);
    const period = trendPeriodOf(config);

    // The average is computed over the full history and only then cut, so the
    // first points of the range average the days before it instead of
    // starting over at the cutoff
    const average = window === null
        ? []
        : pointsSince(movingAverage(all, window), cutoff);
    const points = pointsSince(all, cutoff);

    const condensed = downsample(points);
    const raw: ChartSeries = { points: condensed, role: 'raw' };

    // A single reading has nothing to average or trend, and recharts draws a
    // dot for a one-point series even where the dots are turned off
    if (points.length < 2) {
        return [raw];
    }

    return [
        raw,
        ...(window === null
            ? []
            : [{ points: downsample(average), role: 'average' } as ChartSeries]),
        ...(period === null
            ? []
            : [{ points: smoothedTrendline(condensed, period), role: 'trend' } as ChartSeries]),
    ];
};

/** The points of the series with the given role, empty when there is none */
export const pointsOfRole = (series: ChartSeries[], role: ChartSeries['role']): ChartPoint[] =>
    series.find(s => s.role === role)?.points ?? [];

/**
 * The components of a group that stack into one whole, i.e. everything but a
 * roll-up component (see isGroupTotalMetricType)
 */
export const stackableComponents = (group: MeasurementCategory): MeasurementCategory[] =>
    group.children.filter(child => !isGroupTotalMetricType(child.metricType));

/** One stacked bar: a day, and what each component contributed to it */
export interface StackedPoint {
    date: number;
    /** Runs parallel to the labels of the chart, a 0 where nothing was reported */
    values: number[];
}

/**
 * One stacked bar per day for the given components, stacked in the order they
 * are given.
 *
 * Only days that any component reported are returned. Values are read through
 * the unit helper, like everywhere else, so a component holding mixed units
 * still stacks correctly.
 */
export const groupStackedEntries = (
    components: MeasurementCategory[],
    points: Map<string, ChartPoint[]>,
): StackedPoint[] => {
    const byDay = new Map<number, number[]>();
    components.forEach((child, index) => {
        for (const point of points.get(child.id!) ?? []) {
            const values = byDay.get(point.date) ?? new Array<number>(components.length).fill(0);
            values[index] += point.value;
            byDay.set(point.date, values);
        }
    });

    return [...byDay.entries()]
        .map(([date, values]) => ({ date: date, values: values }))
        .sort((a, b) => a.date - b.date);
};

/**
 * How the readings of a group are charted.
 *
 * Components that are parts of one whole (the sleep stages) stack into one bar
 * per day. Two components that are the ends of a reading are drawn as a bar
 * spanning it. Anything else stays one line per component: more than two
 * components cannot be a range, and neither can readings that are not paired,
 * which happens once the date of one half is edited apart from the other.
 * Without that fallback the card would go blank while there is data.
 */
export type GroupChart =
    | { kind: 'stacked', points: StackedPoint[], labels: string[] }
    | { kind: 'range', points: ChartPoint[] }
    | { kind: 'components', series: ChartSeries[] };

export const groupChart = (
    group: MeasurementCategory,
    points: Map<string, ChartPoint[]>,
    labelOf: (category: MeasurementCategory) => string = category => category.name,
): GroupChart => {
    if (isSummedPerDay(group.metricType)) {
        const components = stackableComponents(group);
        const stacked = groupStackedEntries(components, points);
        if (stacked.length > 0) {
            return { kind: 'stacked', points: stacked, labels: components.map(labelOf) };
        }
    }

    const ranges = group.children.length === 2 ? groupRangeEntries(points) : [];

    return ranges.length > 0
        ? { kind: 'range', points: ranges }
        : { kind: 'components', series: groupComponentSeries(group, points, labelOf) };
};

/** One reading of a group: a timestamp, and what each component holds for it */
export interface GroupReading {
    date: Date;
    /** Keyed by component id, the value in that component's own unit */
    values: Map<string, number>;
}

/**
 * The readings of a group, newest first: one per timestamp, paired the way the
 * importer and the group form write them. A reading only some components
 * reported is kept, a night without deep sleep is not a broken pair.
 */
export const groupReadings = (
    group: MeasurementCategory,
    entries: MeasurementEntry[],
): GroupReading[] => {
    const unitOf = new Map(group.children.map(child => [child.id!, child.unit]));

    // Keyed by component id, not by name: two components can share a name
    const byDate = new Map<number, Map<string, number>>();
    for (const entry of entries) {
        const unit = unitOf.get(entry.category);
        if (unit === undefined) {
            continue;
        }
        const values = byDate.get(entry.date.getTime()) ?? new Map<string, number>();
        const value = entry.valueIn(unit, unit);
        values.set(entry.category, (values.get(entry.category) ?? 0) + value);
        byDate.set(entry.date.getTime(), values);
    }

    return [...byDate.entries()]
        .map(([date, values]) => ({ date: new Date(date), values: values }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * One page of a group's readings, cut where a reading ends.
 * {@link truncated} says the server returned fewer entries than it had, which
 * leaves the oldest reading half-read: dropping it keeps it off two pages.
 */
export const groupReadingPage = (
    group: MeasurementCategory,
    entries: MeasurementEntry[],
    pageSize: number,
    truncated: boolean,
): { readings: GroupReading[], hasMore: boolean } => {
    const all = groupReadings(group, entries);
    const whole = truncated && all.length > 1 ? all.slice(0, -1) : all;

    return {
        readings: whole.slice(0, pageSize),
        hasMore: truncated || whole.length > pageSize,
    };
};
