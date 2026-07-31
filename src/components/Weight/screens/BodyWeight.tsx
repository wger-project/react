import { Box, Stack } from "@mui/material";
import { ChartRange, ChartRangeSelector, DEFAULT_CHART_RANGE } from "@/components/Measurements";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import {
    useBodyWeightCategoryQuery,
    useBodyWeightQuery,
    useDisplayWeightUnit
} from "@/components/Weight/queries";
import { WeightTable } from "@/components/Weight/widgets/Table";
import { WeightChart } from "@/components/Weight/widgets/WeightChart";
import { AddBodyWeightEntryFab } from "@/components/Weight/widgets/fab";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const BodyWeight = () => {
    const [t] = useTranslation();
    const [range, setRange] = useState<ChartRange>(DEFAULT_CHART_RANGE);
    // The range is cut client-side, so the average can be computed over the
    // full history before it is applied; the table lists every entry
    const weightyQuery = useBodyWeightQuery('');
    const categoryQuery = useBodyWeightCategoryQuery();
    const displayUnit = useDisplayWeightUnit();
    const planPeriods = useNutritionPlanPeriods();

    if (weightyQuery.isLoading || categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // Entries without their own unit fall back to the one of the category
    const categoryUnit = categoryQuery.data!.unit;

    return <WgerContainerRightSidebar
        title={t("weight")}
        mainContent={<Stack spacing={2}>
            <ChartRangeSelector value={range} onChange={setRange} />
            {weightyQuery.data!.length === 0 && <OverviewEmpty />}
            {weightyQuery.data!.length !== 0 && <>
                <WeightChart
                    weights={weightyQuery.data!}
                    unit={displayUnit}
                    categoryUnit={categoryUnit}
                    range={range}
                    planPeriods={planPeriods} />
                <Box sx={{ mt: 4 }} />
                <WeightTable
                    weights={weightyQuery.data!}
                    unit={displayUnit}
                    categoryUnit={categoryUnit} />
            </>}
        </Stack>
        }
        fab={<AddBodyWeightEntryFab />}
    />;
};
