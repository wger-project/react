import { Stack, useTheme } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { LinearPlannedLoggedChart } from "components/Nutrition/widgets/charts/LinearPlannedLoggedChart";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { numberLocale } from "utils/numbers";


export const NutritionalValuesDashboardChart = (props: {
    percentage: NutritionalValues,
    logged: NutritionalValues,
    planned: NutritionalValues,
}) => {

    const energyPercentage = props.planned.energy > 0 ? props.logged.energy / props.planned.energy * 100 : 100;
    const energyDiff = props.planned.energy > 0 ? props.planned.energy - props.logged.energy : props.logged.energy;

    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const data = [
        {
            name: '',
            value: energyPercentage,
        },
        {
            name: '',
            value: energyPercentage < 100 ? 100 - energyPercentage : 0,
        },
    ];
    const COLORS = [theme.palette.primary.main, '#C5C5C5'];


    return <Stack direction={'row'}>
        <ResponsiveContainer width={'50%'} height={140}>
            <PieChart>
                <Pie
                    // cx={0}
                    // cy={'10'}
                    height={100}
                    data={data}
                    startAngle={200}
                    endAngle={-20}
                    innerRadius={60}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <g>
                    <text x={'50%'} y={'45%'} fontSize="1.25em" textAnchor="middle">{/*fill="#333"*/}
                        {t('nutrition.valueEnergyKcal', { value: numberLocale(energyDiff, i18n.language) })}
                    </text>
                    <text x={'50%'} y={'60%'} fontSize="1em" textAnchor="middle">
                        {props.planned.energy > 0 && t(energyPercentage < 100 ? 'nutrition.valueRemaining' : 'nutrition.valueTooMany')}
                    </text>
                </g>
            </PieChart>
        </ResponsiveContainer>
        <Stack width={'50%'} spacing={1}>
            <LinearPlannedLoggedChart
                title={t('nutrition.protein')}
                percentage={props.percentage.protein}
                logged={props.logged.protein}
                planned={props.planned.protein}
            />
            <LinearPlannedLoggedChart
                title={t('nutrition.carbohydrates')}
                percentage={props.percentage.carbohydrates}
                logged={props.logged.carbohydrates}
                planned={props.planned.carbohydrates}
            />
            <LinearPlannedLoggedChart
                title={t('nutrition.fat')}
                percentage={props.percentage.fat}
                logged={props.logged.fat}
                planned={props.planned.fat}
            />
        </Stack>
    </Stack>;
};
