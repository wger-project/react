import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { componentPalette, seriesColor } from "@/components/Measurements/charts/colors";
import { clampPeriods, planNamesAt, pointsOfRole } from "@/components/Measurements/charts/data";
import { dotRadius, useChartWidth } from "@/components/Measurements/charts/density";
import { dateTick, spansYears, valueWithUnit } from "@/components/Measurements/charts/format";
import {
    ChartPoint,
    ChartSeries,
    ChartSeriesRole,
    hasRange,
    PlanPeriod
} from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceArea,
    ReferenceLine,
    Tooltip,
    useXAxisScale,
    useYAxisScale,
    XAxis,
    YAxis
} from "recharts";
import { dateToLocale } from "@/core/lib/date";
import { numberDecimalLocale } from "@/core/lib/numbers";

/** Opacity of the band drawn around a series of ranged points */
const BAND_OPACITY = 0.15;

/** Opacity of a shaded nutrition plan period */
const PLAN_BAND_OPACITY = 0.15;

/** Point count above which the connectors to the trend stop being readable */
const MAX_VARIANCE_LINES = 30;

interface TooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    label?: string;
    unit: string;
    planPeriods: PlanPeriod[];
}

/**
 * One tooltip line per series. A band carries the same name as the line it
 * belongs to, so its bounds join that line instead of appearing as a row of
 * their own — where an array value would read as four numbers, not two.
 */
interface TooltipRow {
    name: string;
    value?: number;
    range?: [number, number];
}

const tooltipRows = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any[],
): TooltipRow[] => {
    const rows = new Map<string, TooltipRow>();

    for (const item of payload) {
        const row: TooltipRow = rows.get(item.name) ?? { name: item.name };
        if (Array.isArray(item.value)) {
            const [low, high] = item.value as [number, number];
            // A bucket holding a single value has no spread worth quoting
            if (low !== high) {
                row.range = [low, high];
            }
        } else {
            row.value = item.value;
        }
        rows.set(item.name, row);
    }

    return [...rows.values()];
};

const CustomTooltip = ({ active, payload, label, unit, planPeriods }: TooltipProps) => {
    const [, i18n] = useTranslation();

    if (!active || !payload?.length) {
        return null;
    }

    // The plan belongs to the touched date, not to a series, so it goes below
    // the value rows instead of onto every one of them
    const plans = planNamesAt(planPeriods, Number(label));

    return (
        <Paper style={{ padding: 8 }}>
            <p><strong>{dateToLocale(new Date(Number(label)))}</strong></p>
            {tooltipRows(payload).map(row => (
                <p key={row.name}>
                    {row.name}
                    {row.value !== undefined && `: ${valueWithUnit(row.value, unit, i18n.language)}`}
                    {row.range !== undefined && ` (${numberDecimalLocale(row.range[0], i18n.language)}`
                        + `–${valueWithUnit(row.range[1], unit, i18n.language)})`}
                </p>
            ))}
            {plans.map(name => <p key={name}><em>{name}</em></p>)}
        </Paper>
    );
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
 * How far each measured value sits from the trend, as a dashed connector.
 *
 * Only readable while the values are few enough to tell apart, and only
 * meaningful where a value and the trend share a date, which they do because
 * the trend is derived from those very points.
 */
const VarianceLines = (props: { raw: ChartPoint[], trend: ChartPoint[] }) => {
    const xScale = useXAxisScale();
    const yScale = useYAxisScale();
    const theme = useTheme();

    if (!xScale || !yScale || props.raw.length > MAX_VARIANCE_LINES) {
        return null;
    }

    const trendByDate = new Map(props.trend.map(point => [point.date, point.value]));

    return <g>
        {props.raw.map(point => {
            const trend = trendByDate.get(point.date);
            if (trend === undefined) {
                return null;
            }

            const x = xScale(point.date) as number;

            return <line
                key={point.date}
                x1={x}
                y1={yScale(point.value) as number}
                x2={x}
                y2={yScale(trend) as number}
                stroke={point.value > trend ? theme.palette.error.main : theme.palette.success.main}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.5} />;
        })}
    </g>;
};

