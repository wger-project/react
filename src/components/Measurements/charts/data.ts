import { BucketLevel } from "@/components/Measurements/api/measurements";
import {
    ChartType,
    isSummedPerDay,
    MeasurementCategory,
    MetricType,
    resolveChartType,
} from "@/components/Measurements/models/Category";
import { MeasurementBucket } from "@/components/Measurements/models/Bucket";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { convertStoredValue } from "@/core/lib/weightUnit";
import { ChartRange, entryFilterFor } from "@/components/Measurements/charts/range";
import { ChartPoint, PlanPeriod } from "@/components/Measurements/charts/series";
import { calculateEMA } from "@/core/lib/ema";
import { DAY_MS, mondayOf } from "@/core/lib/date";

/** Length of the moving average window for a category that configured none */
const DEFAULT_AVERAGE_WINDOW_DAYS = 7;

/** Point count above which a series is condensed, see downsample */
export const MAX_CHART_POINTS = 200;

/**
 * Turns stored entries into chart points, converting the value to the target
 * unit. Entries stored as a daily aggregate keep the range they summarise in
 * extra_data (heart rate min/max); it is lifted onto the point so the chart
 * can draw a band. Those bounds share the value's unit and are converted
 * along with it.
 *
 * The result is chronological; entries arrive from the API newest first.
 */
export const chartPointsFor = (
    entries: MeasurementEntry[],
    targetUnit: string,
    categoryUnit: string,
): ChartPoint[] => [...entries]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(entry => {
        const bound = (key: string) => {
            const stored = entry.extraData[key];
            return typeof stored === 'number'
                ? entry.boundIn(stored, targetUnit, categoryUnit)
                : undefined;
        };

        const min = bound('min');
        const max = bound('max');

        return {
            date: entry.date.getTime(),
            value: entry.valueIn(targetUnit, categoryUnit),
            ...(min !== undefined && max !== undefined ? { min: min, max: max } : {}),
        };
    });

/**
 * Turns the server's condensed buckets into chart points, converting to the
 * target unit.
 *
 * The counterpart of chartPointsFor for the aggregated read path. A bucket
 * arrives once per unit its entries were written in, so the slices are
 * converted before they are merged: a mean over kg and lb values is a number
 * in neither. Their spread becomes the point's range, left off where it says
 * nothing (a single reading, a summed total, which has no spread).
 */
export const chartPointsForBuckets = (
    buckets: MeasurementBucket[],
    targetUnit: string,
    categoryUnit: string,
    summed: boolean = false,
): ChartPoint[] => {
    const convert = (value: number, from: string | null) =>
        convertStoredValue(value, from, categoryUnit, targetUnit);

    const byStart = new Map<number, MeasurementBucket[]>();
    for (const bucket of buckets) {
        const start = bucket.start.getTime();
        byStart.set(start, [...(byStart.get(start) ?? []), bucket]);
    }

    return [...byStart.entries()]
        .sort(([a], [b]) => a - b)
        .map(([start, slices]) => {
            const total = slices.reduce((sum, s) => sum + convert(s.sum, s.unit), 0);
            if (summed) {
                return { date: start, value: total };
            }

            const value = total / slices.reduce((count, s) => count + s.count, 0);
            const min = Math.min(...slices.map(s => convert(s.min, s.unit)));
            const max = Math.max(...slices.map(s => convert(s.max, s.unit)));

            return min < value || max > value
                ? { date: start, value: value, min: min, max: max }
                : { date: start, value: value };
        });
};

/**
 * What the chart of a category reads: which categories, at which level, over
 * which span.
 *
 * Derived in one place because two widgets ask for it, the chart and the card
 * whose component rows follow the chart's kind. Two different derivations
 * would mean two query keys, i.e. two requests deciding over different spans.
 */
export const chartQueryFor = (category: MeasurementCategory, range: ChartRange): {
    ids: string[],
    level: BucketLevel,
    filters: object,
} => ({
    // A group asks for its components in one call, so they share the calendar
    // unit and the halves of a reading still meet on the same bucket
    ids: category.isGroup ? category.children.map(child => child.id!) : [category.id!],
    level: category.isGroup
        ? (isSummedPerDay(category.metricType) ? 'day' : 'auto')
        : bucketLevelFor(category.metricType, category.chartType),
    // The points reach back beyond the range, so the moving average derived
    // from them does not start over at the cutoff
    filters: entryFilterFor(range),
});

/**
 * The point level a category's chart needs.
 *
 * Two charts are built on a calendar unit and fix it: a heatmap draws days, a
 * week-over-week chart weeks. A distribution has no time axis and reads
 * counted values of its own; the points it gets here are what its fallback
 * draws when there are too few values to bin.
 */
