import { ChartPoint } from "@/components/Measurements/charts/series";
import { dayOf, daysBetween, mondayOf, shiftDays } from "@/core/lib/date";

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