export interface MeasurementSeriesChartProps {
    series: ChartSeries[];
    unit: string;
    height?: number;

    /**
     * Extras the body weight screens had before they moved onto this chart:
     * the mean of the values as a reference line with the current trend, and
     * a connector from every value to the trend. Off everywhere else.
     */
    showMean?: boolean;
    showVariance?: boolean;

    /** Nutrition plan periods shaded for context, see PlanPeriod */
    planPeriods?: PlanPeriod[];
}

/**
 * Renders a list of series into one chart, styled by the role of each series.
 *
 * Points that summarise a range get a band around their line, which is what
 * shows the spread of a daily aggregate or of a condensed series.
 */
export const MeasurementSeriesChart = (props: MeasurementSeriesChartProps) => {
    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const [chartRef, chartWidth] = useChartWidth();

    const roleLabels: Record<ChartSeriesRole, string> = {
        raw: t('measurements.indicatorRaw'),
        average: t('measurements.indicatorAvg'),
        trend: t('measurements.indicatorTrend'),
        component: '',
    };

    const palette = componentPalette(props.series.filter(s => s.role === 'component').length);
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

    // Clamped to the span of the data so a band never draws past the axes
    const periods = clampPeriods(props.planPeriods ?? [], props.series.flatMap(s => s.points));

    const rawPoints = pointsOfRole(props.series, 'raw');
    const trendPoints = pointsOfRole(props.series, 'trend');
    const mean = rawPoints.length === 0
        ? null
        : rawPoints.reduce((sum, point) => sum + point.value, 0) / rawPoints.length;
    const currentTrend = trendPoints.at(-1)?.value ?? null;

    return <Box ref={chartRef} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        {props.showMean && mean !== null && <Stack
            direction="row"
            spacing={2}
            sx={{ alignSelf: 'flex-end', px: 1 }}>
            <Typography variant="caption" color="text.secondary">
                {t('mean')}: {valueWithUnit(mean, props.unit, i18n.language)}
            </Typography>
            {currentTrend !== null && <Typography
                variant="caption"
                sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {t('currentTrend')}: {valueWithUnit(currentTrend, props.unit, i18n.language)}
            </Typography>}
        </Stack>}
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
            <Tooltip content={<CustomTooltip unit={props.unit} planPeriods={periods} />} />

            {props.showMean && mean !== null && <ReferenceLine
                y={mean}
                stroke={theme.palette.text.secondary}
                strokeDasharray="5 5"
                strokeWidth={1.5} />}
            {props.showMean && currentTrend !== null && <ReferenceLine
                y={currentTrend}
                stroke={theme.palette.primary.main}
                strokeDasharray="3 3"
                strokeWidth={1}
                ifOverflow="extendDomain" />}
            {props.showVariance && <VarianceLines raw={rawPoints} trend={trendPoints} />}

            {periods.map(period => <ReferenceArea
                key={`${period.start}-${period.name}`}
                x1={period.start}
                x2={period.end}
                fill={theme.palette.primary.main}
                fillOpacity={PLAN_BAND_OPACITY}
                ifOverflow="hidden" />)}

            {/* the bands go in first so the lines paint on top of them */}
            {resolved.map(({ series, color, name, key }) => {
                const band = bandData(series);

                return band.length === 0
                    ? null
                    // the band shares the name of its line, which is what
                    // folds its bounds into that line's tooltip row
                    : <Area
                        key={`band-${key}`}
                        data={band}
                        dataKey="range"
                        name={name}
                        stroke="none"
                        fill={color}
                        fillOpacity={BAND_OPACITY}
                        legendType="none" />;
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
            {periods.length > 0 && <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box sx={{
                    backgroundColor: theme.palette.primary.main,
                    height: 12,
                    opacity: PLAN_BAND_OPACITY,
                    width: 12,
                }} />
                <Typography variant="caption">{t('nutrition.plan')}</Typography>
            </Stack>}
        </Stack>
    </Box>;
};
