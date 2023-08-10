import { LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { numberGramLocale } from "utils/numbers";


export const NutritionalValuesDashboardChart = (props: { logged: NutritionalValues, planned: NutritionalValues }) => {

    const energyPercentage = props.logged.energy / props.planned.energy * 100;
    const energyDiff = props.planned.energy - props.logged.energy;
    const proteinPercentage = props.logged.protein / props.planned.protein * 100;
    const carbohydratesPercentage = props.logged.carbohydrates / props.planned.carbohydrates * 100;
    const fatPercentage = props.logged.fat / props.planned.fat * 100;

    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const data = [
        {
            name: t('nutrition.energy'),
            value: energyPercentage,
        },
        {
            name: t('nutrition.protein'),
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
                        {t('nutrition.valueEnergyKcal', { value: energyDiff.toFixed() })}
                    </text>
                    <text x={'50%'} y={'60%'} fontSize="1em" textAnchor="middle">
                        {t(energyPercentage < 100 ? 'nutrition.valueRemaining' : 'nutrition.valueTooMany')}
                    </text>
                </g>
            </PieChart>
        </ResponsiveContainer>
        <Stack width={'50%'}>
            <span>
                <LinearProgress
                    variant="determinate"
                    value={proteinPercentage < 100 ? proteinPercentage : 100}
                />
                <Typography variant={'caption'}>
                    {t('nutrition.protein')} — {numberGramLocale(props.logged.protein, i18n.language)} / {numberGramLocale(props.planned.protein, i18n.language)}
                </Typography>
            </span>

            <span>
                <LinearProgress
                    variant="determinate"
                    value={carbohydratesPercentage < 100 ? carbohydratesPercentage : 100}
                />
                <Typography variant={'caption'}>
                    {t('nutrition.carbohydrates')} — {numberGramLocale(props.logged.carbohydrates, i18n.language)} / {numberGramLocale(props.planned.carbohydrates, i18n.language)}
                </Typography>
            </span>

            <span>
                <LinearProgress
                    variant="determinate"
                    value={fatPercentage < 100 ? fatPercentage : 100}
                />
                <Typography variant={'caption'}>
                    {t('nutrition.fat')} — {numberGramLocale(props.logged.fat, i18n.language)} / {numberGramLocale(props.planned.fat, i18n.language)}
                </Typography>
            </span>
        </Stack>
    </Stack>;
};
