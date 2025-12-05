import { Box } from "@mui/material";
import { MeasurementCategory } from "components/Measurements/models/Category";
import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { theme } from "theme";
import { dateToLocale } from "utils/date";

export const MeasurementChart = (props: { category: MeasurementCategory }) => {
    const NR_OF_ENTRIES_CHART_DOT = 30;

    // map the list of weights to an array of objects with the date and weight
    const entryData = [...props.category.entries].sort((a, b) => a.date.getTime() - b.date.getTime()).map(entry => {
        return {
            date: entry.date.getTime(),
            value: entry.value,
            entry: entry
        };
    });


    return <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
        <LineChart data={entryData} responsive width="90%" height={200}>
            <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
                dot={entryData.length > NR_OF_ENTRIES_CHART_DOT ? false : { strokeWidth: 1, r: 4 }}
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
            <YAxis domain={['auto', 'auto']} unit={props.category.unit} />
            {/*<Tooltip content={<CustomTooltip />} />*/}
        </LineChart>
    </Box>;
};