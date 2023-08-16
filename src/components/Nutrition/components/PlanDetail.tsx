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


    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={planQuery.data!.description}
            optionsMenu={<PlanDetailDropdown plan={planQuery.data!} />}
            mainContent={<>
                <Stack spacing={2}>
                    <Typography gutterBottom variant="h4">
                        {t('nutrition.planned')}
                    </Typography>
                    {planQuery.data!.meals.map(meal =>
                        <MealDetail meal={meal} planId={planQuery.data!.id} key={meal.id} />
                    )}
                    <MealDetail meal={planQuery.data!.pseudoMealOthers} planId={planQuery.data!.id} key={-1} />

                    <Tooltip title={t('nutrition.addMeal')}>
                        <IconButton onClick={handleToggleExpandedForm}>
                            <Add />
                        </IconButton>
                    </Tooltip>

                    <Collapse in={expandedForm} timeout="auto" unmountOnExit>
                        <p><b>{t('nutrition.addMeal')}</b></p>
                        <MealForm planId={planQuery.data!.id} closeFn={handleToggleExpandedForm} />
                    </Collapse>

                    <Typography gutterBottom variant="h5">
                        {t('nutrition.nutritionalData')}
                    </Typography>
                    <NutritionalValuesTable values={planQuery.data!.plannedNutritionalValues} />
                    <MacrosPieChart data={planQuery.data!.plannedNutritionalValues} />

                    <Typography gutterBottom variant="h4">
                        {t('nutrition.logged')}
                    </Typography>
                    <NutritionDiaryChart
                        planned={planQuery.data!.plannedNutritionalValues}
                        today={planQuery.data!.loggedNutritionalValuesToday}
                        avg7Days={planQuery.data!.loggedNutritionalValues7DayAvg}
                    />
                    <DiaryOverview
                        planId={planQuery.data!.id}
                        logged={planQuery.data!.groupDiaryEntries}
                        planned={planQuery.data!.plannedNutritionalValues}
                    />
                </Stack>
            </>}
            fab={<AddNutritionDiaryEntryFab plan={planQuery.data!} />}
        />;
};