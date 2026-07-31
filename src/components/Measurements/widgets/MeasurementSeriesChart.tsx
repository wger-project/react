import { Box, Paper, useTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ChartSeries, ChartSeriesRole, hasRange } from "@/components/Measurements/charts/series";
import React from "react";
import { useTranslation } from "react-i18next";
import { Area, CartesianGrid, ComposedChart, Legend, Line, Tooltip, XAxis, YAxis } from "recharts";
import { generateChartColors } from "@/core/lib/colors";
import { dateToLocale } from "@/core/lib/date";

/** Point count above which the dots of the measured values are dropped */
const MAX_DOTS = 30;

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
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <Paper style={{ padding: 8 }}>
            <p><strong>{dateToLocale(new Date(Number(label)))}</strong></p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((item: any) => (
                <p key={item.name}>{item.name}: {item.value.toFixed(1)} {unit}</p>
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
const lineProps = (role: ChartSeriesRole, color: string, showDots: boolean) => {
    switch (role) {
        case 'raw':
            // Dots only: a line would assert that something was measured
            // between two readings
            return {
                stroke: 'transparent',
                dot: showDots ? { fill: color, r: 3 } : false as const,
                activeDot: { fill: color, r: 5 },
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
                dot: showDots ? { fill: color, r: 3 } : false as const,
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
    const [t] = useTranslation();

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

    const maxPoints = Math.max(0, ...props.series.map(s => s.points.length));
    const showDots = maxPoints <= MAX_DOTS;
    const showLegend = props.series.some(s => s.label !== undefined);

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <ComposedChart responsive width="90%" height={props.height ?? 200}>
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5" />
            <XAxis
                dataKey="date"
                type={'number'}
                domain={['dataMin', 'dataMax']}
                tickFormatter={timeStr => dateToLocale(new Date(timeStr))!}
                tickCount={10}
            />
            <YAxis domain={['auto', 'auto']} width="auto" unit={props.unit} />
            <Tooltip content={<CustomTooltip unit={props.unit} />} />
            {showLegend && <Legend />}

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
                    {...lineProps(series.role, color, showDots)} />)}
        </ComposedChart>
    </Box>;
};
