import { Box, Stack } from "@mui/material";
import { ChartRange, DEFAULT_CHART_RANGE, entryFilterFor } from "@/components/Measurements/charts/range";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import {
    useBodyWeightCategoryQuery,
    useBodyWeightQuery,
    useDisplayWeightUnit
} from "@/components/Measurements/queries/bodyWeight";
import { WeightChart } from "@/components/Measurements/widgets/WeightChart";
import { AddBodyWeightEntryFab } from "@/components/Measurements/widgets/fab";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const BodyWeight = () => {
    const [t] = useTranslation();
    const [range, setRange] = useState<ChartRange>(DEFAULT_CHART_RANGE);
    // Fetch what the range shows, rather than the whole history. The filter
    // reaches a week further back than the chart draws, so the moving average
    // of the first days in range still averages the days before them. The
    // table below lists the same entries, so it follows the range too
    const weightyQuery = useBodyWeightQuery(entryFilterFor(range));
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
                {/* The entries are read by their own query here, the official
                    category is fetched without them */}
                <CategoryDetailDataGrid
                    category={categoryQuery.data!}
                    entries={weightyQuery.data!}
                    displayUnit={displayUnit} />
            </>}
        </Stack>
        }
        fab={<AddBodyWeightEntryFab />}
    />;
};
