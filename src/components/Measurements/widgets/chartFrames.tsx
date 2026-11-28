import { Box, Paper, useTheme } from "@mui/material";
import {
    dateTick,
    durationAxis,
    spansYears,
    valueWithUnit
} from "@/components/Measurements/charts/format";
import { dateToLocale } from "@/core/lib/date";
import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export interface TooltipProps {
    active?: boolean,
    /** The hovered entries, read by each tooltip the way its own chart wrote them */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
}

/** What every tooltip here shares: the day, and under it what was measured on it */
export const TooltipFrame = (props: { label?: string, children: React.ReactNode }) =>
    <Paper style={{ padding: 8 }}>
        <p><strong>{dateToLocale(new Date(Number(props.label)))}</strong></p>
        {props.children}
    </Paper>;

/**
 * The frame every bar chart here is drawn in: the grid, the date axis and the
 * value axis, which only differ in the unit they read. The bars themselves are
 * the caller's, they are what each chart is about.
 */
export const BarChartFrame = (props: {
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
    const theme = useTheme();

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
                stroke={theme.palette.divider}
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
