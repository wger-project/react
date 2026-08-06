import { alpha, Box, Paper, Typography } from "@mui/material";
import {
    averageWindowOf,
    binWidthFor,
    categoryDisplayName,
    ChartConfig,
    isSummedPerDay,
    MeasurementCategory,
    resolveChartType
} from "@/components/Measurements/models/Category";
import {
    aggregatePerDay,
    averagePerDay,
    buildHeatmapGrid,
    chartQueryFor,
    buildHistogram,
    chartPointsForBuckets,
    DAYS_PER_WEEK,
    DISTRIBUTION_MIN_VALUES,
    fillMissingDays,
    groupChart,
    groupComponentPoints,
    heatmapDayAt,
    measurementSeries,
    movingAverage,
    StackedPoint,
    ValueCount,
    valueHistogram,
    weeklyDeltas
} from "@/components/Measurements/charts/data";
import {
    useMeasurementBucketsQuery,
    useMeasurementValueCountsQuery
} from "@/components/Measurements/queries";
import { componentColor, componentPalette, deltaColor } from "@/components/Measurements/charts/colors";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import {
    dateTick,
    durationAxis,
    spansYears,
    valueOnly,
    valueWithUnit
} from "@/components/Measurements/charts/format";
import {
    ChartRange,
    cutoffFor,
    DEFAULT_CHART_RANGE,
    displayFilterFor,
    pointsSince
} from "@/components/Measurements/charts/range";
import { ChartPoint, PlanPeriod } from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
import { OverallChange } from "@/components/Measurements/widgets/OverallChange";
import React from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@/theme";
import { dateToLocale } from "@/core/lib/date";

interface TooltipProps {
    active?: boolean,
    /** The hovered entries, read by each tooltip the way its own chart wrote them */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
}

/** What every tooltip here shares: the day, and under it what was measured on it */
const TooltipFrame = (props: { label?: string, children: React.ReactNode }) =>
    <Paper style={{ padding: 8 }}>
        <p><strong>{dateToLocale(new Date(Number(props.label)))}</strong></p>
        {props.children}
    </Paper>;

/**
 * The frame every bar chart here is drawn in: the grid, the date axis and the
 * value axis, which only differ in the unit they read. The bars themselves are
 * the caller's, they are what each chart is about.
 */
const BarChartFrame = (props: {
    data: { date: number }[],
    unit: string,
    /** Where the value axis starts for a unit that brings no axis of its own */
    domainStart: 0 | 'auto',
    axis: ReturnType<typeof durationAxis>,
    tooltip: React.ReactElement,
    ariaLabel?: string,
    children: React.ReactNode,
}) => {
    const [, i18n] = useTranslation();

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        {/*
          * Bar width follows from how many bars share the width: recharts
          * sizes them to the band, the gap (taken off both sides, so a bar
          * keeps 70% of its band) holds neighbours apart, and the maximum
          * keeps a handful of bars from becoming blocks
          */}
        <BarChart
            data={props.data}
            responsive
            width="90%"
            height={200}
            barCategoryGap="15%"
            aria-label={props.ariaLabel}>
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={dateTick(spansYears(props.data))}
            />
            <YAxis
                type="number"
                domain={props.axis?.domain ?? [props.domainStart, 'auto']}
                ticks={props.axis?.ticks}
                width="auto"
                tickFormatter={value => valueWithUnit(value, props.unit, i18n.language)} />
            <Tooltip content={props.tooltip} />
            {props.children}
        </BarChart>
    </Box>;
};

