import { Box, Paper } from "@mui/material";
import { isSummedPerDay, MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import React from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@/theme";
import { generateChartColors } from "@/core/lib/colors";
import { dateToLocale } from "@/core/lib/date";
import { calculateEMA } from "@/core/lib/ema";

export interface TooltipProps {
    active?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
    category: MeasurementCategory
}

const CustomTooltip = ({ active, payload, label, category }: TooltipProps) => {
    const [t] = useTranslation();

    if (active && payload && payload.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = payload.find((p: any) => p.dataKey === 'value');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trend = payload.find((p: any) => p.dataKey === 'ema');

        return (
            <Paper style={{ padding: 8 }}>
                <p><strong>{dateToLocale(new Date(label!))}</strong></p>
                {value && <p>{category.name}: {value.value} {category.unit}</p>}
                {trend && <p>{t('trend')}: {trend.value.toFixed(1)} {category.unit}</p>}
            </Paper>
        );
    }

    return null;
};

/**
 * Sums entries per local calendar day, for metric types where individual
 * samples aren't meaningful on their own (steps, distance, energy, sleep)
 */
export const aggregatePerDay = (entries: MeasurementEntry[]): { date: number, value: number }[] => {
    const sums = new Map<number, number>();
    for (const entry of entries) {
        const day = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate()).getTime();
        sums.set(day, (sums.get(day) ?? 0) + entry.value);
    }

    return [...sums.entries()]
        .map(([date, value]) => ({ date: date, value: value }))
        .sort((a, b) => a.date - b.date);
};

/**
 * Fills gaps in a per-day series with zero-value days so a band axis keeps
 * the spacing between bars proportional to time
 */
export const fillMissingDays = (data: { date: number, value: number }[]): { date: number, value: number }[] => {
    if (data.length === 0) {
        return [];
    }

    const byDay = new Map(data.map(d => [d.date, d.value]));
    const last = data[data.length - 1].date;
    const out = [];
    // aggregatePerDay emits local-midnight timestamps; stepping via setDate
    // stays on local midnight across DST changes
    for (const day = new Date(data[0].date); day.getTime() <= last; day.setDate(day.getDate() + 1)) {
        out.push({ date: day.getTime(), value: byDay.get(day.getTime()) ?? 0 });
    }
    return out;
};

const MeasurementBarChart = (props: { category: MeasurementCategory }) => {
    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const data = fillMissingDays(aggregatePerDay(props.category.entries));

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <BarChart data={data} responsive width="90%" height={200}>
            <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false} />
            <XAxis
                dataKey="date"
                tickFormatter={timeStr => dateToLocale(new Date(timeStr))!}
            />
            <YAxis type="number" domain={[0, 'auto']} width="auto" unit={props.category.unit} />
            <Tooltip content={(<CustomTooltip category={props.category} />)} />
            <Bar
                dataKey="value"
                fill={theme.palette.secondary.main}
                maxBarSize={20} />
        </BarChart>
    </Box>;
};

const MeasurementLineChart = (props: { category: MeasurementCategory }) => {
    const NR_OF_ENTRIES_CHART_DOT = 30;

    // map the list of entries to an array of objects with the date and value
    const entryData = [...props.category.entries].sort((a, b) => a.date.getTime() - b.date.getTime()).map(entry => {
        return {
            date: entry.date.getTime(),
            value: entry.value,
            entry: entry
        };
    });
    const emaData = calculateEMA(entryData, p => p.value);

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <LineChart data={emaData} responsive width="90%" height={200}>
            <Line
                type="monotone"
                dataKey="ema"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={false} />
            <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
                dot={emaData.length > NR_OF_ENTRIES_CHART_DOT ? false : { strokeWidth: 1, r: 4 }}
                activeDot={{
                    stroke: 'black',
                    strokeWidth: 1,
                    r: 6,
                    //onClick: handleClick
                }} />
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
            <YAxis domain={['auto', 'auto']} width="auto" unit={props.category.unit} />
            {<Tooltip content={(<CustomTooltip category={props.category} />)} />}
        </LineChart>
    </Box>;
};

/**
 * Renders all components of a multi-value group (e.g. systolic and diastolic
 * blood pressure) as series of one combined chart
 */
const MeasurementGroupChart = (props: { category: MeasurementCategory }) => {
    const colorGenerator = generateChartColors(props.category.children.length);

    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <LineChart responsive width="90%" height={200}>
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
            <YAxis domain={['auto', 'auto']} width="auto" unit={props.category.unit} />
            <Tooltip
                labelFormatter={label => dateToLocale(new Date(label as number))!}
                formatter={(value, name, item) =>
                    `${value} ${item.payload.unit || props.category.unit}`}
            />
            <Legend />
            {props.category.children.map(child => {
                const data = [...child.entries]
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(entry => ({
                        date: entry.date.getTime(),
                        value: entry.value,
                        unit: child.unit,
                    }));

                return <Line
                    key={child.id}
                    type="monotone"
                    data={data}
                    dataKey="value"
                    name={child.name}
                    stroke={colorGenerator.next().value!}
                    strokeWidth={2}
                    dot={false} />;
            })}
        </LineChart>
    </Box>;
};

export const MeasurementChart = (props: { category: MeasurementCategory }) => {
    if (props.category.isGroup) {
        return <MeasurementGroupChart category={props.category} />;
    }

    return isSummedPerDay(props.category.metricType)
        ? <MeasurementBarChart category={props.category} />
        : <MeasurementLineChart category={props.category} />;
};
