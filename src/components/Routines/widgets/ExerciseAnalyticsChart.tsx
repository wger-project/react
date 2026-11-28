import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme,
} from "@mui/material";
import { AnalyticsSeries, AnalyticsUnit } from "@/components/Routines/models/analytics";
import { dateToLocale } from "@/core/lib/date";
import { LIST_OF_COLORS8 } from "@/core/lib/consts";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export interface NamedAnalyticsSeries extends AnalyticsSeries {
    name: string;
}

export const ExerciseAnalyticsChart = (props: {
    series: NamedAnalyticsSeries[], unit: AnalyticsUnit, table: boolean,
}) => {
    const [t, i18n] = useTranslation();
    const theme = useTheme();
    const unitLabel = {
        kg: 'kg',
        kgReps: t('routines.analytics.kgReps'),
        reps: t('routines.reps'),
        seconds: t('server.seconds'),
    }[props.unit];
    const number = (value: number) => value.toLocaleString(i18n.language, { maximumFractionDigits: 2 });
    const data = useMemo(() => {
        const days = new Map<number, Record<string, number>>();
        for (const series of props.series) {
            for (const point of series.points) {
                if (!days.has(point.date)) {
                    days.set(point.date, { date: point.date });
                }
                days.get(point.date)![series.key] = point.value;
            }
        }
        return [...days.values()].sort((a, b) => a.date - b.date);
    }, [props.series]);

    return <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>{unitLabel}</Typography>
        {props.table ? <TableContainer component={Paper}>
            <Table size="small" aria-label={unitLabel}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('date')}</TableCell>
                        {props.series.map(series => <TableCell key={series.key} align="right">
                            {series.name} ({unitLabel})
                        </TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(day => <TableRow key={day.date}>
                        <TableCell>{dateToLocale(new Date(day.date))}</TableCell>
                        {props.series.map(series => <TableCell key={series.key} align="right">
                            {day[series.key] === undefined ? '—' : number(day[series.key])}
                        </TableCell>)}
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer> : <LineChart
            data={data}
            responsive
            width="100%"
            height={300}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            aria-label={unitLabel}>
            <CartesianGrid stroke={theme.palette.divider} strokeDasharray="5 5" vertical={false} />
            <XAxis
                dataKey="date"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={value => dateToLocale(new Date(value))}
                minTickGap={30}
            />
            <YAxis width="auto" domain={['auto', 'auto']} tickFormatter={number} />
            <Tooltip
                labelFormatter={label => dateToLocale(new Date(Number(label)))}
                formatter={value => `${number(Number(value))} ${unitLabel}`}
            />
            <Legend />
            {props.series.map((series, index) => <Line
                key={series.key}
                dataKey={series.key}
                name={series.name}
                stroke={LIST_OF_COLORS8[index % LIST_OF_COLORS8.length]}
                strokeDasharray={index >= LIST_OF_COLORS8.length ? '6 3' : undefined}
                strokeWidth={2}
                type="linear"
                connectNulls
                dot={{ r: 3 }}
                isAnimationActive={false}
            />)}
        </LineChart>}
    </Box>;
};
