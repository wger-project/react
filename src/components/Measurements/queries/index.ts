import {
    addMeasurementCategory,
    AddMeasurementCategoryParams,
    addMeasurementEntry,
    AddMeasurementParams,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementCategoryParams,
    editMeasurementEntry,
    editMeasurementParams,
    getDynamicCategories,
    getMeasurementCategories,
    getMeasurementCategory,
    MeasurementQueryOptions
} from "@/components/Measurements/api/measurements";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export function useMeasurementsCategoryQuery(options?: MeasurementQueryOptions) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, JSON.stringify(options || {})],
        queryFn: () => getMeasurementCategories(options)
    });
}

export function useDynamicCategoriesQuery() {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS_CATEGORIES, 'dynamic'],
        queryFn: getDynamicCategories
    });
}

export const useAddMeasurementCategoryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementCategoryParams) => addMeasurementCategory(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS_CATEGORIES,]
        })
    });
};

export const useEditMeasurementCategoryQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: editMeasurementCategoryParams) => editMeasurementCategory(data),
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

export const useDeleteMeasurementCategoryQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeasurementCategory(id),
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


export function useMeasurementsQuery(id: number) {
    return useQuery({
        queryKey: [QueryKey.MEASUREMENTS, id],
        queryFn: () => getMeasurementCategory(id)
    });
}

export const useAddMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementParams) => addMeasurementEntry(data),
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
        mutationFn: (data: editMeasurementParams) => editMeasurementEntry(data),
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
        mutationFn: (id: number) => deleteMeasurementEntry(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.MEASUREMENTS,]
        })
    });
};
