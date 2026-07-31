import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementEntry,
    getMeasurementCategories,
    getMeasurementCategory,
    MeasurementQueryOptions,
    updateMeasurementCategoryOrder
} from "@/components/Measurements/api/measurements";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export function useMeasurementsCategoryQuery(options?: MeasurementQueryOptions) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, JSON.stringify(options || {})],
        queryFn: () => getMeasurementCategories(options)
    });
}

export const useAddMeasurementCategoryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (category: MeasurementCategory) => addMeasurementCategory(category),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
        })
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
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
        })
    });
};

export function useMeasurementsQuery(id: string) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS, id],
        queryFn: () => getMeasurementCategory(id)
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
        }
    });
};

export const useDeleteMeasurementsQuery = (/*id: number*/) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMeasurementEntry(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS,]
        })
    });
};