const CustomTooltip = (props: TooltipProps & { category: MeasurementCategory }) => {
    const [t, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = props.payload.find((entry: any) => entry.dataKey === 'value');

    return <TooltipFrame label={props.label}>
        {value && <p>
            {categoryDisplayName(props.category, t)}
            : {valueWithUnit(value.value, props.category.unit, i18n.language)}
        </p>}
    </TooltipFrame>;
};

const MeasurementBarChart = (props: { category: MeasurementCategory, points: ChartPoint[] }) => {
    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const data = fillMissingDays(aggregatePerDay(props.points));

    if (data.length === 0) {
        return <ChartEmptyState />;
    }

    return <BarChartFrame
        data={data}
        unit={props.category.unit}
        domainStart={0}
        axis={durationAxis(props.category.unit, 0, Math.max(...data.map(point => point.value)))}
        tooltip={<CustomTooltip category={props.category} />}>
        <Bar
            dataKey="value"
            fill={theme.palette.secondary.main}
            maxBarSize={MAX_BAR_WIDTH} />
    </BarChartFrame>;
};

const RangeTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    const [low, high] = props.payload[0].value as [number, number];

    return <TooltipFrame label={props.label}>
        {/* a range is quoted as high over low, the way a blood pressure reading is written */}
        <p>
            {valueOnly(high, props.unit, i18n.language)}/
            {valueWithUnit(low, props.unit, i18n.language)}
        </p>
    </TooltipFrame>;
};

/**
 * The readings of a two-component group, each as one bar spanning from the
 * lower component to the upper one.
 *
 * A reading is one event: two lines would assert interpolation, but nothing
 * was measured between two readings, and connecting them buries the thing that
 * matters, the gap within one reading.
 */
const MeasurementRangeBarChart = (props: { points: ChartPoint[], unit: string }) => {
    const data = props.points.map(point => ({ date: point.date, range: [point.min!, point.max!] }));

    return <BarChartFrame
        data={data}
        unit={props.unit}
        domainStart="auto"
        axis={durationAxis(
            props.unit,
            Math.min(...props.points.map(point => point.min!)),
            Math.max(...props.points.map(point => point.max!)),
        )}
        tooltip={<RangeTooltip unit={props.unit} />}>
        <Bar
            dataKey="range"
            fill={theme.palette.secondary.main}
            maxBarSize={MAX_BAR_WIDTH} />
    </BarChartFrame>;
};

/** The whole bar with its parts: a single segment says little without the night it belongs to */
const StackedTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = props.payload.filter((entry: any) => entry.value > 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = parts.reduce((sum: number, entry: any) => sum + entry.value, 0);

    return <TooltipFrame label={props.label}>
        <p>{valueWithUnit(total, props.unit, i18n.language)}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {parts.map((entry: any) => <p key={entry.dataKey}>
            {entry.dataKey}: {valueOnly(entry.value, props.unit, i18n.language)}
        </p>)}
    </TooltipFrame>;
};

/**
 * Stacked bar chart for a group whose components are parts of one whole, e.g.
 * the sleep stages of a night.
 *
 * One bar per day, split into a segment per component in the components' own
 * order, so the bar's height is the night and its segments are how it was
 * spent. Colours come from the component palette by position, which is what
 * ties a segment to the row naming it.
 */
const MeasurementStackedBarChart = (props: {
    points: StackedPoint[],
    labels: string[],
    unit: string,
}) => {
    const palette = componentPalette(props.labels.length);
    const data = props.points.map(point => ({
        date: point.date,
        ...Object.fromEntries(props.labels.map((label, index) => [label, point.values[index]])),
    }));
    // The bar is as tall as its segments together, so that is what the axis
    // has to cover
    const totals = props.points.map(
        point => point.values.reduce((sum: number, value) => sum + (value ?? 0), 0),
    );

    return <BarChartFrame
        data={data}
        unit={props.unit}
        domainStart={0}
        axis={durationAxis(props.unit, 0, Math.max(...totals))}
        tooltip={<StackedTooltip unit={props.unit} />}>
        {props.labels.map((label, index) => <Bar
            key={label}
            dataKey={label}
            stackId="components"
            fill={componentColor(palette, index)}
            maxBarSize={MAX_BAR_WIDTH} />)}
    </BarChartFrame>;
};

const DeltaTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    const value = props.payload[0].value as number;

    return <TooltipFrame label={props.label}>
        {/* the plus is ours, only the minus comes out of the number format */}
        <p>{value > 0 ? '+' : ''}{valueWithUnit(value, props.unit, i18n.language)}</p>
    </TooltipFrame>;
};

