import { LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { generateChartColors } from "utils/colors";


export const NutritionalValuesDashboardChart = (props: { logged: NutritionalValues, planned: NutritionalValues }) => {

    const energyDiff = props.logged.energy / props.planned.energy * 100;
    const proteinDiff = props.logged.protein / props.planned.protein * 100;
    const carbohydratesDiff = props.logged.carbohydrates / props.planned.carbohydrates * 100;
    const fatDiff = props.logged.fat / props.planned.fat * 100;

    const theme = useTheme();
    const [t] = useTranslation();
    const colorGenerator = generateChartColors(3);
    const data = [
        {
            name: t('nutrition.energy'),
            value: energyDiff,
        },
        {
            name: t('nutrition.protein'),
            value: 100,
        },
    ];
    const COLORS = [theme.palette.primary.main, '#C5C5C5'];


    return <Stack direction={'row'}>
        <ResponsiveContainer width={'100%'} height={140}>
            <PieChart>
                <Pie
                    // cx={0}
                    // cy={'10'}
                    height={100}
                    data={data}
                    startAngle={180}
                    endAngle={0}
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

                    <text x={'50%'} y={'50%'} fontSize="1.4em" textAnchor="middle">{/*fill="#333"*/}
                        {t('nutrition.valueEnergyKcal', { value: (props.planned.energy - props.logged.energy).toFixed() })}
                    </text>
                </g>
            </PieChart>
        </ResponsiveContainer>
        <Stack width={'50%'}>
            <span>
                <LinearProgress variant="determinate" value={proteinDiff} />
                <Typography variant={'caption'}>
                    {t('nutrition.protein')}
                </Typography>

            </span>
            <span>
                <LinearProgress variant="determinate" value={carbohydratesDiff} />
                <Typography variant={'caption'}>
                    {t('nutrition.carbohydrates')}
                </Typography>
            </span>
            <span>
                <LinearProgress variant="determinate" value={fatDiff} />
                <Typography variant={'caption'}>
                    {t('nutrition.fat')}
                </Typography>
            </span>
        </Stack>
    </Stack>;
};
