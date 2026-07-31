import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { dotRadius, useChartWidth } from "@/components/Measurements/charts/density";
import { dateTick, spansYears, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartSeries, ChartSeriesRole, hasRange } from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import React from "react";
import { useTranslation } from "react-i18next";
import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { generateChartColors } from "@/core/lib/colors";
import { dateToLocale } from "@/core/lib/date";

/** Opacity of the band drawn around a series of ranged points */
const BAND_OPACITY = 0.15;

interface TooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    label?: string;
    unit: string;
}

const CustomTooltip = ({ active, payload, label, unit }: TooltipProps) => {
    const [, i18n] = useTranslation();

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <Paper style={{ padding: 8 }}>
            <p><strong>{dateToLocale(new Date(Number(label)))}</strong></p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((item: any) => (
                <p key={item.name}>{item.name}: {valueWithUnit(item.value, unit, i18n.language)}</p>
            ))}
        </Paper>
    );
};

/**
 * Colour of a series. Components are coloured by their position so a legend
 * entry and its line match; the other roles have a fixed colour each.
 */
const seriesColor = (theme: Theme, role: ChartSeriesRole, componentIndex: number, palette: string[]): string => {
    switch (role) {
        case 'raw':
            return theme.palette.primary.main;
        case 'average':
            return theme.palette.info.main;
        case 'trend':
            return theme.palette.secondary.main;
        case 'component':
            return palette[componentIndex % palette.length];
    }
};

/** How a series is drawn follows from its role, never from the series itself */
const lineProps = (role: ChartSeriesRole, color: string, radius: number) => {
    switch (role) {
        case 'raw':
            // Dots only: a line would assert that something was measured
            // between two readings
            return {
                stroke: 'transparent',
                dot: { fill: color, r: radius },
                activeDot: { fill: color, r: radius + 2 },
            };
        case 'average':
            return { type: 'linear' as const, stroke: color, strokeWidth: 1, dot: false as const };
        case 'trend':
            return { type: 'monotone' as const, stroke: color, strokeWidth: 3, dot: false as const };
        case 'component':
            return {
                type: 'linear' as const,
                stroke: color,
                strokeWidth: 2,
                dot: { fill: color, r: radius },
                activeDot: { fill: color, r: radius + 2 },
            };
    }
};

/**
 * The points of a series as a band, empty when it must not have one.
 *
 * A band means "this is the spread of the measurements", which a derived line
 * has none of. Condensing attaches a range to every point, so an average that
 * got downsampled along with its values would otherwise be given a second band
 * of its own. A partly ranged series is skipped as well, its envelope would
 * end mid-chart.
 */
export const bandData = (series: ChartSeries): { date: number, range: [number, number] }[] => {
    const carriesSpread = series.role === 'raw' || series.role === 'component';
    if (!carriesSpread || series.points.length === 0 || !series.points.every(hasRange)) {
        return [];
    }

    return series.points.map(point => ({ date: point.date, range: [point.min!, point.max!] }));
};

/**
 * Renders a list of series into one chart, styled by the role of each series.
 *
 * Points that summarise a range get a band around their line, which is what
 * shows the spread of a daily aggregate or of a condensed series.
 */
export const MeasurementSeriesChart = (props: { series: ChartSeries[], unit: string, height?: number }) => {
    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const [chartRef, chartWidth] = useChartWidth();

    const roleLabels: Record<ChartSeriesRole, string> = {
        raw: t('measurements.indicatorRaw'),
        average: t('measurements.indicatorAvg'),
        trend: t('measurements.indicatorTrend'),
        component: '',
    };

    const palette = [...generateChartColors(props.series.filter(s => s.role === 'component').length)];
    let componentIndex = 0;
    const resolved = props.series.map(series => ({
        series: series,
        color: seriesColor(theme, series.role, series.role === 'component' ? componentIndex++ : 0, palette),
        name: series.label ?? roleLabels[series.role],
        // a role appears at most once, components are told apart by their name
        key: `${series.role}-${series.label ?? ''}`,
    }));

    // The densest series decides the mark size: all of them share the width
    const maxPoints = Math.max(0, ...props.series.map(s => s.points.length));
    const radius = dotRadius(chartWidth, maxPoints);

    if (maxPoints === 0) {
        return <ChartEmptyState height={props.height} />;
    }

    const withYear = spansYears(props.series.flatMap(s => s.points));

    return <Box ref={chartRef} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <ComposedChart responsive width="90%" height={props.height ?? 200}>
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5" />
            <XAxis
                dataKey="date"
                type={'number'}
                domain={['dataMin', 'dataMax']}
                tickFormatter={dateTick(withYear)}
                tickCount={10}
            />
            <YAxis
                domain={['auto', 'auto']}
                width="auto"
                tickFormatter={value => valueWithUnit(value, props.unit, i18n.language)} />
            <Tooltip content={<CustomTooltip unit={props.unit} />} />

            {/* the bands go in first so the lines paint on top of them */}
            {resolved.map(({ series, color, key }) => {
                const band = bandData(series);

                return band.length === 0
                    ? null
                    : <Area
                        key={`band-${key}`}
                        data={band}
                        dataKey="range"
                        stroke="none"
                        fill={color}
                        fillOpacity={BAND_OPACITY}
                        legendType="none"
                        tooltipType="none" />;
            })}

            {resolved.map(({ series, color, name, key }) =>
                <Line
                    key={`series-${key}`}
                    data={series.points}
                    dataKey="value"
                    name={name}
                    {...lineProps(series.role, color, radius)} />)}
        </ComposedChart>

        {/*
          * The legend is drawn outside the chart: recharts takes its swatch
          * colour from the line's stroke, and the measured values have no
          * stroke of their own, only dots
          */}
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {resolved.map(({ color, name, key }) =>
                <Stack key={`legend-${key}`} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ backgroundColor: color, height: 12, width: 12 }} />
                    <Typography variant="caption">{name}</Typography>
                </Stack>)}
        </Stack>
    </Box>;
};