/**
 * Week-over-week change: one bar per calendar week, hanging off a zero line
 * and coloured by its direction. Answers "is it going the right way" more
 * directly than the trend line does.
 */
const MeasurementDeltaBarChart = (props: { points: ChartPoint[], unit: string }) => {
    const [t] = useTranslation();

    if (props.points.length === 0) {
        return <ChartEmptyState />;
    }

    const values = props.points.map(point => point.value);

    return <BarChartFrame
        data={props.points}
        unit={props.unit}
        domainStart="auto"
        axis={durationAxis(props.unit, Math.min(0, ...values), Math.max(0, ...values))}
        tooltip={<DeltaTooltip unit={props.unit} />}
        ariaLabel={t('measurements.chartTypes.delta')}>
        {/* without the baseline a chart of only decreases reads as a normal one pointing down */}
        <ReferenceLine y={0} stroke={theme.palette.text.primary} />
        <Bar dataKey="value" maxBarSize={MAX_BAR_WIDTH}>
            {props.points.map(point =>
                <Cell key={point.date} fill={deltaColor(theme, point.value)} />)}
        </Bar>
    </BarChartFrame>;
};

/**
 * Histogram of how often each value occurred: the values of the selected range
 * binned by size, with the median and the newest value marked.
 *
 * The one chart of the set without a time axis. It answers what is normal and
 * what is an outlier, which no chart over time shows, and the marked newest
 * value places today within that. Plain elements rather than recharts, whose
 * bar chart cannot place a marker line at an exact value on a band axis.
 */
const MeasurementDistributionChart = (props: {
    values: ValueCount[],
    latest: number,
    unit: string,
    binWidth?: number,
    countsAreDays?: boolean,
}) => {
    const [t, i18n] = useTranslation();
    const [selected, setSelected] = React.useState<number | null>(null);

    if (props.values.length === 0) {
        return <ChartEmptyState />;
    }

    const histogram = buildHistogram(props.values, props.latest, props.binWidth);
    const bins = histogram.counts.length;
    const maxCount = Math.max(...histogram.counts);
    const lowerEdgeOf = (bin: number): number => histogram.firstEdge + bin * histogram.binWidth;

    // A pick from before the data changed (a tap, then a range switch) could
    // point past the histogram, so it is dropped rather than read out of range
    const activeBin = selected !== null && selected < bins ? selected : null;

    /** Horizontal position of a value on the axis the bins tile, in percent */
    const positionOf = (value: number): string =>
        `${((value - histogram.firstEdge) / (bins * histogram.binWidth) * 100).toFixed(2)}%`;

    // The read-out line above the bars: the hovered bin as its range and
    // count, or the median and newest value while nothing is hovered, coloured
    // like their marker lines so the numbers say what the lines only place
    const readout = activeBin === null
        ? <>
            <Box component="span" sx={{ color: theme.palette.info.main }}>
                {t('measurements.distributionMedian')}
                : {valueWithUnit(histogram.median, props.unit, i18n.language)}
            </Box>
            {' · '}
            <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                {t('measurements.distributionLatest')}
                : {valueWithUnit(histogram.latest, props.unit, i18n.language)}
            </Box>
        </>
        : `${valueOnly(lowerEdgeOf(activeBin), props.unit, i18n.language)}`
        + `-${valueWithUnit(lowerEdgeOf(activeBin + 1), props.unit, i18n.language)}: `
        + t(
            props.countsAreDays
                ? 'measurements.distributionDayCount'
                : 'measurements.distributionEntryCount',
            { count: histogram.counts[activeBin] },
        );

    // Every k-th bin edge, labelled with its value: the edges are the round
    // numbers the bins were aligned to, so they are the natural ticks
    const labelEvery = Math.max(1, Math.ceil(bins / 4));
    const edgeLabels: number[] = [];
    for (let edge = 0; edge <= bins; edge += labelEvery) {
        edgeLabels.push(edge);
    }

    const markerStyle = {
        bottom: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: '2px',
    } as const;

    return <Box sx={{ width: '90%' }}>
        <Typography variant="body2" sx={{ minHeight: '1.5em' }}>{readout}</Typography>
        <Box
            role="img"
            aria-label={t('measurements.chartTypes.distribution')}
            sx={{ height: 180, position: 'relative' }}>
            <Box sx={{
                alignItems: 'end',
                display: 'grid',
                gap: '1px',
                gridTemplateColumns: `repeat(${bins}, 1fr)`,
                height: '100%',
            }}>
                {/* The whole column takes the hover, so an empty bin can be read too */}
                {histogram.counts.map((count, bin) => <Box
                    key={lowerEdgeOf(bin)}
                    onMouseEnter={() => setSelected(bin)}
                    onMouseLeave={() => setSelected(null)}
                    sx={{ alignItems: 'flex-end', display: 'flex', height: '100%' }}>
                    <Box sx={{
                        backgroundColor: theme.palette.primary.main,
                        height: `${count / maxCount * 100}%`,
                        outline: bin === activeBin
                            ? `1px solid ${theme.palette.text.primary}`
                            : 'none',
                        width: '100%',
                    }} />
                </Box>)}
            </Box>
            {/* The markers sit at the exact value, not on a bin */}
            <Box sx={{
                ...markerStyle,
                backgroundColor: theme.palette.info.main,
                left: positionOf(histogram.median),
            }} />
            <Box sx={{
                ...markerStyle,
                backgroundColor: theme.palette.secondary.main,
                left: positionOf(histogram.latest),
            }} />
        </Box>
        <Box sx={{ height: '1.2em', position: 'relative' }}>
            {edgeLabels.map(edge => <Typography
                key={edge}
                sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    left: positionOf(lowerEdgeOf(edge)),
                    position: 'absolute',
                    // The first and last labels stay inside the chart instead
                    // of being centred on its edge
                    transform: edge === 0
                        ? 'none'
                        : edge === bins ? 'translateX(-100%)' : 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                }}>
                {valueOnly(lowerEdgeOf(edge), props.unit, i18n.language)}
            </Typography>)}
        </Box>
    </Box>;
};

