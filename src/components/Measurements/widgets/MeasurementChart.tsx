import { Box, Paper } from "@mui/material";
import { isSummedPerDay, MeasurementCategory } from "@/components/Measurements/models/Category";
import {
    aggregatePerDay,
    chartPointsFor,
    fillMissingDays,
    groupChart,
    measurementSeries,
    StackedPoint
} from "@/components/Measurements/charts/data";
import { componentColor, componentPalette } from "@/components/Measurements/charts/colors";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { dateTick, spansYears, valueWithUnit } from "@/components/Measurements/charts/format";
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
import { numberDecimalLocale } from "@/core/lib/numbers";

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
                domain={[0, 'auto']}
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
                {numberDecimalLocale(high, i18n.language)}/
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
                domain={['auto', 'auto']}
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
                {entry.dataKey}: {numberDecimalLocale(entry.value, i18n.language)}
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
                domain={[0, 'auto']}
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
    const cutoff = cutoffFor(props.range ?? DEFAULT_CHART_RANGE);

    if (props.category.isGroup) {
        const chart = groupChart(props.category, cutoff);

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

    return isSummedPerDay(props.category.metricType)
        ? <MeasurementBarChart category={props.category} cutoff={cutoff} />
        : <MeasurementLineChart
            category={props.category}
            cutoff={cutoff}
            planPeriods={props.planPeriods} />;
};
