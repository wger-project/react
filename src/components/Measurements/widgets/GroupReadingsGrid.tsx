import { componentColor, componentPalette } from "@/components/Measurements/charts/colors";
import { stackableComponents } from "@/components/Measurements/charts/groups";
import { valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartRange, displayFilterFor } from "@/components/Measurements/charts/range";
import {
    categoryDisplayName,
    displayDecimalsFor,
    isSummedPerDay,
    MeasurementCategory
} from "@/components/Measurements/models/Category";
import { useGroupReadingsQuery } from "@/components/Measurements/queries";
import { useRangePagination } from "@/components/Measurements/widgets/useRangePagination";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";
import { makeLink, WgerLink } from "@/core/lib/url";
import { Box, Link as MuiLink, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DateTime } from "luxon";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * The readings of a multi-value group, newest first: one row per timestamp,
 * one column per component. Shown but not edited here, since one row is
 * several entries; the column headers lead to the component screens.
 */
export const GroupReadingsGrid = (props: { group: MeasurementCategory, range: ChartRange }) => {
    const [t, i18n] = useTranslation();
    const group = props.group;
    const children = group.children;

    // The range as it is labelled, not the chart's read: the table would list
    // the average's lead as if it were part of the range
    const filter = displayFilterFor(props.range);
    const [pagination, setPagination] = useRangePagination(props.range);

    const query = useGroupReadingsQuery(group, pagination.pageSize, filter);
    const pages = query.data ?? [];
    const readings = pages[pagination.page]?.readings ?? [];

    // Nothing counts the readings, so the total is provisional while the chain
    // is walked and exact once its end is reached. The grid's unknown-count
    // mode is deliberately not used: it derives a total of its own from the
    // page it is on and lands on the wrong one.
    const loaded = pages.reduce((sum, page) => sum + page.readings.length, 0);
    const rowCount = query.hasNextPage
        ? pages.length * pagination.pageSize + 1
        : loaded;

    // A page is only shown once it is there, so the table keeps the rows it
    // has instead of blanking while the next one loads
    const showPage = (page: number) => {
        if (page < pages.length) {
            setPagination(model => ({ ...model, page: page }));
            return;
        }
        query.fetchNextPage().then(result => {
            if (page < (result.data?.length ?? 0)) {
                setPagination(model => ({ ...model, page: page }));
            }
        });
    };

    // Only the stacked chart leaves a component out, so the dots follow it
    const coloured = isSummedPerDay(group.metricType) ? stackableComponents(group) : children;
    const palette = componentPalette(coloured.length);

    const columns: GridColDef[] = [
        {
            field: 'date',
            headerName: t('date'),
            type: 'dateTime',
            width: 160,
            // Sorting would only reach the page in hand, which is not what a
            // sorted table means
            sortable: false,
            valueFormatter: (value?: Date) => value == null
                ? ''
                : luxonDateTimeToLocale(DateTime.fromJSDate(value), undefined, DateTime.DATETIME_SHORT),
        },
        ...children.map((child): GridColDef => {
            const name = categoryDisplayName(child, t);
            const colourIndex = coloured.findIndex(c => c.id === child.id);

            return {
                field: child.id!,
                headerName: name,
                type: 'number',
                // The components share what the date column leaves, so two of
                // them fill the width and five still fit before it scrolls
                flex: 1,
                minWidth: 110,
                sortable: false,
                renderHeader: () => <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    {colourIndex >= 0 && <Box sx={{
                        backgroundColor: componentColor(palette, colourIndex),
                        borderRadius: '50%',
                        flexShrink: 0,
                        height: 10,
                        width: 10,
                    }} />}
                    <MuiLink
                        component={Link}
                        to={makeLink(WgerLink.MEASUREMENT_DETAIL, i18n.language, { id: child.id! })}
                        variant="body2"
                        sx={{ fontWeight: 500 }}>
                        {name}
                    </MuiLink>
                </Stack>,
                valueFormatter: (value?: number) => value == null
                    ? ''
                    : valueWithUnit(value, child.unit, i18n.language, displayDecimalsFor(child.metricType)),
            };
        }),
    ];

    const rows = readings.map(reading => ({
        // The timestamp is what pairs the components, so it identifies the row
        id: reading.date.getTime(),
        date: reading.date,
        ...Object.fromEntries(reading.values),
    }));

    return <Box sx={{ width: '100%' }}>
        <DataGrid
            rows={rows}
            columns={columns}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={pagination}
            onPaginationModelChange={model => model.pageSize === pagination.pageSize
                ? showPage(model.page)
                // Another page size cuts the readings elsewhere
                : setPagination({ page: 0, pageSize: model.pageSize })}
            loading={query.isFetching}
            pageSizeOptions={PAGINATION_OPTIONS.pageSizeOptions}
            disableColumnFilter
            disableRowSelectionOnClick
        />
    </Box>;
};
