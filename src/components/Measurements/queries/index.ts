import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementEntry,
    BucketLevel,
    getAllMeasurementEntries,
    getCategoryEntryFlags,
    getMeasurementBuckets,
    getMeasurementCategories,
    getMeasurementCategory,
    getMeasurementEntries,
    getMeasurementEntryPage,
    getMeasurementValueCounts,
    getOldestMeasurementEntry,
    MeasurementQueryOptions,
    updateMeasurementCategoryOrder
} from "@/components/Measurements/api/measurements";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { QueryKey } from "@/core/lib/consts";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


/**
 * Which categories hold entries. Under the category key so that adding or
 * removing one refreshes it, like every other read of that list.
 */
const CATEGORY_ENTRY_FLAGS_KEY = [QueryKey.MEASUREMENTS_CATEGORIES, 'entry-flags'];

/** The condensed reads behind the charts, which every write invalidates */
const invalidateChartReads = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_BUCKETS,] });
    queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_VALUE_COUNTS,] });
};

/**
 * What a written entry ages: the entries themselves, the charts drawn from
 * them, and whether the category holds any. Not the categories, they carry
 * nothing that an entry can change.
 */
const invalidateEntryReads = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_ENTRIES,] });
    queryClient.invalidateQueries({ queryKey: CATEGORY_ENTRY_FLAGS_KEY });
    invalidateChartReads(queryClient);
};

export function useMeasurementsCategoryQuery(options?: MeasurementQueryOptions) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, JSON.stringify(options || {})],
        queryFn: () => getMeasurementCategories(options),
    });
}

/** The categories, each with whether it holds entries: what a group parent may be */
export function useCategoryEntryFlagsQuery() {
    return useQuery({
        queryKey: CATEGORY_ENTRY_FLAGS_KEY,
        queryFn: () => getCategoryEntryFlags(),
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

export function useMeasurementsQuery(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS, id],
        queryFn: () => getMeasurementCategory(id),
        enabled: enabled,
    });
}

/**
 * The entries of one category.
 *
 * [limit] reads only that many of the newest ones, for the callers that show
 * the latest handful rather than a span of time.
 */
export function useMeasurementEntriesQuery(
    categoryId: string,
    filtersetQuery: object = {},
    limit?: number,
    enabled: boolean = true,
) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENT_ENTRIES, categoryId, JSON.stringify(filtersetQuery), limit ?? null],
        queryFn: () => getMeasurementEntries(categoryId, filtersetQuery, limit),
        enabled: enabled,
        // Picking another range refetches, and the table would otherwise drop
        // back to the loading placeholder while the new one arrives
        placeholderData: keepPreviousData,
    });
}

/**
 * One page of a category's entries, for the tables that show a page at a time.
 *
 * Kept apart from the query above, which hands over a whole span: a table
 * shows ten rows, and a synced category holds thousands of them.
 */
export function useMeasurementEntryPageQuery(
    categoryId: string,
    offset: number,
    limit: number,
    filtersetQuery: object = {},
) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENT_ENTRIES, categoryId, JSON.stringify(filtersetQuery), 'page', offset, limit],
        queryFn: () => getMeasurementEntryPage(categoryId, offset, limit, filtersetQuery),
        // Turning the page refetches, and the table would otherwise drop back
        // to an empty grid while the next one arrives
        placeholderData: keepPreviousData,
    });
}

/**
 * The oldest entry of a category, which the total change of every row is
 * measured against. Its own query, so paging through the table doesn't read
 * it again: it only changes with the range.
 */
export function useOldestMeasurementEntryQuery(categoryId: string, filtersetQuery: object = {}) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENT_ENTRIES, categoryId, JSON.stringify(filtersetQuery), 'oldest'],
        queryFn: () => getOldestMeasurementEntry(categoryId, filtersetQuery),
    });
}

/** The entries of every category in one read, for the views that show a window of time */
export function useAllMeasurementEntriesQuery(filtersetQuery: object = {}) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENT_ENTRIES, 'all', JSON.stringify(filtersetQuery)],
        queryFn: () => getAllMeasurementEntries(filtersetQuery),
    });
}

export const useAddMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entry: MeasurementEntry) => addMeasurementEntry(entry),
        onSuccess: () => invalidateEntryReads(queryClient)
    });
};

/** Adds one entry per component of a multi-value group, e.g. blood pressure */
export const useAddGroupEntriesQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entries: MeasurementEntry[]) => Promise.all(entries.map(entry => addMeasurementEntry(entry))),
        onSuccess: () => invalidateEntryReads(queryClient)
    });
};

export const useEditMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (entry: MeasurementEntry) => editMeasurementEntry(entry),
        onSuccess: () => invalidateEntryReads(queryClient)
    });
};

export const useDeleteMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMeasurementEntry(id),
        onSuccess: () => invalidateEntryReads(queryClient)
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