export const bucketLevelFor = (metricType: MetricType, chartType: ChartType): BucketLevel => {
    switch (resolveChartType(metricType, chartType)) {
        case 'heatmap':
            return 'day';
        case 'delta':
            return 'week';
        default:
            // The summed types are drawn as daily totals whatever the range
            return isSummedPerDay(metricType) ? 'day' : 'auto';
    }
};

/**
 * For each point, the average of all points in the given days preceding it.
 *
 * The window total is carried along instead of re-summing the window for every
 * point: with densely sampled metrics the window holds thousands of values,
 * and re-adding them each time makes this quadratic.
 */
export const movingAverage = (
    points: ChartPoint[],
    days: number = DEFAULT_AVERAGE_WINDOW_DAYS,
): ChartPoint[] => {
    const sorted = [...points].sort((a, b) => a.date - b.date);
    const out: ChartPoint[] = [];
    let start = 0;
    let sum = 0;

    for (let end = 0; end < sorted.length; end++) {
        sum += sorted[end].value;

        // Users log measurements days or minutes apart, so the start of the
        // window has to be advanced by date, not by a fixed number of points
        const windowStart = sorted[end].date - days * DAY_MS;
        while (start < end && sorted[start].date < windowStart) {
            sum -= sorted[start].value;
            start++;
        }

        out.push({ date: sorted[end].date, value: sum / (end - start + 1) });
    }

    return out;
};

/**
 * Smoothed trendline via an exponential moving average, seeded with the first
 * point. A larger period tracks the values more loosely (smoother, more lag).
 */
export const smoothedTrendline = (points: ChartPoint[], period: number = 10): ChartPoint[] =>
    calculateEMA([...points].sort((a, b) => a.date - b.date), p => p.value, period)
        .map(point => ({ date: point.date, value: point.ema }));

/**
 * Time units a dense series is condensed into, finest first.
 *
 * Buckets follow the calendar instead of being equal slices of the total span:
 * these metrics have a daily rhythm (asleep, awake, a workout), so slices that
 * do not line up with a day each catch a different phase of it, and the result
 * oscillates at the slice frequency instead of showing the shape of the data.
 */
const BUCKET_STARTS: ((date: Date) => Date)[] = [
    d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()),
    d => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    d => {
        const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        // getDay() counts from Sunday, the week starts on Monday
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        return monday;
    },
    d => new Date(d.getFullYear(), d.getMonth(), 1),
];

/**
 * Condenses one bucket into a single point: the mean value at the start of the
 * bucket, spanning the values it stands for.
 */
const summarise = (date: number, bucket: ChartPoint[]): ChartPoint => {
    let sum = 0;
    // An entry that already carries a range contributes its bounds, not just
    // its value, so re-condensing an aggregate keeps the true extremes
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const point of bucket) {
        sum += point.value;
        min = Math.min(min, point.min ?? point.value);
        max = Math.max(max, point.max ?? point.value);
    }

    return { date: date, value: sum / bucket.length, min: min, max: max };
};

/**
 * Reduces a dense series to at most maxPoints, keeping its shape.
 *
 * Plotting more points than the chart has pixels only overdraws: a season of
 * raw heart rate samples is tens of thousands of values on a few hundred
 * pixels, which comes out as a solid block. Entries are therefore condensed
 * into the finest calendar unit that gets under the limit; each unit becomes
 * one point at its mean, carrying its minimum and maximum so the chart draws
 * the spread as a band. That keeps exactly the information a line through
 * every single sample buries.
 *
 * Series that already fit are returned unchanged, which is what the points of
 * the aggregate endpoint are: the server condenses to the same limit. What is
 * left for this are the charts that still read raw entries (WeightChart), and
 * it goes once those read buckets too.
 */
export const downsample = (points: ChartPoint[], maxPoints: number = MAX_CHART_POINTS): ChartPoint[] => {
    if (points.length <= maxPoints) {
        return points;
    }

    for (const [index, bucketStart] of BUCKET_STARTS.entries()) {
        const grouped = new Map<number, ChartPoint[]>();
        for (const point of points) {
            const key = bucketStart(new Date(point.date)).getTime();
            const bucket = grouped.get(key);
            if (bucket === undefined) {
                grouped.set(key, [point]);
            } else {
                bucket.push(point);
            }
        }

        if (grouped.size <= maxPoints || index === BUCKET_STARTS.length - 1) {
            return [...grouped.entries()]
                .sort(([a], [b]) => a - b)
                .map(([date, bucket]) => summarise(date, bucket));
        }
    }

    return points;
};

