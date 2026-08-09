import { Box, Stack } from "@mui/material";
import { entryFilterFor } from "@/components/Measurements/charts/range";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { PlanPeriod } from "@/components/Measurements/charts/series";
import { setChartRange, useChartRange } from "@/components/Measurements/state/chartRange";
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
import { useTranslation } from "react-i18next";


/** [planPeriods] come from the caller: measurements know nothing about nutrition */
export const BodyWeight = (props: { planPeriods?: PlanPeriod[] }) => {
    const [t] = useTranslation();
    // Shared with the other measurement screens, see useChartRange
    const range = useChartRange();
    // Fetch what the range shows, rather than the whole history. The filter
    // reaches a week further back than the chart draws, so the moving average
    // of the first days in range still averages the days before them. The
    // table below lists the same entries, so it follows the range too
    const weightyQuery = useBodyWeightQuery(entryFilterFor(range));
    const categoryQuery = useBodyWeightCategoryQuery();
    const displayUnit = useDisplayWeightUnit();

    if (weightyQuery.isLoading || categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // Entries without their own unit fall back to the one of the category
    const categoryUnit = categoryQuery.data!.unit;

    return <WgerContainerRightSidebar
        title={t("weight")}
        mainContent={<Stack spacing={2}>
            <ChartRangeSelector value={range} onChange={setChartRange} />
            {weightyQuery.data!.length === 0 && <OverviewEmpty />}
            {weightyQuery.data!.length !== 0 && <>
                <WeightChart
                    weights={weightyQuery.data!}
                    unit={displayUnit}
                    categoryUnit={categoryUnit}
                    range={range}
                    planPeriods={props.planPeriods ?? []}
                    chartConfig={categoryQuery.data!.chartConfig} />
                <Box sx={{ mt: 4 }} />
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