/** Widest a heatmap cell gets, and the room its weekday labels need */
const MAX_HEATMAP_CELL = 22;
const WEEKDAY_LABEL_WIDTH = 30;

/**
 * Calendar heatmap: one cell per day, coloured by that day's value.
 *
 * Where a line or a bar answers how much, this answers how regularly, which for
 * steps or sleep is often the more interesting question. It is also the only
 * chart of the set where a gap is visible: a day without a measurement is an
 * empty cell instead of a line segment that silently spans it.
 *
 * Takes one point per calendar day; how a day's readings became that value
 * (summed, averaged) is decided by the caller.
 */
const MeasurementHeatmapChart = (props: { points: ChartPoint[], unit: string }) => {
    const [t, i18n] = useTranslation();
    const [selected, setSelected] = React.useState<number | null>(null);

    if (props.points.length === 0) {
        return <ChartEmptyState />;
    }

    const grid = buildHeatmapGrid(props.points);
    const today = new Date().setHours(0, 0, 0, 0);
    const weekdays = Array.from({ length: DAYS_PER_WEEK }, (_, row) => row);
    const weeks = Array.from({ length: grid.weeks }, (_, column) => column);

    /**
     * A day without a measurement is neutral, everything else is tinted by how
     * large its value is within the grid. The scale is continuous and starts
     * well above transparent: a day that was measured has to read as measured
     * even when its value is the smallest one.
     */
    const cellColor = (value: number | undefined): string => {
        if (value === undefined) {
            return theme.palette.action.hover;
        }
        const share = grid.maxValue <= 0 ? 1 : Math.min(1, Math.max(0, value / grid.maxValue));

        return alpha(theme.palette.secondary.main, 0.3 + 0.7 * share);
    };

    // The grid is whole weeks and its last one usually runs past today, so the
    // span it covers ends today rather than on that Sunday
    const last = heatmapDayAt(grid, grid.weeks - 1, DAYS_PER_WEEK - 1);
    const selectedValue = selected === null ? undefined : grid.values.get(selected);
    const readout = selected === null
        ? `${dateToLocale(new Date(grid.start))} - ${dateToLocale(new Date(Math.min(last, today)))}`
        : `${dateToLocale(new Date(selected))}: ${selectedValue === undefined
            ? t('measurements.noDataAvailable')
            : valueWithUnit(selectedValue, props.unit, i18n.language)}`;

    const cells = weekdays.flatMap(weekday => weeks.map(week => {
        const day = heatmapDayAt(grid, week, weekday);

        return <Box
            key={day}
            onMouseEnter={() => setSelected(day)}
            onMouseLeave={() => setSelected(null)}
            sx={{
                aspectRatio: '1 / 1',
                backgroundColor: cellColor(grid.values.get(day)),
                borderRadius: '2px',
                // Days that have not happened yet are left blank rather than
                // drawn as a gap
                visibility: day > today ? 'hidden' : 'visible',
                outline: day === selected ? `1px solid ${theme.palette.text.primary}` : 'none',
            }} />;
    }));

    // The month above the column it starts in, which is what says where in the
    // year the grid is without a date axis
    const monthLabels = weeks.map(week => {
        const monday = heatmapDayAt(grid, week, 0);
        const day = new Date(monday);
        const previous = week === 0 ? -1 : new Date(heatmapDayAt(grid, week - 1, 0)).getMonth();

        return {
            day: monday,
            label: day.getMonth() === previous
                ? ''
                : day.toLocaleDateString(i18n.language, { month: 'short' }),
        };
    });

    const columns = `repeat(${grid.weeks}, 1fr)`;
    const labelStyle = {
        color: 'text.secondary',
        fontSize: '0.7rem',
        lineHeight: 1,
        whiteSpace: 'nowrap',
    } as const;

    return <Box sx={{ width: '90%' }}>
        <Typography variant="body2" sx={{ minHeight: '1.5em' }}>{readout}</Typography>
        {/*
          * The cells are square and share the width, so a short range would
          * blow them up into a chunky calendar; the grid stops growing at a
          * width its cells stay small in and keeps the rest of the space empty
          */}
        <Box sx={{
            display: 'grid',
            gap: '2px',
            gridTemplateColumns: 'auto 1fr',
            maxWidth: `${grid.weeks * MAX_HEATMAP_CELL + WEEKDAY_LABEL_WIDTH}px`,
        }}>
            <Box />
            <Box sx={{ display: 'grid', gap: '2px', gridTemplateColumns: columns }}>
                {monthLabels.map(({ day, label }) =>
                    <Typography key={day} sx={{ ...labelStyle, overflow: 'visible' }}>
                        {label}
                    </Typography>
                )}
            </Box>

            {/* Every other weekday: naming all seven needs more room than the rows have */}
            <Box sx={{ display: 'grid', gap: '2px', gridTemplateRows: `repeat(${DAYS_PER_WEEK}, 1fr)` }}>
                {weekdays.map(weekday =>
                    <Typography key={weekday} sx={{ ...labelStyle, alignSelf: 'center', pr: 0.5 }}>
                        {weekday % 2 === 0
                            ? new Date(heatmapDayAt(grid, 0, weekday))
                                .toLocaleDateString(i18n.language, { weekday: 'short' })
                            : ''}
                    </Typography>
                )}
            </Box>
            {/* The grid carries its meaning in colour alone, so it needs a name */}
            <Box
                role="img"
                aria-label={t('measurements.chartTypes.heatmap')}
                sx={{ display: 'grid', gap: '2px', gridTemplateColumns: columns }}>
                {cells}
            </Box>
        </Box>
    </Box>;
};

