import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React from 'react';
import { WeightTableProps } from "components/BodyWeight/Table";
import i18n from "i18next";

export const WeightChart = ({ weights }: WeightTableProps) => {

    // map the list of weights to an array of objects with the date and weight
    const weightData = weights.map(weight => {
        return {
            // Format date according to the locale
            date: new Date(weight.date).toLocaleDateString(i18n.language),
            //date: weight.date.toISOString().substring(0, 10),
            weight: weight.weight
        };
    });

    return (
        <ResponsiveContainer width="90%" height={400}>
            <LineChart data={weightData}>
                <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2A4C7D"
                    strokeWidth={4}
                    dot={{ strokeWidth: 4 }}
                    activeDot={{ stroke: '#2A4C7D', strokeWidth: 2, r: 6 }}/>
                <CartesianGrid
                    stroke="#ccc"
                    strokeDasharray="5 5"/>
                <XAxis dataKey="date"/>
                <YAxis domain={['auto', 'auto']}/>

                <Tooltip/>
            </LineChart>
        </ResponsiveContainer>
    );
};