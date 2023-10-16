import { Stack, Typography } from "@mui/material";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { LinearPlannedLoggedChart } from "components/Nutrition/widgets/charts/LinearPlannedLoggedChart";
import React from "react";
import { useTranslation } from "react-i18next";


export const PlanSidebar = (props: { plan: NutritionalPlan }) => {
    const [t] = useTranslation();

    const planned = props.plan.plannedNutritionalValues;
    const loggedToday = props.plan.loggedNutritionalValuesToday;
    const percentages = props.plan.percentages;


    return <>
        <Stack direction="column" spacing={1}>
            <Typography gutterBottom variant="h6">
                {t('nutrition.goalsTitle')}
            </Typography>

            <LinearPlannedLoggedChart
                title={t('nutrition.protein')}
                percentage={percentages.protein}
                logged={loggedToday.protein}
                planned={planned.protein}
            />

            <LinearPlannedLoggedChart
                title={t('nutrition.carbohydrates')}
                percentage={percentages.carbohydrates}
                logged={loggedToday.carbohydrates}
                planned={planned.carbohydrates}
            />

            <LinearPlannedLoggedChart
                title={t('nutrition.fat')}
                percentage={percentages.fat}
                logged={loggedToday.fat}
                planned={planned.fat}
            />
        </Stack>
    </>;
};