import React from "react";
import { Cell, Pie, PieChart } from 'recharts';
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { generateChartColors } from "utils/colors";

export const MacrosPieChart = (props: { data: NutritionalValues }) => {
    const data = [
        { name: 'carbs', value: props.data.carbohydrates },
        { name: 'protein', value: props.data.protein },
        { name: 'fat', value: props.data.fat },
    ];

    const COLORS = [...generateChartColors(3)];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
                                       cx,
                                       cy,
                                       midAngle,
                                       innerRadius,
                                       outerRadius,
                                       payload,
                                       percent,
                                   }: any) => {


        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);


        return (
            <text
                x={x}
                y={y}
                //fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${payload.name} - ${(percent * 100).toFixed(0)}% / ${payload.value.toFixed(0)}g`}
            </text>
        );
    };

    return <PieChart width={400} height={400}>
        <Pie
            data={data}
            labelLine={false}
            label={renderCustomizedLabel}
            //outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            //label
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
    </PieChart>;
};
