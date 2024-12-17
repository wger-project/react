import { Add } from "@mui/icons-material";
import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { MacrosPieChart } from "components/Nutrition/widgets/charts/MacrosPieChart";
import { NutritionDiaryChart } from "components/Nutrition/widgets/charts/NutritionDiaryChart";
import { DiaryOverview } from "components/Nutrition/widgets/DiaryOverview";
import { AddNutritionDiaryEntryFab } from "components/Nutrition/widgets/Fab";
import { MealForm } from "components/Nutrition/widgets/forms/MealForm";
import { MealDetail } from "components/Nutrition/widgets/MealDetail";
import { NutritionalValuesTable } from "components/Nutrition/widgets/NutritionalValuesTable";
import { PlanDetailDropdown } from "components/Nutrition/widgets/PlanDetailDropdown";
import { PlanSidebar } from "components/Nutrition/widgets/PlanSidebar";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


export const PlanDetail = () => {
    const [t] = useTranslation();
    const params = useParams<{ planId: string }>();
    const planId = parseInt(params.planId!);
    const planQuery = useFetchNutritionalPlanQuery(planId);
    const [expandedForm, setExpandedForm] = useState(false);
    const handleToggleExpandedForm = () => setExpandedForm(!expandedForm);

    const plan = planQuery.data!;

    if (planQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerRightSidebar
        title={plan.description}
        optionsMenu={<PlanDetailDropdown plan={plan} />}
        mainContent={<>
            <Stack spacing={2}>
                {/*<Typography gutterBottom variant="h4">*/}
                {/*    {t('nutrition.planned')}*/}
                {/*</Typography>*/}
                {plan.meals.map(meal => <MealDetail
                    meal={meal}
                    planId={plan.id}
                    key={meal.id}
                    onlyLogging={plan.onlyLogging} />)}
                <MealDetail
                    meal={planQuery.data!.pseudoMealOthers(t('nutrition.pseudoMealTitle'))}
                    planId={plan.id}
                    key={-1}
                    onlyLogging={true}
                />

                {!plan.onlyLogging && <>
                    <Tooltip title={t('nutrition.addMeal')}>
                        <IconButton onClick={handleToggleExpandedForm}>
                            <Add />
                        </IconButton>
                    </Tooltip>
                    <Collapse in={expandedForm} timeout="auto" unmountOnExit>
                        <p><b>{t('nutrition.addMeal')}</b></p>
                        <MealForm planId={plan.id} closeFn={handleToggleExpandedForm} />
                    </Collapse>
                </>}

                <NutritionalValuesTable values={plan.plannedNutritionalValues} />

                {plan.hasAnyPlanned &&
                    <MacrosPieChart data={plan.plannedNutritionalValues} />
                }
                <Typography gutterBottom variant="h4">
                    {t('nutrition.logged')}
                </Typography>
                <NutritionDiaryChart
                    showPlanned={plan.hasAnyPlanned}
                    planned={plan.plannedNutritionalValues}
                    today={plan.loggedNutritionalValuesToday}
                    avg7Days={plan.loggedNutritionalValues7DayAvg}
                />
                <NutritionalValuesTable
                    values={plan.loggedNutritionalValuesToday}
                />
                <DiaryOverview
                    planId={plan.id}
                    logged={plan.groupDiaryEntries}
                    planned={plan.plannedNutritionalValues}
                />
            </Stack>
        </>}
        sideBar={<PlanSidebar plan={plan} />}
        fab={<AddNutritionDiaryEntryFab plan={plan} />}
    />;
};