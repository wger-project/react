import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { generateChartColors } from "utils/colors";
import { useTranslation } from "react-i18next";


export const NutritionalValuesPlannedLoggedChart = (props: {
    logged: NutritionalValues,
    planned: NutritionalValues
}) => {
    const [t] = useTranslation();
    const colorGenerator = generateChartColors(3);

    const data = [
        {
            name: t('nutrition.energy'),
            value: props.planned.energy / props.logged.energy * 100,
        },
        {
            name: t('nutrition.protein'),
            value: props.planned.protein / props.logged.protein * 100,
        },
        {
            name: t('nutrition.carbohydrates'),
            value: props.planned.carbohydrates / props.logged.carbohydrates * 100,
        },
        {
            name: t('nutrition.fat'),
            value: props.planned.fat / props.logged.fat * 100,
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
