import { ChartRange } from "@/components/Measurements/charts/range";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { GridPaginationModel } from "@mui/x-data-grid";
import React from 'react';

/**
 * Grid pagination that starts over when the range changes: another range is
 * another set of rows, and page seven of the last one says nothing about it.
 */
export function useRangePagination(
    range: ChartRange,
): [GridPaginationModel, React.Dispatch<React.SetStateAction<GridPaginationModel>>] {
    const [pagination, setPagination] = React.useState<GridPaginationModel>({
        page: 0,
        pageSize: PAGINATION_OPTIONS.pageSize,
    });
    React.useEffect(
        () => setPagination(model => ({ ...model, page: 0 })),
        [range]
    );

    return [pagination, setPagination];
}
