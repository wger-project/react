import { Box, Paper, Typography } from "@mui/material";
import { isSummedPerDay, MeasurementCategory } from "@/components/Measurements/models/Category";
import {
    aggregatePerDay,
    chartPointsFor,
    downsample,
    fillMissingDays,
    groupChart,
    moving7dAverage,
    overallChange,
    smoothedTrendline
} from "@/components/Measurements/charts/data";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { dateTick, spansYears, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint, ChartSeries } from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
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

const MeasurementBarChart = (props: { category: MeasurementCategory }) => {
    const [, i18n] = useTranslation();

    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const points = chartPointsFor(props.category.entries, props.category.unit, props.category.unit);
    const data = fillMissingDays(aggregatePerDay(points));

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

/**
 * The values of a category with the average and trend derived from them.
 *
 * The points are condensed before anything is derived: a trend line over raw
 * samples follows the swings within a single day instead of the trend across
 * weeks, and the average would be as dense as the values it summarises. The
 * average itself is computed over every point and only condensed afterwards,
 * so it stays a 7-day average rather than an average of bucket means.
 */
const MeasurementLineChart = (props: { category: MeasurementCategory }) => {
    const [t, i18n] = useTranslation();

    const points = chartPointsFor(props.category.entries, props.category.unit, props.category.unit);
    const condensed = downsample(points);
    const raw: ChartSeries = { points: condensed, role: 'raw' };

    // A single reading has nothing to average or trend, and recharts draws a
    // dot for a one-point series even where the dots are turned off
    const average = points.length < 2 ? [] : downsample(moving7dAverage(points));
    const series: ChartSeries[] = points.length < 2
        ? [raw]
        : [
            raw,
            { points: average, role: 'average' },
            { points: smoothedTrendline(condensed), role: 'trend' },
        ];

    // Read off the average rather than the values: the first and last reading
    // are two arbitrary moments of a densely sampled metric
    const change = overallChange(average);

    return <>
        <MeasurementSeriesChart series={series} unit={props.category.unit} />
        {change !== null && <Typography variant="caption" sx={{ textAlign: 'center' }}>
            {t('measurements.overallChangeWeight')}
            {' '}
            {change > 0 ? '+' : change < 0 ? '-' : ''}
            {valueWithUnit(Math.abs(change), props.category.unit, i18n.language)}
        </Typography>}
    </>;
};

export const MeasurementChart = (props: { category: MeasurementCategory }) => {
    if (props.category.isGroup) {
        const chart = groupChart(props.category);

        return chart.kind === 'range'
            ? <MeasurementRangeBarChart points={chart.points} unit={props.category.unit} />
            : <MeasurementSeriesChart series={chart.series} unit={props.category.unit} />;
    }

    return isSummedPerDay(props.category.metricType)
        ? <MeasurementBarChart category={props.category} />
        : <MeasurementLineChart category={props.category} />;
};
