import { Stack } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import {
    categoryDisplayName,
    MeasurementCategory,
    METRIC_TYPE_BODY_WEIGHT
} from "@/components/Measurements/models/Category";
import {
    useMeasurementEntryPageQuery,
    useMeasurementsQuery,
    useOldestMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { PlanPeriod } from "@/components/Measurements/charts/series";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "@/components/Measurements/widgets/CategoryDetailDropdown";
import { GroupReadingsGrid } from "@/components/Measurements/widgets/GroupReadingsGrid";
import { ChartRange, displayFilterFor } from "@/components/Measurements/charts/range";
import { setChartRange, useChartRange } from "@/components/Measurements/state/chartRange";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { GridPaginationModel } from "@mui/x-data-grid";
import { AddMeasurementEntryFab } from "@/components/Measurements/widgets/fab";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import { makeLink, WgerLink } from "@/core/lib/url";
import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

/**
 * The grid of one category, a page at a time over the entries the range
 * covers.
 *
 * A component of its own because a group renders one per component, and each
 * of them reads its own entries.
 */
const CategoryEntriesGrid = (props: { category: MeasurementCategory, range: ChartRange }) => {
    // The range as it is labelled, not the chart's read: that one takes a
    // month of lead so the moving average has something to average over, and
    // the table would list those rows as if they were part of the range
    const filter = displayFilterFor(props.range);
    const [pagination, setPagination] = React.useState<GridPaginationModel>({
        page: 0,
        pageSize: PAGINATION_OPTIONS.pageSize,
    });
    // Another range is another set of entries, and page seven of the last one
    // says nothing about it
    React.useEffect(
        () => setPagination(model => ({ ...model, page: 0 })),
        [props.range]
    );

    const pageQuery = useMeasurementEntryPageQuery(
        props.category.id!,
        pagination.page * pagination.pageSize,
        pagination.pageSize,
        filter,
    );
    const oldestQuery = useOldestMeasurementEntryQuery(props.category.id!, filter);
    const page = pageQuery.data;

    return <CategoryDetailDataGrid
        category={props.category}
        entries={page?.entries ?? []}
        pagination={{
            rowCount: page?.count ?? 0,
            model: pagination,
            onModelChange: setPagination,
            neighbours: [page?.next, oldestQuery.data].filter(entry => entry != null),
            isLoading: pageQuery.isFetching,
        }} />;
};

/** [planPeriods] come from the caller: measurements know nothing about nutrition */
export const MeasurementCategoryDetail = (props: { planPeriods?: PlanPeriod[] }) => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ?? '';
    if (!categoryId) {
        return <p>Please pass a category id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const range = useChartRange();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const categoryQuery = useMeasurementsQuery(categoryId);
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
                <ChartRangeSelector value={range} onChange={setChartRange} />
                <MeasurementChart
                    category={categoryQuery.data!}
                    range={range}
                    planPeriods={props.planPeriods ?? []} />
                {categoryQuery.data!.isGroup
                    ? <GroupReadingsGrid group={categoryQuery.data!} range={range} />
                    : <CategoryEntriesGrid category={categoryQuery.data!} range={range} />}
            </Stack>
        }
        fab={<AddMeasurementEntryFab category={categoryQuery.data!} />}
    />;
};
