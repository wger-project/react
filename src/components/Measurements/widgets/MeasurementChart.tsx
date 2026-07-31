import { Box, Paper } from "@mui/material";
import { isSummedPerDay, MeasurementCategory } from "@/components/Measurements/models/Category";
import { aggregatePerDay, chartPointsFor, fillMissingDays } from "@/components/Measurements/charts/data";
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

const MeasurementBarChart = (props: { category: MeasurementCategory }) => {
    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const points = chartPointsFor(props.category.entries, props.category.unit, props.category.unit);
    const data = fillMissingDays(aggregatePerDay(points));

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

    const points = chartPointsFor(props.category.entries, props.category.unit, props.category.unit);
    const emaData = calculateEMA(points, p => p.value);

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
                const data = chartPointsFor(child.entries, child.unit, child.unit)
                    .map(point => ({ ...point, unit: child.unit }));

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
