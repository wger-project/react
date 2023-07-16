import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

    const data = [
        {
            name: t('nutrition.protein'),
            planned: planned.protein.toFixed(),
            today: today.protein.toFixed(),
            avg7Days: avg7Days.protein.toFixed(),
        },
        {
            name: t('nutrition.carbohydrates'),
            planned: planned.carbohydrates.toFixed(),
            today: today.carbohydrates.toFixed(),
            avg7Days: avg7Days.carbohydrates.toFixed(),
        },

        {
            name: t('nutrition.sugar'),
            planned: planned.carbohydratesSugar.toFixed(),
            today: today.carbohydratesSugar.toFixed(),
            avg7Days: avg7Days.carbohydratesSugar.toFixed(),
        },
        {
            name: t('nutrition.fat'),
            planned: planned.fat.toFixed(),
            today: today.fat.toFixed(),
            avg7Days: avg7Days.fat.toFixed(),
        },
        {
            name: t('nutrition.saturatedFat'),
            planned: planned.fatSaturated.toFixed(),
            today: today.fatSaturated.toFixed(),
            avg7Days: avg7Days.fatSaturated.toFixed(),
        },
        // {
        //     name: "Energy (kcal)",
        //     value: props.data.energy,
        // },
    ];


    return (
        <ResponsiveContainer width={"100%"} height={300}>
            <BarChart
                data={data}
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
        </ResponsiveContainer>
    );
};
