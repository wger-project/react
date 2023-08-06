import { Stack, Typography } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { DiaryDetail } from "components/Nutrition/widgets/DiaryDetail";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


export const NutritionDiaryOverview = () => {
    const [t] = useTranslation();
    const params = useParams<{ planId: string, date: string }>();

    const planId = parseInt(params.planId!);
    const date = new Date(params.date!);

    const planQuery = useFetchNutritionalPlanQuery(planId);

    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={t('nutrition.nutritionalDiary')}
            mainContent={<>
                <Stack spacing={2}>
                    <Typography gutterBottom variant="h4">
                        {date.toLocaleDateString()}
                    </Typography>
                    <DiaryDetail
                        entries={planQuery.data!.loggedEntriesDate(date)}
                        planValues={planQuery.data!.loggedNutritionalValuesDate(date)}
                    />
                </Stack>
            </>}
        />;
};