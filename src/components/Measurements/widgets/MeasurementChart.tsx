import { Box, Paper } from "@mui/material";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "../models/Entry";
import React from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@/theme";
import { dateToLocale } from "@/core/lib/date";
import { useBodyWeightQuery } from "@/components/Weight";
import { useProfileQuery } from "@/components/User";

export interface TooltipProps {
    active?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
    category: MeasurementCategory
}

const CustomTooltip = ({ active, payload, label, category }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <Paper style={{ padding: 8 }}>
                <p><strong>{dateToLocale(new Date(label!))}</strong></p>
                <p>{category.name}: {payload[0].value} {category.unit}</p>
            </Paper>
        );
    }

    return null;
};


export const MeasurementChart = (props: { category: MeasurementCategory }) => {
    const NR_OF_ENTRIES_CHART_DOT = 30;

    const weightQuery = useBodyWeightQuery('');
    const profileQuery = useProfileQuery();

    // default to the standard database entries
    let entries = [...props.category.entries];
    console.log(props.category);

    if (props.category.is_dynamic) {
        console.log("We made it here.");
        switch (props.category.name) {
            case "BMI": {
                console.log("We made it to BMI");
                const height = profileQuery.data?.height;
                const weights = weightQuery.data || [];

                console.log(height, weights);

                if (height && height > 0) {
                    const hMeters = height / 100;
                    
                    // Use the constructor to create valid MeasurementEntry objects
                    entries = weights.map(w => new MeasurementEntry(
                        null,               // id
                        props.category.id,  // category
                        new Date(w.date),   // date
                        +(w.weight / (hMeters ** 2)).toFixed(2), // value
                        "Auto-generated"    // notes
                    ));
                }
                break;
            }
            default:
                // shouldn't be possible if name changes are restricted for dynamic measurements
                break;
        }
    }

    const entryData = entries
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(entry => {
        return {
            date: entry.date.getTime(),
            value: entry.value,
            entry: entry
        };
    });


    return <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
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
            {<Tooltip content={(<CustomTooltip category={props.category} />)} />}
        </LineChart>
    </Box>;
};