/**
 * Sums points per local calendar day, for metric types where individual
 * samples aren't meaningful on their own (steps, distance, energy, sleep)
 */
export const aggregatePerDay = (points: ChartPoint[]): ChartPoint[] => {
    const sums = new Map<number, number>();
    for (const point of points) {
        const date = new Date(point.date);
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        sums.set(day, (sums.get(day) ?? 0) + point.value);
    }

    return [...sums.entries()]
        .map(([date, value]) => ({ date: date, value: value }))
        .sort((a, b) => a.date - b.date);
};

/**
 * Averages points per local calendar day.
 *
 * The per-day counterpart of aggregatePerDay for the sample metrics (body
 * weight, heart rate), where a day's readings are repeated measurements of the
 * same thing and adding them up would be meaningless. Used by the charts that
 * need exactly one value per day.
 */
export const averagePerDay = (points: ChartPoint[]): ChartPoint[] => {
    const byDay = new Map<number, number[]>();
    for (const point of points) {
        const date = new Date(point.date);
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const values = byDay.get(day);
        if (values === undefined) {
            byDay.set(day, [point.value]);
        } else {
            values.push(point.value);
        }
    }

    return [...byDay.entries()]
        .map(([date, values]) => ({
            date: date,
            value: values.reduce((sum, value) => sum + value, 0) / values.length,
        }))
        .sort((a, b) => a.date - b.date);
};

/**
 * The level a week is summarised at: its total for the summed metric types, its
 * average for the sample ones, whose readings repeat the same measurement.
 */
const weekLevel = (values: number[], summed: boolean): number => {
    const total = values.reduce((sum, value) => sum + value, 0);

    return summed ? total : total / values.length;
};

/**
 * Week-over-week change: one point per calendar week against the last week
 * with readings, summarised (see weekLevel) before subtracting so no single
 * reading decides a bar. The running week of a summed metric is left out,
 * its total is still growing and would read as a drop until Sunday.
 */
export const weeklyDeltas = (
    points: ChartPoint[],
    summed: boolean = false,
    today: Date = new Date(),
): ChartPoint[] => {
    const byWeek = new Map<number, number[]>();
    for (const point of points) {
        const week = mondayOf(new Date(point.date)).getTime();
        const values = byWeek.get(week);
        if (values === undefined) {
            byWeek.set(week, [point.value]);
        } else {
            values.push(point.value);
        }
    }

    if (summed) {
        byWeek.delete(mondayOf(today).getTime());
    }

    const weeks = [...byWeek.keys()].sort((a, b) => a - b);

    return weeks.slice(1).map((week, index) => ({
        date: week,
        value: weekLevel(byWeek.get(week)!, summed) - weekLevel(byWeek.get(weeks[index])!, summed),
    }));
};

/**
 * Fills gaps in a per-day series with zero-value days so a band axis keeps
 * the spacing between bars proportional to time
 */
export const fillMissingDays = (points: ChartPoint[]): ChartPoint[] => {
    if (points.length === 0) {
        return [];
    }

    const byDay = new Map(points.map(p => [p.date, p.value]));
    const last = points[points.length - 1].date;
    const out: ChartPoint[] = [];
    // aggregatePerDay emits local-midnight timestamps; stepping via setDate
    // stays on local midnight across DST changes
    for (const day = new Date(points[0].date); day.getTime() <= last; day.setDate(day.getDate() + 1)) {
        out.push({ date: day.getTime(), value: byDay.get(day.getTime()) ?? 0 });
    }

    return out;
};

/**
 * The parts of the periods that overlap the span the chart covers, clamped to
 * it. Periods entirely outside it are dropped, so a band never draws past the
 * axes.
 */
export const clampPeriods = (periods: PlanPeriod[], points: ChartPoint[]): PlanPeriod[] => {
    if (points.length === 0) {
        return [];
    }

    const first = points[0].date;
    const last = points[points.length - 1].date;

    return periods
        .filter(period => period.start < last && period.end > first)
        .map(period => ({
            ...period,
            start: Math.max(period.start, first),
            end: Math.min(period.end, last),
        }));
};

/** Names of the plans whose period contains the given date */
export const planNamesAt = (periods: PlanPeriod[], date: number): string[] =>
    periods.filter(period => date >= period.start && date <= period.end).map(period => period.name);

/** Difference between the first and the last point, null for an empty series */
export const overallChange = (points: ChartPoint[]): number | null =>
    points.length === 0 ? null : points[points.length - 1].value - points[0].value;
