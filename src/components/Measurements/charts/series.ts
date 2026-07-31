/**
 * A chart is given a list of series, not a single value list. That is what
 * lets one chart show the components of a multi-value group.
 */

/**
 * One point of a series. min/max are set when the point stands for a range
 * rather than a single reading — either because the entry is a stored daily
 * aggregate (extra_data min/max) or because several points were condensed
 * into it. Both are set or neither.
 */
export interface ChartPoint {
    date: number;
    value: number;
    min?: number;
    max?: number;
}

/**
 * What a series means, which decides how it is drawn. Colours come from the
 * theme when the chart is built, never from the series itself.
 */
export type ChartSeriesRole =
/** the measured values themselves */
    | 'raw'
    /** moving average over the raw values */
    | 'average'
    /** smoothed trend through the raw values */
    | 'trend'
    /** one component of a multi-value group (systolic, diastolic, ...) */
    | 'component';

export interface ChartSeries {
    points: ChartPoint[];
    role: ChartSeriesRole;
    /**
     * Name for the legend and the tooltip. Undefined for the unnamed series of
     * a plain category, where the chart title already says what is shown.
     */
    label?: string;
}

/** Whether the point carries a range that can be drawn as a band */
export const hasRange = (point: ChartPoint): boolean =>
    point.min !== undefined && point.max !== undefined;

/**
 * A nutrition plan period shown for context: shaded as a vertical band in the
 * chart, and named in the tooltip of the points it contains.
 */
export interface PlanPeriod {
    start: number;
    /** An open-ended plan runs up to now */
    end: number;
    name: string;
}
