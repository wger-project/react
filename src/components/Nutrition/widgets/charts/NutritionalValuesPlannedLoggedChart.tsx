import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { generateChartColors } from "utils/colors";


export const NutritionalValuesPlannedLoggedChart = (props: {
    logged: NutritionalValues,
    planned: NutritionalValues
}) => {
    const [t] = useTranslation();
    const colorGenerator = generateChartColors(3);
    const data = [
        {
            name: t('nutrition.energy'),
            value: props.logged.energy / props.planned.energy * 100,
        },
        {
            name: t('nutrition.protein'),
            value: props.logged.protein / props.planned.protein * 100,
        },
        {
            name: t('nutrition.carbohydrates'),
            value: props.logged.carbohydrates / props.planned.carbohydrates * 100,
        },
        {
            name: t('nutrition.fat'),
            value: props.logged.fat / props.planned.fat * 100,
        },
    ];


    return (
        <ResponsiveContainer width={"100%"} height={150}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{
                    left: 60,
                }}
            >
                <CartesianGrid strokeDasharray="3 4" />
                <XAxis type={'number'} unit={'%'} />
                <YAxis type={'category'} dataKey={'name'} />
                <Bar
                    dataKey="value"
                    unit={'%'}
                    fill={colorGenerator.next().value!}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};
