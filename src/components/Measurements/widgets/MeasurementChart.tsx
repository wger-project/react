import { MeasurementCategory } from "components/Measurements/models/Category";
import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { theme } from "theme";
import React from "react";
import { Box } from "@mui/material";

export const MeasurementChart = (props: { category: MeasurementCategory }) => {
    const { i18n } = useTranslation();
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
        <ResponsiveContainer width="90%" height={200}>

            <LineChart data={entryData}>
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
                    tickFormatter={timeStr => new Date(timeStr).toLocaleDateString(i18n.language)}
                    tickCount={10}
                />
                <YAxis domain={['auto', 'auto']} unit={props.category.unit} />
                {/*<Tooltip content={<CustomTooltip />} />*/}
            </LineChart>
        </ResponsiveContainer>
    </Box>;
};