import { alpha, Box, Paper, Typography } from "@mui/material";
import {
    categoryDisplayName,
    isSummedPerDay,
    MeasurementCategory,
    resolveChartType
} from "@/components/Measurements/models/Category";
import {
    aggregatePerDay,
    averagePerDay,
    buildHeatmapGrid,
    chartPointsFor,
    DAYS_PER_WEEK,
    fillMissingDays,
    groupChart,
    heatmapDayAt,
    measurementSeries,
    StackedPoint
} from "@/components/Measurements/charts/data";
import { componentColor, componentPalette } from "@/components/Measurements/charts/colors";
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
    pointsSince
} from "@/components/Measurements/charts/range";
import { ChartPoint, PlanPeriod } from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
import { OverallChange } from "@/components/Measurements/widgets/OverallChange";
import React from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@/theme";
import { dateToLocale } from "@/core/lib/date";

export interface TooltipProps {
    active?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
    category: MeasurementCategory
}

const CustomTooltip = ({ active, payload, label, category }: TooltipProps) => {
    const [, i18n] = useTranslation();

    if (active && payload && payload.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = payload.find((p: any) => p.dataKey === 'value');

        return (
            <Paper style={{ padding: 8 }}>
                <p><strong>{dateToLocale(new Date(label!))}</strong></p>
                {value && <p>
                    {category.name}: {valueWithUnit(value.value, category.unit, i18n.language)}
                </p>}
            </Paper>
        );
    }

    return null;
};

const MeasurementBarChart = (props: { category: MeasurementCategory, cutoff: Date | null }) => {
    const [, i18n] = useTranslation();

    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const points = chartPointsFor(props.category.entries, props.category.unit, props.category.unit);
    const data = fillMissingDays(aggregatePerDay(pointsSince(points, props.cutoff)));

    if (data.length === 0) {
        return <ChartEmptyState />;
    }

    const axis = durationAxis(props.category.unit, 0, Math.max(...data.map(point => point.value)));

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        {/*
          * Bar width follows from how many bars share the width: recharts
          * sizes them to the band, the gap (taken off both sides, so a bar
          * keeps 70% of its band) holds neighbours apart, and the maximum
          * keeps a handful of bars from becoming blocks
          */}
        <BarChart data={data} responsive width="90%" height={200} barCategoryGap="15%">
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={dateTick(spansYears(data))}
            />
            <YAxis
                type="number"
                domain={axis?.domain ?? [0, 'auto']}
                ticks={axis?.ticks}
                width="auto"
                tickFormatter={value => valueWithUnit(value, props.category.unit, i18n.language)} />
            <Tooltip content={(<CustomTooltip category={props.category} />)} />
            <Bar
                dataKey="value"
                fill={theme.palette.secondary.main}
                maxBarSize={MAX_BAR_WIDTH} />
        </BarChart>
    </Box>;
};

interface RangeTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    label?: string;
    unit: string;
}

const RangeTooltip = ({ active, payload, label, unit }: RangeTooltipProps) => {
    const [, i18n] = useTranslation();

    if (!active || !payload?.length) {
        return null;
    }

    const [low, high] = payload[0].value as [number, number];

    return (
        <Paper style={{ padding: 8 }}>
            <p><strong>{dateToLocale(new Date(Number(label)))}</strong></p>
            {/* a range is quoted as high over low, the way a blood pressure reading is written */}
            <p>
                {valueOnly(high, unit, i18n.language)}/
                {valueWithUnit(low, unit, i18n.language)}
            </p>
        </Paper>
    );
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
    const [, i18n] = useTranslation();
    const data = props.points.map(point => ({ date: point.date, range: [point.min!, point.max!] }));
    const axis = durationAxis(
        props.unit,
        Math.min(...props.points.map(point => point.min!)),
        Math.max(...props.points.map(point => point.max!)),
    );

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <BarChart data={data} responsive width="90%" height={200} barCategoryGap="15%">
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={dateTick(spansYears(props.points))}
            />
            <YAxis
                type="number"
                domain={axis?.domain ?? ['auto', 'auto']}
                ticks={axis?.ticks}
                width="auto"
                tickFormatter={value => valueWithUnit(value, props.unit, i18n.language)} />
            <Tooltip content={<RangeTooltip unit={props.unit} />} />
            <Bar
                dataKey="range"
                fill={theme.palette.secondary.main}
                maxBarSize={MAX_BAR_WIDTH} />
        </BarChart>
    </Box>;
};

