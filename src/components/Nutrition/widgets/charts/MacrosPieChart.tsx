import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import React from "react";
import { useTranslation } from "react-i18next";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { generateChartColors } from "utils/colors";
import { numberGramLocale } from "utils/numbers";

export const MacrosPieChart = (props: { data: NutritionalValues }) => {
    const [t, i18n] = useTranslation();
    const colorGenerator = generateChartColors(3);

    const data = [
        { name: t('nutrition.carbohydrates'), value: props.data.carbohydrates },
        { name: t('nutrition.protein'), value: props.data.protein },
        { name: t('nutrition.fat'), value: props.data.fat },
    ];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = (
        {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            payload,
        }:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any) => {


        const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
        >
            {numberGramLocale(payload.value, i18n.language)}
        </text>;
    };


    return <ResponsiveContainer width={"100%"} height={300}>
        <PieChart>
            <Pie
                data={data}
                labelLine={false}
                // outerRadius={80}
                label={renderCustomizedLabel}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorGenerator.next().value!} />
                ))}
            </Pie>
            {/*<Tooltip />*/}
            <Legend />
        </PieChart>
    </ResponsiveContainer>;
};
