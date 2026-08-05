import {
    isGroupTotalMetricType,
    isSummedPerDay,
    MeasurementCategory
} from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { pointsSince } from "@/components/Measurements/charts/range";
import { ChartPoint, ChartSeries, PlanPeriod } from "@/components/Measurements/charts/series";
import { calculateEMA } from "@/core/lib/ema";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Length of the moving average window */
const AVERAGE_WINDOW_DAYS = 7;

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
 * For each point, the average of all points in the 7 days preceding it.
 *
 * The window total is carried along instead of re-summing the window for every
 * point: with densely sampled metrics the window holds thousands of values,
 * and re-adding them each time makes this quadratic.
 */
export const moving7dAverage = (points: ChartPoint[]): ChartPoint[] => {
    const sorted = [...points].sort((a, b) => a.date - b.date);
    const out: ChartPoint[] = [];
    let start = 0;
    let sum = 0;

    for (let end = 0; end < sorted.length; end++) {
        sum += sorted[end].value;

        // Users log measurements days or minutes apart, so the start of the
        // window has to be advanced by date, not by a fixed number of points
        const windowStart = sorted[end].date - AVERAGE_WINDOW_DAYS * DAY_MS;
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
 * Series that already fit are returned unchanged.
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

/** Days of the week, the grid of a heatmap has one row per weekday */
export const DAYS_PER_WEEK = 7;

/**
 * Widest a heatmap gets, in week columns.
 *
 * A year is where the grid stops being readable: 53 columns already put the
 * cells at a few pixels each, and a history of several years would be a wall
 * rather than a chart. The range selector above the chart can go further
 * (all-time), so the heatmap caps itself here; the month labels along the top
 * say which span is actually drawn.
 */
export const HEATMAP_MAX_WEEKS = 53;

/**
 * A calendar heatmap laid out as a grid of week columns and weekday rows, with
 * the values it draws.
 *
 * Days are addressed by their position in the grid, so nothing downstream has
 * to do calendar arithmetic: column 0 row 0 is the start, which is always a
 * Monday.
 */
export interface HeatmapGrid {
    /** Monday of the first (oldest) week column */
    start: number;
    /** Number of week columns */
    weeks: number;
    /**
     * Value of each day the grid shows that has one, keyed by local midnight of
     * that day. Days outside the window are not part of this chart and are left
     * out, see buildHeatmapGrid.
     */
    values: Map<number, number>;
    /**
     * Largest value in the grid, the top of the colour scale. Zero for an empty
     * grid, and for a history that holds nothing but zeroes.
     */
    maxValue: number;
}

// Calendar arithmetic, not milliseconds: a DST day is 23 or 25 hours long
const dayOf = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const shiftDays = (date: Date, days: number): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
// getDay() counts from Sunday, the week starts on Monday
const mondayOf = (date: Date): Date => shiftDays(date, -((date.getDay() + 6) % 7));
const daysBetween = (from: Date, to: Date): number => Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
        - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / DAY_MS
);

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

/** The day in column week, row weekday (0 = Monday), as a local-midnight timestamp */
export const heatmapDayAt = (grid: HeatmapGrid, week: number, weekday: number): number =>
    shiftDays(new Date(grid.start), week * DAYS_PER_WEEK + weekday).getTime();

/**
 * Lays per-day points out as a calendar grid, newest week last.
 *
 * Expects one point per calendar day (see aggregatePerDay and averagePerDay).
 * The grid ends with the current week, so a stretch without measurements at the
 * end stays visible as empty cells; only a history that ended longer ago than
 * the grid is wide is anchored at its own last day instead, since an empty grid
 * shows nothing at all.
 */
export const buildHeatmapGrid = (
    days: ChartPoint[],
    maxWeeks: number = HEATMAP_MAX_WEEKS,
    today: Date = new Date(),
): HeatmapGrid => {
    const values = new Map(days.map(point => [dayOf(new Date(point.date)).getTime(), point.value]));
    const now = dayOf(today);
    const window = DAYS_PER_WEEK * (maxWeeks - 1);

    if (values.size === 0) {
        return {
            start: shiftDays(mondayOf(now), -window).getTime(),
            weeks: maxWeeks,
            values: values,
            maxValue: 0,
        };
    }

    const timestamps = [...values.keys()];
    const first = new Date(Math.min(...timestamps));
    const last = new Date(Math.max(...timestamps));
    const oldestVisible = shiftDays(mondayOf(now), -window);
    const end = mondayOf(last) < oldestVisible ? last : now;

    const endMonday = mondayOf(end);
    const weeks = Math.min(
        maxWeeks,
        Math.floor(daysBetween(mondayOf(first), endMonday) / DAYS_PER_WEEK) + 1,
    );
    const start = shiftDays(endMonday, -DAYS_PER_WEEK * (weeks - 1));
    const lastDay = shiftDays(start, DAYS_PER_WEEK * weeks - 1).getTime();

    // Only the days the grid actually shows. A history longer than the grid is
    // wide keeps its older days out of the window, and a spike among them would
    // otherwise set the top of the colour scale without being visible itself,
    // washing out every cell that is
    const visible = new Map(
        [...values.entries()].filter(([day]) => day >= start.getTime() && day <= lastDay)
    );

    return {
        start: start.getTime(),
        weeks: weeks,
        values: visible,
        maxValue: visible.size === 0 ? 0 : Math.max(...visible.values()),
    };
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
 * The readings of a multi-value group as ranges: one point per timestamp,
 * spanning from the lower component to the upper one.
 *
 * A reading is one event, so it is drawn as a single bar (diastolic to
 * systolic) rather than as two lines: the components belong together, and
 * nothing was measured between two readings. Components are paired by their
 * shared timestamp, which is how both the importer and the group form write
 * them; an unpaired half-reading is skipped, it has no range.
 */
export const groupRangeEntries = (
    group: MeasurementCategory,
    cutoff: Date | null = null,
): ChartPoint[] => {
    const byDate = new Map<number, number[]>();
    for (const child of group.children) {
        for (const entry of child.entries) {
            const date = entry.date.getTime();
            const values = byDate.get(date);
            const value = entry.valueIn(child.unit, child.unit);
            if (values === undefined) {
                byDate.set(date, [value]);
            } else {
                values.push(value);
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

    return pointsSince(ranges, cutoff);
};

/**
 * One series per component of a multi-value group, in the children's in-group
 * order and named after them
 */
export const groupComponentSeries = (
    group: MeasurementCategory,
    cutoff: Date | null = null,
    labelOf: (category: MeasurementCategory) => string = category => category.name,
): ChartSeries[] =>
    group.children.map(child => ({
        points: pointsSince(chartPointsFor(child.entries, child.unit, child.unit), cutoff),
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
    entries: MeasurementEntry[],
    targetUnit: string,
    categoryUnit: string,
    cutoff: Date | null = null,
): ChartSeries[] => {
    const all = chartPointsFor(entries, targetUnit, categoryUnit);
    // The average is computed over the full history and only then cut, so the
    // first points of the range average the days before it instead of
    // starting over at the cutoff
    const average = pointsSince(moving7dAverage(all), cutoff);
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
        { points: downsample(average), role: 'average' },
        { points: smoothedTrendline(condensed), role: 'trend' },
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
    cutoff: Date | null = null,
): StackedPoint[] => {
    const byDay = new Map<number, number[]>();
    components.forEach((child, index) => {
        for (const entry of child.entries) {
            if (cutoff !== null && entry.date < cutoff) {
                continue;
            }
            const date = entry.date;
            const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            const values = byDay.get(day) ?? new Array<number>(components.length).fill(0);
            // A component can hold several entries for one day (a nap next to
            // the night), and the bar shows the day, so they add up
            values[index] += entry.valueIn(child.unit, child.unit);
            byDay.set(day, values);
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
    cutoff: Date | null = null,
    labelOf: (category: MeasurementCategory) => string = category => category.name,
): GroupChart => {
    if (isSummedPerDay(group.metricType)) {
        const components = stackableComponents(group);
        const stacked = groupStackedEntries(components, cutoff);
        if (stacked.length > 0) {
            return { kind: 'stacked', points: stacked, labels: components.map(labelOf) };
        }
    }

    const ranges = group.children.length === 2 ? groupRangeEntries(group, cutoff) : [];

    return ranges.length > 0
        ? { kind: 'range', points: ranges }
        : { kind: 'components', series: groupComponentSeries(group, cutoff, labelOf) };
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
