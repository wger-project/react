import { Stack, Typography } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import {
    categoryDisplayName,
    correlatesWithNutrition,
    MeasurementCategory,
    METRIC_TYPE_BODY_WEIGHT
} from "@/components/Measurements/models/Category";
import { useMeasurementEntriesQuery, useMeasurementsQuery } from "@/components/Measurements/queries";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "@/components/Measurements/widgets/CategoryDetailDropdown";
import { ChartRange, DEFAULT_CHART_RANGE, entryFilterFor } from "@/components/Measurements/charts/range";
import { AddMeasurementEntryFab } from "@/components/Measurements/widgets/fab";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import { makeLink, WgerLink } from "@/core/lib/url";
import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

/**
 * The grid of one category, over the entries the range covers.
 *
 * A component of its own because a group renders one per component, and each
 * of them reads its own entries.
 */
const CategoryEntriesGrid = (props: { category: MeasurementCategory, range: ChartRange }) => {
    const entriesQuery = useMeasurementEntriesQuery(props.category.id!, entryFilterFor(props.range));

    return <CategoryDetailDataGrid category={props.category} entries={entriesQuery.data ?? []} />;
};

export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ?? '';
    if (!categoryId) {
        return <p>Please pass a category id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [range, setRange] = React.useState<ChartRange>(DEFAULT_CHART_RANGE);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const categoryQuery = useMeasurementsQuery(categoryId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const planPeriods = useNutritionPlanPeriods(
        correlatesWithNutrition(categoryQuery.data?.metricType ?? 'custom'),
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [t, i18n] = useTranslation();

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // Body weight is presented on its own screens, which read and write it
    // through their own query cache. Rendering it here as well would show a
    // second view of the same rows and leave the other one stale after an edit
    if (categoryQuery.data!.isOfficial && categoryQuery.data!.metricType === METRIC_TYPE_BODY_WEIGHT) {
        return <Navigate to={makeLink(WgerLink.WEIGHT_OVERVIEW, i18n.language)} replace />;
    }

    return <WgerContainerRightSidebar
        title={categoryDisplayName(categoryQuery.data!, t)}
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
                            <Typography variant="h5">{categoryDisplayName(child, t)}</Typography>
                            <CategoryEntriesGrid category={child} range={range} />
                        </React.Fragment>)
                    : <CategoryEntriesGrid category={categoryQuery.data!} range={range} />}
            </Stack>
        }
        fab={<AddMeasurementEntryFab category={categoryQuery.data!} />}
    />;
};
