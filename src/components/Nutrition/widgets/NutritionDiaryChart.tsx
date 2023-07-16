import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { generateChartColors } from "utils/colors";
import { useTranslation } from "react-i18next";

type NutritionDiaryChartProps = {
    planned: NutritionalValues;
    today: NutritionalValues;
    avg7Days: NutritionalValues;
}

export const NutritionDiaryChart = ({ planned, today, avg7Days }: NutritionDiaryChartProps) => {
    const [t] = useTranslation();
    const colorGenerator = generateChartColors(3);

    const data2 = [
        {
            name: t('nutrition.protein'),
            planned: planned.protein.toFixed(2),
            today: today.protein.toFixed(1),
            avg7Days: avg7Days.protein.toFixed(1),
        },
        {
            name: t('nutrition.carbohydrates'),
            planned: planned.carbohydrates.toFixed(1),
            today: today.carbohydrates.toFixed(1),
            avg7Days: avg7Days.carbohydrates.toFixed(1),
        },

        {
            name: t('nutrition.sugar'),
            planned: planned.carbohydratesSugar.toFixed(1),
            today: today.carbohydratesSugar.toFixed(1),
            avg7Days: avg7Days.carbohydratesSugar.toFixed(1),
        },
        {
            name: t('nutrition.fat'),
            planned: planned.fat.toFixed(1),
            today: today.fat.toFixed(1),
            avg7Days: avg7Days.fat.toFixed(1),
        },
        {
            name: t('nutrition.saturatedFat'),
            planned: planned.fatSaturated.toFixed(1),
            today: today.fatSaturated.toFixed(1),
            avg7Days: avg7Days.fatSaturated.toFixed(1),
        },
        // {
        //     name: "Energy (kcal)",
        //     value: props.data.energy,
        // },
    ];


    return (
        <BarChart
            width={700}
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
            <Bar
                yAxisId="left"
                dataKey="planned"
                unit={'g'}
                name={t('nutrition.planned')}
                fill={colorGenerator.next().value!}
            />
            <Bar
                yAxisId="left"
                dataKey="today"
                unit={'g'}
                name={t('nutrition.today')}
                fill={colorGenerator.next().value!}
            />
            <Bar
                yAxisId="left"
                dataKey="avg7Days"
                unit={'g'}
                name={t('nutrition.7dayAvg')}
                fill={colorGenerator.next().value!}
            />
            {/*<Bar yAxisId="right" dataKey="uv" fill="#82ca9d" />*/}
        </BarChart>
    );
};
