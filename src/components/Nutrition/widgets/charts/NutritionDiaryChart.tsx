import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { generateChartColors } from "utils/colors";

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
            planned: planned.protein,
            today: today.protein,
            avg7Days: avg7Days.protein,
        },
        {
            name: t('nutrition.carbohydrates'),
            planned: planned.carbohydrates,
            today: today.carbohydrates,
            avg7Days: avg7Days.carbohydrates,
        },

        {
            name: t('nutrition.sugar'),
            planned: planned.carbohydratesSugar,
            today: today.carbohydratesSugar,
            avg7Days: avg7Days.carbohydratesSugar,
        },
        {
            name: t('nutrition.fat'),
            planned: planned.fat,
            today: today.fat,
            avg7Days: avg7Days.fat,
        },
        {
            name: t('nutrition.saturatedFat'),
            planned: planned.fatSaturated,
            today: today.fatSaturated,
            avg7Days: avg7Days.fatSaturated,
        },
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
                <YAxis
                    type="number"
                    orientation="left"
                    stroke="#8884d8"
                    unit={t('nutrition.gramShort')}
                />
                <Tooltip formatter={(value: number) => value.toFixed()} />
                <Legend />
                <Bar
                    dataKey="planned"
                    unit={t('nutrition.gramShort')}
                    name={t('nutrition.planned')}
                    fill={colorGenerator.next().value!}
                />
                <Bar
                    dataKey="today"
                    unit={t('nutrition.gramShort')}
                    name={t('nutrition.today')}
                    fill={colorGenerator.next().value!}
                />
                <Bar
                    dataKey="avg7Days"
                    unit={t('nutrition.gramShort')}
                    name={t('nutrition.7dayAvg')}
                    fill={colorGenerator.next().value!}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};
