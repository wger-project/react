import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_MEASUREMENTS, QUERY_MEASUREMENTS_CATEGORIES, } from "utils/consts";
import {
    deleteMeasurementEntry,
    editMeasurementEntry,
    getMeasurementCategories,
    getMeasurementCategory
} from "services";
import {
    addMeasurementCategory,
    AddMeasurementCategoryParams,
    addMeasurementEntry,
    AddMeasurementParams,
    deleteMeasurementCategory,
    editMeasurementCategory,
    editMeasurementCategoryParams,
    editMeasurementParams
} from "services/measurements";


export function useMeasurementsCategoryQuery() {
    return useQuery([QUERY_MEASUREMENTS_CATEGORIES], getMeasurementCategories);
}

export const useAddMeasurementCategoryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementCategoryParams) => addMeasurementCategory(data),
        onSuccess: () => queryClient.invalidateQueries([QUERY_MEASUREMENTS_CATEGORIES,])
    });
};

export const useEditMeasurementCategoryQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: editMeasurementCategoryParams) => editMeasurementCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_MEASUREMENTS, id]);
            queryClient.invalidateQueries([QUERY_MEASUREMENTS_CATEGORIES,]);
        }
    });
};

export const useDeleteMeasurementCategoryQuery = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeasurementCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_MEASUREMENTS, id]);
            queryClient.invalidateQueries([QUERY_MEASUREMENTS_CATEGORIES,]);
        }
    });
};


export function useMeasurementsQuery(id: number) {
    return useQuery([QUERY_MEASUREMENTS, id],
        () => getMeasurementCategory(id)
    );
}

export const useAddMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMeasurementParams) => addMeasurementEntry(data),
        onError: (error: any) => {
            console.log(error);
            // toast.error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_MEASUREMENTS,]);
            queryClient.invalidateQueries([QUERY_MEASUREMENTS_CATEGORIES,]);
        }
    });
};

export const useEditMeasurementEntryQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: editMeasurementParams) => editMeasurementEntry(data),
        onSuccess: () => {
            queryClient.invalidateQueries([QUERY_MEASUREMENTS,]);
            queryClient.invalidateQueries([QUERY_MEASUREMENTS_CATEGORIES,]);
        }
    });
};

export const useDeleteMeasurementsQuery = (/*id: number*/) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMeasurementEntry(id),
        onSuccess: () => queryClient.invalidateQueries([QUERY_MEASUREMENTS,])
    });
};