interface StackedTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    label?: string;
    unit: string;
}

/** The whole bar with its parts: a single segment says little without the night it belongs to */
const StackedTooltip = ({ active, payload, label, unit }: StackedTooltipProps) => {
    const [, i18n] = useTranslation();

    if (!active || !payload?.length) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = payload.filter((entry: any) => entry.value > 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = parts.reduce((sum: number, entry: any) => sum + entry.value, 0);

    return (
        <Paper style={{ padding: 8 }}>
            <p><strong>{dateToLocale(new Date(Number(label)))}</strong></p>
            <p>{valueWithUnit(total, unit, i18n.language)}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {parts.map((entry: any) => <p key={entry.dataKey}>
                {entry.dataKey}: {valueOnly(entry.value, unit, i18n.language)}
            </p>)}
        </Paper>
    );
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
    const [, i18n] = useTranslation();
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
    const axis = durationAxis(props.unit, 0, Math.max(...totals));

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <BarChart data={data} responsive width="90%" height={200} barCategoryGap="15%">
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={dateTick(spansYears(props.points))}
            />
            <YAxis
                type="number"
                domain={axis?.domain ?? [0, 'auto']}
                ticks={axis?.ticks}
                width="auto"
                tickFormatter={value => valueWithUnit(value, props.unit, i18n.language)} />
            <Tooltip content={<StackedTooltip unit={props.unit} />} />
            {props.labels.map((label, index) => <Bar
                key={label}
                dataKey={label}
                stackId="components"
                fill={componentColor(palette, index)}
                maxBarSize={MAX_BAR_WIDTH} />)}
        </BarChart>
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
    category: MeasurementCategory,
    cutoff: Date | null,
    planPeriods?: PlanPeriod[],
}) => {
    const series = measurementSeries(
        props.category.entries,
        props.category.unit,
        props.category.unit,
        props.cutoff,
    );

    return <>
        <MeasurementSeriesChart
            series={series}
            unit={props.category.unit}
            planPeriods={props.planPeriods} />
        <OverallChange series={series} unit={props.category.unit} />
    </>;
};

export const MeasurementChart = (props: {
    category: MeasurementCategory,
    range?: ChartRange,
    planPeriods?: PlanPeriod[],
}) => {
    const [t] = useTranslation();
    const cutoff = cutoffFor(props.range ?? DEFAULT_CHART_RANGE);

    if (props.category.isGroup) {
        // The components are labelled by their metric type, like everywhere else
        const chart = groupChart(props.category, cutoff, c => categoryDisplayName(c, t));

        switch (chart.kind) {
            case 'stacked':
                return <MeasurementStackedBarChart
                    points={chart.points}
                    labels={chart.labels}
                    unit={props.category.unit} />;
            case 'range':
                return <MeasurementRangeBarChart points={chart.points} unit={props.category.unit} />;
            case 'components':
                return <MeasurementSeriesChart series={chart.series} unit={props.category.unit} />;
        }
    }

    const summed = isSummedPerDay(props.category.metricType);

    // A pick that does not fit the metric type falls back to the derived chart,
    // which is also what a category configured on another client gets here
    if (resolveChartType(props.category.metricType, props.category.chartType) === 'heatmap') {
        // The cells are days, so how a day's readings become one value has to
        // be decided here: the summed types are a daily total, the sample types
        // are repeated readings of the same thing and average. The points are
        // deliberately not condensed on the way, which for a grid of days would
        // collapse whole weeks into a single cell
        const points = pointsSince(
            chartPointsFor(props.category.entries, props.category.unit, props.category.unit),
            cutoff,
        );

        return <MeasurementHeatmapChart
            points={summed ? aggregatePerDay(points) : averagePerDay(points)}
            unit={props.category.unit} />;
    }

    return summed
        ? <MeasurementBarChart category={props.category} cutoff={cutoff} />
        : <MeasurementLineChart
            category={props.category}
            cutoff={cutoff}
            planPeriods={props.planPeriods} />;
};
