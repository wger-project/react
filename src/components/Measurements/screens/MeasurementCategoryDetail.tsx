import { Stack, Typography } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { correlatesWithNutrition } from "@/components/Measurements/models/Category";
import { useMeasurementsQuery } from "@/components/Measurements/queries";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "@/components/Measurements/widgets/CategoryDetailDropdown";
import { ChartRange, DEFAULT_CHART_RANGE, entryFilterFor } from "@/components/Measurements/charts/range";
import { AddMeasurementEntryFab } from "@/components/Measurements/widgets/fab";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import React from "react";
import { useParams } from "react-router-dom";

export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ?? '';
    if (!categoryId) {
        return <p>Please pass a category id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [range, setRange] = React.useState<ChartRange>(DEFAULT_CHART_RANGE);
    // Fetch what the range shows, rather than the whole history. The grid
    // below lists the same entries, so it follows the range too
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const categoryQuery = useMeasurementsQuery(categoryId, entryFilterFor(range));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const planPeriods = useNutritionPlanPeriods(
        correlatesWithNutrition(categoryQuery.data?.metricType ?? 'custom'),
    );

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerRightSidebar
        title={categoryQuery.data!.name}
        // official categories may neither be renamed nor deleted
        optionsMenu={categoryQuery.data!.isOfficial
            ? undefined
            : <CategoryDetailDropdown category={categoryQuery.data!} />}
        mainContent={
            <Stack spacing={2}>
                <ChartRangeSelector value={range} onChange={setRange} />
                <MeasurementChart
                    category={categoryQuery.data!}
                    range={range}
                    planPeriods={planPeriods} />
                {categoryQuery.data!.isGroup
                    ? categoryQuery.data!.children.map(child =>
                        <React.Fragment key={child.id}>
                            <Typography variant="h5">{child.name}</Typography>
                            <CategoryDetailDataGrid category={child} />
                        </React.Fragment>)
                    : <CategoryDetailDataGrid category={categoryQuery.data!} />}
            </Stack>
        }
        fab={<AddMeasurementEntryFab category={categoryQuery.data!} />}
    />;
};
