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
    getMeasurementCategories,
    getMeasurementCategory,
    MeasurementQueryOptions
} from "@/components/Measurements/api/measurements";
import { QUERY_MEASUREMENTS, QUERY_MEASUREMENTS_CATEGORIES, } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export function useMeasurementsCategoryQuery(options?: MeasurementQueryOptions) {
    return useQuery({
        queryKey: [QUERY_MEASUREMENTS_CATEGORIES, JSON.stringify(options || {})],
        queryFn: () => getMeasurementCategories(options)
    });
}

export const useAddMeasurementCategoryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementCategoryParams) => addMeasurementCategory(data),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QUERY_MEASUREMENTS_CATEGORIES,]
        })
    });
};

export const useEditMeasurementCategoryQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: editMeasurementCategoryParams) => editMeasurementCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS, id]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS_CATEGORIES,]
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
                queryKey: [QUERY_MEASUREMENTS, id]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS_CATEGORIES,]
            });
        }
    });
};


export function useMeasurementsQuery(id: number) {
    return useQuery({
        queryKey: [QUERY_MEASUREMENTS, id],
        queryFn: () => getMeasurementCategory(id)
    });
}

export const useAddMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementParams) => addMeasurementEntry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS_CATEGORIES,]
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
                queryKey: [QUERY_MEASUREMENTS,]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_MEASUREMENTS_CATEGORIES,]
            });
        }
    });
};

export const useDeleteMeasurementsQuery = (/*id: number*/) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeasurementEntry(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QUERY_MEASUREMENTS,]
        })
    });
};
