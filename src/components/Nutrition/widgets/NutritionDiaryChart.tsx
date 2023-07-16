import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { generateChartColors } from "utils/colors";

type NutritionDiaryChartProps = {
    planned: NutritionalValues;
    today: NutritionalValues;
    avg7Days: NutritionalValues;
}

export const NutritionDiaryChart = ({ planned, today, avg7Days }: NutritionDiaryChartProps) => {
    const colorGenerator = generateChartColors(3);

    const data2 = [
        {
            name: "Protein",
            planned: planned.protein.toFixed(2),
            today: today.protein.toFixed(1),
            avg7Days: avg7Days.protein.toFixed(1),
        },

        {
            name: "Fat",
            planned: planned.fat.toFixed(1),
            today: today.fat.toFixed(1),
            avg7Days: avg7Days.fat.toFixed(1),
        },
        {
            name: "Carbohydrates",
            planned: planned.carbohydrates.toFixed(1),
            today: today.carbohydrates.toFixed(1),
            avg7Days: avg7Days.carbohydrates.toFixed(1),
        },
        // {
        //     name: "Energy (kcal)",
        //     value: props.data.energy,
        // },
    ];


    return (
        <BarChart
            width={500}
            height={300}
            data={data2}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 4" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="planned" fill={colorGenerator.next().value!} />
            <Bar yAxisId="left" dataKey="today" fill={colorGenerator.next().value!} />
            <Bar yAxisId="left" dataKey="avg7Days" fill={colorGenerator.next().value!} />
            {/*<Bar yAxisId="right" dataKey="uv" fill="#82ca9d" />*/}
        </BarChart>
    );
};