const MeasurementLineChart = (props: {
    unit: string,
    points: ChartPoint[],
    cutoff: Date | null,
    config: ChartConfig,
    planPeriods?: PlanPeriod[],
}) => {
    const series = measurementSeries(props.points, props.cutoff, props.config);

    return <>
        <MeasurementSeriesChart
            series={series}
            unit={props.unit}
            planPeriods={props.planPeriods} />
        <OverallChange series={series} unit={props.unit} />
    </>;
};

export const MeasurementChart = (props: {
    category: MeasurementCategory,
    range?: ChartRange,
    planPeriods?: PlanPeriod[],
}) => {
    const [t] = useTranslation();
    const category = props.category;
    const range = props.range ?? DEFAULT_CHART_RANGE;
    const cutoff = cutoffFor(range);
    const summed = isSummedPerDay(category.metricType);

    // A pick that does not fit the metric type falls back to the derived chart,
    // which is also what a category configured on another client gets here
    const resolved = resolveChartType(category.metricType, category.chartType);

    const { ids, level, filters } = chartQueryFor(category, range);
    const buckets = useMeasurementBucketsQuery(ids, level, filters).data ?? [];

    // Its own query, since a histogram needs every value and the points above
    // are condensed. Over the range itself, without the average lead: counted
    // values carry no date and cannot be trimmed afterwards.
    const counts = useMeasurementValueCountsQuery(
        category.id!,
        summed,
        displayFilterFor(range),
        !category.isGroup && resolved === 'distribution',
    ).data ?? [];

    if (category.isGroup) {
        const points = groupComponentPoints(category, buckets, cutoff);
        // The components are labelled by their metric type, like everywhere else
        const chart = groupChart(category, points, c => categoryDisplayName(c, t));

        switch (chart.kind) {
            case 'stacked':
                return <MeasurementStackedBarChart
                    points={chart.points}
                    labels={chart.labels}
                    unit={category.unit} />;
            case 'range':
                return <MeasurementRangeBarChart points={chart.points} unit={category.unit} />;
            case 'components':
                return <MeasurementSeriesChart series={chart.series} unit={category.unit} />;
        }
    }

    const all = chartPointsForBuckets(buckets, category.unit, category.unit, summed);
    const points = pointsSince(all, cutoff);

    if (resolved === 'delta') {
        return <>
            <MeasurementDeltaBarChart
                // Not condensed: a week is already the bucket, and the deltas
                // are what the chart draws rather than the values behind them
                points={weeklyDeltas(points, summed)}
                unit={category.unit} />
            {/* the one-number version of the bars above; a summed metric has no level to change */}
            {!summed && <OverallChange
                series={[{
                    points: pointsSince(movingAverage(all, averageWindowOf(category.chartConfig)), cutoff),
                    role: 'average',
                }]}
                unit={category.unit} />}
        </>;
    }

    if (resolved === 'distribution') {
        // Values are counted per unit they were entered in, so each goes
        // through the conversion helper before equal ones are added up
        const histogram = valueHistogram(counts, category.unit, category.unit);
        // How many readings there are, not how many distinct values: a
        // hundred weigh-ins around one number are a distribution, three are
        // not, however far apart they lie
        const readings = counts.reduce((sum, count) => sum + count.count, 0);

        // A histogram of a handful of readings is noise with gaps, so too few
        // fall through to the derived default chart below
        if (readings >= DISTRIBUTION_MIN_VALUES) {
            return <MeasurementDistributionChart
                values={histogram.values}
                latest={histogram.latest}
                unit={category.unit}
                binWidth={binWidthFor(category.metricType, category.unit)}
                countsAreDays={summed} />;
        }
    }

    if (resolved === 'heatmap') {
        // The cells are days, so how a day's readings become one value has to
        // be decided here: the summed types are a daily total, the sample types
        // are repeated readings of the same thing and average
        return <MeasurementHeatmapChart
            points={summed ? aggregatePerDay(points) : averagePerDay(points)}
            unit={category.unit} />;
    }

    return summed
        ? <MeasurementBarChart category={category} points={points} />
        : <MeasurementLineChart
            unit={category.unit}
            points={all}
            cutoff={cutoff}
            config={category.chartConfig}
            planPeriods={props.planPeriods} />;
};
