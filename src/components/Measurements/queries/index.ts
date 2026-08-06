import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementEntry,
    BucketLevel,
    getMeasurementBuckets,
    getMeasurementCategories,
    getMeasurementCategory,
    getMeasurementValueCounts,
    MeasurementQueryOptions,
    updateMeasurementCategoryOrder
} from "@/components/Measurements/api/measurements";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { QueryKey } from "@/core/lib/consts";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


/** The condensed reads behind the charts, which every write invalidates */
const invalidateChartReads = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_BUCKETS,] });
    queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_VALUE_COUNTS,] });
};

export function useMeasurementsCategoryQuery(options?: MeasurementQueryOptions) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, JSON.stringify(options || {})],
        queryFn: () => getMeasurementCategories(options),
        // Widening the range refetches, and the charts would otherwise drop
        // back to the loading placeholder while the longer history arrives
        placeholderData: keepPreviousData,
    });
}

export const useAddMeasurementCategoryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (category: MeasurementCategory) => addMeasurementCategory(category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,] });
            invalidateChartReads(queryClient);
        }
    });
};

export const useEditMeasurementCategoryQuery = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (category: MeasurementCategory) => editMeasurementCategory(category),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS, id]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};

export const useDeleteMeasurementCategoryQuery = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMeasurementCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS, id]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};


/** Persists a new top-level category order, the position in the list becomes the order value */
export const useReorderMeasurementCategoriesQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categories: MeasurementCategory[]) => Promise.all(
            categories.map((category, index) => updateMeasurementCategoryOrder(category.id!, index))
        ),
        // Not the chart reads: the order decides where a card sits, not what
        // it draws
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
        })
    });
};

export function useMeasurementsQuery(id: string, filtersetQueryEntries: object = {}) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS, id, JSON.stringify(filtersetQueryEntries)],
        queryFn: () => getMeasurementCategory(id, filtersetQueryEntries),
        placeholderData: keepPreviousData,
    });
}

export const useAddMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entry: MeasurementEntry) => addMeasurementEntry(entry),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};

/** Adds one entry per component of a multi-value group, e.g. blood pressure */
export const useAddGroupEntriesQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entries: MeasurementEntry[]) => Promise.all(entries.map(entry => addMeasurementEntry(entry))),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};

export const useEditMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entry: MeasurementEntry) => editMeasurementEntry(entry),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};

export const useDeleteMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMeasurementEntry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS,]
            });
            // The category lists carry the entries as well, like on add and edit
            queryClient.invalidateQueries({
                queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
            });
            invalidateChartReads(queryClient);
        }
    });
};


/**
 * The chart points of one or more categories, condensed by the server.
 *
 * Kept apart from the category queries, which hand over the entries
 * themselves: a chart shows a few hundred points, and a watch-fed metric holds
 * tens of thousands a year. A group passes its components in one call, so they
 * share the calendar unit and their readings still meet on the same bucket.
 */
export function useMeasurementBucketsQuery(
    categoryIds: string[],
    level: BucketLevel,
    filtersetQuery: object = {},
    enabled: boolean = true,
) {
    return useQuery({
        queryKey: [
            QueryKey.MEASUREMENT_BUCKETS,
            categoryIds.join(','),
            level,
            JSON.stringify(filtersetQuery),
        ],
        queryFn: () => getMeasurementBuckets(categoryIds, level, filtersetQuery),
        enabled: enabled && categoryIds.length > 0,
        // Picking another range refetches, and the chart would otherwise drop
        // back to the loading placeholder while the new one arrives
        placeholderData: keepPreviousData,
    });
}

/** How often each value occurred, which is what the histogram bins */
export function useMeasurementValueCountsQuery(
    categoryId: string,
    summedPerDay: boolean,
    filtersetQuery: object = {},
    enabled: boolean = true,
) {
    return useQuery({
        queryKey: [
            QueryKey.MEASUREMENT_VALUE_COUNTS,
            categoryId,
            summedPerDay,
            JSON.stringify(filtersetQuery),
        ],
        queryFn: () => getMeasurementValueCounts(categoryId, summedPerDay, filtersetQuery),
        enabled: enabled,
        placeholderData: keepPreviousData,
    });
}
